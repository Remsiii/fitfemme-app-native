import { supabase } from '@/lib/supabase';

interface NotificationData {
    title: string;
    body: string;
}

class NotificationService {
    async sendNotification(data: NotificationData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user found');

        return this.sendNotificationToUser(user.id, data);
    }

    async sendNotificationToUser(userId: string, data: NotificationData) {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'system',
                    message: data.body,
                    read: false,
                    sender_name: 'System',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            // If you want to add browser notifications later, you can add them here
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.body
                });
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    async sendWorkoutNotification(userId: string, data: NotificationData) {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'workout',
                    message: data.body,
                    read: false,
                    sender_name: 'Trainer',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.body
                });
            }
        } catch (error) {
            console.error('Error sending workout notification:', error);
            throw error;
        }
    }

    async sendTrainerMessage(userId: string, data: NotificationData) {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'message',
                    message: data.body,
                    read: false,
                    sender_name: 'Trainer',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.body
                });
            }
        } catch (error) {
            console.error('Error sending trainer message:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();
