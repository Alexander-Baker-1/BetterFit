
INSERT INTO MuscleGroup (name)
VALUES ('Chest'), ('Back'), ('Legs'), ('Arms'), ('Shoulders'), ('Abs');

INSERT INTO Exercise (name, description, difficulty_level, type, muscle_group_id)
VALUES 
    ('Bench Press', 'Targets the chest', 'Intermediate', 'Push', 1),
    ('Pull-Up', 'Targets the back', 'Advanced', 'Pull', 2),
    ('Squat', 'Targets the legs', 'Intermediate', 'Other', 3),
    ('Bicep Curl', 'Targets the arms', 'Beginner', 'Pull', 4),
    ('Shoulder Press', 'Targets the shoulders', 'Intermediate', 'Push', 5),
    ('Crunches', 'Targets the abs', 'Beginner', 'Other', 6),
    ('Deadlift', 'Targets the lower back and hamstrings', 'Advanced', 'Pull', 2),
    ('Push-Up', 'Works chest, shoulders, and triceps', 'Beginner', 'Push', 1),
    ('Leg Press', 'Targets the quadriceps and glutes', 'Intermediate', 'Push', 3),
    ('Lat Pulldown', 'Targets the latissimus dorsi', 'Intermediate', 'Pull', 2),
    ('Tricep Extension', 'Isolates the triceps', 'Beginner', 'Push', 4),
    ('Lunges', 'Targets quads, hamstrings, and glutes', 'Intermediate', 'Other', 3),
    ('Bicycle Crunch', 'Targets the abs and obliques', 'Beginner', 'Other', 6),
    ('Hammer Curl', 'Targets the brachialis and biceps', 'Beginner', 'Pull', 4),
    ('Chest Fly', 'Targets the chest', 'Intermediate', 'Push', 1),
    ('Seated Row', 'Targets the upper back', 'Intermediate', 'Pull', 2),
    ('Leg Curl', 'Isolates the hamstrings', 'Intermediate', 'Pull', 3),
    ('Plank', 'Targets core stability', 'Beginner', 'Other', 6),
    ('Overhead Tricep Extension', 'Targets triceps', 'Intermediate', 'Push', 4),
    ('Front Squat', 'Focuses on quads', 'Advanced', 'Other', 3),
    ('Incline Bench Press', 'Upper chest emphasis', 'Intermediate', 'Push', 1),
    ('Bent Over Row', 'Targets back and biceps', 'Intermediate', 'Pull', 2),
    ('Calf Raise', 'Isolates the calves', 'Beginner', 'Other', 3),
    ('Russian Twist', 'Works abs and obliques', 'Intermediate', 'Other', 6),
    ('Face Pull', 'Rear deltoid and upper back', 'Intermediate', 'Pull', 5),
    ('Cable Fly', 'Chest isolation', 'Intermediate', 'Push', 1),
    ('T-Bar Row', 'Targets mid-back', 'Advanced', 'Pull', 2),
    ('Goblet Squat', 'Quads and glutes', 'Beginner', 'Other', 3),
    ('Dumbbell Shoulder Press', 'Shoulders and triceps', 'Intermediate', 'Push', 5),
    ('Hanging Leg Raise', 'Targets lower abs', 'Advanced', 'Other', 6);