const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.post("/create", (req, res) => {
    const requestData = req.body;
    db.query(`INSERT INTO polls (email,title) VALUES($1,$2)RETURNING *`,[requestData.email,requestData.title])
      .then(data => {
        const newPoll = data.rows[0];
        const pollID = newPoll.id;

        requestData.options.forEach(async(option) => {
          await db.query(`INSERT INTO options (poll_id,title,description) VALUES($1,$2,$3)`, [pollID, option.title, option.description]);
        });

        return res.status(200).send({ pollID });
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

