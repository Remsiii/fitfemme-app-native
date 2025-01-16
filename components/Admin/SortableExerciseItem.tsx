import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";

interface Exercise {
    id: number;
    name: string;
    duration: string;
    reps: string;
}

interface Props {
    exercise: Exercise;
    onDelete: (id: number) => void;
}

export function SortableExerciseItem({ exercise, onDelete }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={`relative ${isDragging ? 'shadow-lg' : ''}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="touch-none"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-gray-600">
                                Duration: {exercise.duration}s | Reps: {exercise.reps}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(exercise.id)}
                            className="hover:bg-red-600"
                        >
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
