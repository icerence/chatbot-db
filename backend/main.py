from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, os, threading, time
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import db

load_dotenv()  # .env의 키를 추출하는 함수

def start_self_ping():
    """Render 무료 인스턴스의 15분 슬립(Spin-down)을 방지하기 위한 백그라운드 셀프 핑 스레드"""
    target_url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("SELF_PING_URL")
        or os.getenv("BACKEND_URL")
    )
    if not target_url:
        print("[Self-Ping] RENDER_EXTERNAL_URL 또는 SELF_PING_URL이 설정되지 않아 셀프 핑이 비활성화되었습니다. (Render 배포 시 자동 활성화)")
        return

    base_url = target_url.rstrip("/")
    ping_url = f"{base_url}/health"
    print(f"[Self-Ping] Render 슬립 방지 태스크 시작: {ping_url} (10분 간격)")

    def ping_worker():
        time.sleep(60)  # 서버 구동 후 1분 대기 후 첫 핑 시작
        while True:
            try:
                res = requests.get(ping_url, timeout=30)
                print(f"[Self-Ping] 핑 성공: {ping_url} (HTTP {res.status_code})")
            except Exception as err:
                print(f"[Self-Ping] 핑 실패: {err}")
            time.sleep(600)  # 10분(600초)마다 주기적 호출

    t = threading.Thread(target=ping_worker, daemon=True)
    t.start()


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_self_ping()
    yield


app = FastAPI(lifespan=lifespan)
db.init_db()
print(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Msg(BaseModel):
    text: str


class SessionTitle(BaseModel):
    title: str


HF_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL = "Qwen/Qwen2.5-72B-Instruct"


def ask_ai(history) -> str:
    token = os.getenv("HF_TOKEN")

    # 1. 토큰 누락 여부 사전 점검
    if not token:
        print("❌ [오류] .env 파일에서 HF_TOKEN을 읽어오지 못했습니다.")
        return "서버 설정 오류: API 토큰이 없습니다. .env 파일을 확인해 주세요."

    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "model": HF_MODEL,
        "messages": [
            # 💡여기에 시스템 프롬프트가 추가되었습니다. 항상 한국어로 일관되게 대답합니다.
            {
                "role": "system",
                "content": "당신은 친절한 인공지능 챗봇입니다. 다른 언어를 섞지 말고, 항상 자연스러운 한국어로만 답변해야 합니다.",
            },
            *(
                history
                if isinstance(history, list)
                else [{"role": "user", "content": history}]
            ),
        ],
        "max_tokens": 1000,
    }

    try:
        res = requests.post(HF_URL, headers=headers, json=payload)
        data = res.json()

        # 2. Hugging Face 서버에서 에러 응답을 받았을 때 예외 처리
        if "choices" not in data:
            print("❌ [HF API 에러 응답]:", data)
            return f"AI 서비스 응답 실패. (상세 이유: {data.get('error', 'Unknown Error')})"

        # 💡 이전에 발생할 수 있었던 구조적 에러 방지를 위해 [0] 인덱스를 정확히 설정했습니다.
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        print(f"❌ [네트워크 에러]: {e}")
        return "AI API 통신 중 알 수 없는 오류가 발생했습니다."


def build_history(session_id):
    row = db.read_message(session_id)
    return [
        {
            "role": "user" if r["role"] == "당신" else "assistant",
            "content": r["text"],
        }
        for r in row
    ]


@app.get("/health")
def health_check():
    """Render 및 프론트엔드 헬스체크 / 슬립 방지용 엔드포인트"""
    return {"status": "ok", "message": "server is awake"}


@app.get("/ping")
def ping():
    return {"pong": True}


@app.post("/chat")
def chat(msg: Msg):
    reply = ask_ai(msg.text)
    return {"reply": reply}


# Create #Read #Update #Delete
@app.post("/sessions")
def new_session():
    session_id = db.create_session()
    return {"id": session_id, "title": "새 대화"}


# Read
@app.get("/sessions")
def list_sessions():
    return {"sessions": db.read_sessions()}


@app.put("/sessions/{session_id}")
def update_session(session_id: int, session: SessionTitle):
    db.update_session(session_id, session.title)
    return {"id": session_id, "title": session.title}


@app.delete("/sessions/{session_id}")
def delete_session(session_id: int):
    db.delete_session(session_id)
    return {"id": session_id}


@app.get("/sessions/{session_id}/message")
def list_messages(session_id: int):
    return {"messages": db.read_message(session_id)}


@app.post("/sessions/{session_id}/messages")
def send_message(session_id: int, msg: Msg):
    first = db.count_messge(session_id) == 0
    db.create_message(session_id, "당신", msg.text)
    if first:
        db.update_session(session_id, msg.text[:20])
    reply = ask_ai(build_history(session_id))
    db.create_message(session_id, "bot", reply)
    return {"reply": reply}