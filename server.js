require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();


app.use(express.static(path.join(__dirname, 'public')));



// -------------------------------
// Middleware
// -------------------------------

// Parse JSON + Form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions – stores saved jobs & preferences
app.use(
  session({
    secret: "supersecretkey", // change if pushing online
    resave: false,
    saveUninitialized: true,
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------------------
// GLOBAL TEMPLATE VARIABLES
// Makes savedJobs available to ALL views + partials
// -------------------------------
app.use((req, res, next) => {
  if (!req.session.savedJobs) {
    req.session.savedJobs = [];
  }
  res.locals.savedJobs = req.session.savedJobs;
  next();
});

// -------------------------------
// Routes
// -------------------------------
const indexRoutes = require("./routes/index");
const jobRoutes = require("./routes/jobs");
const toolRoutes = require("./routes/tools");

// Use routes
app.use("/", indexRoutes);
app.use("/jobs", jobRoutes);
app.use("/tools", toolRoutes);

// -------------------------------
// 404 Handler
// -------------------------------
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
  });
});

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
