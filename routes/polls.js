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
    db.query(`INSERT INTO polls (email,title) VALUES($1,$2)RETURNING *`, [requestData.email, requestData.title])
      .then(data => {
        const newPoll = data.rows[0];
        const pollID = newPoll.id;

        // For each option in the form, insert an options row with the data
        requestData.options.forEach(async(option) => {
          await db.query(`INSERT INTO options (poll_id,title,description) VALUES($1,$2,$3)`, [pollID, option.title, option.description]);
        });

        // TODO: send 2 links to the provided email, one for sharing with friends, one for seeing results
        const mgAdress = process.env.MAILGUN_API_KEY_ADDRESS;
        console.log(mgAdress);
        mg.messages
          .create(mgAdress, {
            from: `Verdict App <postmaster@${mgAdress}>`,
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
    optionIDs.forEach(async(optionID, index) => {
      const rank = index + 1;

      // Insert answers and their rank in the db
      await db.query(`INSERT INTO answers (poll_id,option_id,rank) VALUES($1,$2,$3)RETURNING *`, [pollID, optionID, rank]);
    });

    res.send();
  });


  // 1. get number of options from poll id
  // 2. get all answers with poll id
  // 3. for every answer, add score based on rank of answer
  // 4. after adding all answer ranks, we will have final ranks
  // 5. return final array of ranks with options data (title, description)
  router.get("/results/:poll_id", (req, res) => {
    const pollID = req.params.poll_id;
    // TODO: when admin checks results
    console.log(pollID);
    db.query(`SELECT * FROM options WHERE poll_id = $1`, [pollID]).then((data) => {
      const options = data.rows;
      const n = options.length;

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

        });


        // Get all answers where poll_id = pollID;
        // each answer has a option_id, and a rank
        // optionPoints[option_id] += n - rank;
        console.log(optionPoints);
        // res.render('results', optionPoints);
      });





    });
  });








  return router;

};
