export type ContentType = 
  | 'study_guide'
  | 'briefing_doc' 
  | 'faq'
  | 'timeline'
  | 'outline'
  | 'deep_dive'
  | 'flashcards';

export interface ContentOptions {
  // Content Style
  format: 'structured' | 'conversational' | 'bullet';
  tone: 'professional' | 'casual' | 'technical';
  length: 'short' | 'medium' | 'long';
  style: 'educational' | 'debate' | 'interview' | 'storytelling' | 'analytical';
  perspective: 'neutral' | 'critical' | 'supportive' | 'contrasting';
  depth: 'overview' | 'balanced' | 'detailed' | 'expert';
  
  // Target Audience
  audience: 'general' | 'beginner' | 'expert';
  complexity: 'basic' | 'intermediate' | 'advanced';
  
  // Content Elements
  elements: {
    examples: boolean;
    questions: boolean;
    summary: boolean;
    citations: boolean;
    keyPoints: boolean;
    definitions: boolean;
    references: boolean;
  };
  
  // Voice Options (for audio)
  voice1?: string;
  voice2?: string;
  speakers?: {
    host1: string;
    host2: string;
    roles?: {
      host1Role?: string;
      host2Role?: string;
    };
    style?: 'formal' | 'casual' | 'dynamic';
    voiceSettings?: {
      host1: {
        speed: number;
        pitch: number;
        emphasis: 'light' | 'moderate' | 'strong' | 'dramatic';
        emotionIntensity: 'low' | 'medium' | 'high' | 'intense';
        style: 'neutral' | 'formal' | 'casual' | 'professional' | 'friendly' | 'authoritative';
        emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious' | 'empathetic' | 'confident';
        age: 'young' | 'adult' | 'senior';
        accent: 'neutral' | 'american' | 'british' | 'australian' | 'indian';
        speed_range: { min: number; max: number };
        pitch_range: { min: number; max: number };
        emphasis_levels: string[];
        emotion_intensities: string[];
      };
      host2: {
        speed: number;
        pitch: number;
        emphasis: 'light' | 'moderate' | 'strong' | 'dramatic';
        emotionIntensity: 'low' | 'medium' | 'high' | 'intense';
        style: 'neutral' | 'formal' | 'casual' | 'professional' | 'friendly' | 'authoritative';
        emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious' | 'empathetic' | 'confident';
        age: 'young' | 'adult' | 'senior';
        accent: 'neutral' | 'american' | 'british' | 'australian' | 'indian';
        speed_range: { min: number; max: number };
        pitch_range: { min: number; max: number };
        emphasis_levels: string[];
        emotion_intensities: string[];
      };
    };
  };
  
  // Advanced Options
  advanced?: {
    maxLength?: number;
    minConfidence?: number;
    requireSources?: boolean;
    preserveFormatting?: boolean;
    highlightKeyTerms?: boolean;
    generateMetadata?: boolean;
  };
}

export interface ContentTypeConfig {
  title: string;
  description: string;
  icon: string;
  defaultOptions: Partial<ContentOptions>;
  availableOptions: (keyof ContentOptions)[];
}

export const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
  study_guide: {
    title: 'Study Guide',
    description: 'A comprehensive guide for learning and revision',
    icon: 'Book',
    defaultOptions: {
      format: 'structured',
      tone: 'professional',
      length: 'long',
      style: 'educational',
      depth: 'detailed',
      audience: 'beginner',
      elements: {
        examples: true,
        questions: true,
        summary: true,
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth', 'audience', 'complexity',
      'elements'
    ]
  },
  briefing_doc: {
    title: 'Briefing Document',
    description: 'A concise overview of key points',
    icon: 'FileText',
    defaultOptions: {
      format: 'structured',
      tone: 'professional',
      length: 'medium',
      style: 'analytical',
      depth: 'balanced',
      audience: 'expert',
      elements: {
        summary: true,
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth', 'audience',
      'elements'
    ]
  },
  faq: {
    title: 'FAQ',
    description: 'Common questions and detailed answers',
    icon: 'HelpCircle',
    defaultOptions: {
      format: 'structured',
      tone: 'casual',
      length: 'medium',
      style: 'educational',
      depth: 'balanced',
      audience: 'general',
      elements: {
        examples: true,
        questions: true,
        summary: true,
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'tone', 'length', 'audience', 'complexity',
      'elements'
    ]
  },
  timeline: {
    title: 'Timeline',
    description: 'Chronological sequence of events',
    icon: 'Clock',
    defaultOptions: {
      format: 'structured',
      tone: 'professional',
      length: 'medium',
      style: 'analytical',
      depth: 'balanced',
      elements: {
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth',
      'elements'
    ]
  },
  outline: {
    title: 'Outline',
    description: 'Structured overview of topics',
    icon: 'List',
    defaultOptions: {
      format: 'bullet',
      tone: 'professional',
      length: 'medium',
      depth: 'balanced',
      elements: {
        summary: true,
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth',
      'elements'
    ]
  },
  deep_dive: {
    title: 'Deep Dive',
    description: 'In-depth conversational analysis',
    icon: 'MessageSquare',
    defaultOptions: {
      format: 'conversational',
      tone: 'professional',
      length: 'long',
      style: 'educational',
      depth: 'detailed',
      audience: 'expert',
      elements: {
        examples: true,
        questions: true,
        summary: true,
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'format', 'tone', 'length', 'style', 'perspective', 'depth',
      'audience', 'complexity', 'elements', 'voice1', 'voice2', 'speakers'
    ]
  },
  flashcards: {
    title: 'Flashcards',
    description: 'Study cards for key concepts',
    icon: 'Square',
    defaultOptions: {
      tone: 'professional',
      complexity: 'intermediate',
      elements: {
        examples: true,
        questions: true,
        summary: true,
        citations: true,
        keyPoints: true,
        definitions: true,
        references: true,
      }
    },
    availableOptions: [
      'tone', 'complexity', 'elements'
    ]
  }
};