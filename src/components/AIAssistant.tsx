import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  HelpCircle,
  Compass,
  CheckSquare,
} from "lucide-react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi there! I am your AI Travel Assistant. How can I help you plan or organize your trip today?",
    },
  ]);

  const handleSend = () => {
    if (!prompt.trim()) return;

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { sender: "user", text: prompt },
    ];
    setMessages(newMessages);
    setPrompt("");

    // Simulate AI response response after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `That sounds exciting! I'm ready to help you analyze that. (This is a mockup response for "${prompt.slice(0, 30)}...")`,
        },
      ]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence initial={false}>
        {isOpen ? (
          /* Open State - Rounded Chat Window */
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-lavender-500 to-indigo-600 dark:from-lavender-700 dark:to-indigo-800 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Sparkles size={16} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    AI Travel Assistant
                  </h3>
                  <span className="text-[10px] text-white/70 font-medium">
                    Ready to optimize your trip
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${
                      msg.sender === "user"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        : "bg-lavender-100 text-lavender-700 dark:bg-lavender-900/40 dark:text-lavender-300"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User size={13} />
                    ) : (
                      <Bot size={13} />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100 dark:bg-slate-800 text-text-primary rounded-tl-none border border-slate-100 dark:border-slate-800/40"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
              <button
                onClick={() =>
                  handleSuggestionClick("Generate a packing checklist")
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-semibold text-text-secondary hover:border-lavender-400 hover:text-lavender-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                <CheckSquare size={10} />
                Packing List
              </button>
              <button
                onClick={() =>
                  handleSuggestionClick("Suggest 3 local dishes to try")
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-semibold text-text-secondary hover:border-lavender-400 hover:text-lavender-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Compass size={10} />
                Local Food
              </button>
              <button
                onClick={() =>
                  handleSuggestionClick("Help me plan my itinerary")
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-semibold text-text-secondary hover:border-lavender-400 hover:text-lavender-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                <HelpCircle size={10} />
                Itinerary Help
              </button>
            </div>

            {/* Prompting Footer */}
            <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-end gap-2 shrink-0 bg-white/50 dark:bg-slate-900/50">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything..."
                rows={2}
                className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs text-text-primary placeholder:text-text-muted rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-lavender-400/40 focus:border-transparent resize-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!prompt.trim()}
                className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Closed State - Widget Button */
          <motion.button
            key="widget-btn"
            initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-linear-to-tr from-lavender-500 via-indigo-500 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-lavender-500/20 dark:hover:shadow-lavender-500/10 cursor-pointer focus:outline-none focus:ring-4 focus:ring-lavender-500/25 border-none"
          >
            <Sparkles size={24} className="animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
