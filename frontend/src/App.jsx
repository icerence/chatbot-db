import { useState, useEffect } from "react";

//const API = "http://localhost:8000/chat";
//const API = "https://two026-chatbot-backend.onrender.com";
const API = "https://chatbot-db-back-6b3p.onrender.com";

export default function App() {
  const [sessions, setSession] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const requestJson = async (url, options) => {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || `Request failed: ${res.status}`);
    }
    return data;
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

  // 리액트 컴포넌트 상태에 따라 함수실행을 제어
  useEffect(() => {
    // The initial data load intentionally updates state after the request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions().then((list) => {
      if (list.length > 0) {
        console.log(list[0].id);
        setSessionId(list[0].id);
        loadMsg(list[0].id);
      }
    });
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

  return (
    <div className="app">
      <aside className="side">
        <button className="new" onClick={newSession}>
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
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} placeholder="메시지를 입력하세요" />
          <button onClick={send}>전송</button>
        </div>
      </main>
    </div>
  );
}
