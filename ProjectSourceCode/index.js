// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs'); //  To hash passwords

// -------------------------------------  APP CONFIG   ----------------------------------------------

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/src/views/layouts',
  partialsDir: __dirname + '/src/views/partials',
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/src/views'));
app.use(bodyParser.json());
// set Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  '/static',
  express.static(path.resolve(__dirname, 'src/resources'))
);

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
const dbConfig = {
  host: process.env.HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// db test
db.connect()
  .then(obj => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log('Database connection successful');
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR', error.message || error);
  });

const user = {
  username: undefined,
  first_name: undefined,
  last_name: undefined,
};

// -------------------------------------  ROUTES for register.hbs   ---------------------------------------------- 
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/register', (req, res) => {
  const message = req.session.message || '';
  const error = req.session.error || false;
  req.session.message = '';
  req.session.error = false;
  res.render('pages/register', { message, error });
});

// Register
app.post('/register', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { fullname, username, password } = req.body;
    console.log('Username:', fullname);
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Username:', username);
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    console.log('Existing user:', existingUser);
    if (existingUser) {
      console.log('Username already taken');
      req.session.message = 'Username is already taken, please choose another one.';
      req.session.error = true;
      return  res.render('pages/register', {
        message: `Username is already taken, please choose another one.`,
      });
    }
    console.log('Attempting to insert new user into database');
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (fullname, username, password ) VALUES ($1, $2, $3)', [fullname, username, hash]);
    req.session.message = 'Registration successful! Please log in.';
    req.session.error = false;
    return res.render('pages/login', {
      message: `Account created`,
    });
  } catch (err) {
    console.error('Error inserting into users table:', err);
    req.session.message = 'An error occurred during registration. Please try again.';
    req.session.error = true;
    return res.redirect('/register');
  }
});

// -------------------------------------  ROUTES for login.hbs   ----------------------------------------------

app.get('/', (req, res) => {
  res.redirect('pages/home'); //this will call the /login route in the API
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

// Login submission
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password; // Assuming the password is also sent in the request body
  const query = 'SELECT * FROM users WHERE users.username = $1 LIMIT 1';

  // Array containing the username as a parameter to safely pass to the query
  const values = [username];

  db.one(query, values)
    .then(data => {
      // Verify the password (assuming 'data.password' contains a hashed password)
      if (bcrypt.compareSync(password, data.password)) {
        const user = {
          username: data.username,
          fullname: data.fullname,
        };

        // Store the user object in the session
        req.session.user = user;
        req.session.save();

        // Redirect to the home page after successful login
        res.redirect('/home');
      } else {
        // Password does not match
        res.render('pages/login', {
          message: `Incorrect login information`,
        });
      }
    })
    .catch(err => {
      console.log(err);
      // In case no user is found or another error occurs
      res.render('pages/login', {
        message: `Incorrect login information`,
      });
    });
});

// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

app.use(auth);

// -------------------------------------  ROUTES for home.hbs   ----------------------------------------------

app.get('/home', (req, res) => {
  res.render('pages/home', {
    username: req.session.user.username,
    first_name: req.session.user.fullname,
  });
});

// -------------------------------------  ROUTES for profile.hbs   ----------------------------------------------

app.get('/profile', async (req, res) => {
  // Check if the user object exists in the session and extract the username
  let username;
  if (req.session.user) {
    username = req.session.user.username;
  } else {
    console.error('Username not found in session');
    return res.status(400).send('User is not logged in');
  }

  console.log("Access profile for:", username);

  try {
    // Fetch user's goals
    const user = await db.oneOrNone('SELECT goals FROM Users WHERE username = $1', [username]);
    if (!user) {
      console.error('User not found in the database');
      return res.status(404).send('User not found');
    }

    // Fetch favorite recipes
    const myFavoriteRecipe = await db.any('SELECT name FROM FavoriteRecipe');
    console.log('Fetched recipes:', myFavoriteRecipe);

    // Render the profile page with user data and recipes
    res.render('pages/profile', {
      password: req.session.user.password, // Use the password from the session if needed
      recipes: myFavoriteRecipe,
      goals: user.goals // Pass the goals to the template
    });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).send('Internal server error');
  }
});

app.post('/update-goals', async (req, res) => {
  let username;

  // Check if the user object exists in the session and extract the username
  if (req.session.user) {
    username = req.session.user.username;
  } else {
    console.error('Username not found in session');
    return res.status(400).send('User is not logged in');
  }

  const newGoals = req.body.goals; // Extract goals from the form submission

  try {
    // Update the goals field for the user
    await db.none('UPDATE Users SET goals = $1 WHERE username = $2', [newGoals, username]);
    console.log(`Goals updated for user: ${username}`);

    // Render the profile page after updating
    res.render('pages/profile', {
      message: `Goals updated successfully`,
    });
  } catch (err) {
    console.error('Error updating goals:', err);
    res.status(500).send('Internal server error');
  }
});

app.post('/profile', (req, res) => {
  const user = req.session.user; // Get the user object from the session
  const newPassword = req.body.newPassword;

  if (!user || !newPassword) {
    console.error('User is not logged in or new password is not provided');
    return res.status(400).send('User must be logged in and new password must be provided');
  }

  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Internal server error');
    }

    const updateQuery = 'UPDATE users SET password = $1 WHERE username = $2';

    db.none(updateQuery, [hashedPassword, user.username]) // Use the username from the user object
      .then(() => {
        console.log('Password updated successfully');
        res.render('pages/profile', {
        message: `Password updated successfully`,
      });
      })
      .catch(err => {
        console.error('Error updating password:', err);
        res.status(500).send('Internal server error');
      });
  });
});

app.post('/remove-recipe', async (req, res) => {
  const recipeName = req.body.recipeName; // Extract the recipe name from the form submission

  const query = 'DELETE FROM FavoriteRecipe WHERE name = $1';

  try {
    await db.none(query, [recipeName]); // Execute the delete query
    console.log(`Recipe removed: ${recipeName}`);
    res.render('pages/profile', {
      message: `Recipe removed: ${recipeName}`,
    }); // Render back to the profile page to refresh the list
  } catch (err) {
    console.error('Error removing recipe:', err);
    res.status(500).send('Internal server error');
  }
});

// -------------------------------------  ROUTES for logout.hbs   ----------------------------------------------

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/login');
});

const axios = require('axios');
app.get('/recipes', (req, res) => {
  axios({
    url: `https://api.edamam.com/api/recipes/v2`,
    method: 'GET',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
      type: 'public',
      app_id: "d3d14f62", // Replace with your actual app ID
      app_key: process.env.RECIPE_KEY, // Ensure your API key is in a .env file
      q: 'vegan', // or any search term
    },
  })
    .then(results => {
      res.render('pages/recipes', { recipes: results.data.hits });
    })
    .catch(error => {
      console.error('Error fetching recipes:', error.message);
      res.status(500).send('Error fetching recipes');
    });
});

// -------------------------------------  START THE SERVER   ----------------------------------------------

module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
