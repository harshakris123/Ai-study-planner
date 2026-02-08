# Database Schema for AI Study Planner

## Tables:

### 1. users
- id (UUID, Primary Key)
- email (String, Unique, Not Null)
- password_hash (String, Not Null)
- full_name (String, Not Null)
- created_at (Timestamp)
- updated_at (Timestamp)

### 2. subjects
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id)
- name (String, Not Null)
- difficulty_level (Integer, 1-5)
- total_hours_required (Float)
- hours_completed (Float, Default: 0)
- deadline (Date, Nullable)
- color (String, for UI)
- created_at (Timestamp)
- updated_at (Timestamp)

### 3. prerequisites
- id (UUID, Primary Key)
- subject_id (UUID, Foreign Key -> subjects.id)
- prerequisite_subject_id (UUID, Foreign Key -> subjects.id)
- created_at (Timestamp)

### 4. topics
- id (UUID, Primary Key)
- subject_id (UUID, Foreign Key -> subjects.id)
- name (String, Not Null)
- estimated_hours (Float)
- is_completed (Boolean, Default: false)
- order (Integer)
- created_at (Timestamp)
- updated_at (Timestamp)

### 5. study_sessions
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id)
- subject_id (UUID, Foreign Key -> subjects.id)
- topic_id (UUID, Foreign Key -> topics.id, Nullable)
- scheduled_start (Timestamp)
- scheduled_end (Timestamp)
- actual_start (Timestamp, Nullable)
- actual_end (Timestamp, Nullable)
- status (Enum: 'scheduled', 'completed', 'missed', 'in_progress')
- focus_score (Integer, 1-10, Nullable)
- notes (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)

### 6. user_preferences
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id, Unique)
- study_hours_per_day (Float, Default: 4)
- preferred_study_times (JSON) # e.g., ["morning", "evening"]
- break_duration (Integer, minutes, Default: 15)
- max_continuous_study (Integer, minutes, Default: 90)
- learning_pace (Enum: 'slow', 'medium', 'fast', Default: 'medium')
- created_at (Timestamp)
- updated_at (Timestamp)

### 7. cognitive_load_logs
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key -> users.id)
- date (Date)
- total_load_score (Float)
- subjects_studied (JSON) # Array of subject_ids
- notes (Text, Nullable)
- created_at (Timestamp)