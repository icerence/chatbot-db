import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const LOCAL_INITIAL_HISTORY = {
  sessions: [
    { id: 15, title: "세션 열고 채팅" },
    { id: 14, title: "기술스택 설명" },
    { id: 1, title: "프롬프트 작성방법" },
  ],
  messages: [
    { id: 1, session_id: 1, role: "당신", text: "안녕동균" },
    { id: 2, session_id: 1, role: "bot", text: "안녕하세요! 동균님, 어떤 도움이 필요하신가요?" },
    { id: 9, session_id: 1, role: "당신", text: "프롬프트 작성방법" },
    { id: 10, session_id: 1, role: "bot", text: "프롬프트 작성 방법은 상황과 목적에 따라 다르게 적용될 수 있습니다. 아래는 일반적인 프롬프트 작성 시 고려해야 할 몇 가지 팁입니다:\n\n1. **목표 명확화**: 프롬프트의 목적이 무엇인지 명확히 하세요. 예를 들어, 질문에 대한 답변을 원하거나 특정 주제에 대한 정보를 얻고자 하는 경우, 그 목적을 명확히 표현해야 합니다.\n\n2. **구체성 유지**: 가능한 한 구체적으로 작성하세요. 모호한 표현은 오해를 초래할 수 있으므로, 구체적인 사례나 예를 들어 설명하는 것이 좋습니다.\n\n3. **문맥 제공**: 필요한 경우 관련 문맥을 제공하세요. 이는 챗봇이 더 정확한 답변을 하도록 도와줄 수 있습니다.\n\n4. **질문 방식**: 직접적인 질문 형태로 작성하는 것이 답변을 얻는 데 더 효과적일 수 있습니다. 예를 들어, \"서울에서 부산까지 가는 가장 빠른 방법은 무엇인가요?\"와 같이 물어보세요.\n\n5. **올바른 어조 사용**: 상황에 맞는 적절한 어조를 사용하세요. (공식적이나 비공식적으로, 상황에 따라 다릅니다.)\n\n6. **추가 지시사항**: 필요한 경우 추가적인 지시사항을 포함하세요. 예를 들어, \"500자 이내로 요약해주세요\"와 같이 요청할 수 있습니다.\n\n7. **예시 제공**: 경우에 따라 예시를 제공하여 원하는 형태의 답변을 유도할 수 있습니다.\n\n이러한 팁들을 활용하여 보다 효과적인 프롬프트를 작성해보세요. 구체적인 도움이 필요하시면 말씀해 주세요!" },
    { id: 11, session_id: 14, role: "당신", text: "기술스택 설명" },
    { id: 12, session_id: 14, role: "bot", text: "기술스택은 프로젝트나 서비스를 개발할 때 사용하는 여러 기술들의 총체를 의미합니다. 일반적으로 다음과 같은 요소들을 포함할 수 있습니다:\n\n1. **프로그래밍 언어**: Java, Python, JavaScript, Ruby, C#, C++ 등\n2. **프레임워크와 라이브러리**: React, Angular, Vue.js, Django, Flask, Spring Boot 등\n3. **데이터베이스**: MySQL, PostgreSQL, MongoDB, Redis 등\n4. **웹 서버**: Apache, Nginx 등\n5. **운영 체제**: Linux, Windows, macOS 등\n6. **백엔드 서비스**: AWS, Google Cloud, Azure 등\n7. **프론트엔드 툴**: Webpack, Babel, TypeScript 등\n8. **버전 관리 시스템**: Git, SVN 등\n9. **CI/CD 툴**: Jenkins, GitHub Actions, GitLab CI 등\n10. **컨테이너화 및 오케스트레이션**: Docker, Kubernetes 등\n11. **API 및 통신 프로토콜**: REST, GraphQL, WebSockets 등\n12. **테스트 프레임워크**: JUnit, Mocha, Jest 등\n\n기술스택은 프로젝트의 특성에 따라 선택됩니다. 예를 들어, 웹 애플리케이션을 개발할 때는 프론트엔드와 백엔드, 데이터베이스, 서버 등 다양한 요소를 고려하여 적절한 기술들을 선택합니다." },
    { id: 3, session_id: 15, role: "당신", text: "안녕?" },
    { id: 4, session_id: 15, role: "bot", text: "안녕하세요! 어떻게 도와드릴까요?" },
    { id: 5, session_id: 15, role: "당신", text: "너는 누구야?" },
    { id: 6, session_id: 15, role: "bot", text: "저는 당신을 도울 준비가 된 친절한 인공지능 챗봇이예요. 어떤 질문이든지 물어봐주세요!" },
    { id: 7, session_id: 15, role: "당신", text: "영화 오딧세이는 어때?" },
    { id: 8, session_id: 15, role: "bot", text: "영화 \"오딧세이\"는 매우 흥미롭고 감동적인 작품으로 알려져 있습니다. 우주 탐사의 위험성과 인간의 생존 의지를 중심으로 이야기가 전개되며, 시각적 효과와 연기, 스토리텔링 모두 뛰어납니다. 영화의 주인공 매터스는 행성에서 고립되면서 겪는 고통과 도전, 그리고 동료들의 구조 작전이 인상적입니다. 이 영화를 보시면 definitely 좋을 것 같아요!" },
  ],
};

export default function App() {
  const [sessions, setSessions] = useState(LOCAL_INITIAL_HISTORY.sessions);
  const [sessionId, setSessionId] = useState(LOCAL_INITIAL_HISTORY.sessions[0].id);
  const [messages, setMessages] = useState(
    LOCAL_INITIAL_HISTORY.messages.filter(
      (message) => message.session_id === LOCAL_INITIAL_HISTORY.sessions[0].id
    )
  );
  const [usingLocalHistory, setUsingLocalHistory] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Request failed");
    return data;
  };

  const loadSessions = async () => {
    const data = await requestJson(`${API}/sessions`);
    const next = Array.isArray(data.sessions) ? data.sessions : [];
    setSessions(next);
    return next;
  };

  const loadMessages = async (id) => {
    if (!id) { setMessages([]); return; }
    const data = await requestJson(`${API}/sessions/${id}/message`);
    setMessages(Array.isArray(data.messages) ? data.messages : []);
  };

  const openSession = async (id) => {
    setSessionId(id);
    setEditing(null);
    if (usingLocalHistory) {
      setMessages(LOCAL_INITIAL_HISTORY.messages.filter((message) => message.session_id === id));
      return;
    }
    await loadMessages(id);
  };

  const newSession = async () => {
    try {
      const data = await requestJson(`${API}/sessions`, { method: "POST" });
      await loadSessions();
      setSessionId(data.id);
      setMessages([]);
      setInput("");
    } catch { setNotice("\uC0C8 \uB300\uD654\uB97C \uB9CC\uB4E4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."); }
  };

  const saveTitle = async (session) => {
    const title = editing?.title?.trim();
    if (!title) { setEditing(null); return; }
    if (usingLocalHistory) {
      setSessions((current) => current.map((item) => (item.id === session.id ? { ...item, title } : item)));
      setEditing(null);
      return;
    }
    try {
      await requestJson(`${API}/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      setEditing(null);
      await loadSessions();
    } catch { setNotice("\uB300\uD654 \uC774\uB984\uC744 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."); }
  };

  const removeSession = async (id) => {
    if (usingLocalHistory) {
      const next = sessions.filter((session) => session.id !== id);
      const nextId = next[0]?.id ?? null;
      setSessions(next);
      setSessionId(nextId);
      setMessages(LOCAL_INITIAL_HISTORY.messages.filter((message) => message.session_id === nextId));
      return;
    }
    try {
      await requestJson(`${API}/sessions/${id}`, { method: "DELETE" });
      const next = await loadSessions();
      const nextId = next[0]?.id ?? null;
      setSessionId(nextId);
      await loadMessages(nextId);
    } catch { setNotice("\uB300\uD654\uB97C \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || loading) return;
    setInput("");
    setLoading(true);
    try {
      await requestJson(`${API}/sessions/${sessionId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      await Promise.all([loadMessages(sessionId), loadSessions()]);
    } catch { setNotice("\uBA54\uC2DC\uC9C0\uB97C \uBCF4\uB0BC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await requestJson(`${API}/health`);
        if (!mounted) return;
        setStatus("ready");
        setUsingLocalHistory(false);
        const next = await loadSessions();
        if (next[0]) {
          setSessionId(next[0].id);
          await loadMessages(next[0].id);
        }
      } catch {
        if (mounted) { setStatus("error"); setNotice("\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uBC31\uC5D4\uB4DC \uC0C1\uD0DC\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694."); }
      }
    })();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chat-shell">
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label={"\uB2EB\uAE30"}>x</button></div>}
      <aside className="sidebar">
        <div className="brand"><strong>MBC</strong> {"\uCC57\uBD07"}</div>
        <button className="new-chat" onClick={newSession} disabled={status !== "ready"}>{"+ \uC0C8 \uB300\uD654"}</button>
        <nav className="conversation-nav" aria-label={"\uB300\uD654 \uBAA9\uB85D"}>
          {sessions.map((session) => <div className={`conversation ${session.id === sessionId ? "active" : ""}`} key={session.id}>
            {editing?.id === session.id ? <span className="conversation-edit"><input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter") saveTitle(session); if (event.key === "Escape") setEditing(null); }} /><button onClick={() => saveTitle(session)}>{"\uC800\uC7A5"}</button><button onClick={() => setEditing(null)}>{"\uCDE8\uC18C"}</button></span>
              : <button className="conversation-title" onClick={() => openSession(session.id)} title={session.title}>{session.title}</button>}
            {session.id === sessionId && editing?.id !== session.id && <span className="conversation-actions"><button onClick={() => setEditing({ id: session.id, title: session.title })}>{"\uC774\uB984 \uBCC0\uACBD"}</button><button onClick={() => removeSession(session.id)}>{"\uC0AD\uC81C"}</button></span>}
          </div>)}
        </nav>
      </aside>
      <main className="workspace">
        <section className="chat-column">
          {messages.length === 0 ? <div className="empty-state"><h1>{"\uB300\uD654\uB97C \uC2DC\uC791\uD558\uC138\uC694"}</h1><p>{"\uBA54\uC2DC\uC9C0\uAC00 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4."}</p></div> : <div className="message-list">
            {messages.map((message) => message.role === "bot" ? <article className="bot-message" key={message.id}><span className="ai-badge">A</span><p>{message.text}</p></article> : <article className="question-card" key={message.id}><p>{message.text}</p><button onClick={() => setInput(message.text)}>{"\uC218\uC815"}</button></article>)}
            {loading && <div className="typing"><i /><i /><i /> {"\uB2F5\uBCC0\uC744 \uC791\uC131\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4"}</div>}
          </div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={status === "ready" ? "\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694..." : "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD558\uB294 \uC911\uC785\uB2C8\uB2E4..."} disabled={!sessionId || loading || status !== "ready"} /><button type="submit" disabled={!input.trim() || !sessionId || loading || status !== "ready"}>{"\uC804\uC1A1"}</button></form>
        </section>
      </main>
    </div>
  );
}
