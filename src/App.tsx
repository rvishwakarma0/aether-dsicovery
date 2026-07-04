import { useState, useEffect } from 'react';
import { Compass, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { DestinationSuggestion, TabType, TabContent, ChatMessage, GlobalChatResponse } from './types';
import DiscoveryScreen from './components/DiscoveryScreen';
import DestinationDetail from './components/DestinationDetail';
import GlobalChat from './components/GlobalChat';

export default function App() {
  // Application State
  const [destinations, setDestinations] = useState<DestinationSuggestion[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<DestinationSuggestion | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('stories');
  
  // Tab-specific contents cache
  const [tabContents, setTabContents] = useState<Record<TabType, TabContent | null>>({
    stories: null,
    heritage: null,
    hidden_gems: null,
    local_events: null,
  });

  // Chat message history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Loading & Error flags
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  // Travel month context (extracted from search or query to personalize dynamic events)
  const [travelMonth, setTravelMonth] = useState<string>('October');

  // Trigger default suggestions on initial load
  useEffect(() => {
    handleDiscoverSuggestions('', []);
  }, []);

  // Whenever selected destination changes, reset the tab contents and fetch content for the active tab
  useEffect(() => {
    if (selectedDestination) {
      // Clear current cached tabs
      setTabContents({
        stories: null,
        heritage: null,
        hidden_gems: null,
        local_events: null,
      });
      // Load current active tab content
      fetchTabContent(selectedDestination.name, activeTab);
    }
  }, [selectedDestination]);

  // When active tab changes, load that tab's content if not already loaded
  useEffect(() => {
    if (selectedDestination && !tabContents[activeTab]) {
      fetchTabContent(selectedDestination.name, activeTab);
    }
  }, [activeTab]);

  // Call Discovery API endpoint
  const handleDiscoverSuggestions = async (query: string, chips: string[]) => {
    setIsDiscoverLoading(true);
    setDiscoverError(null);

    // Look for month chip to save travelMonth context
    const monthChip = chips.find(c => ['October', 'December', 'February', 'June'].includes(c));
    if (monthChip) {
      setTravelMonth(monthChip);
    }

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, chips }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch destination recommendations. Please verify key setup.');
      }

      const data = await response.json();
      if (data.destinations && data.destinations.length > 0) {
        setDestinations(data.destinations);
        // Pre-select the first suggestion if none is selected
        if (!selectedDestination) {
          setSelectedDestination(data.destinations[0]);
        }
      }
    } catch (err: any) {
      setDiscoverError(err.message || 'Something went wrong while fetching recommendations.');
    } finally {
      setIsDiscoverLoading(false);
    }
  };

  // Call Details API endpoint
  const fetchTabContent = async (destName: string, tab: TabType, followUpText?: string) => {
    setIsDetailLoading(true);
    try {
      const response = await fetch('/api/destination-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationName: destName,
          tab,
          travelMonth,
          followUp: followUpText,
          chatHistory: [] // Can pass history if refining
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate detailed cultural insights.');
      }

      const data = await response.json();
      setTabContents(prev => ({
        ...prev,
        [tab]: {
          content: data.content,
          suggestions: data.suggestions || []
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Refine specific tab's content (triggered by contextual chips or sidebar follow-up input)
  const handleRefineTabContent = (tab: TabType, refinement: string) => {
    if (selectedDestination) {
      fetchTabContent(selectedDestination.name, tab, refinement);
    }
  };

  // Submit global chat message
  const handleSendGlobalMessage = async (text: string) => {
    // Append user message immediately
    const userMsg: ChatMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/global-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          selectedDestination: selectedDestination?.name || null,
          activeTab,
          chatHistory: [...chatHistory, userMsg],
          currentList: destinations
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the AI assistant.');
      }

      const data: GlobalChatResponse = await response.json();
      
      // Append assistant message response
      setChatHistory(prev => [...prev, { role: 'model', text: data.reply }]);

      // If intent is 'refine_list' and new suggestions were generated, sync the left panel
      if (data.intent === 'refine_list' && data.updatedDestinations && data.updatedDestinations.length > 0) {
        setDestinations(data.updatedDestinations);
        // Autoload the first updated destination
        setSelectedDestination(data.updatedDestinations[0]);
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: `⚠️ **Assistant Connection Error:** ${err.message || 'The server could not process the chat inquiry.'}`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div
      id="app-root"
      className="flex flex-col w-full min-h-screen overflow-hidden text-slate-100 font-sans relative"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1e1b4b 0%, #0f172a 100%)',
        backgroundColor: '#0f172a',
      }}
    >
      {/* Background visual light orbs */}
      <div
        id="bg-orbs"
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, #4338ca 0%, transparent 40%), radial-gradient(circle at 20% 80%, #701a75 0%, transparent 40%)',
        }}
      />

      {/* Main Header */}
      <header
        id="main-app-header"
        className="h-16 flex items-center px-8 border-b border-white/10 backdrop-blur-md bg-white/5 relative z-20 shrink-0"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">
            AETHER <span className="font-light text-indigo-300">DISCOVERY</span>
          </h1>
        </div>
        <div className="ml-auto flex items-center space-x-6 text-xs font-semibold">
          <div className="text-indigo-200/80 uppercase tracking-widest hidden md:block">
            GenAI-Powered Cultural Travel App
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Live Preview
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main id="main-content-layout" className="flex-1 flex overflow-hidden relative z-10 pb-14">
        {/* Left Side Discovery Panel */}
        <aside className="w-[380px] border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col shrink-0">
          <DiscoveryScreen
            destinations={destinations}
            selectedDestination={selectedDestination}
            onSelectDestination={setSelectedDestination}
            isLoading={isDiscoverLoading}
            onSearch={handleDiscoverSuggestions}
            errorMessage={discoverError}
          />
        </aside>

        {/* Right Side Tabbed Details Deep-Dive Panel */}
        <section className="flex-1 flex flex-col overflow-hidden bg-slate-950/10">
          <DestinationDetail
            destination={selectedDestination}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabContents={tabContents}
            isLoading={isDetailLoading}
            onRefineTab={handleRefineTabContent}
          />
        </section>
      </main>

      {/* Docked Contextual Global AI Chat Assistant */}
      <GlobalChat
        chatHistory={chatHistory}
        onSendMessage={handleSendGlobalMessage}
        selectedDestination={selectedDestination}
        activeTab={activeTab}
        isGenerating={isChatLoading}
      />
    </div>
  );
}
