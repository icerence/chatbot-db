# 🎨 Chatbot Frontend (React + Vite)

AI 챗봇 웹 애플리케이션의 프론트엔드 리포지토리입니다. React 19와 Vite 8을 기반으로 빠르고 가벼운 UI를 제공합니다.

---

## 📊 실측 빌드 및 벤치마크 지표

- **Vite 버전**: v8.2.2
- **React 버전**: v19.2.8
- **Node.js**: v24.15.0 / **npm**: 11.12.1
- **빌드 소요 시간**: **137 ms**
- **모듈 변환 개수**: 16 modules transformed

### 프로덕션 번들 실측 크기 (`dist/`)
| 파일명 | 파일 크기 | gzip 압축 크기 |
| :--- | :---: | :---: |
| `dist/index.html` | 0.47 kB | 0.30 kB |
| `dist/assets/index-DwyoYBS7.css` | 2.15 kB | 0.83 kB |
| `dist/assets/index-D-G5gI1l.js` | 195.41 kB | 61.96 kB |
| **총합** | **198.03 kB** | **63.09 kB** |

---

## ⚡ 주요 기능 및 연동 설정

1. **대화 세션 관리**: 새 대화 생성, 목록 조회, 세션 이름 수정, 세션 삭제
2. **실시간 대화 인터랙션**: 메시지 전송, AI 생각 중 로딩 상태 표시
3. **Render 슬립 방어 및 복구 UI**:
   - 접속 초기 콜드스타트 감지 시 서버 깨우기 배너 및 프로그레스 표시
   - 브라우저 활성 상태 유지 시 10분 주기 백엔드 Keep-Alive 핑 전송
   - 네트워크/서버 에러 시 수동 재시도 버튼 제공

---

## 🛠️ 실행 스크립트

```bash
# 개발 서버 실행 (기본 포트: 5173)
npm run dev

# 프로덕션 번들 빌드
npm run build

# 코드 린트 검사
npm run lint

# 빌드 산출물 미리보기
npm run preview
```
