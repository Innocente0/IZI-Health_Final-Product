import { useEffect, useRef, useState } from "react";
import { HeartPulse, MessageCircle, Send, X } from "lucide-react";
import { API_URL, KEY, getStored, setStored } from "../config.js";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  const [messages, setMessages] = useState(
    getStored(KEY.chat, [
      {
        sender: "bot",
        message: "Hello! I am your Health Navigator. How can I help you today?",
      },
    ])
  );

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !bodyRef.current) return;

    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    const handleOpenChat = () => setOpen(true);

    window.addEventListener("open-chat", handleOpenChat);

    return () => {
      window.removeEventListener("open-chat", handleOpenChat);
    };
  }, []);

  async function send() {
    if (!text.trim()) return;

    const userText = text;
    const updatedMessages = [
      ...messages,
      {
        sender: "user",
        message: userText,
      },
    ];

    setMessages(updatedMessages);
    setStored(KEY.chat, updatedMessages);
    setText("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const data = await response.json();
      const finalMessages = [
        ...updatedMessages,
        {
          sender: "bot",
          message: data.answer || "Sorry, I could not find a good answer.",
          facilities: data.facilities || [],
        },
      ];

      setMessages(finalMessages);
      setStored(KEY.chat, finalMessages);
    } catch (error) {
      console.error("Chatbot error:", error);

      const errorMessages = [
        ...updatedMessages,
        {
          sender: "bot",
          message:
            "Sorry, the chatbot service is not available. Make sure the backend and ML service are running.",
        },
      ];

      setMessages(errorMessages);
      setStored(KEY.chat, errorMessages);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    const newMessages = [
      {
        sender: "bot",
        message: "New conversation started. How can I help?",
      },
    ];

    setMessages(newMessages);
    setStored(KEY.chat, newMessages);
  }

  return (
    <>
      {open && (
        <div className="chat">
          <div className="chatHead">
            <HeartPulse />
            <b>Health Navigator</b>
            <span>AI</span>

            <button type="button" className="chatClearBtn" onClick={clear}>
              Clear
            </button>

            <button type="button" className="chatCloseBtn" onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          <div className="chatBody" ref={bodyRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.sender === "user" ? "bubble user" : "bubble"}
              >
                <div>{message.message}</div>

                {message.facilities && message.facilities.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    {message.facilities.map((facility) => (
                      <a
                        key={facility.id}
                        href={`/facilities?q=${encodeURIComponent(
                          facility.name
                        )}`}
                        style={{
                          display: "block",
                          marginTop: "8px",
                          padding: "8px",
                          borderRadius: "10px",
                          background: "#f1ecff",
                          color: "#3b1978",
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        View {facility.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && <div className="bubble">Thinking...</div>}
          </div>

          <div className="chatInput">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) {
                  send();
                }
              }}
              placeholder="Type your message..."
              disabled={loading}
            />

            <button type="button" onClick={send} disabled={loading}>
              <Send />
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button type="button" className="chatBtn" onClick={() => setOpen(true)}>
          <MessageCircle />
        </button>
      )}
    </>
  );
}
