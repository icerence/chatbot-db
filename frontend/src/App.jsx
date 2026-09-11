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
    } catch { setNotice("Could not create a new conversation."); }
  };

  const saveTitle = async (session) => {
    const title = editing?.title?.trim();
    if (!title) { setEditing(null); return; }
    try {
      await requestJson(`${API}/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      setEditing(null);
      await loadSessions();
    } catch { setNotice("Could not rename this conversation."); }
  };

  const removeSession = async (id) => {
    try {
      await requestJson(`${API}/sessions/${id}`, { method: "DELETE" });
      const next = await loadSessions();
      const nextId = next[0]?.id ?? null;
      setSessionId(nextId);
      await loadMessages(nextId);
    } catch { setNotice("Could not delete this conversation."); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || loading) return;
    setInput("");
    setLoading(true);
    try {
      await requestJson(`${API}/sessions/${sessionId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      await Promise.all([loadMessages(sessionId), loadSessions()]);
    } catch { setNotice("Could not send your message. Please try again."); }
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
        if (mounted) { setStatus("error"); setNotice("Could not connect to the server. Please check the backend."); }
      }
    })();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chat-shell">
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Close">x</button></div>}
      <aside className="sidebar">
        <div className="brand"><strong>AIVA</strong> CHATBOT</div>
        <button className="new-chat" onClick={newSession} disabled={status !== "ready"}>+ New Chat</button>
        <nav className="conversation-nav" aria-label="Conversations">
          {sessions.map((session) => <div className={`conversation ${session.id === sessionId ? "active" : ""}`} key={session.id}>
            {editing?.id === session.id ? <input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} onBlur={() => saveTitle(session)} onKeyDown={(event) => { if (event.key === "Enter") saveTitle(session); if (event.key === "Escape") setEditing(null); }} />
              : <button className="conversation-title" onClick={() => openSession(session.id)} title={session.title}>{session.title}</button>}
            {session.id === sessionId && editing?.id !== session.id && <span className="conversation-actions"><button onClick={() => setEditing({ id: session.id, title: session.title })}>Edit</button><button onClick={() => removeSession(session.id)}>Delete</button></span>}
          </div>)}
        </nav>
      </aside>
      <main className="workspace">
        <section className="chat-column">
          {messages.length === 0 ? <div className="empty-state"><h1>Start a conversation</h1><p>Your messages will appear here.</p></div> : <div className="message-list">
            {messages.map((message) => message.role === "bot" ? <article className="bot-message" key={message.id}><span className="ai-badge">A</span><p>{message.text}</p></article> : <article className="question-card" key={message.id}><p>{message.text}</p><button onClick={() => setInput(message.text)}>Edit</button></article>)}
            {loading && <div className="typing"><i /><i /><i /> Writing a response</div>}
          </div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={status === "ready" ? "Send a message..." : "Connecting to server..."} disabled={!sessionId || loading || status !== "ready"} /><button type="submit" disabled={!input.trim() || !sessionId || loading || status !== "ready"}>Send</button></form>
        </section>
      </main>
    </div>
  );
}
