/********************************************************************************** 
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Thanh Thuy Nguyen, Student ID: 116045220, Date: Sep 29, 2023
*
* Online (Cyclic) URL: https://grumpy-bass-cape.cyclic.cloud/
*********************************************************************************/

var express = require("express");
var path = require("path");
var dataSrv = require("./data-service.js");

var app = express();
app.use(express.static('public/css')); 
app.use(express.static('img')); 

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/lego/sets", function(req, res) {
    const theme = req.query.theme;
    if (theme) {
        dataSrv.getLegoSetsByTheme(theme)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.status(404).json(err);
            });
    } else {
        dataSrv.getAllLegoSets()
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.status(404).json(err);
            });
    }
});

app.get("/lego/sets/:id", function(req, res) {
    const setId = req.params.id;
    dataSrv.getLegoSetById(setId)
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({ error: "Lego set not found" });
            }
        })
        .catch((err) => {
            res.status(404).json(err);
        });
});

app.use(function(req, res) {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

console.log("Ready for initialize");
dataSrv.initialize()
    .then(() => {
        console.log("initialize.then");
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch(err => {
        console.log(err);
    });
