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

//check which countries have been visited, and then use the output back into the app.get.
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// GET home page
//the value from checkVisisted() from there to display inside our index.js, passing it from countries
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

//INSERT new country
app.post("/add", async (req, res) => {
  //Basically we get the hold of the value form our index.ejs action="/add" method="post" named country  
  const input = req.body["country"];
  

  try {
    //make a query to our database to look for a country code from our table of countries, remember use placeholder $1 then [input]
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name )LIKE '%' || $1 || '%' ",
      [input.toLowerCase()]
    );
    //Now the result is gonna give us alot of value , we need result.rows to know the code n make sure they exist 
    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
        // the value is going to be a dollar one replaced by the country code from this line of code here.
        );
        //finally we go ahead and do a redirect.Go back to the home page,
        res.redirect("/");
    } catch (error) {
      //below we catching the err and rendering the page with the error 
      console.log(error);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });   
    }
  } catch (error) {
    //this error is if country doesn't exist.
    console.log(error);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
