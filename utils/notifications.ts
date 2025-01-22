import { supabase } from '@/lib/supabase';

export async function createNotification(
  userId: string,
  type: 'workout' | 'water' | 'period' | 'system' | 'andree-workout',
  message: string,
  imageUrl?: string,
  senderName?: string
) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          message,
          read: false,
          image_url: imageUrl,
          sender_name: senderName,
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

// Helper functions for specific notification types
export async function createWorkoutNotification(
  userId: string, 
  workoutName: string, 
  time: string, 
  duration?: number,
  difficulty?: string
) {
  const messages = [
    `Hey beautiful! 🌟 I've prepared an amazing ${duration ? `${duration}-minute ` : ''}${workoutName} workout for you at ${time}${difficulty ? ` (${difficulty} level)` : ''}. Can't wait to train together! 💪`,
    `Ready for something special? 💫 Join me at ${time} for a fantastic ${duration ? `${duration}-minute ` : ''}${workoutName} session${difficulty ? ` at ${difficulty} level` : ''}. Let's crush our goals together! 🔥`,
    `Your ${time} workout is calling! 🎯 I've designed this ${duration ? `${duration}-minute ` : ''}${workoutName}${difficulty ? ` (${difficulty})` : ''} session just for you. Let's make today count! ✨`
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return createNotification(
    userId,
    'andree-workout',
    randomMessage,
    '/assets/images/andree.jpg',
    'Andree'
  );
}

export async function createWaterReminderNotification(userId: string) {
  return createNotification(
    userId,
    'water',
    "Don't forget to stay hydrated! 💧"
  );
}

export async function createPeriodNotification(userId: string, daysUntil: number) {
  return createNotification(
    userId,
    'period',
    `Your cycle starts in ${daysUntil} days 📅`
  );
}

export async function createSystemNotification(userId: string, message: string) {
  return createNotification(userId, 'system', message);
}
