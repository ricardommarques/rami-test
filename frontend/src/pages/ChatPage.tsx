import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Lightbulb } from "lucide-react";
import { chatbotResponses } from "@/data/mockData";
import { WFPHeader } from "@/components/WFPHeader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What are the main food price trends across Lebanon, Syria and Palestine?",
  "Which country faces the most critical food access risks right now?",
  "What are the WFP programming recommendations for the region?",
  "How has the situation changed compared to last month?",
  "What is the latest AI-collected signal on commodity prices?",
];

function pickResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("trend")) {
    const arr = chatbotResponses.price;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes("access") || lower.includes("road") || lower.includes("checkpoint")) {
    const arr = chatbotResponses.access;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes("forecast") || lower.includes("predict") || lower.includes("outlook") || lower.includes("next")) {
    const arr = chatbotResponses.forecast;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes("recommend") || lower.includes("programme") || lower.includes("program") || lower.includes("intervention")) {
    const arr = chatbotResponses.recommendation;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const arr = chatbotResponses.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Hello. I'm the WFP Market Intelligence Assistant. I have access to market monitoring data, AI-collected signals, and news intelligence across **Lebanon**, **Syria**, and **Palestine**. You can ask me about price trends, food availability, market access, programming recommendations, or any other aspect of the regional food security situation.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: pickResponse(text), timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <WFPHeader title="AI Market Intelligence Assistant" />

      <div className="flex flex-1 overflow-hidden">
        {/* Suggested questions panel */}
        <div className="hidden w-72 shrink-0 flex-col gap-2 overflow-y-auto border-r border-neutral-200 p-4 lg:flex">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
            <Lightbulb className="h-3.5 w-3.5" />
            Suggested questions
          </div>
          {SUGGESTED_QUESTIONS.map((q) => (
            <Button
              key={q}
              variant="secondary"
              onClick={() => send(q)}
              className="h-auto justify-start whitespace-normal p-3 text-left text-xs leading-relaxed"
            >
              {q}
            </Button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === "assistant" ? "bg-primary" : "bg-neutral-800"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "border border-neutral-200 bg-neutral-50 text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {msg.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
                    )}
                    <div
                      className={`mt-2 text-xs ${
                        msg.role === "assistant" ? "text-neutral-400" : "text-primary-200"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <Spinner className="text-primary" />
                    <span className="text-sm text-neutral-400">Analysing signals…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-end gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about market conditions, food security trends, or programming implications…"
                rows={3}
                className="flex-1 resize-none"
              />
              <Button onClick={() => send(input)} disabled={!input.trim() || isTyping}>
                <Send />
                Send
              </Button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Responses are AI-generated from available market data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
