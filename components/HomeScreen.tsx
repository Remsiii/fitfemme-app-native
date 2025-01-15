import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

interface Workout {
    image: any;
    title: string;
    calories: string;
    duration: string;
}

const HomeScreen = () => {
    const heartRateData = {
        labels: ['', '', '', '', '', ''],
        datasets: [{
            data: [65, 70, 78, 72, 75, 78],
        }]
    };

    const workoutProgress = {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            data: [20, 45, 28, 80, 99, 43, 50],
        }]
    };

    const workouts: Workout[] = [
        {
            image: require('../assets/workout1.jpg'),
            title: 'Full Body Workout',
            calories: '400',
            duration: '45min'
        },
        {
            image: require('../assets/workout2.jpg'),
            title: 'Core Strength',
            calories: '200',
            duration: '30min'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome Back,</Text>
                        <Text style={styles.nameText}>Daniel</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <LinearGradient
                    colors={['#7C9EFF', '#A5B9FF']}
                    style={styles.bmiCard}
                >
                    <View style={styles.bmiContent}>
                        <View>
                            <Text style={styles.bmiTitle}>BMI (Body Mass Index)</Text>
                            <Text style={styles.bmiSubtitle}>You have a normal weight</Text>
                            <TouchableOpacity style={styles.viewMoreButton}>
                                <Text style={styles.viewMoreText}>View More</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.bmiCircle}>
                            <Text style={styles.bmiValue}>20,1</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.todayTarget}>
                    <Text style={styles.sectionTitle}>Today Target</Text>
                    <TouchableOpacity style={styles.checkButton}>
                        <Text style={styles.checkButtonText}>Check</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.activityStatus}>
                    <Text style={styles.sectionTitle}>Activity Status</Text>

                    <View style={styles.heartRateCard}>
                        <View style={styles.heartRateHeader}>
                            <Text style={styles.heartRateTitle}>Heart Rate</Text>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeText}>3mins ago</Text>
                            </View>
                        </View>
                        <Text style={styles.bpmText}>78 BPM</Text>
                        <LineChart
                            data={heartRateData}
                            width={320}
                            height={100}
                            chartConfig={{
                                backgroundGradientFrom: '#f8f9fe',
                                backgroundGradientTo: '#f8f9fe',
                                color: (opacity = 1) => `rgba(124, 158, 255, ${opacity})`,
                                strokeWidth: 2,
                            }}
                            bezier
                            style={styles.chart}
                            withDots={false}
                            withInnerLines={false}
                            withOuterLines={false}
                        />
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Water Intake</Text>
                            <Text style={styles.statsValue}>4 Liters</Text>
                            <View style={styles.waterProgress}>
                                {[1, 2, 3, 4, 5].map((_, index) => (
                                    <View key={index} style={styles.waterTimeBlock}>
                                        <Text style={styles.waterTime}>{`${index * 2 + 6}am - ${index * 2 + 8}am`}</Text>
                                        <Text style={styles.waterAmount}>{`${500 + index * 100}ml`}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Sleep</Text>
                            <Text style={styles.statsValue}>8h 20m</Text>
                            <View style={styles.sleepGraph}>
                                {/* Sleep wave visualization would go here */}
                            </View>
                        </View>

                        <View style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Calories</Text>
                            <Text style={styles.statsValue}>760 kCal</Text>
                            {/* <View style={styles.caloriesCircle}>
                                <Text style={styles.caloriesRemaining}>2300Cal left</Text>
                            </View> */}
                        </View>
                    </View>
                </View>

                <View style={styles.workoutProgress}>
                    <View style={styles.workoutHeader}>
                        <Text style={styles.sectionTitle}>Workout Progress</Text>
                        <TouchableOpacity style={styles.weeklyButton}>
                            <Text style={styles.weeklyButtonText}>Weekly</Text>
                            <Ionicons name="chevron-down" size={20} color="#7C9EFF" />
                        </TouchableOpacity>
                    </View>
                    <LineChart
                        data={workoutProgress}
                        width={320}
                        height={200}
                        chartConfig={{
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            color: (opacity = 1) => `rgba(124, 158, 255, ${opacity})`,
                            strokeWidth: 2,
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#7C9EFF"
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: ""
                            }
                        }}
                        bezier
                        style={styles.chart}
                        withDots={false}
                        withInnerLines={false}
                    />
                </View>

                <View style={styles.latestWorkouts}>
                    <View style={styles.workoutHeader}>
                        <Text style={styles.sectionTitle}>Latest Workout</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeMoreText}>See more</Text>
                        </TouchableOpacity>
                    </View>

                    {workouts.map((workout, index) => (
                        <TouchableOpacity key={index} style={styles.workoutItem}>
                            <Image source={workout.image} style={styles.workoutImage} />
                            <View style={styles.workoutInfo}>
                                <Text style={styles.workoutTitle}>{workout.title}</Text>
                                <Text style={styles.workoutSubtitle}>
                                    {workout.calories} | {workout.duration}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#7C9EFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="stats-chart" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton}>
                    <View style={styles.navButtonInner}>
                        <Ionicons name="add" size={32} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="camera" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person" size={24} color="#666" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    caloriesRemaining: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    notificationButton: {
        padding: 8,
    },
    bmiCard: {
        margin: 20,
        borderRadius: 20,
        padding: 20,
    },
    bmiContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bmiTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    bmiSubtitle: {
        color: '#FFF',
        opacity: 0.8,
        marginBottom: 16,
    },
    viewMoreButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    viewMoreText: {
        color: '#FFF',
        fontSize: 14,
    },
    bmiCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bmiValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#7C9EFF',
    },
    todayTarget: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    checkButton: {
        backgroundColor: '#7C9EFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    checkButtonText: {
        color: '#FFF',
        fontSize: 14,
    },
    activityStatus: {
        padding: 20,
    },
    heartRateCard: {
        backgroundColor: '#f8f9fe',
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
    },
    heartRateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    heartRateTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeBadge: {
        backgroundColor: '#E4A5FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timeText: {
        color: '#FFF',
        fontSize: 12,
    },
    bpmText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#7C9EFF',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 16,
    },
    statsCard: {
        backgroundColor: '#f8f9fe',
        borderRadius: 20,
        padding: 20,
        flex: 1,
        minWidth: '45%',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    statsValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7C9EFF',
        marginBottom: 16,
    },
    waterProgress: {
        gap: 8,
    },
    waterTimeBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    waterTime: {
        fontSize: 12,
        color: '#666',
    },
    waterAmount: {
        fontSize: 12,
        color: '#7C9EFF',
    },
    sleepGraph: {
        width: '100%',
        height: 100,
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        padding: 10,
        marginTop: 5,
    },
    workoutProgress: {
        padding: 20,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    weeklyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    weeklyButtonText: {
        color: '#7C9EFF',
        fontSize: 14,
    },
    latestWorkouts: {
        padding: 20,
    },
    seeMoreText: {
        color: '#7C9EFF',
        fontSize: 14,
    },
    workoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fe',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    workoutImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    workoutSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    navItem: {
        padding: 8,
    },
    navButton: {
        backgroundColor: '#7C9EFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -28,
    },
    navButtonInner: {
        backgroundColor: '#7C9EFF',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default HomeScreen;