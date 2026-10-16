export type AppTab = 
  | 'video'
  | 'ai'
  | 'arcade'
  | 'productivity'
  | 'wellness'
  | 'matrix'
  | 'quicktools';

export type FeatureCategory = 
  | 'video'
  | 'ai'
  | 'arcade'
  | 'productivity'
  | 'wellness'
  | 'knowledge'
  | 'calculators'
  | 'developer';

export interface FeatureItem {
  id: string;
  title: string;
  titleEn: string;
  category: FeatureCategory;
  description: string;
  icon: string;
  tags: string[];
  actionType: 'tab' | 'quick-tool' | 'preset' | 'game' | 'video-filter' | 'calculator' | 'sound' | 'ai-prompt';
  actionTarget: string;
  badge?: string;
}

export interface VideoTrack {
  id: string;
  title: string;
  category: string;
  url: string;
  thumbnail: string;
  duration: string;
  resolution: string;
  description: string;
}

export interface VideoBookmark {
  id: string;
  time: number;
  label: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  category: string;
}
