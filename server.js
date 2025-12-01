require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware for saved jobs
app.use(session({
  secret: 'freelancehub-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize saved jobs in session
app.use((req, res, next) => {
  if (!req.session.savedJobs) {
    req.session.savedJobs = [];
  }
  res.locals.savedJobs = req.session.savedJobs;
  next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const indexRoutes = require('./routes/index');
const jobRoutes = require('./routes/jobs');
const toolRoutes = require('./routes/tools');

app.use('/', indexRoutes);
app.use('/jobs', jobRoutes);
app.use('/tools', toolRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404 }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong!',
    error: err
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FreelanceHub server running on http://localhost:${PORT}`);
});