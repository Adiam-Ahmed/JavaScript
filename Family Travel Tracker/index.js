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
db.connect(); // Connect to the database

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the "public" directory

// Function to check visited countries
async function checkVisited() {
  // Query the database to get a list of visited country codes
  const result = await db.query("SELECT country_code FROM visited_countries");

  // Extract country codes from the result and return them in an array
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// GET home page
app.get("/", async (req, res) => {
  // Retrieve the list of visited countries
  const countries = await checkVisited();

  // Render the "index.ejs" template with the list of visited countries
  res.render("index.ejs", { countries: countries, total: countries.length });
});

// INSERT new country
app.post("/add", async (req, res) => {
  // Extract the input country from the request body
  const input = req.body["country"];

  try {
    // Query the database to check if the country name exists
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    // Extract the country code from the result
    const data = result.rows[0];
    const countryCode = data.country_code;

    try {
      // Insert the country code into the visited_countries table
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
        countryCode,
      ]);

      // Redirect to the home page after successful insertion
      res.redirect("/");
    } catch (err) {
      console.log(err);

      // Handle the case where the country has already been added
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);

    // Handle the case where the country name does not exist
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
