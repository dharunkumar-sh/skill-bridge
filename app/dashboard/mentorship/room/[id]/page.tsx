"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Send, Sparkles, AlertCircle, Loader2, StopCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import ReactMarkdown from "react-markdown";

export default function MentorRoomPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Fetch
  useEffect(() => {
    async function loadRoom() {
      if (!user?.email) return;
      try {
        // Find session details to display header
        const secRes = await axios.get(`/api/mentorship/sessions?email=${encodeURIComponent(user.email)}`);
        const targetSession = secRes.data.sessions?.find((s: any) => s.id === sessionId);
        
        if (!targetSession) {
          setError("Session not found or you don't have access.");
          setLoading(false);
          return;
        }
        
        setSessionData(targetSession);

        // Fetch messages
        const msgRes = await axios.get(`/api/mentorship/chat?sessionId=${sessionId}`);
        setMessages(msgRes.data.messages || []);

      } catch (err) {
        console.error(err);
        setError("Failed to load session data.");
      } finally {
        setLoading(false);
      }
    }
    loadRoom();
  }, [sessionId, user?.email]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userText = inputValue;
    setInputValue("");
    setIsSending(true);

    // Optimistically update UI
    const tempUserMsg = { id: `temp-${Date.now()}`, sender: "user", content: userText, sentAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await axios.post("/api/mentorship/chat", {
        sessionId,
        content: userText,
      });

      // Replace optimistic message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, res.data.userMessage, res.data.aiMessage];
      });

    } catch (err) {
      console.error(err);
      // Let user retry
      setInputValue(userText);
      setMessages((prev) => prev.filter(m => m.id !== tempUserMsg.id));
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const endSession = () => {
    if (confirm("Are you sure you want to exit the mentorship session? Your chat history is saved securely.")) {
      router.push("/dashboard/mentorship");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400">Connecting to Mentor Link...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="text-center py-24 bg-midnight-900 border border-white/5 rounded-3xl max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Button onClick={() => router.push("/dashboard/mentorship")}>Return to Hub</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 max-w-5xl mx-auto -mt-2">
      
      {/* ── Room Header ── */}
      <div className="shrink-0 bg-midnight-900/80 backdrop-blur-md border border-white/10 rounded-t-3xl p-4 sm:p-6 flex justify-between items-center z-10 shadow-lg">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => router.push("/dashboard/mentorship")}
            className="w-10 h-10 rounded-full bg-midnight-800 hover:bg-midnight-700 flex items-center justify-center text-slate-400 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="relative shrink-0 hidden sm:block">
            <div className="w-12 h-12 rounded-2xl bg-midnight-950 flex items-center justify-center text-2xl border border-indigo-500/30">
              {sessionData.mentorAvatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-midnight-900 rounded-full animate-pulse"></div>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate flex items-center gap-2">
              {sessionData.mentorName} <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-semibold shrink-0 uppercase">AI Mentor</span>
            </h1>
            <p className="text-sm text-slate-400 truncate hidden sm:block">{sessionData.mentorRole} • {sessionData.topic}</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={endSession} className="text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 ml-2">
          <StopCircle size={14} className="mr-2" /> Exit
        </Button>
      </div>

      {/* ── Chat Container ── */}
      <div className="flex-1 overflow-y-auto bg-midnight-950/50 border-x border-white/5 p-4 sm:p-6 space-y-6 hide-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-4xl mb-4 border border-indigo-500/20">
              {sessionData.mentorAvatar}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Start the Session</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Introduce yourself and say you're ready for the {sessionData.topic.toLowerCase()}. The AI will adapt to your pace.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className="shrink-0 hidden xs:block">
                {isAI ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {sessionData.mentorAvatar}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm overflow-hidden">
                    {user?.picture ? <img src={user.picture} alt="" className="w-full h-full object-cover"/> : user?.name?.[0]}
                  </div>
                )}
              </div>
              
              <div className={`rounded-2xl p-4 ${
                isAI ? 'bg-midnight-900 border border-white/10 text-slate-300 shadow-lg' : 'bg-indigo-600 text-white shadow-xl'
              }`}>
                {isAI ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-midnight-950 prose-pre:border prose-pre:border-white/10">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                )}
                <div className={`text-[10px] mt-2 font-medium ${isAI ? 'text-slate-500' : 'text-indigo-200 text-right'}`}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        
        {isSending && (
          <div className="flex gap-4 max-w-[85%] mr-auto">
             <div className="w-8 h-8 shrink-0 hidden xs:flex rounded-full bg-indigo-500/20 border border-indigo-500/30 items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                {sessionData.mentorAvatar}
             </div>
             <div className="bg-midnight-900 border border-white/10 rounded-2xl p-4 flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="shrink-0 p-4 bg-midnight-900/80 backdrop-blur-md border border-white/10 rounded-b-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            placeholder={isSending ? `${sessionData.mentorName} is typing...` : "Message your mentor..."}
            className="w-full bg-midnight-950 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 shadow-inner transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md"
          >
            <Send size={18} className={isSending ? "animate-pulse" : ""} />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
          <Sparkles size={10} /> AI-generated guidance. Verify important technical facts.
        </p>
      </div>

    </div>
  );
}
