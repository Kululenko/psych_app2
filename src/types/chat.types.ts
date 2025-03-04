export interface ChatMessage {
    id: number | string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
    isProcessing?: boolean;
  }
  
  export interface ChatSession {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: ChatMessage[];
  }