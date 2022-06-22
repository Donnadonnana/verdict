const express = require('express');
const router  = express.Router();
const formData = require('form-data');
const Mailgun = require('mailgun.js');

module.exports = (db) => {
  router.post("/create", (req, res) => {
    const requestData = req.body;

    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });

    // Create poll row, with email and title from the form on the front end
    db.query(`INSERT INTO polls (email,title) VALUES($1,$2)RETURNING *`,[requestData.email,requestData.title])
      .then(data => {
        const newPoll = data.rows[0];
        const pollID = newPoll.id;

        // For each option in the form, insert an options row with the data
        requestData.options.forEach(async(option) => {
          await db.query(`INSERT INTO options (poll_id,title,description) VALUES($1,$2,$3)`, [pollID, option.title, option.description]);
        });

        // TODO: send 2 links to the provided email, one for sharing with friends, one for seeing results
        mg.messages
          .create('sandboxde358f6826584f1c8c443475e8a96839.mailgun.org', {
            from: "Verdict App <postmaster@sandboxde358f6826584f1c8c443475e8a96839.mailgun.org>",
            to: [requestData.email],
            subject: "You just made a new poll!",
            text: `${requestData.title} poll created!
            share link : http://localhost:8080/answer/${pollID}
            result link: http://localhost:8080/result/${pollID}`,
          })
          .then(msg => console.log(msg)) // logs response data
          .catch(err => console.log(err)); // logs any error`;



        // Everything works, we send a 200 status back to the front end, with the pollID in the response data
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

