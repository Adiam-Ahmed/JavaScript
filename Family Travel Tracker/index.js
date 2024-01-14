import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

// Create a PostgreSQL client and connect to the database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});
// Establish a connection to the database
db.connect();

// Middleware to parse URL-encoded bodies and serve static files from the "public" directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize currentUserId and a sample list of users
let currentUserId = 1;
let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

// Function to retrieve visited countries for the current user
async function checkVisited() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1;",
    [currentUserId]
  );

  // Extract country codes from the query result
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  return countries;
}

// Function to get the details of the current user
async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");

  // Update the global users array with the latest data from the database
  users = result.rows;

  // Find and return the current user based on the currentUserId
  return users.find((user) => user.id == currentUserId);
}

// Route for the home page
app.get("/", async (req, res) => {
  // Retrieve visited countries and current user details
  const countries = await checkVisited();
  const currentUser = await getCurrentUser();

  // Render the index.ejs template with relevant data
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});

// Route to handle adding a new visited country
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const currentUser = await getCurrentUser();

  try {
    // Retrieve the country code based on the input
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;

    try {
      // Insert the visited country into the database
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );

      // Redirect to the home page after successful insertion
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

// Route to handle user-related actions
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    // If the request indicates adding a new user, render the "new.ejs" template
    res.render("new.ejs");
  } else {
    // Otherwise, update the currentUserId and redirect to the home page
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

// Route to handle adding a new user
app.post("/new", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;

  // Insert the new user into the database and get the generated ID
  const result = await db.query(
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
    [name, color]
  );

  const id = result.rows[0].id;

  // Update the currentUserId with the newly created user's ID
  currentUserId = id;

  // Redirect to the home page after adding a new user
  res.redirect("/");
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});