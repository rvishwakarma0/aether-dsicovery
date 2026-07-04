import React, { useState } from 'react';
import { Search, MapPin, Compass, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DestinationSuggestion } from '../types';

interface DiscoveryScreenProps {
  destinations: DestinationSuggestion[];
  selectedDestination: DestinationSuggestion | null;
  onSelectDestination: (dest: DestinationSuggestion) => void;
  isLoading: boolean;
  onSearch: (query: string, chips: string[]) => void;
  errorMessage: string | null;
}

const PRESETS = {
  destinations: ['Manali', 'Coorg', 'Shillong', 'Gokarna', 'Hampi', 'Ladakh'],
  months: ['October', 'December', 'February', 'June'],
  vibes: ['Quiet Trekking', 'Culinary Journey', 'Heritage & Art', 'Off the Beaten Path', 'Budget Friendly']
};

export default function DiscoveryScreen({
  destinations,
  selectedDestination,
  onSelectDestination,
  isLoading,
  onSearch,
  errorMessage
}: DiscoveryScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const handleToggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedChips);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Search and Query Area */}
      <div className="p-5 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-800">
            Explore Destinations
          </h2>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                maxLength={250}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. hilly areas, into food and quiet trekking, budget trip..."
                className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-xs"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-sans font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Discover
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] px-1 text-slate-400">
              <span>Limit: 250 characters max</span>
              <span className={query.length >= 240 ? "text-amber-600 font-semibold animate-pulse" : ""}>
                {query.length} / 250
              </span>
            </div>
          </div>

          {/* Quick-select chips categories */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-medium text-slate-500 mr-1.5">Where:</span>
              {PRESETS.destinations.map(city => {
                const active = selectedChips.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleToggleChip(city)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      active
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-medium text-slate-500 mr-1.5">Month:</span>
              {PRESETS.months.map(month => {
                const active = selectedChips.includes(month);
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleToggleChip(month)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      active
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-medium text-slate-500 mr-1.5">Vibe:</span>
              {PRESETS.vibes.map(vibe => {
                const active = selectedChips.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => handleToggleChip(vibe)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      active
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Destinations List Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation error</p>
              <p className="opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-xs text-indigo-600 animate-pulse font-medium">GenAI is crafting custom suggestions...</p>
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                  <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                </div>
                <div className="h-3 bg-slate-150 rounded-md w-full"></div>
                <div className="h-3 bg-slate-150 rounded-md w-5/6"></div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-white">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No destinations suggested yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Select some filters or type a query above, then click "Discover" to generate options.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Suggestions ({destinations.length})
            </p>
            <AnimatePresence mode="popLayout">
              {destinations.map((dest, idx) => {
                const isSelected = selectedDestination?.name === dest.name;
                return (
                  <motion.div
                    key={dest.name + idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    onClick={() => onSelectDestination(dest)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="font-display font-bold text-base tracking-tight leading-tight">
                        {dest.name}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider uppercase ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : dest.tag === 'Popular'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {dest.tag}
                      </span>
                    </div>
                    <p className={`text-xs font-sans leading-relaxed ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      {dest.hook}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
