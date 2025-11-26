import React from 'react';
import { PlatformConfig } from '../types';
import { Icons } from '../constants';

interface PlatformCardProps {
  platform: PlatformConfig;
  query: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, query }) => {
  const isDisabled = !query.trim();
  const searchUrl = platform.urlTemplate(query);

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    window.open(searchUrl, '_blank');
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        group relative flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-gray-900 
        transition-all duration-200 cursor-pointer
        ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-gray-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5'}
      `}
    >
      <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${platform.color} bg-opacity-10 text-white shadow-sm ring-1 ring-white/10`}>
        {platform.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate">
          {platform.name}
        </h3>
        <div className="text-[10px] font-medium text-gray-500 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
          Search Now
        </div>
      </div>

      <div className="text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
        <Icons.ExternalLink />
      </div>
    </div>
  );
};

export default PlatformCard;