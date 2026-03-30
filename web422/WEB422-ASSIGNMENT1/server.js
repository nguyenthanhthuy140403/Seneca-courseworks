/********************************************************************************
*  WEB422 – Assignment 1
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: __Thanh Thuy Nguyen____________________ Student ID: __116045220____________ Date: ___Feb 02,2024___________
*
*  Published URL: __https://handkerchief-grasshopper.cyclic.app/_________________________________________________________
*
********************************************************************************/
const express = require("express");
const cors = require("cors");
const ListingDB = require("./modules/listingsDB.js");
require('dotenv').config();
const { MONGODB_CONN_STRING } = process.env;

const db = new ListingDB();

const app = express();
app.use(cors());
app.use(express.json());
const HTTP_PORT = process.env.PORT || 3000; 

db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});

// Home route
app.get("/", (req, res) => {
    res.json({message: "API Listening"})
});

app.get("/api/listings", (req, res) => {
    if((!req.query.page || !req.query.perPage)) res.status(500).json({message: "Missing query parameters"})
    else {
        db.getAllListings(req.query.page, req.query.perPage, req.query.borough)
        .then((data) => {
            if(data.length === 0) res.status(204).json({message: "No data returned"});
            else res.status(201).json(data);
        })
        .catch((err) => { res.status(500).json({error: err}) })
    }
});


app.get("/api/listings/:_id", (req, res) => {
    db.getListingById(req.params._id)
    .then((data) => { res.status(201).json(data) })
    .catch((err) => { res.status(500).json({error: err}) })
});

app.post("/api/listings", (req, res) => {
    if(Object.keys(req.body).length === 0) res.status(500).json({error: "Invalid body"})
    else {
        db.addNewListing(req.body)
        .then((data) => { res.status(201).json(data) })
        .catch((err) => { res.status(500).json({error: err}) })
    }
});

app.put("/api/listings/:_id", (req, res) => {
    if(Object.keys(req.body).length === 0) res.status(500).json({error: "Invalid body"})
    else {
        db.updateListingById(req.body, req.params._id)
        .then(() => { res.status(201).json({message: `Successfuly updated listings ${req.params._id}`}) })
        .catch((err) => { res.status(500).json({error: err}) }) 
    }
});

app.delete("/api/listings/:_id", (req, res) => {
    db.deleteListingById(req.params._id)
    .then(() => { res.status(201).json({message: `Successfuly deleted listing ${req.params._id}`}) })
    .catch((err) => { res.status(500).json({error: err}) })
});