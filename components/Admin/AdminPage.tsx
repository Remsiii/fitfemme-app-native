"use client";

import React, { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Loader2Icon, PlusCircleIcon, User2Icon, Target, Trophy, Calendar, Clock, Activity, Heart, AlertCircle, Scale, Utensils } from "lucide-react";
import UserProgress from "./UserProgress";
import { useAdmin } from "@/hooks/useAdmin";

interface AdminWorkout {
    id: number;
    name: string;
    type: string;
    duration: number;
    difficulty: string;
    description: string | null;
    exercises_count: number;
    calories_burned: number;
    schedule_time: string | null;
}

interface AdminUser {
    id: string;
    email: string;
    full_name?: string;
    fitness_goal?: string;
    weekly_workout_days?: number;
    preferred_workout_time?: string;
    fitness_level?: string;
    health_conditions?: string[];
    target_weight?: string;
    dietary_preferences?: string[];
}

interface Exercise {
    id: number;
    name: string;
    duration?: string;
    reps?: string;
    image_url?: string;
    video_url?: string;
    set_number: number;
}

interface Workout {
    id: number;
    name: string;
    description: string;
    duration: number;
    difficulty: string;
    calories_burn: number;
    exercises: Exercise[];
    icon?: string;
}

export const AdminPage = () => {
    const navigate = useNavigate();
    const { isAdmin, loading } = useAdmin();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [openWorkoutDialog, setOpenWorkoutDialog] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [newWorkout, setNewWorkout] = useState({
        name: "",
        type: "",
        duration: 0,
        difficulty: "",
        description: "",
        exercises_count: 0,
        calories_burned: 0,
        schedule_time: "",
        icon: "",
    });

    const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
        name: "",
        duration: "",
        reps: "",
        image_url: "",
        video_url: "",
        set_number: 1,
    });

    const [activeTab, setActiveTab] = useState<'workouts' | 'users' | 'progress'>('workouts');

    useEffect(() => {
        if (!loading && !isAdmin) {
            navigate('/home');
            return;
        }

        if (!loading && isAdmin) {
            fetchUsers();
            fetchWorkouts();
        }
    }, [loading, isAdmin, navigate]);

    useEffect(() => {
        const checkAdmin = async () => {
            await supabaseAdmin.auth.updateUser({
                data: { is_super_admin: true }
            });

            const {
                data: { user },
            } = await supabaseAdmin.auth.getUser();

            if (!user) {
                navigate("/login");
                return;
            }

            // Add icon column if it doesn't exist
            const { error: alterError } = await supabaseAdmin.rpc('add_icon_column_if_not_exists');
            if (alterError) {
                console.error("Error adding icon column:", alterError);
            }

            setIsLoading(false);
        };

        checkAdmin();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            // First get all profiles with their goals and preferences
            const { data: profiles, error: profilesError } = await supabaseAdmin
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    fitness_goal,
                    weekly_workout_days,
                    preferred_workout_time,
                    fitness_level,
                    health_conditions,
                    target_weight,
                    dietary_preferences,
                    email
                `);

            if (profilesError) {
                console.error('Error fetching profiles:', profilesError);
                return;
            }

            setUsers(profiles || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchWorkouts = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from("workouts")
                .select(`
                    *,
                    exercises (*)
                `);

            if (error) {
                console.error("Error fetching workouts:", error);
                return;
            }

            setWorkouts(data || []);
        } catch (err) {
            console.error("Unknown error fetching workouts:", err);
        }
    };

    const handleAddWorkout = async () => {
        try {
            // First, ensure the icon column exists
            const { error: checkError } = await supabaseAdmin
                .from('workouts')
                .select('icon')
                .limit(1);

            if (checkError && checkError.message.includes('column "icon" does not exist')) {
                // Column doesn't exist, create it
                const { error: alterError } = await supabaseAdmin.rpc('add_icon_column_if_not_exists');
                if (alterError) {
                    console.error("Error adding icon column:", alterError);
                    return;
                }
            }

            // Now proceed with the insert
            const { error } = await supabaseAdmin.from("workouts").insert({
                name: newWorkout.name,
                type: newWorkout.type,
                duration: newWorkout.duration,
                difficulty: newWorkout.difficulty,
                description: newWorkout.description || null,
                exercises_count: newWorkout.exercises_count,
                calories_burned: newWorkout.calories_burned,
                schedule_time: newWorkout.schedule_time || null,
                icon: newWorkout.icon || null,
            });

            if (error) {
                console.error("Error inserting workout:", error);
                return;
            }

            await fetchWorkouts();
            setOpenWorkoutDialog(false);
            setNewWorkout({
                name: "",
                type: "",
                duration: 0,
                difficulty: "",
                description: "",
                exercises_count: 0,
                calories_burned: 0,
                schedule_time: "",
                icon: "",
            });
        } catch (error) {
            console.error("Error adding workout:", error);
        }
    };

    const handleAddExercise = async () => {
        if (!selectedWorkout) return;

        try {
            const { data, error } = await supabaseAdmin
                .from("exercises")
                .insert([
                    {
                        ...newExercise,
                        workout_id: selectedWorkout.id,
                    },
                ])
                .select();

            if (error) throw error;

            // Exercise erfolgreich angelegt -> Liste neu laden und Dialog schließen
            await fetchWorkouts();
            setIsAddingExercise(false);
            setNewExercise({
                name: "",
                duration: "",
                reps: "",
                image_url: "",
                video_url: "",
                set_number: 1,
            });
        } catch (error) {
            console.error("Error adding exercise:", error);
        }
    };

    const handleUpdateExercise = async (exercise: Exercise) => {
        try {
            const { error } = await supabaseAdmin
                .from("exercises")
                .update({
                    name: exercise.name,
                    duration: exercise.duration,
                    reps: exercise.reps,
                    image_url: exercise.image_url,
                    video_url: exercise.video_url,
                    set_number: exercise.set_number,
                })
                .eq("id", exercise.id);

            if (error) throw error;

            // Exercise erfolgreich aktualisiert -> Liste neu laden
            await fetchWorkouts();
        } catch (error) {
            console.error("Error updating exercise:", error);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        try {
            const { error } = await supabaseAdmin
                .from("exercises")
                .delete()
                .eq("id", exerciseId);

            if (error) throw error;

            // Exercise erfolgreich gelöscht -> Liste neu laden
            await fetchWorkouts();
        } catch (error) {
            console.error("Error deleting exercise:", error);
        }
    };

    const handleFileUpload = async (file: File, exerciseId: number, type: 'video' | 'image') => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}-${exerciseId}.${fileExt}`;
            const filePath = `exercises/${type}s/${fileName}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('workout-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('workout-media')
                .getPublicUrl(filePath);

            const updateField = type === 'video' ? 'video_url' : 'image_url';
            const { error: updateError } = await supabaseAdmin
                .from('exercises')
                .update({ [updateField]: publicUrl })
                .eq('id', exerciseId);

            if (updateError) throw updateError;

            // Exercise erfolgreich aktualisiert -> Liste neu laden
            await fetchWorkouts();
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setUploadingImage(true);

            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`; // Simplified path

            // Upload the file to Supabase storage
            const { error: uploadError } = await supabaseAdmin.storage
                .from('workout-images')  // Using the new bucket name
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            // Get the public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('workout-images')  // Using the new bucket name
                .getPublicUrl(filePath);

            // Update the form state with the full URL
            setNewWorkout(prev => ({
                ...prev,
                icon: publicUrl
            }));

        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const UserCard = ({ user }: { user: AdminUser }) => {
        const goalLabels: Record<string, string> = {
            weight_loss: 'Gewichtsverlust',
            muscle_gain: 'Muskelaufbau',
            endurance: 'Ausdauer verbessern',
            flexibility: 'Flexibilität verbessern',
            general_fitness: 'Allgemeine Fitness'
        };

        return (
            <Card className="hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/users/${user.id}`)}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{user.full_name || 'Unnamed User'}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Ziel:</span>
                            <span>{goalLabels[user.fitness_goal || ''] || 'Nicht angegeben'}</span>
                        </div>
                        {user.weekly_workout_days && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Training/Woche:</span>
                                <span>{user.weekly_workout_days} Tage</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2Icon className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            <div className="flex gap-4 mb-6">
                <Button
                    variant={activeTab === 'workouts' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('workouts')}
                    className={activeTab === 'workouts' ? 'bg-[#92A3FD] text-white' : ''}
                >
                    Workouts
                </Button>
                <Button
                    variant={activeTab === 'users' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('users')}
                    className={activeTab === 'users' ? 'bg-[#92A3FD] text-white' : ''}
                >
                    Users
                </Button>
                <Button
                    variant={activeTab === 'progress' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('progress')}
                    className={activeTab === 'progress' ? 'bg-[#92A3FD] text-white' : ''}
                >
                    Progress
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2Icon className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <>
                    {activeTab === 'users' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {users.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                    {activeTab === 'progress' && (
                        <UserProgress />
                    )}
                    {activeTab === 'workouts' && (
                        <Card className="mb-8">
                            <CardHeader className="p-4 flex items-center justify-between">
                                <h2 className="text-base font-semibold">Workouts</h2>
                                <Dialog open={openWorkoutDialog} onOpenChange={setOpenWorkoutDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="flex items-center gap-2 bg-gradient-to-b from-[#92A3FD] to-[#9DCEFF] text-white">
                                            <PlusCircleIcon className="w-4 h-4" />
                                            <span>Add Workout</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="p-6 rounded-lg bg-white w-[350px]">
                                        <DialogHeader>
                                            <DialogTitle>Neues Workout anlegen</DialogTitle>
                                            <DialogDescription>
                                                Fülle die folgenden Felder aus:
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="flex flex-col gap-2 mt-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Name</label>
                                                <Input
                                                    type="text"
                                                    value={newWorkout.name}
                                                    onChange={(e) =>
                                                        setNewWorkout({ ...newWorkout, name: e.target.value })
                                                    }
                                                    placeholder="Workout name"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Workout Icon</label>
                                                <div className="mt-1 flex items-center space-x-4">
                                                    {newWorkout.icon && (
                                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                                                            <img
                                                                src={newWorkout.icon}
                                                                alt="Workout preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                        {uploadingImage ? 'Uploading...' : 'Upload Icon'}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={uploadingImage}
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            <label className="text-sm font-medium text-gray-700">Type</label>
                                            <Input
                                                type="text"
                                                value={newWorkout.type}
                                                onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                                            />

                                            <label className="text-sm font-medium text-gray-700">Difficulty</label>
                                            <Input
                                                type="text"
                                                value={newWorkout.difficulty}
                                                onChange={(e) =>
                                                    setNewWorkout({ ...newWorkout, difficulty: e.target.value })
                                                }
                                            />

                                            <label className="text-sm font-medium text-gray-700">Duration (min)</label>
                                            <Input
                                                type="number"
                                                value={newWorkout.duration}
                                                onChange={(e) =>
                                                    setNewWorkout({ ...newWorkout, duration: parseInt(e.target.value) })
                                                }
                                            />

                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                            <Input
                                                type="text"
                                                value={newWorkout.description}
                                                onChange={(e) =>
                                                    setNewWorkout({ ...newWorkout, description: e.target.value })
                                                }
                                            />

                                            <label className="text-sm font-medium text-gray-700">Exercises Count</label>
                                            <Input
                                                type="number"
                                                value={newWorkout.exercises_count}
                                                onChange={(e) =>
                                                    setNewWorkout({
                                                        ...newWorkout,
                                                        exercises_count: parseInt(e.target.value),
                                                    })
                                                }
                                            />

                                            <label className="text-sm font-medium text-gray-700">Calories Burned</label>
                                            <Input
                                                type="number"
                                                value={newWorkout.calories_burned}
                                                onChange={(e) =>
                                                    setNewWorkout({
                                                        ...newWorkout,
                                                        calories_burned: parseInt(e.target.value),
                                                    })
                                                }
                                            />

                                            <label className="text-sm font-medium text-gray-700">Schedule Time</label>
                                            <Input
                                                type="datetime-local"
                                                value={newWorkout.schedule_time}
                                                onChange={(e) =>
                                                    setNewWorkout({ ...newWorkout, schedule_time: e.target.value })
                                                }
                                            />
                                        </div>

                                        <DialogFooter className="mt-6">
                                            <Button
                                                variant="default"
                                                onClick={handleAddWorkout}
                                                className="bg-[#92A3FD] hover:bg-[#9DCEFF] text-white w-full"
                                            >
                                                Speichern
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>

                            <CardContent className="p-4 space-y-2">
                                {workouts.length === 0 && (
                                    <p className="text-sm text-gray-500">No workouts found.</p>
                                )}
                                {workouts.map((workout) => (
                                    <div key={workout.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium">{workout.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {workout.type} | {workout.difficulty} | {workout.duration} min
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/admin/workout/${workout.id}`)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage;
