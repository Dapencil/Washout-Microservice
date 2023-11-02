const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const machineService = require("./stub/machineService");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  machineService.getAll(null, (err, data) => {
    if (err) res.status(500);
    res.render("iot", {
      results: data.machines,
    });
  });
});

app.post("/open/:id", (req, res) => {
  let id = req.params.id;
  console.log("Open", id);
  machineService.open({ id }, (err, data) => {
    if (err) console.log("Error:", err.details);
    res.redirect("/");
  });
});

app.post("/close/:id", (req, res) => {
  let id = req.params.id;
  console.log("Close", id);
  machineService.close({ id }, (err, data) => {
    if (err) console.log("Error:", err.details);
    res.redirect("/");
  });
});

app.post("/start/:id", (req, res) => {
  let id = req.params.id;
  machineService.start({ machineId: id, userId: "IOT" }, (err, data) => {
    if (err) console.log("Error:", err.details);
    // else setMachineTimer(id);
    res.redirect("/");
  });
});

app.post("/forceFinish/:id", (req, res) => {
  let id = req.params.id;
  machineService.forceStop({ id }, (err, data) => {
    if (err) console.log("Error:", err.details);
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
