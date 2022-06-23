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
    console.log(process.env.MAILGUN_API_KEY);
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
          .create('sandbox0c10c0578c284d6881df9499aff9bf18.mailgun.org', {
            from: "Verdict App <postmaster@sandbox0c10c0578c284d6881df9499aff9bf18.mailgun.org>",
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


  // after the FE user clicks, submit poll answers
  // {
  //  pollID: number,
  //  answers: [1,4,2,3] ids of the options
  // }
  router.post("/answers", (req, res) => {
    const pollID = req.body.pollID;
    const optionIDs = req.body.answers;
    optionIDs.forEach(async (optionID, index) => {
      const rank = index + 1;

      // Insert answers and their rank in the db
      await db.query(`INSERT INTO answers (poll_id,option_id,rank) VALUES($1,$2,$3)RETURNING *`, [pollID,optionID,rank]);
    });

    res.send();
  });

  router.get("/results/:poll_id", (req, res) => {
    // TODO: when admin checks results
  });

  return router;
};

