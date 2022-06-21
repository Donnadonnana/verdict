const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.post("/create", (req, res) => {
    console.log(req.body);
    console.log('Creating poll request!');
    const requestData = req.body;
    db.query(`INSERT INTO polls (email,title) VALUES($1,$2)RETURNING *`,[requestData.email,requestData.title])
      .then(data => {
        const newPoll = data.rows[0];
        const pollID = newPoll.id;

        requestData.options.forEach((option) => {
          console.log(option);

          db.query(`INSERT INTO options (poll_id,title,description) VALUES($1,$2,$3)`, [pollID, option.title, option.description])
            .then(() => {
              res.status(200);
              res.send();
            });
        });

        console.log(newPoll);
      })
      .catch(err => {
        console.log(err);
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/answer", (req, res) => {
    // TODO: when user submits answer
  });

  router.get("/results/:poll_id", (req, res) => {
    // TODO: when admin checks results
  });

  return router;
};

