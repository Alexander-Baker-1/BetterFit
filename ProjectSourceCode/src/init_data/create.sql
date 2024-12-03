DROP TABLE IF EXISTS users;
CREATE TABLE users (
  username VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  goals VARCHAR(700)
);

CREATE TABLE MuscleGroup (
    muscle_group_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE Exercise (
    exercise_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20),  -- E.g., beginner, intermediate, advanced
    type VARCHAR(10) CHECK (type IN ('Push', 'Pull', 'Other')),  -- Push or Pull classification
    muscle_group_id INT,
    FOREIGN KEY (muscle_group_id) REFERENCES MuscleGroup(muscle_group_id)
);


CREATE TABLE FavoriteRecipe (
    recipe_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    
);

