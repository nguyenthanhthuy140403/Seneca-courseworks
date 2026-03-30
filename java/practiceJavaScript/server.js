/*********************************************************************************
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Max Ratajczak Student ID: 100153204 Date: January 19, 2022
* Heroku Link: https://max-web422-assignment1.herokuapp.com/ 
*
********************************************************************************/ 

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const RestaurantDB = require("./modules/restaurantDB.js");

require('dotenv').config();
const { MONGO_CONNECT_STRING } = process.env;

const db = new RestaurantDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 8080; 

db.initialize(MONGO_CONNECT_STRING)
.then(() => {
    app.listen(PORT, function() {
        console.log(`Server listening on port ${PORT}`);
    })
})
.catch((err) => { console.log(err) })

// Home route
app.get("/", (req, res) => {
    res.json({message: "API Listening"})
});

// Getting restaurant by page, PerPage & borough query
app.get("/api/restaurants", (req, res) => {
    if((!req.query.page || !req.query.perPage)) res.status(500).json({message: "Missing query parameters"})
    else {
        db.getAllRestaurants(req.query.page, req.query.perPage, req.query.borough)
        .then((data) => {
            if(data.length === 0) res.status(204).json({message: "No data returned"});
            else res.status(201).json(data);
        })
        .catch((err) => { res.status(500).json({error: err}) })
    }
});

// Getting restaurant by ID
app.get("/api/restaurants/:_id", (req, res) => {
    db.getRestaurantById(req.params._id)
    .then((data) => { res.status(201).json(data) })
    .catch((err) => { res.status(500).json({error: err}) })
});

// Adding a new restaurant from req.body
app.post("/api/restaurants", (req, res) => {
    if(Object.keys(req.body).length === 0) res.status(500).json({error: "Invalid body"})
    else {
        db.addNewRestaurant(req.body)
        .then((data) => { res.status(201).json(data) })
        .catch((err) => { res.status(500).json({error: err}) })
    }
});

// Updating restaurant with req.body and the ID
app.put("/api/restaurants/:_id", (req, res) => {
    if(Object.keys(req.body).length === 0) res.status(500).json({error: "Invalid body"})
    else {
        db.updateRestaurantById(req.body, req.params._id)
        .then(() => { res.status(201).json({message: `Successfuly updated restaurant ${req.params._id}`}) })
        .catch((err) => { res.status(500).json({error: err}) }) 
    }
});

// Deleting restaurant by ID
app.delete("/api/restaurants/:_id", (req, res) => {
    db.deleteRestaurantById(req.params._id)
    .then(() => { res.status(201).json({message: `Successfuly deleted restaurant ${req.params._id}`}) })
    .catch((err) => { res.status(500).json({error: err}) })
});