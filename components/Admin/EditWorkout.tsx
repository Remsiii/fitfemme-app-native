import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableExerciseItem } from './SortableExerciseItem';

interface Exercise {
    id: string;
    name: string;
    duration: string;
    reps: string;
    video_url?: string;
    image_url?: string;
    set_number: number;
    workout_id: string;
}

interface Workout {
    id: string;
    name: string;
    type: string;
    difficulty: string;
    duration: number;
    description: string;
    exercises_count: number;
    calories_burned: number;
    schedule_time: string;
    exercises?: Exercise[];
    icon?: string;
}

export default function EditWorkout() {
    const navigate = useNavigate();
    const { workoutId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [newExercise, setNewExercise] = useState({
        name: "",
        duration: "",
        reps: "",
        video_url: "",
        image_url: "",
        set_number: 1,
    });

    const [newExerciseFiles, setNewExerciseFiles] = useState<{
        image?: File;
        video?: File;
    }>({});

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchWorkout();
    }, [workoutId]);

    const fetchWorkout = async () => {
        try {
            setIsLoading(true);
            const { data: workoutData, error: workoutError } = await supabaseAdmin
                .from('workouts')
                .select('*')
                .eq('id', workoutId)
                .single();

            if (workoutError) throw workoutError;
            setWorkout(workoutData);

            const { data: exerciseData, error: exerciseError } = await supabaseAdmin
                .from('exercises')
                .select('*')
                .eq('workout_id', workoutId)
                .order('set_number', { ascending: true });

            if (exerciseError) throw exerciseError;
            setExercises(exerciseData || []);
        } catch (error) {
            console.error('Error fetching workout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdateWorkout = async (updatedData: Partial<Workout>) => {
        try {
            const { error } = await supabaseAdmin
                .from('workouts')
                .update(updatedData)
                .eq('id', workoutId);

            if (error) throw error;

            setWorkout(prev => prev ? { ...prev, ...updatedData } : null);
        } catch (error) {
            console.error('Error updating workout:', error);
        }
    };

    const handleAddExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workout) {
            showToast("No workout found", "error");
            return;
        }

        try {
            setIsSubmitting(true);
            // Create default URLs for image and video
            const defaultImageUrl = 'https://placehold.co/400x300?text=No+Image';
            const defaultVideoUrl = 'https://placehold.co/400x300?text=No+Video';
            
            // Create the exercise first with default URLs
            const { data: exerciseData, error: exerciseError } = await supabaseAdmin
                .from('exercises')
                .insert({
                    workout_id: workout.id,
                    name: newExercise.name,
                    duration: newExercise.duration,
                    reps: newExercise.reps,
                    set_number: exercises.length + 1,
                    image_url: defaultImageUrl,
                    video_url: defaultVideoUrl
                })
                .select()
                .single();

            if (exerciseError) {
                showToast("Error creating exercise", "error");
                return;
            }

            if (!exerciseData) {
                showToast("No exercise data returned", "error");
                return;
            }

            // Update local state immediately
            setExercises(prev => [...prev, exerciseData]);

            // Handle file uploads
            if (newExerciseFiles.image || newExerciseFiles.video) {
                let imageUrl = defaultImageUrl;
                let videoUrl = defaultVideoUrl;

                if (newExerciseFiles.image) {
                    const fileExt = newExerciseFiles.image.name.split('.').pop();
                    const fileName = `image-${exerciseData.id}.${fileExt}`;
                    const filePath = `exercises/${fileName}`;

                    const { error: uploadError } = await supabaseAdmin.storage
                        .from('workout-media')
                        .upload(filePath, newExerciseFiles.image);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabaseAdmin.storage
                            .from('workout-media')
                            .getPublicUrl(filePath);
                        imageUrl = publicUrl;
                    }
                }

                if (newExerciseFiles.video) {
                    const fileExt = newExerciseFiles.video.name.split('.').pop();
                    const fileName = `video-${exerciseData.id}.${fileExt}`;
                    const filePath = `exercises/${fileName}`;

                    const { error: uploadError } = await supabaseAdmin.storage
                        .from('workout-media')
                        .upload(filePath, newExerciseFiles.video);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabaseAdmin.storage
                            .from('workout-media')
                            .getPublicUrl(filePath);
                        videoUrl = publicUrl;
                    }
                }

                // Update the exercise with the final URLs
                const { data: updatedExercise, error: updateError } = await supabaseAdmin
                    .from('exercises')
                    .update({
                        image_url: imageUrl,
                        video_url: videoUrl
                    })
                    .eq('id', exerciseData.id)
                    .select()
                    .single();

                if (!updateError && updatedExercise) {
                    // Update the exercise in local state
                    setExercises(prev => prev.map(ex => 
                        ex.id === updatedExercise.id ? updatedExercise : ex
                    ));
                }
            }

            // Reset form
            setNewExercise({
                name: "",
                duration: "",
                reps: "",
                video_url: "",
                image_url: "",
                set_number: 1,
            });
            setNewExerciseFiles({});
            
            showToast("Exercise added successfully!", "success");
        } catch (error) {
            console.error('Error in handleAddExercise:', error);
            showToast("Error adding exercise", "error");
        } finally {
            setIsSubmitting(false); // Make sure this always runs
        }
    };

    const handleUpdateExercise = async (exercise: Exercise) => {
        try {
            const { error } = await supabaseAdmin
                .from('exercises')
                .update(exercise)
                .eq('id', exercise.id);

            if (error) throw error;

            await fetchWorkout();
        } catch (error) {
            console.error('Error updating exercise:', error);
        }
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        try {
            // Optimistically remove from UI
            setExercises(prev => prev.filter(ex => ex.id !== exerciseId));

            const { error } = await supabaseAdmin
                .from('exercises')
                .delete()
                .eq('id', exerciseId);

            if (error) {
                // If error, revert the change
                await fetchWorkout();
                showToast("Error deleting exercise", "error");
                return;
            }

            // Update set numbers for remaining exercises
            const updatedExercises = exercises
                .filter(ex => ex.id !== exerciseId)
                .map((ex, idx) => ({ ...ex, set_number: idx + 1 }));

            // Update all set numbers in database
            await Promise.all(
                updatedExercises.map(ex =>
                    supabaseAdmin
                        .from('exercises')
                        .update({ set_number: ex.set_number })
                        .eq('id', ex.id)
                )
            );

            setExercises(updatedExercises);
            showToast("Exercise deleted successfully!", "success");
        } catch (error) {
            console.error('Error deleting exercise:', error);
            showToast("Error deleting exercise", "error");
            await fetchWorkout(); // Refresh to ensure correct state
        }
    };

    const handleFileUpload = async (file: File, exerciseId: string, type: 'video' | 'image') => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}-${exerciseId}.${fileExt}`;
            const filePath = `exercises/${fileName}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('workout-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('workout-media')
                .getPublicUrl(filePath);

            const updateData = type === 'video' 
                ? { video_url: publicUrl }
                : { image_url: publicUrl };

            await handleUpdateExercise({
                ...(workout?.exercises?.find(e => e.id === exerciseId) as Exercise),
                ...updateData
            });
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file || !workout) return;

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

            // Update the workout with the new icon
            const { error: updateError } = await supabaseAdmin
                .from('workouts')
                .update({ icon: publicUrl })
                .eq('id', workout.id);

            if (updateError) {
                throw updateError;
            }

            // Update local state
            setWorkout(prev => prev ? { ...prev, icon: publicUrl } : null);
            setToast({ message: 'Workout icon updated successfully', type: 'success' });

        } catch (error) {
            console.error('Error uploading image:', error);
            setToast({ message: 'Error uploading image. Please try again.', type: 'error' });
        } finally {
            setUploadingImage(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) {
            return;
        }

        setExercises((exercises) => {
            const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
            const newIndex = exercises.findIndex((ex) => ex.id === over.id);

            const newExercises = arrayMove(exercises, oldIndex, newIndex);
            
            // Update set numbers in database
            Promise.all(
                newExercises.map((exercise, index) =>
                    supabaseAdmin
                        .from('exercises')
                        .update({ set_number: index + 1 })
                        .eq('id', exercise.id)
                )
            ).catch((error) => {
                console.error('Error updating exercise order:', error);
                showToast("Error updating exercise order", "error");
                // Refresh to ensure correct state
                fetchWorkout();
            });

            return newExercises;
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2Icon className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    if (!workout) {
        return <div>Workout not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
                    toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}>
                    {toast.message}
                </div>
            )}

            <div className="mb-8">
                <Button
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    className="mb-4"
                >
                    ← Back to Admin
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Edit Workout</h1>
                        <p className="text-gray-600">Update workout details and exercises</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {workout.icon && (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                                <img
                                    src={workout.icon}
                                    alt="Workout icon"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {uploadingImage ? 'Uploading...' : 'Change Icon'}
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
            </div>

            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <Input
                                value={workout.name}
                                onChange={(e) => handleUpdateWorkout({ name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <Input
                                value={workout.type}
                                onChange={(e) => handleUpdateWorkout({ type: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Difficulty</label>
                            <Input
                                value={workout.difficulty}
                                onChange={(e) => handleUpdateWorkout({ difficulty: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Duration (min)</label>
                            <Input
                                type="number"
                                value={workout.duration}
                                onChange={(e) => handleUpdateWorkout({ duration: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <Input
                                value={workout.description}
                                onChange={(e) => handleUpdateWorkout({ description: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Exercise</h3>
                    <form onSubmit={handleAddExercise} className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name *</label>
                                <Input
                                    required
                                    value={newExercise.name}
                                    onChange={(e) =>
                                        setNewExercise({ ...newExercise, name: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Duration (seconds) *</label>
                                <Input
                                    required
                                    type="number"
                                    value={newExercise.duration}
                                    onChange={(e) =>
                                        setNewExercise({ ...newExercise, duration: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Reps *</label>
                            <Input
                                required
                                value={newExercise.reps}
                                onChange={(e) =>
                                    setNewExercise({ ...newExercise, reps: e.target.value })
                                }
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Video (optional)</label>
                                <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewExerciseFiles(prev => ({ ...prev, video: file }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Image (optional)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewExerciseFiles(prev => ({ ...prev, image: file }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit"
                            className="bg-gradient-to-r from-[#92A3FD] to-[#9DCEFF] text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Adding...
                                </div>
                            ) : (
                                'Add Exercise'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Exercise List</h3>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={exercises.map(ex => ex.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {exercises.map((exercise) => (
                                <SortableExerciseItem
                                    key={exercise.id}
                                    exercise={exercise}
                                    onDelete={handleDeleteExercise}
                                />
                            ))}
                            {exercises.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                    No exercises added yet.
                                </p>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
