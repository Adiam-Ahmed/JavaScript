import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "Webdev@123",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

db.query("SELECT * FROM items", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    items = res.rows;
  }
});

// Define a function to fetch updated items
const fetchUpdatedItems = async () => {
  try {
    const { rows: updatedItems } = await db.query("SELECT * FROM items");
    return updatedItems;
  } catch (error) {
    console.error("Error fetching updated items", error.stack);
    throw error; // Re-throw the error to be handled by the calling code
  }
};

app.get("/", (req, res) => {
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const newItem = req.body.newItem; 
  try {
    // Insert the new item into the database
    await db.query("INSERT INTO items (title) VALUES ($1)", [newItem]);
   // Fetch the updated list of items using the function
   const updatedItems = await fetchUpdatedItems();
    // Redirect to the home page with the updated list
   res.render("index.ejs", {
      listTitle: "Today",
      listItems: updatedItems,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/edit", async(req, res) => {
  const editItem = req.body.updatedItemId
  const newItem = req.body.updatedItemTitle
  try {
    // edit item into the database
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [newItem, editItem]);
   // Fetch the updated list of items using the function
   const updatedItems = await fetchUpdatedItems();
    // Redirect to the home page with the updated list
   res.render("index.ejs", {
      listTitle: "Today",
      listItems: updatedItems,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Internal Server Error");
  } 
});


app.post("/delete", async(req, res) => {
  const deleteItem = req.body.deleteItemId
  try {
    // edit item into the database
    await db.query("DELETE FROM items WHERE id = $1", [deleteItem]);
   // Fetch the updated list of items using the function
   const updatedItems = await fetchUpdatedItems();
    // Redirect to the home page with the updated list
   res.render("index.ejs", {
      listTitle: "Today",
      listItems: updatedItems,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Internal Server Error");
  } 




});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
