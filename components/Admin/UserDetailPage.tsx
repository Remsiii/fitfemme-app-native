import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/services/NotificationService";
import {
  ArrowLeftIcon,
  UserIcon,
  ScaleIcon,
  TargetIcon,
  ActivityIcon,
  CalendarIcon,
  TrendingUpIcon,
  HeartIcon,
  ClockIcon,
  DumbbellIcon,
  UtensilsIcon,
  AlertCircleIcon,
  BellDotIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  height?: string;
  weight?: string;
  age?: string;
  goal?: string;
  daily_water_goal?: number;
  created_at: string;
  fitness_goal: string;
  weekly_workout_days: number;
  preferred_workout_time: string;
  fitness_level: string;
  health_conditions: string[];
  target_weight: string;
  dietary_preferences: string[];
}

interface AssignedWorkout {
  id: string;
  workout_id: number;
  user_id: string;
  assigned_date: string;
  completed: boolean;
  workout: {
    title: string;
    description: string;
  };
}

interface WeightEntry {
  created_at: string;
  weight: number;
  note?: string;
}

interface WorkoutProgress {
  date: string;
  completed_workouts: number;
  calories_burned: number;
}

export function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress[]>([]);
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [assignDate, setAssignDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserData();
      await fetchWeightData();
      await fetchWorkoutProgress();
      await fetchAvailableWorkouts();
      await fetchAssignedWorkouts();
    };
    
    loadData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Fetch basic user data from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name, email, profile_picture_url, age, weight, height, goal")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      console.log('User Data:', userData);
      console.log('Profile Data:', profileData);

      // Combine data from both tables
      setUserData({
        id: userId,
        email: userData?.email || 'N/A',
        full_name: userData?.full_name || 'N/A',
        height: userData?.height || 'N/A',
        weight: userData?.weight || 'N/A',
        age: userData?.age || 'N/A',
        goal: userData?.goal || 'N/A',
        created_at: profileData?.created_at,
        // Profile specific data
        fitness_goal: profileData?.fitness_goal,
        weekly_workout_days: profileData?.weekly_workout_days,
        preferred_workout_time: profileData?.preferred_workout_time,
        fitness_level: profileData?.fitness_level,
        health_conditions: profileData?.health_conditions || [],
        target_weight: profileData?.target_weight,
        dietary_preferences: profileData?.dietary_preferences || []
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/admin');
    }
  };

  const fetchWeightData = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedData = data.map(entry => ({
        ...entry,
        created_at: new Date(entry.created_at).toLocaleDateString(),
      }));
      
      setWeightData(formattedData);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
    }
  };

  const fetchWorkoutProgress = async () => {
    try {
      // Da die workout_progress Tabelle nicht existiert, simulieren wir die Daten
      const mockProgress = [
        { date: '2024-01-01', completed_workouts: 3, calories_burned: 450 },
        { date: '2024-01-02', completed_workouts: 2, calories_burned: 300 },
        { date: '2024-01-03', completed_workouts: 4, calories_burned: 600 }
      ];
      setWorkoutProgress(mockProgress);
    } catch (error) {
      console.error('Error fetching workout progress:', error);
    }
  };

  const fetchAvailableWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*');
      
      if (error) throw error;
      setAvailableWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchAssignedWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('assigned_workouts')
        .select(`
          *,
          workout:workouts (
            name,
            description
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      setAssignedWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching assigned workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignWorkout = async () => {
    if (!selectedWorkout || !assignDate) return;

    try {
      // Füge das Workout der assigned_workouts Tabelle hinzu
      const { data, error } = await supabase
        .from('assigned_workouts')
        .insert([
          {
            workout_id: selectedWorkout,
            user_id: userId,
            assigned_date: assignDate,
            completed: false
          }
        ]);

      if (error) throw error;

      // Erstelle eine Benachrichtigung für den Benutzer
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            type: 'workout_assigned',
            message: `Ein neues Workout wurde dir für den ${new Date(assignDate).toLocaleDateString()} zugewiesen`,
            read: false
          }
        ]);

      if (notificationError) throw notificationError;

      // Aktualisiere die Liste der zugewiesenen Workouts
      fetchAssignedWorkouts();
      
      // Setze die Formularfelder zurück
      setSelectedWorkout('');
      setAssignDate('');
    } catch (error) {
      console.error('Error assigning workout:', error);
    }
  };

  const calculateProgress = () => {
    if (!userData?.weight || !userData?.target_weight) return 0;
    const currentWeight = parseFloat(userData.weight);
    const targetWeight = parseFloat(userData.target_weight);
    const startWeight = weightData[0]?.weight || currentWeight;
    
    if (targetWeight > startWeight) {
      // Goal is to gain weight
      return Math.min(((currentWeight - startWeight) / (targetWeight - startWeight)) * 100, 100);
    } else {
      // Goal is to lose weight
      return Math.min(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100, 100);
    }
  };

  const goalLabels: Record<string, string> = {
    'weight_loss': 'Gewichtsverlust',
    'muscle_gain': 'Muskelaufbau',
    'endurance': 'Ausdauer verbessern',
    'flexibility': 'Flexibilität verbessern',
    'general_fitness': 'Allgemeine Fitness'
  };

  const timeLabels: Record<string, { label: string, icon: string }> = {
    'morning': { label: 'Morgens (6:00 - 11:00 Uhr)', icon: '🌅' },
    'afternoon': { label: 'Nachmittags (11:00 - 17:00 Uhr)', icon: '☀️' },
    'evening': { label: 'Abends (17:00 - 22:00 Uhr)', icon: '🌙' },
    'flexible': { label: 'Flexibel', icon: '⭐' }
  };

  const levelLabels: Record<string, string> = {
    'beginner': 'Anfänger',
    'intermediate': 'Fortgeschritten',
    'advanced': 'Sehr Fortgeschritten'
  };

  const healthConditionLabels: Record<string, string> = {
    'back_pain': 'Rückenschmerzen',
    'joint_issues': 'Gelenkprobleme',
    'heart_condition': 'Herzprobleme',
    'diabetes': 'Diabetes',
    'asthma': 'Asthma'
  };

  const dietaryPreferenceLabels: Record<string, string> = {
    'vegetarian': 'Vegetarisch',
    'vegan': 'Vegan',
    'gluten_free': 'Glutenfrei',
    'lactose_free': 'Laktosefrei',
    'low_carb': 'Low Carb'
  };

  const sendMessage = async () => {
    try {
      // Insert into notifications table and send browser notification
      await notificationService.sendNotificationToUser(userId!, {
        title: "Neue Nachricht von deinem Trainer 💪",
        body: message,
        icon: "/favicon.ico"
      });

      // Show success toast to admin
      toast({
        title: "Nachricht gesendet",
        description: "Die Nachricht wurde erfolgreich an den Benutzer gesendet.",
        duration: 3000,
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92A3FD]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/admin/users')}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      {/* User Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#92A3FD] to-[#9DCEFF] rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData?.full_name || 'N/A'}</h1>
            <p className="text-gray-500">{userData?.email}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="progress">Fortschritt</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="messages">Nachrichten</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium">{userData?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{userData?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Age</label>
                  <p className="font-medium">{userData?.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Height</label>
                  <p className="font-medium">{userData?.height ? `${userData.height} cm` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Weight</label>
                  <p className="font-medium">{userData?.weight ? `${userData.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Daily Water Goal</label>
                  <p className="font-medium">{userData?.daily_water_goal ? `${userData.daily_water_goal} ml` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Weekly Workout Goal</label>
                  <p className="font-medium">{userData?.weekly_workout_days ? `${userData.weekly_workout_days} workouts` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Goal</label>
                  <p className="font-medium">{goalLabels[userData?.fitness_goal || ''] || userData?.fitness_goal || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Weight Progress Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <ScaleIcon className="w-5 h-5 text-[#92A3FD]" />
                <h2 className="font-semibold">Weight Progress</h2>
              </div>
              {weightData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <defs>
                        <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#92A3FD" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#92A3FD" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="created_at"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                        label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#92A3FD"
                        fillOpacity={1}
                        fill="url(#weightColor)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px] text-gray-500">
                  No weight entries found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Goals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                    <TargetIcon className="w-5 h-5 text-[#92A3FD]" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-500">Main Goal</h3>
                  <p className="font-semibold break-words">{goalLabels[userData?.fitness_goal || ''] || userData?.fitness_goal || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-[#92A3FD]" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-500">Weekly Workouts</h3>
                  <p className="font-semibold">{userData?.weekly_workout_days || 0} Tage pro Woche</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-[#92A3FD]" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-500">Preferred Time</h3>
                  <p className="font-semibold break-words">
                    {userData?.preferred_workout_time ? (
                      <>
                        {timeLabels[userData.preferred_workout_time]?.icon}{' '}
                        {timeLabels[userData.preferred_workout_time]?.label}
                      </>
                    ) : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                    <ActivityIcon className="w-5 h-5 text-[#92A3FD]" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-500">Fitness Level</h3>
                  <p className="font-semibold break-words">{levelLabels[userData?.fitness_level || ''] || userData?.fitness_level || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Conditions Section */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-[#92A3FD]" />
                </div>
                <h3 className="font-medium">Health Conditions</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-2">
                {userData?.health_conditions && userData.health_conditions.length > 0 ? (
                  userData.health_conditions.map((condition) => (
                    <div
                      key={condition}
                      className="flex items-center gap-2 px-4 py-2 bg-[#92A3FD]/5 rounded-full"
                    >
                      <span className="font-medium break-words">{healthConditionLabels[condition] || condition}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No health conditions specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dietary Preferences Section */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                  <UtensilsIcon className="w-5 h-5 text-[#92A3FD]" />
                </div>
                <h3 className="font-medium">Dietary Preferences</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-2">
                {userData?.dietary_preferences && userData.dietary_preferences.length > 0 ? (
                  userData.dietary_preferences.map((pref) => (
                    <div
                      key={pref}
                      className="flex items-center gap-2 px-4 py-2 bg-[#92A3FD]/5 rounded-full"
                    >
                      <span className="font-medium break-words">{dietaryPreferenceLabels[pref] || pref}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No dietary preferences specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold">Workout zuweisen</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Workout auswählen</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedWorkout}
                    onChange={(e) => setSelectedWorkout(e.target.value)}
                  >
                    <option value="">Workout auswählen...</option>
                    {availableWorkouts.map((workout) => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Datum</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                  />
                </div>
                <Button onClick={assignWorkout}>Workout zuweisen</Button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Zugewiesene Workouts</h3>
                <div className="space-y-4">
                  {assignedWorkouts.map((assignment) => (
                    <div key={assignment.id} className="p-4 border rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{assignment.workout.name}</h4>
                          <p className="text-sm text-gray-500">
                            Datum: {new Date(assignment.assigned_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {assignment.completed ? (
                            <span className="text-green-500">✓ Abgeschlossen</span>
                          ) : (
                            <span className="text-yellow-500">Ausstehend</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#92A3FD]/10 flex items-center justify-center">
                  <BellDotIcon className="w-5 h-5 text-[#92A3FD]" />
                </div>
                <h3 className="font-medium">Nachricht senden</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nachricht</label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#92A3FD]"
                  placeholder="Schreibe eine Nachricht..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button 
                onClick={sendMessage}
                className="w-full"
                disabled={!message.trim()}
              >
                Nachricht senden
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
