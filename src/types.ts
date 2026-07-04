export interface DestinationSuggestion {
  name: string;
  hook: string;
  tag: 'Popular' | 'Offbeat';
}

export type TabType = 'stories' | 'heritage' | 'hidden_gems' | 'local_events';

export interface TabContent {
  content: string;
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GlobalChatResponse {
  reply: string;
  updatedDestinations?: DestinationSuggestion[];
  intent: 'refine_list' | 'q_and_a';
}
