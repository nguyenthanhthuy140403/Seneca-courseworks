/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Thanh Thuy Nguyen Student ID: 116045220 Date: Nov 18, 2023
*
*  Published URL:  
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Middleware for urlencoded form data

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  let sets = [];

  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }

    res.render("sets", { sets });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

// New GET route for displaying the "addSet" view
app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (error) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

// New POST route for processing the form data and adding a new set
app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

// New GET route for displaying the "editSet" view
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    const set = await legoData.getSetByNum(req.params.num);
    res.render('editSet', { themes, set });
  } catch (error) {
    res.status(404).render('404', { message: error });
  }
});

// New POST route for processing the form data and editing an existing set
app.post('/lego/editSet', async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

// New GET route for deleting an existing set
app.get('/lego/deleteSet/:num', async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

// 404 middleware
app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});
