import express from "express";
import axios from "axios";
import ejs from "ejs";

const app = express();
const port = 3000;
const API_URL = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

// Set EJS as the view engine
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    try {
        const response = await axios.get(API_URL);
        const cocktail = response.data.drinks[0]; // Access the first cocktail in the array

        // Render the HTML template with the cocktail details
        res.render("cocktail.ejs", { cocktail });
    } catch (error) {
        console.error(error.response.data);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});