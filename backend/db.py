import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("chat.db")


# DB접속
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


SEED_SESSIONS = [
    (1, "프롬프트 작성방법", "2026-09-10 11:48:33"),
    (14, "기술스택 설명", "2026-09-11 13:01:02"),
    (15, "세션 열고 채팅", "2026-09-11 13:03:28"),
]

SEED_MESSAGES = [
    (1, 1, "당신", "안녕동균", "2026-09-10 13:14:40"),
    (2, 1, "bot", "안녕하세요! 동균님, 어떤 도움이 필요하신가요?", "2026-09-10 13:14:41"),
    (3, 15, "당신", "안녕?", "2026-09-11 13:13:18"),
    (4, 15, "bot", "안녕하세요! 어떻게 도와드릴까요?", "2026-09-11 13:13:20"),
    (5, 15, "당신", "너는 누구야?", "2026-09-11 13:13:46"),
    (6, 15, "bot", "저는 당신을 도울 준비가 된 친절한 인공지능 챗봇이예요. 어떤 질문이든지 물어봐주세요!", "2026-09-11 13:13:48"),
    (7, 15, "당신", "영화 오딧세이는 어때?", "2026-09-11 13:14:03"),
    (8, 15, "bot", '영화 "오딧세이"는 매우 흥미롭고 감동적인 작품으로 알려져 있습니다. 우주 탐사의 위험성과 인간의 생존 의지를 중심으로 이야기가 전개되며, 시각적 효과와 연기, 스토리텔링 모두 뛰어납니다. 영화의 주인공 매터스는 행성에서 고립되면서 겪는 고통과 도전, 그리고 동료들의 구조 작전이 인상적입니다. 이 영화를 보시면 definitely 좋을 것 같아요!', "2026-09-11 13:14:08"),
    (9, 1, "당신", "프롬프트 작성방법", "2026-09-11 17:20:47"),
    (10, 1, "bot", "프롬프트 작성 방법은 상황과 목적에 따라 다르게 적용될 수 있습니다. 아래는 일반적인 프롬프트 작성 시 고려해야 할 몇 가지 팁입니다:\n\n1. **목표 명확화**: 프롬프트의 목적이 무엇인지 명확히 하세요. 예를 들어, 질문에 대한 답변을 원하거나 특정 주제에 대한 정보를 얻고자 하는 경우, 그 목적을 명확히 표현해야 합니다.\n\n2. **구체성 유지**: 가능한 한 구체적으로 작성하세요. 모호한 표현은 오해를 초래할 수 있으므로, 구체적인 사례나 예를 들어 설명하는 것이 좋습니다.\n\n3. **문맥 제공**: 필요한 경우 관련 문맥을 제공하세요. 이는 챗봇이 더 정확한 답변을 하도록 도와줄 수 있습니다.\n\n4. **질문 방식**: 직접적인 질문 형태로 작성하는 것이 답변을 얻는 데 더 효과적일 수 있습니다. 예를 들어, \"서울에서 부산까지 가는 가장 빠른 방법은 무엇인가요?\"와 같이 물어보세요.\n\n5. **올바른 어조 사용**: 상황에 맞는 적절한 어조를 사용하세요.正式的或非正式的, depending on the context. (공식적이나 비공식적으로, 상황에 따라 다릅니다.)\n\n6. **추가 지시사항**: 필요한 경우 추가적인 지시사항을 포함하세요. 예를 들어, \"500자 이내로 요약해주세요\"와 같이 요청할 수 있습니다.\n\n7. **예시 제공**: 경우에 따라 예시를 제공하여 원하는 형태의 답변을 유도할 수 있습니다. 예를 들어, \"다음과 같은 형식으로 답변해주세요: [주제]은/는 [특징1], [특징2], [특징3]을 포함합니다.\"\n\n이러한 팁들을 활용하여 보다 효과적인 프롬프트를 작성해보세요. 더具体的的帮助需要吗? (구체적인 도움이 필요하시면 말씀해 주세요!)", "2026-09-11 17:21:05"),
    (11, 14, "당신", "기술스택 설명", "2026-09-11 17:21:14"),
    (12, 14, "bot", "기술스택은 프로젝트나 서비스를 개발할 때 사용하는 여러 기술들의 총체를 의미합니다. 일반적으로 다음과 같은 요소들을 포함할 수 있습니다:\n\n1. **프로그래밍 언어**: Java, Python, JavaScript, Ruby, C#, C++ 등\n2. **프레임워크와 라이브러리**: React, Angular, Vue.js, Django, Flask, Spring Boot 등\n3. **데이터베이스**: MySQL, PostgreSQL, MongoDB, Redis 등\n4. **웹 서버**: Apache, Nginx 등\n5. **운영 체제**: Linux, Windows, macOS 등\n6. **백엔드 서비스**: AWS, Google Cloud, Azure 등\n7. **프론트엔드 툴**: Webpack, Babel, TypeScript 등\n8. **버전 관리 시스템**: Git, SVN 등\n9. **CI/CD 툴**: Jenkins, GitHub Actions, GitLab CI 등\n10. **컨테이너화 및 오케스트레이션**: Docker, Kubernetes 등\n11. **API 및 통신 프로토콜**: REST, GraphQL, WebSockets 등\n12. **테스트 프레임워크**: JUnit, Mocha, Jest 등\n\n기술스택은 프로젝트의 특성에 따라 선택됩니다. 예를 들어, 웹 애플리케이션을 개발할 때는 프론트엔드와 백엔드, 데이터베이스, 서버 등 다양한 요소를 고려하여 적절한 기술들을 선택합니다.", "2026-09-11 17:21:29"),
]


def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL DEFAULT '새 대화',
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )
    """)
    # 세션이 없거나, 메시지가 하나도 없는 구버전 더미 데이터 상태일 때
    # 현재 저장된 실제 대화 내역(3개 세션, 12개 메시지)을 초기 시드 데이터로 구축
    session_count = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
    message_count = conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
    if session_count == 0 or message_count == 0:
        conn.execute("DELETE FROM messages")
        conn.execute("DELETE FROM sessions")
        conn.executemany(
            "INSERT INTO sessions (id, title, created_at) VALUES (?, ?, ?)",
            SEED_SESSIONS,
        )
        conn.executemany(
            "INSERT INTO messages (id, session_id, role, text, created_at) VALUES (?, ?, ?, ?, ?)",
            SEED_MESSAGES,
        )
    conn.commit()
    conn.close()


def create_session():
    conn = get_conn()
    cur = conn.execute("INSERT INTO sessions DEFAULT VALUES")
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return new_id


# Read
def read_sessions():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, title, created_at FROM sessions ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


# Create
def create_message(session_id, role, text):
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO messages (session_id, role, text) VALUES (?, ?, ?)",
        (session_id, role, text),
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return new_id


# Read
def read_message(session_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, role, text, created_at FROM messages "
        "WHERE session_id = ? ORDER BY id",
        (session_id,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def count_messge(session_id):
    conn = get_conn()
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM messages WHERE session_id = ?",
        (session_id,)
    ).fetchone()
    conn.close()
    return row["n"]


# Update
def update_session(session_id, title):
    conn = get_conn()
    cur = conn.execute(
        "UPDATE sessions SET title = ? WHERE id = ?",
        (title, session_id)
    )
    conn.commit()
    changed = cur.rowcount
    conn.close()
    return changed


def delete_session(session_id):
    conn = get_conn()
    cur = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    deleted = cur.rowcount
    conn.close()
    return deleted
