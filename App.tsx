import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PLATFORMS, CURRENCIES, Icons } from './constants';
import { SearchState } from './types';
import { analyzeItemWithGemini, searchItemPrices, getAutocompleteSuggestions } from './services/geminiService';
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

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Ref for the wrapper to detect outside clicks
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Ref for the input to detect focus status accurately
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced Autocomplete logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      // CRITICAL FIX: Only run logic if the input is currently focused.
      // This prevents the menu from popping up if the user has already clicked away.
      if (document.activeElement !== inputRef.current) {
         return;
      }

      // Only search if query is long enough AND we are not currently executing a main search
      if (state.query.length >= 3 && !state.isSearching) {
        try {
          const results = await getAutocompleteSuggestions(state.query);
          
          // CRITICAL FIX: Check focus AGAIN after the async await.
          // If user clicked away during the API call, do not show suggestions.
          if (document.activeElement !== inputRef.current) {
             setShowSuggestions(false);
             return;
          }

          // Only show if we actually got results and the query hasn't been cleared
          if (results.length > 0 && state.query.length >= 3) {
            setSuggestions(results);
            setShowSuggestions(true);
          } else {
             setShowSuggestions(false);
          }
        } catch (e) {
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400); // Slightly faster debounce

    return () => clearTimeout(timer);
  }, [state.query, state.isSearching]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSearch = useCallback(async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const term = (overrideQuery || state.query).trim();
    if (!term) return;

    // Immediately hide suggestions and blur to prevent reopening
    setShowSuggestions(false);
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // Reset results but keep query and currency
    setState(prev => ({ 
      ...prev, 
      query: term, 
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

      if (!analysis && (!priceInsight || priceInsight.sources.length === 0)) {
         throw new Error("No data returned");
      }

      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        analysis,
        priceInsight
      }));
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Failed to complete analysis. Please try again.";
      
      if (err.message?.includes('400') || err.message?.includes('403') || err.message?.includes('API key')) {
          errorMessage = "Search failed. Please ensure your Google Gemini API_KEY is correctly set in Vercel Environment Variables.";
      }

      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: errorMessage
      }));
    }
  }, [state.query, state.currency]);

  const handleSuggestionClick = (suggestion: string) => {
    // Update query AND trigger search immediately
    setState(prev => ({ ...prev, query: suggestion }));
    handleSearch(undefined, suggestion);
  };

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
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-indigo-500/30 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                <Icons.Search />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">Price<span className="text-indigo-400">Compass</span></h1>
            </div>

            {/* Central Search Bar */}
            <div className="flex-1 w-full max-w-2xl mx-auto relative z-40" ref={wrapperRef}>
              <form onSubmit={(e) => handleSearch(e)} className="relative group w-full">
                <div className="relative flex items-center rounded-xl bg-gray-900 shadow-sm border border-gray-800 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <div className="pl-4 text-gray-500">
                    <Icons.Search width="18" height="18" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={state.query}
                    onChange={(e) => {
                       const val = e.target.value;
                       setState(prev => ({ ...prev, query: val }));
                       // If user clears input, hide suggestions immediately
                       if (val.length < 3) setShowSuggestions(false);
                    }}
                    placeholder="Search game, console, or accessory..."
                    className="w-full bg-transparent px-3 py-2.5 text-base text-white placeholder-gray-500 focus:outline-none"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={state.isSearching || !state.query}
                    className="mr-1.5 rounded-lg bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {state.isSearching ? (
                       <span className="flex items-center gap-2">
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                       </span>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-950/50">Suggestions</div>
                    <ul>
                      {suggestions.map((s, i) => (
                        <li 
                          key={i} 
                          onMouseDown={(e) => {
                             // prevent focus loss on input when clicking suggestion
                             e.preventDefault(); 
                             handleSuggestionClick(s);
                          }}
                          className="px-4 py-3 hover:bg-indigo-600/10 hover:text-indigo-300 cursor-pointer text-sm text-gray-300 border-b border-gray-800/50 last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <span className="flex items-center gap-2">
                             {s}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 text-indigo-500">
                             <Icons.ExternalLink width="12" height="12"/>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
               {state.query && (
                <button 
                  onClick={handleOpenAll}
                  className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg px-3 py-2 hover:bg-gray-800 hover:border-gray-700"
                  title="Open all sites in new tabs"
                >
                  <Icons.ExternalLink width="14" height="14" />
                  Open All
                </button>
               )}
              
              <div className="relative">
                <div className="flex items-center gap-2 rounded-xl bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-gray-300 hover:border-gray-700 transition-colors">
                  <span className="text-gray-500"><Icons.Globe width="16" height="16" /></span>
                  <select 
                    value={state.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="appearance-none bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code} className="bg-gray-900 text-gray-200">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Error Message */}
        {state.error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-400 text-sm">
             <div className="shrink-0 text-red-500">⚠</div>
             {state.error}
          </div>
        )}

        {/* AI Insight & Prices Section */}
        <AIInsight 
          analysis={state.analysis} 
          priceInsight={state.priceInsight}
          isLoading={state.isSearching} 
          onApplyTerm={updateQuery} 
        />

        {/* Platforms Grid - Direct Access */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Direct Search</h3>
            <div className="h-px bg-gray-800 flex-grow"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PLATFORMS.map((platform) => (
              <PlatformCard 
                key={platform.id} 
                platform={platform} 
                query={state.query} 
              />
            ))}
          </div>
        </div>
        
      </main>

      <footer className="mt-12 py-6 text-center text-xs text-gray-600 border-t border-gray-900">
        <p>© {new Date().getFullYear()} PriceCompass. Real-time data powered by Gemini.</p>
      </footer>
    </div>
  );
}
