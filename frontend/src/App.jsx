import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
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
    try {
      await requestJson(`${API}/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      setEditing(null);
      await loadSessions();
    } catch { setNotice("\uB300\uD654 \uC774\uB984\uC744 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."); }
  };

  const removeSession = async (id) => {
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
        const next = await loadSessions();
        if (next[0]) await openSession(next[0].id);
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
        <div className="brand"><strong>AIVA</strong> {"\uCC57\uBD07"}</div>
        <button className="new-chat" onClick={newSession} disabled={status !== "ready"}>{"+ \uC0C8 \uB300\uD654"}</button>
        <nav className="conversation-nav" aria-label={"\uB300\uD654 \uBAA9\uB85D"}>
          {sessions.map((session) => <div className={`conversation ${session.id === sessionId ? "active" : ""}`} key={session.id}>
            {editing?.id === session.id ? <input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} onBlur={() => saveTitle(session)} onKeyDown={(event) => { if (event.key === "Enter") saveTitle(session); if (event.key === "Escape") setEditing(null); }} />
              : <button className="conversation-title" onClick={() => openSession(session.id)} title={session.title}>{session.title}</button>}
            {session.id === sessionId && editing?.id !== session.id && <span className="conversation-actions"><button onClick={() => setEditing({ id: session.id, title: session.title })}>{"\uC218\uC815"}</button><button onClick={() => removeSession(session.id)}>{"\uC0AD\uC81C"}</button></span>}
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
