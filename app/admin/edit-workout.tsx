import { Stack } from 'expo-router';
import EditWorkout from '../../components/Admin/EditWorkout';

export default function EditWorkoutPage() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Workout bearbeiten',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }} 
      />
      <EditWorkout />
    </>
  );
}
