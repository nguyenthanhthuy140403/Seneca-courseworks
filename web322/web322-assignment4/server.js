/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Thanh Thuy Nguyen Student ID: 116045220 Date: Nov 04, 2023
*
*  Published URL: https://easy-blue-caiman-cap.cyclic.app/
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const path = require("path");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.set("view engine", "ejs"); // Set EJS as the view engine

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/home.html"));
  res.render("home");
});

app.get('/about', (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/about.html"));
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  try {
    if (req.query.theme) {
      let sets = await legoData.getSetsByTheme(req.query.theme);
      res.render("sets", { sets: sets, page: "/lego/sets" });
    } else {
      let sets = await legoData.getAllSets();
      res.render("sets", { sets: sets, page: "/lego/sets" });
    }
  } catch (err) {
    res.status(404).render("404", { message: "Unable to find requested sets" });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set: set });
  } catch (err) {
    res.status(404).render("404", { message: "Unable to find requested set" });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." });
});

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`server listening on: ${HTTP_PORT}`);
  });
});
