import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "firstdatabase",
  password: "Webdev@123",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkId() {
  const result = await db.query("SELECT id FROM users");
  let currentUserId = result.rows; 
  return currentUserId;
};



async function checkUsers() {
  const result = await db.query("SELECT * FROM users");
  const users = result.rows;
  return users;
};

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
};

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const users = await checkUsers();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: "teal",
  });
});


app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});


app.post("/user", async (req, res) => {
  const currentUserId = req.body["user"];
  if (users.find(user => user.id === parseInt(currentUserId))) {
    
    
  } else {
    
  }
  const selectedUser = users.find(user => user.id === parseInt(currentUserId));
  //user with the specified id is found, this line redirects the client to a new URL with a query parameter named "userId" containing the selected user's id.
  res.redirect(`/?userId=${selectedUser.id}`);

});


app.post("/new" , async (req, res) => {
  // Replace with the actual column names
  const name = req.body.name; 
  // Replace with the corresponding values
  const selectedColor = req.body.color; 
  try {
    await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      [name, selectedColor]
    );
    res.render("new.ejs");
    
  } catch (error) {
    console.log(error);
    
  }
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
});



app.post("/add", async (req, res) => {

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


