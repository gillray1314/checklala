import React from 'react';
import { ItemAnalysis, PriceInsight } from '../types';
import { Icons, PLATFORMS } from '../constants';

interface AIInsightProps {
  analysis: ItemAnalysis | null;
  priceInsight: PriceInsight | null;
  isLoading: boolean;
  onApplyTerm: (term: string) => void;
}

// Helper to attempt to match a platform name string to our internal icons
const getPlatformIcon = (name: string) => {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = PLATFORMS.find(p => {
    const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalizedName.includes(pName) || pName.includes(normalizedName);
  });
  return found ? found.icon : <Icons.Search width="16" height="16" />;
};

// Distinct colors for regions
const getRegionBadgeStyles = (region: string) => {
  const r = region.toUpperCase();
  if (r.includes('JP') || r.includes('JAPAN')) return 'bg-rose-500 text-white';
  if (r.includes('US') || r.includes('USA')) return 'bg-blue-500 text-white';
  if (r.includes('ASIA') || r.includes('CHINESE') || r.includes('HK')) return 'bg-amber-400 text-gray-900';
  return 'bg-gray-700 text-gray-300';
};

const AIInsight: React.FC<AIInsightProps> = ({ analysis, priceInsight, isLoading, onApplyTerm }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="w-full animate-pulse rounded-2xl border border-gray-800 bg-gray-900/50 p-6 h-96">
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-10 w-10 rounded-full bg-gray-800"></div>
              <div className="h-4 w-40 rounded bg-gray-800"></div>
            </div>
            <div className="space-y-4">
              <div className="h-3 w-3/4 rounded bg-gray-800"></div>
              <div className="h-3 w-full rounded bg-gray-800"></div>
              <div className="h-3 w-5/6 rounded bg-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* LEFT: Product Identity & Specs */}
      <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm overflow-hidden shadow-sm hover:border-indigo-500/20 transition-colors">
        
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-gray-800/50 relative">
          <div className="absolute top-0 right-0 p-6">
             {analysis.estimatedValue && (
                <div className="text-right">
                   <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Est. Value</div>
                   <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{analysis.estimatedValue}</div>
                </div>
             )}
          </div>

          <div className="pr-24">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                {analysis.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">{analysis.name}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-grow">
          
          <div className="prose prose-invert prose-sm max-w-none text-gray-400">
            <p>{analysis.description}</p>
          </div>

          {/* Version Compatibility Table */}
          {analysis.versions && analysis.versions.length > 0 && (
             <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icons.Globe width="14" height="14" />
                  Language Support
                </h3>
                <div className="rounded-xl border border-gray-800 bg-gray-950/30 overflow-hidden">
                  {analysis.versions.map((ver, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-center p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors group">
                      <div className="shrink-0 w-12">
                         <span className={`inline-flex items-center justify-center w-full px-2 py-1 rounded text-[10px] font-bold shadow-sm ${getRegionBadgeStyles(ver.region)}`}>
                            {ver.region}
                         </span>
                      </div>
                      <div className="flex-grow text-xs sm:text-sm text-gray-300">
                        {ver.languages}
                      </div>
                      {ver.sourceUrl && (
                        <a 
                          href={ver.sourceUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="shrink-0 text-gray-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="View Source"
                        >
                          <Icons.ExternalLink width="14" height="14" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* Search Terms Chips */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
               <Icons.Sparkles width="12" height="12" />
               Smart Search Terms
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.searchTips?.map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => onApplyTerm(tip)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-indigo-600 hover:text-white text-xs text-gray-300 border border-transparent hover:border-indigo-500/50 transition-all duration-200"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Market Data */}
      <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm overflow-hidden shadow-sm hover:border-emerald-500/20 transition-colors">
        
        <div className="p-6 border-b border-gray-800/50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-emerald-400">
             <div className="p-1.5 rounded-lg bg-emerald-500/10">
               <Icons.Chart width="20" height="20" />
             </div>
             <h2 className="text-lg font-bold text-emerald-100">Live Market Data</h2>
           </div>
           <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Live</span>
           </div>
        </div>

        <div className="p-6 flex-grow flex flex-col gap-6">
          {!priceInsight ? (
             <div className="flex flex-col items-center justify-center flex-grow opacity-50 space-y-4">
                <div className="relative">
                   <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-emerald-500 animate-spin"></div>
                </div>
                <div className="text-sm font-medium text-gray-400">Scanning marketplaces...</div>
             </div>
          ) : (
             <>
               {/* Pricing Ledger */}
               <div className="rounded-xl border border-gray-800 bg-gray-950/50 overflow-hidden">
                  {priceInsight.prices.length > 0 ? (
                     <div className="divide-y divide-gray-800/50">
                        {priceInsight.prices.map((item, idx) => {
                           const isAvailable = item.status.toLowerCase().includes('available') || item.status.toLowerCase().includes('listings') || item.status.toLowerCase().includes('stock');
                           const isNotFound = item.status.toLowerCase().includes('not found') || item.status.toLowerCase().includes('out of stock');

                           return (
                             <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors">
                               <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${isNotFound ? 'bg-gray-800 text-gray-600' : 'bg-gray-800 text-emerald-400'}`}>
                                     {getPlatformIcon(item.platform)}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-sm font-bold text-gray-200">{item.platform}</span>
                                     <span className={`text-[10px] font-medium uppercase tracking-wide ${isNotFound ? 'text-red-400' : 'text-gray-500'}`}>
                                        {item.status}
                                     </span>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className={`text-base font-bold ${isNotFound ? 'text-gray-600 line-through decoration-gray-700' : 'text-white'}`}>
                                     {item.price}
                                  </div>
                               </div>
                             </div>
                           )
                        })}
                     </div>
                  ) : (
                     <div className="p-8 text-center text-gray-500 text-sm">
                        No pricing data could be extracted automatically.
                     </div>
                  )}
               </div>

               {/* Summary Text */}
               <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/5 border border-emerald-500/10">
                  <div className="shrink-0 text-emerald-500 mt-0.5"><Icons.Sparkles width="16" height="16" /></div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                     {priceInsight.overview}
                  </p>
               </div>

               {/* Verification Sources */}
               {priceInsight.sources.length > 0 && (
                  <div className="mt-auto pt-4 border-t border-gray-800/50">
                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Verification Sources</div>
                     <div className="flex flex-wrap gap-2">
                        {priceInsight.sources.map((source, idx) => (
                           <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 hover:text-white transition-colors border border-gray-700/50 hover:border-gray-600 max-w-[200px] truncate"
                           >
                              <Icons.ExternalLink width="10" height="10" className="shrink-0" />
                              <span className="truncate">{source.title}</span>
                           </a>
                        ))}
                     </div>
                  </div>
               )}
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsight;