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
        group relative flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-4 
        transition-all duration-200 hover:border-indigo-500 hover:bg-slate-750 cursor-pointer
        ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10'}
      `}
    >
      <div className={`mb-2 rounded-lg p-2 ${platform.color} bg-opacity-20 text-white`}>
        {platform.icon}
      </div>
      
      <div className="text-center">
        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
          {platform.name}
        </h3>
      </div>

      <div className="absolute top-2 right-2 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <Icons.ExternalLink />
      </div>
    </div>
  );
};

export default PlatformCard;