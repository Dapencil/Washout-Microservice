const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const { Machine, ids, mType } = require("./data");
const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

let machines = {};
for (let i = 0; i < ids.length; i++) {
  machines[ids[i]] = new Machine(ids[i], mType[getRandomInt(mType.length - 1)]);
}

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("iot", {
    results: machines,
  });
});

// app.get("/:id", (req, res) => {
//   client.get({ id: req.params.id }, (err, data) => {
//     if (!err) {
//       res.json(data);
//     }
//   });
// });

app.post("/open/:id", (req, res) => {
  let id = req.params.id;
  machines[id].open();
  res.redirect("/");
});

app.post("/close/:id", (req, res) => {
  let id = req.params.id;
  machines[id].close();
  res.redirect("/");
});

app.post("/start/:id", (req, res) => {
  let id = req.params.id;
  machines[id].start();
  res.redirect("/");
});

app.post("/forceFinish/:id", (req, res) => {
  let id = req.params.id;
  machines[id].forceFinish();
  res.redirect("/");
});

// app.post("/remove", (req, res) => {
//   client.remove({ id: req.body.menuItem_id }, (err, _) => {
//     if (err) throw err;
//     console.log("Menu Item removed successfully");
//     res.redirect("/");
//   });
// });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
