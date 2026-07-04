import React, { useState } from 'react';
import { BookOpen, Landmark, Eye, Calendar, Sparkles, Send, MapPin, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DestinationSuggestion, TabType, TabContent } from '../types';

interface DestinationDetailProps {
  destination: DestinationSuggestion | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabContents: Record<TabType, TabContent | null>;
  isLoading: boolean;
  onRefineTab: (tab: TabType, refinement: string) => void;
}

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'stories', label: 'Stories', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'heritage', label: 'Heritage', icon: <Landmark className="w-4 h-4" /> },
  { id: 'hidden_gems', label: 'Hidden Gems', icon: <Eye className="w-4 h-4" /> },
  { id: 'local_events', label: 'Events & Culture', icon: <Calendar className="w-4 h-4" /> },
];

export default function DestinationDetail({
  destination,
  activeTab,
  setActiveTab,
  tabContents,
  isLoading,
  onRefineTab
}: DestinationDetailProps) {
  const [refineInput, setRefineInput] = useState('');

  if (!destination) {
    return (
      <div id="no-destination" className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/20 backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-300 mb-4 animate-bounce">
          <CompassIcon className="w-8 h-8" />
        </div>
        <h3 className="font-display font-semibold text-lg text-white mb-2">No Destination Selected</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Select any of the curated destinations from the left panel to discover their rich history, hidden gems, and seasonal festivals.
        </p>
      </div>
    );
  }

  const currentTabContent = tabContents[activeTab];

  const handleSubmitRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInput.trim()) return;
    onRefineTab(activeTab, refineInput);
    setRefineInput('');
  };

  return (
    <div id="destination-detail-container" className="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
      {/* Hero Header Area */}
      <div className="p-8 pb-4 relative overflow-hidden border-b border-white/10 backdrop-blur-md bg-white/2">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">
                {destination.tag === 'Popular' ? 'Curated Hotspot' : 'Undiscovered Territory'}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight drop-shadow-sm">
              {destination.name}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Type</div>
              <div className="text-sm text-indigo-200 font-semibold">{destination.tag}</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Platform Rating</div>
              <div className="text-sm text-indigo-200 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" /> GenAI Best
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-white/15 overflow-x-auto scrollbar-none -mx-8 px-8 gap-2">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all shrink-0 ${
                  isSelected
                    ? 'text-white border-indigo-500 font-bold bg-white/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content View with Frosted Glass Overlay when Loading */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs flex flex-col items-center justify-center z-10 p-8">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-white">Weaving immersive stories...</p>
            <p className="text-xs text-slate-400 mt-1">Sourcing history, seasonal rituals and hidden elements</p>
          </div>
        ) : null}

        {currentTabContent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              <article className="markdown-body text-slate-200">
                <ReactMarkdown>{currentTabContent.content}</ReactMarkdown>
              </article>

              {/* Refinement Suggestions Chips */}
              {currentTabContent.suggestions && currentTabContent.suggestions.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Refinement Suggestions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentTabContent.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        id={`sug-chip-${i}`}
                        onClick={() => onRefineTab(activeTab, sug)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-indigo-300 hover:text-white text-xs rounded-lg transition-all cursor-pointer shadow-sm font-medium"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Sidebar widget matching the mockup's right box */}
            <div className="lg:col-span-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/5 p-6 backdrop-blur-md flex flex-col h-full min-h-[250px] justify-between">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent z-10" />
                <div className="relative z-20">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                    Cultural Spotlight
                  </span>
                  <h4 className="text-xl font-display font-bold text-white mt-3 mb-2">
                    Authentic Explorations
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Every insight is uniquely woven in real time by Gemini, keeping cultural preservation, ecological sensitivity, and authentic tribal heritage at its center.
                  </p>
                </div>

                <form onSubmit={handleSubmitRefine} className="relative z-20 mt-6 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Refine this tab's content:</span>
                    <span className="text-[9px] text-slate-500 font-medium">{refineInput.length}/250</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={refineInput}
                      maxLength={250}
                      onChange={(e) => setRefineInput(e.target.value)}
                      placeholder="e.g. More historical details..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                    <button
                      type="submit"
                      disabled={!refineInput.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-white disabled:opacity-45"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-medium text-slate-300">Start discovery</p>
            <p className="text-xs text-slate-500">Wait, loading your personalized travel feed.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
