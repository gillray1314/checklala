import React, { useState, useCallback } from 'react';
import { PLATFORMS, CURRENCIES, Icons } from './constants';
import { SearchState } from './types';
import { analyzeItemWithGemini, searchItemPrices } from './services/geminiService';
import PlatformCard from './components/PlatformCard';
import AIInsight from './components/AIInsight';

export default function App() {
  const [state, setState] = useState<SearchState>({
    query: '',
    currency: 'MYR', // Default to MYR
    isSearching: false,
    analysis: null,
    priceInsight: null,
    error: null,
  });

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = state.query.trim();
    if (!term) return;

    // Reset results but keep query and currency
    setState(prev => ({ 
      ...prev, 
      isSearching: true, 
      error: null, 
      analysis: null,
      priceInsight: null 
    }));

    try {
      // Run both tasks in parallel with the selected currency
      const analysisPromise = analyzeItemWithGemini(term, state.currency);
      const pricePromise = searchItemPrices(term, state.currency);

      const [analysis, priceInsight] = await Promise.all([analysisPromise, pricePromise]);

      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        analysis,
        priceInsight
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: "Failed to complete analysis. Please try again." 
      }));
    }
  }, [state.query, state.currency]);

  const handleOpenAll = () => {
    if (!state.query) return;
    
    let opened = 0;
    PLATFORMS.forEach((platform) => {
        const url = platform.urlTemplate(state.query);
        const win = window.open(url, '_blank');
        if (win) opened++;
    });

    if (opened === 0) {
        alert("Popups were blocked. Please allow popups for this site to open all searches at once.");
    }
  };

  const updateQuery = (newQuery: string) => {
      setState(prev => ({...prev, query: newQuery }));
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setState(prev => ({ ...prev, currency: newCurrency }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Compact Header with Search */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Icons.Search />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">Price<span className="text-indigo-400">Compass</span></h1>
            </div>

            {/* Central Search Bar */}
            <div className="flex-1 w-full max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative group w-full">
                <div className="relative flex items-center rounded-xl bg-slate-900 shadow-inner ring-1 ring-slate-700/50 focus-within:ring-indigo-500 transition-all">
                  <input
                    type="text"
                    value={state.query}
                    onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
                    placeholder="Search item..."
                    className="w-full bg-transparent px-4 py-2.5 text-base text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={state.isSearching || !state.query}
                    className="mr-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.isSearching ? (
                       <span className="flex items-center gap-2">
                         <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                       </span>
                    ) : (
                      "Go"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 shrink-0">
               {state.query && (
                <button 
                  onClick={handleOpenAll}
                  className="text-xs font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 rounded px-2 py-1.5 hover:bg-slate-800"
                  title="Open all sites in new tabs"
                >
                  Open All
                </button>
               )}
              
              <div className="relative">
                <div className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm text-slate-300">
                  <Icons.Globe />
                  <select 
                    value={state.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="appearance-none bg-transparent font-medium focus:outline-none cursor-pointer pr-4 text-xs sm:text-sm"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code} className="bg-slate-900 text-slate-200">
                        {curr.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Error Message */}
        {state.error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm text-center">
            {state.error}
          </div>
        )}

        {/* AI Insight & Prices Section */}
        <div className="mb-8">
            <AIInsight 
              analysis={state.analysis} 
              priceInsight={state.priceInsight}
              isLoading={state.isSearching} 
              onApplyTerm={updateQuery} 
            />
        </div>

        {/* Platforms Grid - Direct Access */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PLATFORMS.map((platform) => (
            <PlatformCard 
              key={platform.id} 
              platform={platform} 
              query={state.query} 
            />
          ))}
        </div>
        
      </main>
    </div>
  );
}