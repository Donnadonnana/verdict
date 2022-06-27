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
  res.render("index");
});

app.get("/success/:pollID", (req, res) => {
  const pollID = req.params.pollID;


  const templateVars = {
    pollID
  };

  res.render("success", templateVars);
});


// The page the user re-orders and submits
app.get("/answer/:pollID", (req, res) => {

  res.render("answers");
});

app.get('/getoptions/:pollID', (req, res) => {
  const pollID = req.params.pollID;
  console.log(pollID);
  db.query('SELECT * FROM options WHERE poll_id = $1', [pollID]).then((data) => {

    const options = data.rows;
    res.send(options);
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
  console.log(`this is poll_id `);
  console.log(pollID);
  db.query(`SELECT * FROM options WHERE poll_id = $1`, [pollID]).then((data) => {
    const options = data.rows;
    const a = [];
    options.forEach((option) => {
      const optionObject = {};

      const title = option.title;
      const description = option.description;
      optionObject.title = title;
      optionObject.description = description;

      a.push(optionObject);
    });
    console.log('here is the option titles and descriptions');
    console.log(a);

    const n = options.length;

    console.log('here is the options');

    console.log(options);

    const optionPoints = {};


    options.forEach((option) => {
      optionPoints[option.id] = 0;

    });


    db.query(`SELECT * FROM answers WHERE poll_id = $1`, [pollID]).then((data) => {

      const allAnswers = data.rows;
      allAnswers.forEach((answer) => {
        const optionID = answer.option_id;
        const rank = answer.rank;

        const points = n - rank;
        optionPoints[optionID] += points;
        console.log(optionID);
      });
      const optionsIDs = Object.keys(optionPoints);
      console.log(a);
      console.log('here is the option ids');
      console.log(optionsIDs);

      // Get all answers where poll_id = pollID;
      // each answer has a option_id, and a rank
      // optionPoints[option_id] += n - rank;
      // res.send(optionPoints);
      res.render('results', {a});
    });
  });
});




app.get('/submit', (req, res) => {
  res.render('confirm');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

