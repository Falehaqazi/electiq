import { useState, useEffect, useCallback, useRef, memo } from "react";

const GEMINI_SYSTEM_PROMPT = `You are ElectIQ, an expert on India's election process. 
You help citizens understand elections, voting rights, the Model Code of Conduct, 
EVMs, nomination procedures, and result declaration. 
Keep answers concise (2-4 sentences), factual, and beginner-friendly.
Only answer election-related questions. For unrelated topics, politely redirect.
Always mention the Election Commission of India (ECI) where relevant.`;

async function callGemini(userMessage, apiKey) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: GEMINI_SYSTEM_PROMPT + "\n\nUser question: " + userMessage
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300
        }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("Gemini error:", err);
    throw new Error("Gemini API error: " + response.status);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't process that. Please try again.";
}

const PHASES = [
  {
    id: 1, icon: "📢",
    title: "Election Announcement",
    date: "~6 weeks before",
    status: "done",
    tag: "Completed",
    detail: "The Election Commission of India (ECI) announces the complete election schedule including phase dates and polling timelines. The Model Code of Conduct (MCC) comes into effect immediately upon announcement, restricting political parties and the government from making policy announcements that could influence voters.",
    keyFact: "ECI is a constitutional body under Article 324",
  },
  {
    id: 2, icon: "📋",
    title: "Model Code of Conduct",
    date: "From announcement day",
    status: "done",
    tag: "Completed",
    detail: "A binding set of guidelines issued by the ECI to regulate political parties and candidates during the election period. It bans the ruling party from announcing new government schemes, misusing government resources for campaigning, or making appeals based on religion, caste, or community.",
    keyFact: "MCC has no statutory backing but is strictly enforced by ECI",
  },
  {
    id: 3, icon: "🗂️",
    title: "Voter Registration",
    date: "~4 weeks before",
    status: "done",
    tag: "Completed",
    detail: "The electoral roll (voter list) is finalized. Citizens aged 18+ who are registered can vote. Voters can check or update their registration at voters.eci.gov.in. On polling day, the Voter ID card (EPIC) or any of 12 approved alternate documents is accepted.",
    keyFact: "India has over 960 million registered voters",
  },
  {
    id: 4, icon: "📝",
    title: "Nomination Filing",
    date: "~3 weeks before",
    status: "active",
    tag: "In progress",
    detail: "Candidates file nomination papers with the Returning Officer of their constituency. Each Lok Sabha candidate must pay a security deposit of ₹25,000 (₹12,500 for SC/ST candidates). Nominations go through scrutiny; invalid nominations are rejected. Candidates can withdraw within 2 days of scrutiny.",
    keyFact: "Deposit is forfeited if the candidate gets less than 1/6 of votes polled",
  },
  {
    id: 5, icon: "📣",
    title: "Campaign Period",
    date: "~2 weeks",
    status: "upcoming",
    tag: "Upcoming",
    detail: "Parties and candidates campaign across their constituencies through rallies, media, and door-to-door outreach. Campaign spending is capped at ₹95 lakhs per Lok Sabha candidate. The 'silence period' begins 48 hours before polling — no campaigning, rallies, or exit poll broadcasts are permitted.",
    keyFact: "Campaign expenditure is monitored by election observers",
  },
  {
    id: 6, icon: "🗳️",
    title: "Voting Day (Polling)",
    date: "Scheduled date(s)",
    status: "upcoming",
    tag: "Upcoming",
    detail: "Polling stations open 7 AM to 6 PM. India uses Electronic Voting Machines (EVMs) paired with VVPAT (Voter Verifiable Paper Audit Trail) units for transparency. Large states vote in multiple phases spread over weeks to allow adequate security deployment and logistics management.",
    keyFact: "India conducts the world's largest democratic exercise",
  },
  {
    id: 7, icon: "📊",
    title: "Counting & Results",
    date: "~1 week after final phase",
    status: "upcoming",
    tag: "Upcoming",
    detail: "Votes are counted at designated counting centres under strict ECI supervision. Results are declared constituency by constituency on a public dashboard. The party or alliance that wins 272+ seats in the 543-seat Lok Sabha forms the government. The President invites the majority leader to take oath.",
    keyFact: "Results are typically declared within 1 day of counting",
  },
];

const QUIZ_QUESTIONS = [
  {
    q: "What is the minimum age to vote in Indian elections?",
    opts: ["16 years", "18 years", "21 years", "25 years"],
    ans: 1,
    explanation: "Article 326 of the Indian Constitution grants the right to vote to every citizen who is 18 years of age or older.",
  },
  {
    q: "What does MCC stand for in Indian elections?",
    opts: ["Maximum Campaign Cost", "Model Code of Conduct", "Mandatory Candidate Criteria", "Minimum Constituency Count"],
    ans: 1,
    explanation: "The Model Code of Conduct (MCC) is issued by the ECI to ensure free and fair elections by regulating party and candidate behaviour.",
  },
  {
    q: "How many seats are needed for a majority in the Lok Sabha?",
    opts: ["250 seats", "261 seats", "272 seats", "300 seats"],
    ans: 2,
    explanation: "The Lok Sabha has 543 elected seats. A simple majority requires 272 seats (more than half of 543).",
  },
  {
    q: "What technology is used alongside EVMs for vote verification?",
    opts: ["Blockchain ledger", "VVPAT machine", "Fingerprint scanner", "QR code scanner"],
    ans: 1,
    explanation: "VVPAT (Voter Verifiable Paper Audit Trail) prints a slip showing the party symbol voted for, visible to the voter for 7 seconds before being stored.",
  },
  {
    q: "How many hours before polling does the 'silence period' begin?",
    opts: ["12 hours", "24 hours", "48 hours", "72 hours"],
    ans: 2,
    explanation: "The 48-hour silence period bans all campaigning and exit poll broadcasts, giving voters time to decide free from campaign pressure.",
  },
  {
    q: "What is the security deposit for a Lok Sabha candidate?",
    opts: ["₹10,000", "₹25,000", "₹50,000", "₹1,00,000"],
    ans: 1,
    explanation: "Lok Sabha candidates must deposit ₹25,000 (₹12,500 for SC/ST). It is forfeited if they receive less than 1/6 of the votes polled.",
  },
];

const SUGGESTIONS = [
  "Who can vote in India?",
  "What is the Model Code of Conduct?",
  "How does an EVM work?",
  "What is the VVPAT machine?",
  "How are election results declared?",
  "What is the silence period?",
  "How many Lok Sabha seats are there?",
  "Can I vote without a Voter ID?",
];

const PhaseItem = memo(({ phase, isOpen, onToggle }) => {
  const statusColors = {
    done: { dot: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7", tag: "#1B5E20" },
    active: { dot: "#1565C0", bg: "#E3F2FD", border: "#90CAF9", tag: "#0D47A1" },
    upcoming: { dot: "#757575", bg: "#F5F5F5", border: "#E0E0E0", tag: "#424242" },
  };
  const c = statusColors[phase.status];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 14,
            backgroundColor: c.bg, border: `1.5px solid ${c.border}`,
            color: c.dot, fontWeight: 600, flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {phase.status === "done" ? "✓" : phase.id}
        </div>
        {phase.id < PHASES.length && (
          <div style={{ width: 1, flex: 1, minHeight: 16, background: "#E0E0E0", margin: "3px 0" }} aria-hidden="true" />
        )}
      </div>

      <div style={{ flex: 1, paddingBottom: 16 }}>
        <button
          onClick={() => onToggle(phase.id)}
          aria-expanded={isOpen}
          aria-controls={`phase-detail-${phase.id}`}
          style={{
            width: "100%", background: "none", border: "none", cursor: "pointer",
            padding: 0, textAlign: "left", display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", gap: 8,
          }}
        >
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
              {phase.icon} {phase.title}
            </span>
            <div style={{ marginTop: 3 }}>
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 10,
                backgroundColor: c.bg, color: c.tag, fontWeight: 500,
              }}>
                {phase.tag}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "#757575" }}>{phase.date}</div>
            <div style={{ fontSize: 11, color: "#1565C0", marginTop: 4 }}>
              {isOpen ? "▲ Hide" : "▼ Details"}
            </div>
          </div>
        </button>

        <div
          id={`phase-detail-${phase.id}`}
          role="region"
          aria-label={`Details for ${phase.title}`}
          hidden={!isOpen}
          style={{
            marginTop: 8, fontSize: 13, color: "#424242", lineHeight: 1.65,
            padding: "10px 14px", backgroundColor: "#F8F9FA",
            borderRadius: 8, borderLeft: `3px solid ${c.border}`,
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>{phase.detail}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#1565C0", fontWeight: 500 }}>
            💡 Key fact: {phase.keyFact}
          </p>
        </div>
      </div>
    </div>
  );
});

function Quiz() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const announcerRef = useRef(null);

  const current = QUIZ_QUESTIONS[idx];

  const handleAnswer = useCallback((i) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === current.ans) setScore(s => s + 1);
    if (announcerRef.current) {
      announcerRef.current.textContent = i === current.ans
        ? "Correct! " + current.explanation
        : "Incorrect. " + current.explanation;
    }
  }, [chosen, current]);

  const handleNext = () => {
    if (idx + 1 >= QUIZ_QUESTIONS.length) setDone(true);
    else { setIdx(i => i + 1); setChosen(null); }
  };

  const restart = () => { setIdx(0); setScore(0); setChosen(null); setDone(false); };

  if (done) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div style={{ padding: "2rem", textAlign: "center" }} role="main" aria-label="Quiz results">
        <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">
          {pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#1565C0" }}>{score}/{QUIZ_QUESTIONS.length}</div>
        <div style={{ fontSize: 16, color: "#424242", marginTop: 8 }}>
          {pct >= 80 ? "Excellent! You're an election expert." : pct >= 60 ? "Good effort! Review the timeline for more." : "Keep learning — the timeline has everything you need!"}
        </div>
        <div style={{ margin: "1.5rem auto", padding: "12px 20px", background: "#E3F2FD", borderRadius: 12, maxWidth: 200, fontSize: 14, color: "#1565C0" }}>
          Score: {pct}%
        </div>
        <button
          onClick={restart}
          style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #1565C0", background: "#fff", color: "#1565C0", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          aria-label="Restart the quiz"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.25rem 1.5rem" }} role="main" aria-label="Election knowledge quiz">
      <div aria-live="polite" aria-atomic="true" ref={announcerRef} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }} />
      <div style={{ fontSize: 12, color: "#757575", marginBottom: 12 }}>
        Question {idx + 1} of {QUIZ_QUESTIONS.length} · Score: {score}
      </div>
      <div style={{ width: "100%", height: 4, background: "#E3F2FD", borderRadius: 2, marginBottom: 16 }}>
        <div style={{ width: `${(idx / QUIZ_QUESTIONS.length) * 100}%`, height: "100%", background: "#1565C0", borderRadius: 2, transition: "width 0.3s" }}
          role="progressbar" aria-valuenow={idx} aria-valuemin={0} aria-valuemax={QUIZ_QUESTIONS.length} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 16, lineHeight: 1.5 }}>{current.q}</p>
      <div role="group" aria-label="Answer options" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {current.opts.map((opt, i) => {
          let bg = "#fff", border = "1.5px solid #E0E0E0", color = "#1a1a1a";
          if (chosen !== null) {
            if (i === current.ans) { bg = "#E8F5E9"; border = "1.5px solid #4CAF50"; color = "#1B5E20"; }
            else if (i === chosen) { bg = "#FFEBEE"; border = "1.5px solid #EF5350"; color = "#B71C1C"; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={chosen !== null}
              aria-pressed={chosen === i}
              aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}${chosen !== null && i === current.ans ? " — correct answer" : ""}${chosen === i && i !== current.ans ? " — your answer, incorrect" : ""}`}
              style={{ padding: "11px 14px", borderRadius: 8, border, background: bg, color, cursor: chosen !== null ? "default" : "pointer", textAlign: "left", fontSize: 13, fontWeight: 500, transition: "all 0.15s" }}>
              <span aria-hidden="true" style={{ marginRight: 8, color: "#9E9E9E" }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#F3F4F6", borderRadius: 8, fontSize: 13, color: "#424242", lineHeight: 1.6 }} role="alert">
          {current.explanation}
        </div>
      )}
      {chosen !== null && (
        <button onClick={handleNext}
          style={{ marginTop: 14, padding: "9px 20px", borderRadius: 8, border: "none", background: "#1565C0", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          aria-label={idx + 1 >= QUIZ_QUESTIONS.length ? "View your results" : "Next question"}>
          {idx + 1 >= QUIZ_QUESTIONS.length ? "See results →" : "Next question →"}
        </button>
      )}
    </div>
  );
}

function Chat({ apiKey }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm ElectIQ 🗳️ Ask me anything about India's election process — voting rights, EVMs, the MCC, nominations, or how results are declared." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggIdx, setSuggIdx] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      if (!apiKey) throw new Error("No API key");
      const reply = await callGemini(msg, apiKey);
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => [...prev, {
        role: "bot",
        text: "I'm having trouble connecting. Error: " + e.message,
      }]);
    } finally {
      setLoading(false);
      setSuggIdx(i => (i + 2) % SUGGESTIONS.length);
      inputRef.current?.focus();
    }
  }, [input, loading, apiKey]);

  const shownSuggs = SUGGESTIONS.slice(suggIdx, suggIdx + 2);

  return (
    <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid #E0E0E0", background: "#fff" }}
      role="complementary" aria-label="Election AI assistant chat">
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #E0E0E0" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Ask ElectIQ</div>
        <div style={{ fontSize: 11, color: "#757575" }}>Powered by Gemini 1.5 Flash</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 300, maxHeight: 420 }}
        role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            <div style={{
              padding: "9px 12px",
              borderRadius: m.role === "user" ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
              background: m.role === "user" ? "#1565C0" : "#F3F4F6",
              color: m.role === "user" ? "#fff" : "#1a1a1a",
              fontSize: 13, lineHeight: 1.6,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start" }} aria-label="ElectIQ is typing">
            <div style={{ padding: "10px 14px", borderRadius: "2px 12px 12px 12px", background: "#F3F4F6", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9E9E9E", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: "6px 14px", borderTop: "1px solid #F0F0F0", display: "flex", flexDirection: "column", gap: 4 }}>
        {shownSuggs.map((s, i) => (
          <button key={i} onClick={() => send(s)} disabled={loading}
            style={{ fontSize: 11, padding: "5px 9px", border: "1px solid #E0E0E0", borderRadius: 6, background: "#fff", color: "#424242", cursor: "pointer", textAlign: "left" }}
            aria-label={`Suggested question: ${s}`}>
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderTop: "1px solid #E0E0E0" }}>
        <label htmlFor="chat-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Type your election question</label>
        <input id="chat-input" ref={inputRef} type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask anything..." disabled={loading}
          aria-label="Type your election question"
          style={{ flex: 1, padding: "8px 10px", fontSize: 12, border: "1px solid #E0E0E0", borderRadius: 6, background: "#F9F9F9", color: "#1a1a1a" }} />
        <button onClick={() => send()} disabled={loading || !input.trim()} aria-label="Send message"
          style={{ padding: "8px 12px", background: "#1565C0", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("timeline");
  const [openPhase, setOpenPhase] = useState(4);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const togglePhase = useCallback((id) => {
    setOpenPhase(prev => prev === id ? null : id);
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F5F7FA; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        button:focus-visible { outline: 2px solid #1565C0; outline-offset: 2px; }
        a:focus-visible { outline: 2px solid #1565C0; outline-offset: 2px; }
        .tab-btn { padding: 8px 16px; font-size: 13px; border: 1px solid #E0E0E0; border-bottom: none; border-radius: 6px 6px 0 0; cursor: pointer; background: #EEEEEE; color: #616161; font-weight: 500; transition: all 0.15s; }
        .tab-btn[aria-selected="true"] { background: #fff; color: #1565C0; border-color: #BDBDBD; font-weight: 600; }
        .tab-btn:hover:not([aria-selected="true"]) { background: #E3F2FD; color: #1565C0; }
      `}</style>

      <a href="#main-content" style={{ position: "absolute", top: -40, left: 8, padding: "8px 16px", background: "#1565C0", color: "#fff", borderRadius: 4, fontSize: 13, zIndex: 1000, transition: "top 0.15s" }}
        onFocus={e => e.target.style.top = "8px"}
        onBlur={e => e.target.style.top = "-40px"}>
        Skip to main content
      </a>

      <div style={{ maxWidth: 960, margin: "0 auto", background: "#fff", minHeight: "100vh", boxShadow: "0 0 0 1px #E0E0E0" }}>
        <header style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #E0E0E0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }} role="banner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }} aria-hidden="true">🗳️</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>ElectIQ</h1>
              <p style={{ fontSize: 11, color: "#757575" }}>India's election process guide</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Lok Sabha", active: true }, { label: "State Assembly", active: false }, { label: "Local Body", active: false }].map(e => (
              <button key={e.label}
                style={{ padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 500, border: `1.5px solid ${e.active ? "#1565C0" : "#E0E0E0"}`, background: e.active ? "#E3F2FD" : "#fff", color: e.active ? "#1565C0" : "#757575", cursor: "pointer" }}
                aria-pressed={e.active} aria-label={`Switch to ${e.label} elections view`}>
                {e.label}
              </button>
            ))}
          </div>
        </header>

        <nav aria-label="Main sections" style={{ display: "flex", gap: 6, padding: "1rem 1.5rem 0", borderBottom: "1px solid #E0E0E0" }}>
          {[{ id: "timeline", label: "📅 Timeline" }, { id: "quiz", label: "🧠 Knowledge Quiz" }].map(t => (
            <button key={t.id} className="tab-btn" role="tab" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        <main id="main-content" style={{ display: "flex", minHeight: 520 }}>
          <div id="panel-timeline" role="tabpanel" aria-label="Election timeline" style={{ flex: 1, display: tab === "timeline" ? "flex" : "none" }}>
            <div style={{ flex: 1, padding: "1.25rem 1.5rem", overflowY: "auto" }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "#757575", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                Election phases — Lok Sabha
              </h2>
              <div role="list" aria-label="Election phases list">
                {PHASES.map(phase => (
                  <div key={phase.id} role="listitem">
                    <PhaseItem phase={phase} isOpen={openPhase === phase.id} onToggle={togglePhase} />
                  </div>
                ))}
              </div>
            </div>
            <Chat apiKey={apiKey} />
          </div>

          <div id="panel-quiz" role="tabpanel" aria-label="Election knowledge quiz" style={{ flex: 1, display: tab === "quiz" ? "flex" : "none" }}>
            <div style={{ flex: 1 }}>
              <Quiz />
            </div>
            <Chat apiKey={apiKey} />
          </div>
        </main>

        <footer style={{ padding: "12px 1.5rem", borderTop: "1px solid #E0E0E0", fontSize: 11, color: "#9E9E9E", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }} role="contentinfo">
          <span>ElectIQ · Built with Google Antigravity + Gemini 1.5 Flash</span>
          <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#1565C0" }} aria-label="Visit Election Commission of India official website (opens in new tab)">
            Election Commission of India ↗
          </a>
        </footer>
      </div>
    </>
  );
}
