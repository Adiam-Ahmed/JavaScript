import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000


app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'));



app.get("/",(req,res)=>{
  res.render("index.ejs");
});



const getCurrentDate = () => {
  const currentDate = new Date();
  return currentDate.toDateString();
};


app.get('/today', (req, res) => {
  res.render('today.ejs', { getCurrentDate });
});



app.get("/Work",(req,res)=>{
  res.render("work.ejs");
});


app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});

