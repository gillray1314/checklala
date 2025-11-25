import React from 'react';
import { ItemAnalysis, PriceInsight } from '../types';
import { Icons } from '../constants';

interface AIInsightProps {
  analysis: ItemAnalysis | null;
  priceInsight: PriceInsight | null;
  isLoading: boolean;
  onApplyTerm: (term: string) => void;
}

const AIInsight: React.FC<AIInsightProps> = ({ analysis, priceInsight, isLoading, onApplyTerm }) => {
  if (isLoading) {
    return (
      <div className="w-full animate-pulse rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-6 w-6 rounded-full bg-slate-700"></div>
          <div className="h-4 w-32 rounded bg-slate-700"></div>
        </div>
        <div className="space-y-3">
          <div className="h-2 w-full rounded bg-slate-700"></div>
          <div className="h-2 w-5/6 rounded bg-slate-700"></div>
          <div className="h-16 w-full rounded bg-slate-700 mt-4"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Insight Card */}
      <div className="w-full rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-800 to-indigo-950/20 p-6 backdrop-blur-sm flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Icons.Brain />
            <h2 className="text-lg font-bold tracking-wide uppercase text-indigo-300">Product Insight</h2>
          </div>
          {analysis.estimatedValue && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10">
              Est: {analysis.estimatedValue}
            </div>
          )}
        </div>

        <div className="space-y-4 flex-grow">
          <div>
            <h3 className="text-xl font-bold text-white">{analysis.name}</h3>
            <span className="inline-block mt-1 rounded-full bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-300">
              {analysis.category}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">
            {analysis.description}
          </p>

          {/* Languages Section */}
          {analysis.languages && (
             <div className="flex items-start gap-3 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10">
                <div className="text-indigo-400 mt-0.5 shrink-0">
                  <Icons.Globe width="18" height="18" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Supported Languages</h4>
                  <p className="text-sm text-indigo-100 leading-snug">{analysis.languages}</p>
                </div>
             </div>
          )}
          
          <div className="pt-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Better Search Terms</div>
            <div className="flex flex-wrap gap-2">
              {analysis.searchTips?.map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => onApplyTerm(tip)}
                  className="flex items-center gap-1 rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/40 transition-colors border border-indigo-500/30"
                >
                  <Icons.Sparkles />
                  {tip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Insight Sources */}
        {analysis.sources && analysis.sources.length > 0 && (
          <div className="mt-6 border-t border-slate-700/50 pt-3">
             <div className="flex flex-wrap gap-2 opacity-80">
               {analysis.sources.map((source, idx) => (
                 <a 
                   key={idx}
                   href={source.uri}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[150px]"
                 >
                   <Icons.ExternalLink />
                   {source.title}
                 </a>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Live Price Check Card */}
      <div className="w-full rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-800 to-emerald-950/20 p-6 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 text-emerald-400">
          <Icons.Chart />
          <h2 className="text-lg font-bold tracking-wide uppercase text-emerald-300">Live Market Check</h2>
        </div>

        {!priceInsight ? (
           <div className="flex flex-col items-center justify-center flex-grow min-h-[12rem] text-slate-500 space-y-2">
             <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
             <span className="text-sm">Searching live prices...</span>
           </div>
        ) : (
          <div className="space-y-4 flex-grow flex flex-col">
            <div className="prose prose-invert prose-sm max-w-none flex-grow">
              <div className="whitespace-pre-wrap text-slate-200 font-medium leading-relaxed">
                {priceInsight.text}
              </div>
            </div>

            {priceInsight.sources.length > 0 && (
              <div className="mt-4 border-t border-slate-700/50 pt-3">
                <p className="text-xs text-slate-500 mb-2 font-semibold">SOURCES</p>
                <div className="flex flex-wrap gap-2">
                  {priceInsight.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20 truncate max-w-[200px]"
                    >
                      <Icons.ExternalLink />
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsight;