const axios = require("axios");
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3003/";

const auth = (role) => {
  return (req, res, next) => {
    axios
      .get(AUTH_URL, {
        headers: { Authorization: req.headers["authorization"] },
      })
      .then(function (response) {
        if (response.data.role === role) {
          res.status(200);
          next();
        } else {
          console.log(`Require ${role} : Got ${response.data.role}`);
          res.status(403).json({ error: "Forbidden" }).end();
        }
      })
      .catch(function (error) {
        console.log("Error At auth");
        next(error);
      });
  };
};
module.exports = auth;
