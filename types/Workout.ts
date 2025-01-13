export interface Workout {
  id?: string;
  name: string;
  type: 'Strength' | 'Cardio' | 'Flexibility' | 'Mixed';
  duration: number; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscleGroups: string[];
  description: string;
  userId?: string;
  createdAt?: Date;
}
