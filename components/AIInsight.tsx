import React from 'react';
import { ItemAnalysis, PriceInsight } from '../types';
import { Icons, PLATFORMS } from '../constants';

interface AIInsightProps {
  analysis: ItemAnalysis | null;
  priceInsight: PriceInsight | null;
  isLoading: boolean;
  onApplyTerm: (term: string) => void;
  currentQuery: string;
}

const AIInsight: React.FC<AIInsightProps> = ({ analysis, priceInsight, isLoading, onApplyTerm, currentQuery }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="w-full animate-pulse rounded-3xl border border-white/5 bg-gray-900/40 p-8 h-96">
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-12 w-12 rounded-full bg-gray-800"></div>
              <div className="h-6 w-48 rounded bg-gray-800"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-3/4 rounded bg-gray-800"></div>
              <div className="h-4 w-full rounded bg-gray-800"></div>
              <div className="h-4 w-5/6 rounded bg-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!analysis && !currentQuery) return null;

  const safeAnalysis = analysis || {
      name: currentQuery,
      category: "Searching...",
      description: "Gathering product details...",
      estimatedValue: "",
      searchTips: [],
      versions: []
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT: Product Identity Card */}
      <div className="relative flex flex-col rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Top Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70"></div>
        
        {/* Header */}
        <div className="p-8 pb-4 relative z-10">
           <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                 <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-3">
                    {safeAnalysis.category}
                 </div>
                 <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                    {safeAnalysis.name}
                 </h2>
              </div>
              
              {/* Estimated Value */}
              {safeAnalysis.estimatedValue && (
                 <div className="text-right shrink-0 bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-md">
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Market Est.</div>
                    <div className="text-xl sm:text-2xl font-black text-white">{safeAnalysis.estimatedValue}</div>
                 </div>
              )}
           </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 space-y-8 flex-grow">
          <p className="text-gray-400 leading-relaxed font-medium">
             {safeAnalysis.description}
          </p>

          {/* Language / Versions Section */}
          {safeAnalysis.versions && safeAnalysis.versions.length > 0 && (
             <div>
                <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  <Icons.Globe width="14" height="14" />
                  Region & Language
                </h3>
                <div className="grid gap-3">
                  {safeAnalysis.versions.map((ver, idx) => {
                    const r = ver.region.toUpperCase();
                    let badgeColor = 'bg-gray-700 text-gray-300';
                    if (r.includes('JP')) badgeColor = 'bg-rose-500 text-white shadow-rose-500/20';
                    else if (r.includes('US')) badgeColor = 'bg-blue-500 text-white shadow-blue-500/20';
                    else if (r.includes('ASIA')) badgeColor = 'bg-amber-400 text-gray-900 shadow-amber-500/20';

                    return (
                      <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col gap-1.5">
                           <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-lg ${badgeColor} uppercase`}>
                                 {ver.region}
                              </span>
                           </div>
                           <span className="text-sm text-gray-300 font-medium">{ver.languages}</span>
                        </div>
                        
                        {/* Direct Link Button */}
                        {ver.sourceUrl && (
                           <a 
                             href={ver.sourceUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white text-xs font-bold transition-all border border-gray-700 hover:border-indigo-500/50 shrink-0"
                           >
                              Official Site
                              <Icons.ExternalLink width="12" height="12" />
                           </a>
                        )}
                      </div>
                    );
                  })}
                </div>
             </div>
          )}

          {/* Search Tips */}
          {safeAnalysis.searchTips && safeAnalysis.searchTips.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 mt-4">
                 <Icons.Sparkles width="12" height="12" />
                 Smart Keywords
              </div>
              <div className="flex flex-wrap gap-2">
                {safeAnalysis.searchTips.map((tip, idx) => (
                  <button
                    key={idx}
                    onClick={() => onApplyTerm(tip)}
                    className="px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-indigo-600 text-xs font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-indigo-500 transition-all"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Market Data Card */}
      <div className="relative flex flex-col rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
         {/* Top Gradient Line */}
         <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-70"></div>

        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
               <Icons.ShoppingBag width="20" height="20" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-white">Market Prices</h2>
                <div className="text-xs text-emerald-400/80 font-medium">Live Aggregation</div>
             </div>
           </div>
           {priceInsight && (
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Updated</span>
             </div>
           )}
        </div>

        <div className="p-8 space-y-6">
           {/* Summary Text */}
           {priceInsight?.overview && (
             <div className="p-5 rounded-2xl bg-emerald-900/10 border border-emerald-500/10">
                <p className="text-sm text-gray-300 leading-relaxed">
                   <span className="text-emerald-400 font-bold mr-2">Market Insight:</span>
                   {priceInsight.overview}
                </p>
             </div>
           )}

           {/* Platforms List */}
           <div className="space-y-3">
             {PLATFORMS.map((platform) => {
                const aiData = priceInsight?.prices.find(p => {
                    const pName = p.platform.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cName = platform.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return pName.includes(cName) || cName.includes(pName);
                });

                const isNotFound = aiData?.status.toLowerCase().includes('not found') || aiData?.status.toLowerCase().includes('out of stock');
                const searchUrl = platform.urlTemplate(currentQuery);
                const hasQuery = currentQuery && currentQuery.trim().length > 0;

                return (
                   <div key={platform.id} className="relative group overflow-hidden rounded-2xl border border-white/5 bg-gray-900/50 hover:bg-gray-800/60 hover:border-indigo-500/30 transition-all duration-300">
                      
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         
                         {/* Icon + Name + Status */}
                         <div className="flex items-center gap-4">
                            <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${platform.color} bg-opacity-10 text-white shadow-inner ring-1 ring-white/5`}>
                               {platform.icon}
                            </div>
                            <div>
                               <h3 className="text-sm font-bold text-gray-100 group-hover:text-white">{platform.name}</h3>
                               {aiData ? (
                                  <div className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${isNotFound ? 'text-rose-400' : 'text-emerald-400'}`}>
                                     {aiData.status}
                                  </div>
                               ) : (
                                  <div className="text-[10px] text-gray-500 font-medium">Check Price</div>
                               )}
                            </div>
                         </div>

                         {/* Price & Actions */}
                         <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                            {aiData && (
                               <div className={`text-lg font-black tracking-tight ${isNotFound ? 'text-gray-600 line-through' : 'text-white'}`}>
                                  {aiData.price}
                               </div>
                            )}

                            <a 
                               href={searchUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className={`
                                 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg
                                 ${hasQuery 
                                   ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5' 
                                   : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                               `}
                               onClick={(e) => !hasQuery && e.preventDefault()}
                            >
                               {aiData ? 'Verify' : 'Open'}
                               <Icons.ExternalLink width="12" height="12" />
                            </a>
                         </div>
                      </div>
                   </div>
                );
             })}
           </div>

           {/* Source Footer */}
           {priceInsight?.sources && priceInsight.sources.length > 0 && (
             <div className="pt-6 border-t border-white/5">
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Verified Sources</div>
                <div className="flex flex-wrap gap-2">
                   {priceInsight.sources.map((source, idx) => (
                      <a 
                         key={idx}
                         href={source.uri}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-950/50 hover:bg-gray-800 text-[10px] text-gray-500 hover:text-gray-300 border border-white/5 hover:border-white/10 transition-colors truncate max-w-[150px]"
                      >
                         <Icons.ExternalLink width="10" height="10" />
                         <span className="truncate">{source.title}</span>
                      </a>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AIInsight;