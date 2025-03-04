export interface TherapyExercise {
    id: number;
    title: string;
    description: string;
    type: 'meditation' | 'journaling' | 'breathwork' | 'cognitive' | 'behavioral';
    durationMinutes: number;
    points: number;
    completedAt?: string;
  }
  
  export interface DailyPrompt {
    id: number;
    content: string;
    type: 'reflection' | 'gratitude' | 'challenge' | 'mindfulness';
    date: string;
  }
  
  export interface ProgressStats {
    totalExercisesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    weeklyActivity: { date: string; count: number }[];
  }
  