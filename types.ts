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

export interface ItemAnalysis {
  name: string;
  category: string;
  description: string;
  estimatedValue: string;
  searchTips: string[];
  languages?: string;
  sources?: WebSource[];
}

export interface PriceInsight {
  text: string;
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