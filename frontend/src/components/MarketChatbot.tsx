import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { chatbotResponses } from "@/data/mockData";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MarketChatbotProps {
  country: string;
  signal: string;
  signalLabel: string;
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What is driving the current price trend?",
  "What is the 2-week forecast for this indicator?",
  "What are WFP programming recommendations?",
  "How does market access affect this signal?",
];

function pickResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("trend")) {
    const arr = chatbotResponses.price;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes("access") || lower.includes("road") || lower.includes("checkpoint") || lower.includes("movement")) {
    const arr = chatbotResponses.access;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes("forecast") || lower.includes("predict") || lower.includes("next week") || lower.includes("outlook")) {
    const arr = chatbotResponses.forecast;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes("recommend") || lower.includes("programme") || lower.includes("program") || lower.includes("intervention") || lower.includes("response")) {
    const arr = chatbotResponses.recommendation;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const arr = chatbotResponses.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function MarketChatbot({
  country,
  signalLabel,
  isOpen,
  isExpanded,
  onClose,
  onExpand,
  onCollapse,
}: MarketChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: `Hello. I'm the WFP Market Intelligence Assistant. I have access to price monitoring data, AI-collected signals, and news intelligence for **${signalLabel}** in **${country}**. Ask me anything about the current situation, trends, or programming implications.`,
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
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const response = pickResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: response, timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className={`gap-0 p-0 shadow-2xl transition-all duration-300 ${
          isExpanded ? "w-full sm:max-w-full" : "w-1/2 sm:max-w-[50vw]"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <SheetTitle className="text-sm font-medium text-primary-foreground">
                WFP Market Intelligence Assistant
              </SheetTitle>
              <SheetDescription className="text-xs text-primary-foreground opacity-75">
                {country} — {signalLabel}
              </SheetDescription>
            </div>
            <Badge className="ml-1 bg-white/20 text-primary-foreground">AI</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={isExpanded ? onCollapse : onExpand}
              className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
              title={isExpanded ? "Collapse to half-page" : "Expand to full page"}
            >
              {isExpanded ? <Minimize2 /> : <Maximize2 />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
              title="Close"
            >
              <X />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
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
                  className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "border border-neutral-200 bg-neutral-50 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.content.split("**").map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
                  )}
                  <div
                    className={`mt-1 text-xs ${
                      msg.role === "assistant" ? "text-neutral-400" : "text-primary-200"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1 border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <Spinner className="size-3 text-primary" />
                  <span className="text-xs text-neutral-400">Analysing signals...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="shrink-0 space-y-2 border-t border-neutral-200 p-3">
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <Button key={q} variant="secondary" size="xs" onClick={() => send(q)}>
                {q}
              </Button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about market conditions, trends, or programming implications…"
              rows={2}
              className="flex-1 resize-none"
            />
            <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || isTyping}>
              <Send />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
