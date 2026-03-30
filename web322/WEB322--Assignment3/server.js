/********************************************************************************** 
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Thanh Thuy Nguyen, Student ID: 116045220, Date: Oct 13, 2023
*
* Online (Cyclic) URL: https://aware-crow-waders.cyclic.app/
*********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/lego/sets', async (req, res) => {
    const theme = req.query.theme;
    try {
        if (theme) {
            const sets = await legoData.getSetsByTheme(theme);
            res.send(sets);
        } else {
            const sets = await legoData.getAllSets();
            res.send(sets);
        }
    } catch (err) {
        res.status(404).send(err);
    }
});

app.get('/lego/sets/:setNum', async (req, res) => {
    const setNum = req.params.setNum;
    try {
        const set = await legoData.getSetByNum(setNum);
        if (set) {
            res.send(set);
        } else {
            res.status(404).send({ error: 'Lego set not found' });
        }
    } catch (err) {
        res.status(404).send(err);
    }
});

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on: ${HTTP_PORT}`);
    });
});
