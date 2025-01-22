# FitFemme Database Schema

## Tables

### users
User profile and authentication information
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | User's email |
| password_hash | text | Hashed password |
| username | text | Username |
| full_name | text | User's full name |
| profile_picture_url | text | URL to profile picture |
| is_active | bool | Account status |
| last_login | timestamp | Last login timestamp |
| created_at | timestamp | Account creation date |
| updated_at | timestamp | Last update timestamp |
| language | varchar | Preferred language |
| age | int4 | User's age |
| weight | float8 | Weight in kg |
| height | float8 | Height in cm |
| goal | text | Fitness goal |
| daily_water_goal_ml | int4 | Daily water intake goal in milliliters |

### user_activities
Daily activity tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| activity_date | date | Date of activity |
| water_intake_ml | int4 | Water intake in milliliters |
| foot_steps | int4 | Steps count |
| calories | int4 | Calories burned |
| sleep_hours | numeric | Hours of sleep |
| heart_rate | int4 | Heart rate measurement |
| exercise_type | text | Type of exercise |
| exercise_duration | int4 | Exercise duration |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |
| period_start | date | Period start date |
| period_end | date | Period end date |
| period_notes | text | Notes about period |

### period_tracking
Menstrual cycle tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| period_start_date | date | Start of period |
| period_end_date | date | End of period |
| cycle_length | int4 | Length of cycle |
| period_length | int4 | Length of period |
| symptoms | text | Symptoms experienced |
| notes | text | Additional notes |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

### user_photos
User uploaded photos
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| photo_url | text | URL to stored photo |
| created_at | timestamp | Upload timestamp |

### user_roles
User role assignments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| role | text | Role name |
| created_at | timestamp | Assignment timestamp |

### notifications
User notifications
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| type | varchar | Notification type (workout, water, period, andree-workout, system) |
| message | text | Notification message |
| read | bool | Read status |
| image_url | text | Optional image URL for notification |
| sender_name | varchar | Optional sender name (e.g., 'Andree') |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### workouts
Workout definitions
| Column | Type | Description |
|--------|------|-------------|
| id | int4 | Primary key |
| name | varchar | Workout name |
| type | varchar | Workout type |
| duration | int4 | Duration in minutes |
| difficulty | varchar | Difficulty level |
| description | text | Workout description |
| exercise_count | int4 | Number of exercises |
| calories_burned | int4 | Estimated calories |
| schedule_time | timestamp | Scheduled time |
| icon | text | Icon identifier |

### exercises
Exercise definitions
| Column | Type | Description |
|--------|------|-------------|
| id | int4 | Primary key |
| workout_id | int4 | Foreign key to workouts |
| set_number | int4 | Set number |
| name | varchar | Exercise name |
| duration | varchar | Duration/time |
| reps | varchar | Number of repetitions |
| image_url | text | Exercise image |
| video_url | text | Exercise video |

### assigned_workouts
Workouts assigned to users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| workout_id | int4 | Foreign key to workouts |
| assigned_date | date | Date workout is assigned |
| scheduled_time | time | Time workout is scheduled for |
| completed | bool | Whether workout is completed |
| notification_sent | bool | Whether notification has been sent |
| notification_retry_count | int2 | Number of notification send attempts |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

### workout_history
User workout completion history
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| workout_id | int4 | Foreign key to workouts |
| start_time | timestamp | Start time |
| end_time | timestamp | End time |
| status | text | Completion status |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

### equipment
Exercise equipment
| Column | Type | Description |
|--------|------|-------------|
| id | int4 | Primary key |
| name | varchar | Equipment name |
| image_url | text | Equipment image |

### workout_equipment
Equipment needed for workouts
| Column | Type | Description |
|--------|------|-------------|
| workout_id | int4 | Foreign key to workouts |
| equipment_id | int4 | Foreign key to equipment |

## Relationships
- users.id -> user_activities.user_id
- users.id -> period_tracking.user_id
- users.id -> user_photos.user_id
- users.id -> user_roles.user_id
- workouts.id -> exercises.workout_id
- workouts.id -> assigned_workouts.workout_id
- workouts.id -> workout_history.workout_id
- workouts.id -> workout_equipment.workout_id
- equipment.id -> workout_equipment.equipment_id
- users.id -> assigned_workouts.user_id
- users.id -> workout_history.user_id
- users.id -> notifications.user_id

## Notes
- All timestamps are in UTC
- UUIDs are used for all primary keys
- Foreign keys maintain referential integrity
- Soft deletes are not implemented (no deleted_at columns)
