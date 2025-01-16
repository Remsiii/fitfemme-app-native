import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2Icon, ChevronRightIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/NotificationService";

interface UserProgress {
    id: string;
    email: string;
    name?: string;
    height?: string;
    weight?: string;
    bmi?: number;
    completed_workouts?: number;
    total_workout_minutes?: number;
    last_workout_date?: string;
    streak_days?: number;
}

export default function UserProgress() {
    const [users, setUsers] = useState<UserProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch users with their profiles
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select(`
                    id,
                    email,
                    name,
                    height,
                    weight
                `)
                .eq('is_active', true);

            if (usersError) throw usersError;

            // For each user, fetch their workout statistics
            const usersWithProgress = await Promise.all(
                (usersData || []).map(async (user) => {
                    // Get completed workouts count
                    const { count: completedWorkouts } = await supabase
                        .from('user_workouts')
                        .select('*', { count: 'exact' })
                        .eq('user_id', user.id)
                        .eq('completed', true);

                    // Get total workout minutes
                    const { data: workoutMinutes } = await supabase
                        .from('user_workouts')
                        .select('duration')
                        .eq('user_id', user.id)
                        .eq('completed', true);

                    const totalMinutes = workoutMinutes?.reduce((acc, curr) => acc + (curr.duration || 0), 0);

                    // Get last workout date
                    const { data: lastWorkout } = await supabase
                        .from('user_workouts')
                        .select('completed_at')
                        .eq('user_id', user.id)
                        .eq('completed', true)
                        .order('completed_at', { ascending: false })
                        .limit(1);

                    // Calculate BMI if height and weight are available
                    let bmi;
                    if (user.height && user.weight) {
                        const heightInMeters = parseFloat(user.height) / 100;
                        const weightInKg = parseFloat(user.weight);
                        bmi = weightInKg / (heightInMeters * heightInMeters);
                    }

                    // Calculate streak
                    const { data: workoutDates } = await supabase
                        .from('user_workouts')
                        .select('completed_at')
                        .eq('user_id', user.id)
                        .eq('completed', true)
                        .order('completed_at', { ascending: false });

                    let streakDays = 0;
                    if (workoutDates && workoutDates.length > 0) {
                        let currentDate = new Date(workoutDates[0].completed_at);
                        const today = new Date();
                        const oneDay = 24 * 60 * 60 * 1000;

                        for (let i = 1; i < workoutDates.length; i++) {
                            const prevDate = new Date(workoutDates[i].completed_at);
                            const diffDays = Math.round(Math.abs((currentDate.getTime() - prevDate.getTime()) / oneDay));
                            
                            if (diffDays === 1) {
                                streakDays++;
                                currentDate = prevDate;
                            } else {
                                break;
                            }
                        }

                        // Check if the streak is still active (last workout was today or yesterday)
                        const diffToToday = Math.round(Math.abs((today.getTime() - new Date(workoutDates[0].completed_at).getTime()) / oneDay));
                        if (diffToToday > 1) {
                            streakDays = 0;
                        }
                    }

                    return {
                        ...user,
                        bmi: bmi ? Math.round(bmi * 10) / 10 : undefined,
                        completed_workouts: completedWorkouts,
                        total_workout_minutes: totalMinutes,
                        last_workout_date: lastWorkout?.[0]?.completed_at,
                        streak_days: streakDays
                    };
                })
            );

            setUsers(usersWithProgress);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching user progress:', error);
            setIsLoading(false);
        }
    };

    const handleMarkCompleted = async (userId: string) => {
        try {
            // Your existing completion logic here
            
            // Send browser notification
            await notificationService.sendNotification({
                title: "Workout Completed! 🎉",
                body: "Great job! You've completed your workout.",
                icon: "/favicon.ico" // Make sure you have a favicon or other icon
            });
            
            // Refresh the user list
            await fetchUsers();
        } catch (error) {
            console.error('Error marking workout as completed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2Icon className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <Card 
                    key={user.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                    <CardHeader className="bg-gradient-to-r from-[#92A3FD] to-[#9DCEFF] text-white p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">{user.name || 'Anonymous'}</h3>
                            <div className="flex items-center">
                                <span className="text-sm opacity-90 mr-2">{user.email}</span>
                                <ChevronRightIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-500">Completed Workouts</p>
                                    <p className="font-semibold">{user.completed_workouts || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Minutes</p>
                                    <p className="font-semibold">{user.total_workout_minutes || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Current Streak</p>
                                    <p className="font-semibold">{user.streak_days || 0} days</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkCompleted(user.id);
                                    }}
                                    className="mt-2 px-4 py-2 bg-gradient-to-r from-[#92A3FD] to-[#9DCEFF] text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Mark Workout Completed
                                </button>
                            </div>
                            <div className="space-y-2">
                                {user.bmi && (
                                    <div>
                                        <p className="text-sm text-gray-500">BMI</p>
                                        <p className="font-semibold">{user.bmi}</p>
                                    </div>
                                )}
                                {user.height && (
                                    <div>
                                        <p className="text-sm text-gray-500">Height</p>
                                        <p className="font-semibold">{user.height} cm</p>
                                    </div>
                                )}
                                {user.weight && (
                                    <div>
                                        <p className="text-sm text-gray-500">Weight</p>
                                        <p className="font-semibold">{user.weight} kg</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {user.last_workout_date && (
                            <div className="mt-4 text-sm text-gray-500">
                                Last workout: {new Date(user.last_workout_date).toLocaleDateString()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
