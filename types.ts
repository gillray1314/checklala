import React from 'react';

export interface PlatformConfig {
  id: string;
  name: string;
  urlTemplate: (query: string) => string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface GameVersion {
  region: string;
  languages: string;
  sourceUrl: string;
}

export interface ItemAnalysis {
  name: string;
  category: string;
  description: string;
  estimatedValue: string;
  searchTips: string[];
  versions: GameVersion[];
  sources?: WebSource[];
}

export interface PlatformPrice {
  platform: string;
  price: string;
  status: string;
}

export interface PriceInsight {
  prices: PlatformPrice[];
  overview: string;
  sources: WebSource[];
}

export interface SearchState {
  query: string;
  currency: string;
  isSearching: boolean;
  analysis: ItemAnalysis | null;
  priceInsight: PriceInsight | null;
  error: string | null;
}