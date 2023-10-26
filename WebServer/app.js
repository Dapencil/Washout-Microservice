const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const apiRouter = require("./routers/api");

app.use("/api", apiRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
