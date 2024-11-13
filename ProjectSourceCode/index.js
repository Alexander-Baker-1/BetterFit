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

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
const dbConfig = {
  host: 'db',
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
  res.json({status: 'success', message: 'Welcome!'});
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
      return res.redirect('/register');
    }
    console.log('Attempting to insert new user into database');
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (fullname, username, password ) VALUES ($1, $2, $3)', [fullname,username, hash]);
        req.session.message = 'Registration successful! Please log in.';
    req.session.error = false;
    return res.redirect('/login');
  } catch (err) {
    console.error('Error inserting into users table:', err);
    req.session.message = 'An error occurred during registration. Please try again.';
    req.session.error = true;
    return res.redirect('/register');
  }
});

// -------------------------------------  ROUTES for login.hbs   ----------------------------------------------

app.get('/', (req, res) => {
  res.redirect('/login'); //this will call the /login route in the API
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
        res.redirect('pages/home');
      } else {
        // Password does not match
        res.redirect('/login');
      }
    })
    .catch(err => {
      console.log(err);
      // In case no user is found or another error occurs
      res.redirect('/login');
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
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  try {
    res.status(200).json({
      username: req.session.user.username,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// -------------------------------------  ROUTES for home.hbs   ----------------------------------------------

app.get('/', (req, res) => {
  res.render('pages/home', {
    username: req.session.user.username,
    first_name: req.session.user.first_name,
    last_name: req.session.user.last_name,
  });
});

// -------------------------------------  ROUTES for logout.hbs   ----------------------------------------------

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// -------------------------------------  START THE SERVER   ----------------------------------------------

module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
