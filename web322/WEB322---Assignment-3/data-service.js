const fs = require("fs");

var vehicles = [];
var brands = [];

module.exports.initialize = function () {

    var promise = new Promise((resolve, reject) => {
       
        try {

            fs.readFile('./data/vehicles.json', 'utf8', (err, data) => {
                if (err) throw err;

                vehicles = JSON.parse(data);
                console.log("INITIALIZE - load vehicles.");
            })

            fs.readFile('./data/brands.json', 'utf8', (err, data) => {
                if (err) throw err;

                brands = JSON.parse(data);
                console.log("INITIALIZE - load brands.");
            })

        } catch (ex) {
                      console.log("INITIALIZE - FAILURE.");
                      reject("INITIALIZE - FAILURE.");
                     }
        console.log("INITIALIZE - SUCCESS.");
        resolve("INITIALIZE - SUCCESS.");
    })

    return promise;
};

module.exports.getAllVehicles = function () {

    var promise = new Promise((resolve, reject) => {
        
       //vehicles = [];
       if(vehicles.length === 0) {
        var err = "getAllVehicles() does not have any data.";
        reject({message: err});
       }  

    resolve (vehicles);
    })
    return promise;
};

module.exports.get2023Vehicles = function () {

    var vehicles2023 = [];
    var promise = new Promise((resolve, reject) => {
      
       for (var i=0; i < vehicles.length; i++){
           if (vehicles[i].year == 2023) {
           vehicles2023.push(vehicles[i]);
           }
       }

       if(vehicles2023.length === 0) {
        var err = "get2023Vehicles() does not have any data.";
        reject({message: err});
       }  

    resolve (vehicles2023);
    })
    return promise;
};

module.exports.getBrands = function () {

    var promise = new Promise((resolve, reject) => {
        //brands = []; //to test errors
        if(brands.length === 0) {
         var err = "getBrands() does not have any data.";
         reject({message: err});
        }  
 
     resolve (brands);
     })
     return promise;
};