import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
//const API = "https://two026-chatbot-backend.onrender.com";
// const API = "https://chatbot-db-back-6b3p.onrender.com";

export default function App() {
  const [sessions, setSession] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Render 서버 슬립(Cold-start) 방어 상태
  const [serverStatus, setServerStatus] = useState("checking"); // checking | waking | ready | error
  const [statusNotice, setStatusNotice] = useState("");

  // API 요청 및 슬립/네트워크 오류 자동 재시도 함수
  const requestJson = async (url, options = {}, retries = 2, delay = 2000) => {
    try {
      const controller = new AbortController();
      // Render 콜드스타트는 최대 50초 이상 걸릴 수 있으므로 60초 타임아웃 부여
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      // Render 서버가 깨어나는 도중 반환하는 502/503/504 에러 대응 재시도
      if ([502, 503, 504].includes(res.status) && retries > 0) {
        console.warn(`[슬립 방어] 서버 응답 대기 중 (${res.status}). ${delay / 1000}초 후 재시도합니다...`);
        await new Promise((r) => setTimeout(r, delay));
        return requestJson(url, options, retries - 1, delay * 1.5);
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || `Request failed: ${res.status}`);
      }
      return data;
    } catch (error) {
      if (retries > 0 && error.name !== "AbortError") {
        console.warn(`[슬립 방어] 네트워크 재시도 (${retries}회 남음)...`, error);
        await new Promise((r) => setTimeout(r, delay));
        return requestJson(url, options, retries - 1, delay * 1.5);
      }
      throw error;
    }
  };

  // Render 무료 인스턴스 슬립 상태 감지 및 깨우기(Wake-up) 폴링
  const checkAndWakeServer = async () => {
    setServerStatus("checking");
    setStatusNotice("서버 상태를 확인하는 중입니다...");

    const maxAttempts = 20; // 3초 간격으로 최대 60초간 확인
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${API}/health`, { signal: controller.signal });
        clearTimeout(tid);

        if (res.ok) {
          setServerStatus("ready");
          setStatusNotice("✅ 서버가 준비되었습니다.");
          setTimeout(() => setStatusNotice(""), 3000);
          return true;
        }
      } catch {
        // 서버 슬립으로 인한 일시적 대기
      }

      setServerStatus("waking");
      setStatusNotice(
        `☁️ Render 서버를 깨우는 중입니다 (${i * 3}초 경과)... 무료 서버 특성상 약 30~50초 소요될 수 있습니다.`
      );
      await new Promise((r) => setTimeout(r, 3000));
    }

    setServerStatus("error");
    setStatusNotice("⚠️ 서버 연결에 실패했습니다. 백엔드 상태를 확인해 주세요.");
    return false;
  };

  // func
  // 세션데이터 로드
  const loadSessions = async () => {
    try {
      const data = await requestJson(`${API}/sessions`);
      const nextSessions = Array.isArray(data.sessions) ? data.sessions : [];
      setSession(nextSessions);
      return nextSessions;
    } catch (error) {
      console.error("세션을 불러오지 못했습니다.", error);
      setSession([]);
      return [];
    }
  };

  //세션의 채팅기록 로드
  const loadMsg = async (id) => {
    if (!id) {
      setMsgs([]);
      return;
    }
    try {
      const data = await requestJson(`${API}/sessions/${id}/message`);
      setMsgs(Array.isArray(data.messages) ? data.messages : []);
    } catch (error) {
      console.error("메시지를 불러오지 못했습니다.", error);
      setMsgs([]);
    }
  };
  //선택된 세션 아이디 저장
  const openSession = (id) => {
    setSessionId(id);
    loadMsg(id);
  };

  //새로운 세션 추가
  const newSession = async () => {
    try {
      const data = await requestJson(`${API}/sessions`, { method: "POST" });
      await loadSessions();
      setSessionId(data.id);
      setMsgs([]);
    } catch (error) {
      console.error("새 대화를 만들지 못했습니다.", error);
    }
  };

  // 1. 초기 로드 시 서버 상태 확인 및 깨우기
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const isAwake = await checkAndWakeServer();
      if (!isMounted) return;
      if (isAwake) {
        const list = await loadSessions();
        if (isMounted && list.length > 0) {
          setSessionId(list[0].id);
          loadMsg(list[0].id);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. 브라우저가 열려있는 동안 10분마다 Keep-Alive Ping (Render 15분 슬립 방지)
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        await fetch(`${API}/health`);
        console.log("💓 [Keep-alive Ping 전송 성공]");
      } catch (err) {
        console.warn("⚠️ [Keep-alive Ping 실패]:", err);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(pingInterval);
  }, []);
  // 수정할 세션의 아이디, 타이틀로 선택
  const startRename = (s) => {
    setEditId(s.id);
    setEditTitle(s.title);
  };
  // 세션 타이틀 수정
  const saveTitle = async (id) => {
    try {
      await requestJson(`${API}/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      setEditId(null);
      await loadSessions();
    } catch (error) {
      console.error("대화 이름을 저장하지 못했습니다.", error);
    }
  };

  const removeSession = async (id) => {
    try {
      await requestJson(`${API}/sessions/${id}`, { method: "DELETE" });
      const list = await loadSessions();
      const next = list.length > 0 ? list[0].id : null;
      setSessionId(next);
      loadMsg(next);
    } catch (error) {
      console.error("대화를 삭제하지 못했습니다.", error);
    }
  };
  //사용자의 메시지를 서버로 전달후 응답결과 반환
  const send = async () => {
    if (!input.trim() || !sessionId) return;
    const text = input;
    setInput("");
    setLoading(true);
    try {
      await requestJson(`${API}/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      await loadMsg(sessionId);
      await loadSessions();
    } catch (error) {
      console.error("메시지를 전송하지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  //엔터키 입력시 메시지 전송
  const onKey = (e) => {
    if (e.key === "Enter") send();
  };

  const isServerWaking = serverStatus === "checking" || serverStatus === "waking";

  return (
    <div className="app-container">
      {statusNotice && (
        <div className={`server-banner ${serverStatus}`}>
          <span>{statusNotice}</span>
          {serverStatus === "error" && (
            <button
              className="retry-btn"
              onClick={() => {
                checkAndWakeServer().then((ok) => {
                  if (ok) loadSessions();
                });
              }}
            >
              재연결 시도
            </button>
          )}
        </div>
      )}
      <div className="app">
        <aside className="side">
          <button className="new" onClick={newSession} disabled={isServerWaking}>
            + 새 대화
          </button>
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id} className={s.id === sessionId ? "session on" : "session"}>
                {console.log('edit',editId)}
                {console.log('session',s.id)}
                {editId === s.id ? (
                  <span className="rename">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <button onClick={() => saveTitle(s.id)}>저장</button>
                  </span>
                ) : (
                  <>
                    <button className="session-title" onClick={() => openSession(s.id)}>
                      {s.title}
                    </button>
                    <span className="session-tools">
                      <button onClick={() => startRename(s)}>이름</button>
                      <button onClick={() => removeSession(s.id)}>삭제</button>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className="chat">
          <div className="box">
            {msgs.map((m) => (
              <div key={m.id} className={m.role}>
                <p>{m.text}</p>
              </div>
            ))}
            {loading && <p className="loading">생각 중...</p>}
          </div>
          <div className="input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={
                isServerWaking
                  ? "서버를 깨우는 중입니다. 잠시만 기다려 주세요..."
                  : "메시지를 입력하세요"
              }
              disabled={isServerWaking || loading}
            />
            <button onClick={send} disabled={isServerWaking || loading}>전송</button>
          </div>
        </main>
      </div>
    </div>
  );
}
