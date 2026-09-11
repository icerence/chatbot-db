# 🤖 AI Chatbot Web Application (Full-Stack)

Hugging Face Qwen 2.5 72B 모델 기반의 다중 세션 지원 대화형 AI 챗봇 웹 서비스입니다.  
FastAPI 백엔드와 React 19 + Vite 프론트엔드로 구성되어 있으며, SQLite를 활용한 세션/메시지 영속 관리와 Render 무료 인스턴스 슬립 방어(Keep-Alive & Self-Ping) 시스템을 갖추고 있습니다.

---

## 📊 실측 성능 및 벤치마크 지표 (Measured Metrics)

> *실측 환경: Windows 11 / Node v24.15.0 / Python 3.12.10 (측정 시점: 2026-09-11)*

### 1. API 및 네트워크 지연 시간 (Latency)
| 구분 | 대상 URL | 응답 상태 | 실측 지연 시간 | 비고 |
| :--- | :--- | :---: | :---: | :--- |
| **로컬 헬스체크** | `http://127.0.0.1:8000/health` | `HTTP 200` | **121.09 ms** | Uvicorn 로컬 인스턴스 |
| **로컬 세션 조회** | `http://127.0.0.1:8000/sessions` | `HTTP 200` | **14.16 ms** | SQLite 연결 및 질의 |
| **로컬 프론트엔드** | `http://localhost:5173` | `HTTP 200` | **109.58 ms** | Vite HMR 개발 서버 |
| **배포 서버 헬스체크**| `https://chatbot-db-back-6b3p.onrender.com/health` | `HTTP 200` | **352.27 ms** | Render 클라우드 인스턴스 |
| **콜드스타트 복구** | 백엔드 슬립 해제 시 | - | **약 30 ~ 50초** | 프론트 자동 폴링 깨우기 |

### 2. 프론트엔드 프로덕션 빌드 실측치 (`npm run build`)
- **빌드 도구**: Vite v8.2.2
- **빌드 소요 시간**: **137 ms** (16개 모듈 변환)
- **번들 산출물 크기**:
  - `dist/index.html`: `0.47 kB` (gzip: `0.30 kB`)
  - `dist/assets/index-DwyoYBS7.css`: `2.15 kB` (gzip: `0.83 kB`)
  - `dist/assets/index-D-G5gI1l.js`: `195.41 kB` (gzip: `61.96 kB`)
  - **총 번들 크기**: **198.03 kB** (gzip 압축 시: **63.09 kB**)

### 3. 데이터베이스 현황 (`chat.db`)
- **DB 엔진**: SQLite3 (`PRAGMA foreign_keys = ON`, `ON DELETE CASCADE`)
- **누적 세션 수**: 3개
- **누적 메시지 수**: 8개

---

## 🛠️ 기술 스택 및 실측 버전 (Tech Stack)

### 백엔드 (Backend)
- **Language**: Python `3.12.10`
- **Framework**: FastAPI `0.141.1`
- **ASGI Server**: Uvicorn `0.52.4`
- **Validation**: Pydantic `2.13.5`
- **HTTP Client**: Requests `2.34.2`
- **Configuration**: Python-dotenv `1.2.3`
- **AI Model**: `Qwen/Qwen2.5-72B-Instruct` (Hugging Face Inference Router)

### 프론트엔드 (Frontend)
- **Runtime & Package Manager**: Node.js `v24.15.0`, npm `11.12.1`
- **Library**: React `19.2.8`, ReactDOM `19.2.8`
- **Build & Dev Tool**: Vite `8.2.2`
- **Linter**: ESLint `10.9.0`

---

## 🛡️ Render 슬립타임(Spin-down) 2중 방어 시스템

Render 무료 인스턴스는 15분 동안 인바운드 트래픽이 없으면 자동으로 슬립 상태로 전환됩니다. 본 프로젝트는 2중 방어 시스템을 구축하여 이를 완화합니다.

1. **백엔드 셀프 핑 (Backend Self-Ping)**
   - 백엔드 구동 시 백그라운드 데몬 스레드가 실행됩니다.
   - `RENDER_EXTERNAL_URL` 또는 지정된 URL로 **10분 주기**마다 `/health`를 호출하여 15분 슬립 제한을 방어합니다.
2. **프론트엔드 킵얼라이브 & 콜드스타트 UI (Frontend Keep-Alive & Wake-up UI)**
   - 초기 진입 시 서버가 잠들어 있으면 상단 안내 배너를 띄우고 최대 60초간 3초 간격으로 `/health`를 폴링하여 서버를 깨웁니다.
   - 사용자가 브라우저 창을 열어둔 상태에서는 **10분 주기**로 Keep-Alive 신호를 전송합니다.

---

## 🔗 주요 주소 및 API 엔드포인트

### 서비스 접속 주소
- **배포 백엔드 URL**: `https://chatbot-db-back-6b3p.onrender.com`
- **로컬 백엔드 URL**: `http://127.0.0.1:8000` (Swagger UI: `http://127.0.0.1:8000/docs`)
- **로컬 프론트엔드 URL**: `http://localhost:5173`

### REST API 명세
| 메서드 | 엔드포인트 | 설명 |
| :--- | :--- | :--- |
| `GET` | `/health` | 서버 상태 확인 및 슬립 방지용 헬스체크 |
| `GET` | `/ping` | 기본 통신 확인용 핑 |
| `POST` | `/chat` | 단발성 AI 질의응답 (히스토리 미저장) |
| `GET` | `/sessions` | 전체 대화 세션 목록 조회 |
| `POST` | `/sessions` | 신규 대화 세션 생성 |
| `PUT` | `/sessions/{id}` | 세션 제목 변경 |
| `DELETE`| `/sessions/{id}` | 세션 및 하위 메시지 전체 삭제 |
| `GET` | `/sessions/{id}/message` | 특정 세션의 대화 메시지 내역 조회 |
| `POST` | `/sessions/{id}/messages` | 메시지 전송, AI 답변 생성 및 DB 동시 저장 |

---

## 🚀 로컬 개발 환경 실행 방법

### 1. 백엔드 실행
```bash
cd backend

# 가상환경 활성화 (Windows)
.\.venv\Scripts\activate

# 의존성 설치 (필요시)
pip install -r requirements.txt

# 서버 실행 (자동 리로드)
uvicorn main:app --reload --port 8000
```

### 2. 프론트엔드 실행
```bash
cd frontend

# 패키지 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```
