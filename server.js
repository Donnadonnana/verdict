// load .env data into process.env
require("dotenv").config();
const bodyParser = require('body-parser');

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const pollRoutes = require("./routes/polls");
// const { Router } = require("express");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/poll", pollRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/success/:pollID", (req, res) => {
  const pollID = req.params.pollID;
  const templateVars = {
    pollID
  };
  db.query('SELECT * FROM polls WHERE id = $1', [pollID]).then((data) => {
    const polls = data.rows;
    if (!polls.length) {
      res.render('error');
    }
    res.render("success", templateVars);

  });

});


// The page the user re-orders and submits
app.get("/answer/:pollID", (req, res) => {
  const pollID = req.params.pollID;

  db.query('SELECT * FROM polls WHERE id = $1', [pollID]).then((data) => {
    const polls = data.rows;
    if (!polls.length) {
      res.render('error');
    }
    res.render("answers");


  });
});

app.get('/getoptions/:pollID', (req, res) => {
  const pollID = req.params.pollID;
  console.log(pollID);

  const dataResult = {};
  db.query('SELECT * FROM options WHERE poll_id = $1', [pollID]).then((data) => {

    const options = data.rows;
    console.log('this is options!!!!',options);
    dataResult['options'] = options;
  }).then((data) => {
    db.query('SELECT title FROM polls WHERE id = $1', [pollID]).then((data) => {

      const title = data.rows[0].title;
      dataResult['title'] = title;
      res.send(dataResult);


    });

  });


});


// 1. get number of options from poll id
// 2. get all answers with poll id
// 3. for every answer, add score based on rank of answer
// 4. after adding all answer ranks, we will have final ranks
// 5. return final array of ranks with options data (title, description)
app.get("/result/:poll_id", (req, res) => {
  const pollID = req.params.poll_id;
  // TODO: when admin checks results

  db.query(`SELECT * FROM options WHERE poll_id = $1`, [pollID]).then((data) => {
    const options = data.rows;
    const result = [];
    if (!options.length) {
      res.render('error');
      return;
    }
    const optionPoints = {};


    options.forEach((option) => {
      optionPoints[option.id] = 0;

    });


    db.query(`SELECT * FROM answers WHERE poll_id = $1`, [pollID]).then((data) => {
      const n = options.length;

      const allAnswers = data.rows;
      if (!allAnswers.length) {
        res.render('empty_result');
      }
      allAnswers.forEach((answer) => {
        const optionID = answer.option_id;
        const rank = answer.rank;

        const points = n - rank;
        optionPoints[optionID] += points;
        console.log(optionID);
      });
      const optionsIDs = Object.keys(optionPoints);



      options.forEach((option) => {
        const optionObject = {};

        const title = option.title;
        const description = option.description;
        optionObject.title = title;
        optionObject.description = description;
        optionObject.id = option.id;
        optionObject.points = optionPoints[option.id];

        result.push(optionObject);

      });

      result.sort(function(a, b) {
        return b.points - a.points;
      });

      res.render('results', {result});
    });

  });
});


app.get('/answer/:pollID', (req, res) => {
  res.render('title');
});

app.get('/submit', (req, res) => {
  res.render('confirm');
});

app.get('/create', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

