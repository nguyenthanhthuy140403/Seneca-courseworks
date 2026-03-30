/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Thanh Thuy Nguyen Student ID: 116045220 Date: Dec 08, 2023
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/

const clientSessions = require('client-sessions');
const authData = require('./modules/auth-service');
const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: 'session',
  secret: 'web_a6_secret', // replace with a secure key
  duration: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  activeDuration: 1000 * 60 * 5 // 5 minutes
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get("/login", (req,res) => {
  res.render("login");
});

app.get("/register", (req,res) => {
  res.render("register");
});

app.post("/register", (req,res) => {
  authData.registerUser(req.body)
  .then(() => res.render("register", {successMessage: "User created" } ))
  .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
      .then(user => {
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory
          };
          res.redirect("/lego/sets");
      })
      .catch(err => {
          res.render("login", { errorMessage: err, userName: req.body.userName });
      });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", (req, res) => {
  res.render("userHistory", {user:req.session.user});
});


// const ensureLogin = (req, res, next) => {
//   if (!req.session || !req.session.userName) {
//       res.redirect('/login'); // Redirect to login if not logged in
//   } else {
//       next(); // Continue to the next middleware
//   }
// };

ensureLogin = (req,res,next) => {
  if (!(req.session.user)) {
      res.redirect("/login");
  }
  else { next(); }
};


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/addSet", ensureLogin, async (req, res) => {
  let themes = await legoData.getAllThemes()
  res.render("addSet", { themes: themes })
});

app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }

});

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {

  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();

    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }

});

app.post("/lego/editSet", async (req, res) => {

  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
})

app.get("/lego/sets", ensureLogin, async (req, res) => {

  let sets = [];

  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }

    res.render("sets", { sets })
  } catch (err) {
    res.status(404).render("404", { message: err });
  }

});

app.get("/lego/sets/:num", ensureLogin, async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set })
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

// legoData.initialize().then(() => {
//   app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
// }).catch(err => {
//   console.log(err)
// });

// authData.initialize().
// then(() => {
//   console.log('MongoDB connected');
// }).catch((err) => {
//   console.error('MongoDB connection error:', err);
// });

legoData.initialize()
.then(authData.initialize())
.then(function(){
  app.listen(HTTP_PORT, function(){
      console.log(`app listening on: ${HTTP_PORT}`);
  });
})
.catch(function(err){
  console.log(`unable to start server: ${err}`);
});

