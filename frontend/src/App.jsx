import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const promptCards = ["Plan my work priorities for today", "Summarize my meeting notes", "Write a reply to a client"];

function makeGroups(sessions) {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  sessions.forEach((session, index) => groups[index === 0 ? "Today" : index < 4 ? "Yesterday" : "Earlier"].push(session));
  return groups;
}

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [model, setModel] = useState("AIVA 1");
  const groups = useMemo(() => makeGroups(sessions), [sessions]);

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
  const openSession = async (id) => { setSessionId(id); setEditing(null); await loadMessages(id); };
  const newSession = async () => {
    try {
      const data = await requestJson(`${API}/sessions`, { method: "POST" });
      await loadSessions(); setSessionId(data.id); setMessages([]); setInput("");
    } catch { setNotice("Could not create a new conversation."); }
  };
  const saveTitle = async (session) => {
    const title = editing?.title?.trim();
    if (!title) { setEditing(null); return; }
    try {
      await requestJson(`${API}/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      setEditing(null); await loadSessions();
    } catch { setNotice("Could not rename this conversation."); }
  };
  const removeSession = async (id) => {
    try {
      await requestJson(`${API}/sessions/${id}`, { method: "DELETE" });
      const next = await loadSessions(); const nextId = next[0]?.id ?? null;
      setSessionId(nextId); await loadMessages(nextId);
    } catch { setNotice("Could not delete this conversation."); }
  };
  const send = async (text = input) => {
    const message = text.trim();
    if (!message || !sessionId || loading) return;
    setInput(""); setLoading(true);
    try {
      await requestJson(`${API}/sessions/${sessionId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message }) });
      await Promise.all([loadMessages(sessionId), loadSessions()]);
    } catch { setNotice("Could not send your message. Please try again."); }
    finally { setLoading(false); }
  };
  // Initial server connection runs once when the application mounts.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await requestJson(`${API}/health`);
        if (!mounted) return;
        setStatus("ready"); const next = await loadSessions();
        if (next[0]) await openSession(next[0].id);
      } catch { if (mounted) { setStatus("error"); setNotice("Could not connect to the server. Please check the backend."); } }
    })();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chat-shell">
      {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Close">x</button></div>}
      <aside className="sidebar">
        <div className="brand"><strong>AIVA</strong> CHATBOT</div>
        <button className="new-chat" onClick={newSession} disabled={status !== "ready"}><span>+</span> New Chat</button>
        <nav className="conversation-nav" aria-label="Conversations">
          {Object.entries(groups).map(([group, entries]) => entries.length > 0 && <section key={group} className="conversation-group"><h2>{group}</h2>
            {entries.map((session) => <div className="conversation" key={session.id}>
              {editing?.id === session.id ? <input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} onBlur={() => saveTitle(session)} onKeyDown={(event) => { if (event.key === "Enter") saveTitle(session); if (event.key === "Escape") setEditing(null); }} /> : <button className="conversation-title" onClick={() => openSession(session.id)} title={session.title}><span>o</span>{session.title}</button>}
              {session.id === sessionId && editing?.id !== session.id && <span className="conversation-actions"><button onClick={() => setEditing({ id: session.id, title: session.title })} aria-label="Rename">Edit</button><button onClick={() => removeSession(session.id)} aria-label="Delete">x</button></span>}
            </div>)}
          </section>)}
        </nav>
        <button className="upgrade"><span>*</span> Upgrade to Plus</button>
      </aside>
      <main className="workspace">
        <header className="topbar"><div className="model-tabs" role="tablist" aria-label="Models">{["AIVA 1", "AIVA Pro", "AIVA Lite"].map((name) => <button key={name} className={model === name ? "selected" : ""} onClick={() => setModel(name)} role="tab" aria-selected={model === name}>{name}</button>)}</div><div className="profile"><span className="toggle"><i /></span><span className="avatar">A</span></div></header>
        <div className="content-grid"><section className="chat-column">
          {messages.length === 0 ? <div className="empty-state"><div className="empty-mark">A</div><h1>How can I help you?</h1><p>Ask a question or choose a prompt to start a conversation.</p><div className="prompt-grid">{promptCards.map((prompt) => <button key={prompt} onClick={() => send(prompt)} disabled={!sessionId || loading}>{prompt}</button>)}</div></div> : <div className="message-list">
            {messages.map((message) => message.role === "bot" ? <article className="bot-message" key={message.id}><span className="ai-badge">A</span><div className="response-card"><p>{message.text}</p><div className="feedback"><button aria-label="Like">Like</button><button aria-label="Dislike">Dislike</button></div></div></article> : <article className="question-card" key={message.id}><p>{message.text}</p><button onClick={() => setInput(message.text)} aria-label="Edit question">Edit</button></article>)}
            {loading && <div className="typing"><i /><i /><i /> AIVA is writing a response</div>}
            {!loading && <div className="suggestion-row"><button onClick={() => send("Make it shorter")}>Make it shorter</button><button onClick={() => send("Explain it simply")}>Explain it simply</button><button onClick={() => send("Tell me more")}>Tell me more</button></div>}
          </div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={status === "ready" ? "Send a message..." : "Connecting to server..."} disabled={!sessionId || loading || status !== "ready"} /><button type="submit" disabled={!input.trim() || !sessionId || loading || status !== "ready"} aria-label="Send">Send</button></form>
        </section><aside className="sources-panel"><h2>Links to <strong>Documents</strong> and <strong>Websites</strong> for this Response</h2><div className="source-empty">Sources for the current response will appear here.</div></aside></div>
      </main>
    </div>
  );
}
