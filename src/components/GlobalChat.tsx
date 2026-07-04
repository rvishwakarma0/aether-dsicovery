import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, ChevronUp, ChevronDown, Check, Compass, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DestinationSuggestion } from '../types';

interface GlobalChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
  selectedDestination: DestinationSuggestion | null;
  activeTab: string;
  isGenerating: boolean;
}

export default function GlobalChat({
  chatHistory,
  onSendMessage,
  selectedDestination,
  activeTab,
  isGenerating
}: GlobalChatProps) {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const formattedTabName = activeTab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div
      id="global-chat-dock"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-t border-white/10 shadow-2xl backdrop-blur-3xl bg-slate-900/90 ${
        isOpen ? 'h-[360px]' : 'h-14'
      }`}
    >
      {/* Header Bar */}
      <div
        id="chat-header-bar"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 flex items-center justify-between px-6 cursor-pointer select-none border-b border-white/5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse absolute -top-0.5 -right-0.5" />
            <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block">
              AI Travel Assistant
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {selectedDestination ? (
                <span>
                  Listening &amp; aware of <strong className="text-slate-300">{selectedDestination.name}</strong> ({formattedTabName})
                </span>
              ) : (
                'Aware of your current discovery dashboard'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Context Tag Indicators */}
          <div className="hidden md:flex items-center space-x-2 text-[10px]">
            <span className="px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-slate-400 flex items-center gap-1">
              <Check className="w-2.5 h-2.5 text-indigo-400" /> Auto-Contextual
            </span>
            <span className="px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-slate-400 flex items-center gap-1">
              <Compass className="w-2.5 h-2.5 text-indigo-400" /> Active Tab Awareness
            </span>
          </div>

          <button className="text-slate-400 hover:text-white transition-colors">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Messaging Area */}
      {isOpen && (
        <div className="flex flex-col h-[304px]">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Persistent Travel Companion
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Ask general travel tips for your destination, or ask me to filter &amp; refine the dashboard (e.g. "show only offbeat places" or "somewhere colder").
                </p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3.5 text-xs font-sans shadow-sm border ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-200'
                    }`}
                  >
                    {msg.role === 'model' ? (
                      <article className="markdown-body text-slate-200">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </article>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Generating responses &amp; syncing layout...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field Form */}
          <div className="p-4 bg-slate-900/60 border-t border-white/5">
            <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto flex flex-col space-y-1.5">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    maxLength={500}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask a question or refine the dashboard list (e.g., 'show only offbeat places')..."
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-14 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  />
                  <span className="absolute right-4 text-[9px] text-slate-500 font-medium">
                    {inputText.length}/500
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isGenerating || !inputText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full transition-all disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
