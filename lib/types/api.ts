// Shared type definitions for AutoContent API and components

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  isCloned?: boolean;
  sourceAudio?: string;
  preview_url?: string;
  accent?: string;
  settings?: {
    speed_range: { min: number; max: number };
    pitch_range: { min: number; max: number };
    emphasis_levels: string[];
    emotion_intensities: string[];
  };
}

export interface GenerationOptions {
  format?: string;
  tone?: string;
  length?: string;
  voice1?: string;
  voice2?: string;
  speakers?: {
    host1: string;
    host2: string;
  };
  includeCitations?: boolean;
}

export interface AnalysisOptions {
  granularity?: 'document' | 'paragraph' | 'sentence';
  aspects?: string[];
  includeEmotions?: boolean;
  includeEvidence?: boolean;
  includeCitations?: boolean;
  minConfidence?: number;
}

export type {
  ApiError,
  ApiResponse,
  ContentStatus,
  ProcessRequest,
  ProcessResponse,
  ModifyPodcastRequest,
  ModifyPodcastResponse,
  CloneVoiceRequest,
  CloneVoiceResponse,
  CreateShortRequest,
} from '../api/types';
