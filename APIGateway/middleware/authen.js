const axios = require("axios");

const auth = (role) => {
  return (req, res, next) => {
    axios
      .get("http://localhost:3003/", {
        headers: { Authorization: req.headers["authorization"] },
      })
      .then(function (response) {
        if (response.data.role === role) {
          res.status(200);
          next();
        } else {
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
