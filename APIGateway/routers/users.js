const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:uid", (req, res) => {
  axios
    .get("http://localhost:3003/users/" + req.params.uid, {
      headers: { Authorization: req.headers["authorization"] },
    })
    .then(function (response) {
      console.log(response);
      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.json(error);
    });
});

module.exports = router;
