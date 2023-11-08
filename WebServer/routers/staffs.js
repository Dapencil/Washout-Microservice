const express = require("express");
const router = express.Router();
const axios = require("axios");
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3003/";

router.get("/", (req, res) => {
  axios
    .get(AUTH_URL + "staffs", {
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

router.get("/:uid", (req, res) => {
  axios
    .get(AUTH_URL + "staffs/" + req.params.uid, {
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

router.post("/", (req, res) => {
  axios
    .post(AUTH_URL + "staffs", req.body, {
      headers: {
        Authorization: req.headers["authorization"],
      },
    })
    .then(function (response) {
      console.log(response);
      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

router.patch("/:uid", (req, res) => {
  axios
    .patch(AUTH_URL + "staffs/" + req.params.uid, req.body, {
      headers: {
        Authorization: req.headers["authorization"],
      },
    })
    .then(function (response) {
      console.log(response);
      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

router.delete("/:uid", (req, res) => {
  axios
    .delete(AUTH_URL + "staffs/" + req.params.uid, {
      headers: {
        Authorization: req.headers["authorization"],
      },
    })
    .then(function (response) {
      console.log(response);
      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

module.exports = router;
