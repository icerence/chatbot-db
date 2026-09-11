import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const LOCAL_INITIAL_HISTORY = {
  sessions: [
    { id: 15, title: "\uC138\uC158 \uC5F4\uACE0 \uCC44\uD305" },
    { id: 14, title: "Dancing robot" },
    { id: 1, title: "i'm a robot" },
  ],
  messages: [
    { id: 3, session_id: 15, role: "\uB2F9\uC2E0", text: "\uC548\uB155?" },
    { id: 4, session_id: 15, role: "bot", text: "\uC548\uB155\uD558\uC138\uC694! \uC5B4\uB5BB\uAC8C \uB3C4\uC640\uB4DC\uB9B4\uAE4C\uC694?" },
    { id: 5, session_id: 15, role: "\uB2F9\uC2E0", text: "\uB108\uB294 \uB204\uAD6C\uC57C?" },
    { id: 6, session_id: 15, role: "bot", text: "\uC800\uB294 \uB2F9\uC2E0\uC744 \uB3C4\uC6B8 \uC900\uBE44\uAC00 \uB41C \uCE5C\uC808\uD55C \uC778\uACF5\uC9C0\uB2A5 \uCC57\uBD07\uC774\uC608\uC694. \uC5B4\uB5A4 \uC9C8\uBB38\uC774\uB4E0\uC9C0 \uBB3C\uC5B4\uBD10\uC8FC\uC138\uC694!" },
    { id: 7, session_id: 15, role: "\uB2F9\uC2E0", text: "\uC601\uD654 \uC624\uB517\uC138\uC774\uB294 \uC5B4\uB54C?" },
    { id: 8, session_id: 15, role: "bot", text: "\uC601\uD654 \"\uC624\uB517\uC138\uC774\"\uB294 \uB9E4\uC6B0 \uD765\uBBF8\uB86D\uACE0 \uAC10\uB3D9\uC801\uC778 \uC791\uD488\uC73C\uB85C \uC54C\uB824\uC838 \uC788\uC2B5\uB2C8\uB2E4. \uC6B0\uC8FC \uD0D0\uC0AC\uC758 \uC704\uD5D8\uC131\uACFC \uC778\uAC04\uC758 \uC0DD\uC874 \uC758\uC9C0\uB97C \uC911\uC2EC\uC73C\uB85C \uC774\uC57C\uAE30\uAC00 \uC804\uAC1C\uB418\uBA70, \uC2DC\uAC01\uC801 \uD6A8\uACFC\uC640 \uC5F0\uAE30, \uC2A4\uD1A0\uB9AC\uD154\uB9C1 \uBAA8\uB450 \uB6F0\uC5B4\uB0A9\uB2C8\uB2E4." },
  ],
};

export default function App() {
  const [sessions, setSessions] = useState(LOCAL_INITIAL_HISTORY.sessions);
  const [sessionId, setSessionId] = useState(LOCAL_INITIAL_HISTORY.sessions[0].id);
  const [messages, setMessages] = useState(LOCAL_INITIAL_HISTORY.messages);
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
        <div className="brand"><strong>AIVA</strong> {"\uCC57\uBD07"}</div>
        <button className="new-chat" onClick={newSession} disabled={status !== "ready"}>{"+ \uC0C8 \uB300\uD654"}</button>
        <nav className="conversation-nav" aria-label={"\uB300\uD654 \uBAA9\uB85D"}>
          {sessions.map((session) => <div className={`conversation ${session.id === sessionId ? "active" : ""}`} key={session.id}>
            {editing?.id === session.id ? <input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} onBlur={() => saveTitle(session)} onKeyDown={(event) => { if (event.key === "Enter") saveTitle(session); if (event.key === "Escape") setEditing(null); }} />
              : <button className="conversation-title" onClick={() => openSession(session.id)} title={session.title}>{session.title}</button>}
            {status === "ready" && session.id === sessionId && editing?.id !== session.id && <span className="conversation-actions"><button onClick={() => setEditing({ id: session.id, title: session.title })}>{"\uC218\uC815"}</button><button onClick={() => removeSession(session.id)}>{"\uC0AD\uC81C"}</button></span>}
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
