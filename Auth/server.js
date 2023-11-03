require("dotenv").config({ path: "./config.env" });

const DB_NAME = process.env.DB_NAME || "authDB";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "password";
const DB_HOST = process.env.DB_HOST || "localhost";
const USER_TABLE = "User";
const STAFF_TABLE = "Staff";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 0;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const PORT = process.env.PORT || 3003;
const ACCESS_TOKEN_EXPIRE_TIME = process.env.ACCESS_TOKEN_EXPIRE_TIME || "5m";
const REFRESH_TOKEN_EXPIRE_TIME = process.env.REFRESH_TOKEN_EXPIRE_TIME || "1d";

const express = require("express");
const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mariadb = require("mariadb");
const pool = mariadb.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  connectionLimit: 5,
});

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      name: user.username,
      uid: user.uid,
      role: user.role,
      branchId: user.branchId,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE_TIME, algorithm: "HS256" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ uid: user.uid }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE_TIME,
    algorithm: "HS256",
  });
};

const accessTokenValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401);

    const token = req.headers["authorization"].replace("Bearer ", "");

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) throw new Error(error);
      req.user = decoded;
      req.user.token = token;
    });
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

const refreshTokenValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401);
    const token = req.headers["authorization"].replace("Bearer ", "");

    jwt.verify(token, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) throw new Error(err);

      req.user = decoded;
      req.user.token = token;
      delete req.user.exp;
      delete req.user.iat;
    });
    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(403);
  }
};

app.get("/", accessTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT role FROM ${USER_TABLE} WHERE uid = ?`;
  const [results] = await conn.query(queryString, [req.user.uid]);
  console.log("have req");
  res.json(results);
});

app.post("/login", async (req, res) => {
  const { username, password, deviceToken } = req.body;

  try {
    const conn = await pool.getConnection();
    const [results] = await conn.query(
      `SELECT * FROM ${USER_TABLE} WHERE username = ?`,
      [username]
    );

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results;
    // Compare the newly hashed password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (user.role === "user") {
        await conn.query(
          `UPDATE ${USER_TABLE} SET deviceToken = ? WHERE username = ?`,
          [deviceToken, username]
        );
      }
      const userDummy =
        user.role === "staff"
          ? { uid: user.uid, role: user.role, branchId: user.branchId }
          : { uid: user.uid, role: user.role };
      const access_token = generateAccessToken(userDummy);
      const refresh_token = generateRefreshToken(userDummy);

      res.json({
        access_token,
        refresh_token,
        user: userDummy,
      });
    } else {
      // Passwords do not match, deny access
      res.status(400).json({ error: "Invalid password" });
    }
  } catch (err) {
    // Handle errors and log them
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/refreshToken", refreshTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT * FROM ${USER_TABLE} WHERE uid = ? `;
  const [results] = await conn.query(queryString, [req.user.uid]);

  if (results.length === 0) {
    return res.status(400).json({ error: "User not found" });
  }
  const user = results;
  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  return res.json({
    access_token,
    refresh_token,
  });
});

app.post("/user", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const conn = await pool.getConnection();
    const queryString = `INSERT INTO ${USER_TABLE}(uid, username, password, role, deviceToken) VALUES (DEFAULT,?, ?, DEFAULT,DEFAULT)`;
    await conn.query(queryString, [username, hashedPassword]);
    res.status(200).json({ message: "Signup Complete" });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error" });
  }
});

app.get("/deviceToken/:uid", accessTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT deviceToken FROM ${USER_TABLE} WHERE uid = ?`;
  const [results] = await conn.query(queryString, [req.params.uid]);
  res.json(results);
});

app.get("/getUID", accessTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT uid FROM ${USER_TABLE} WHERE uid = ?`;
  const [results] = await conn.query(queryString, [req.user.uid]);
  res.json(results);
});

app.get("/staffs/", accessTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT uid, branchID, fName, lName FROM staff`;
  const results = await conn.query(queryString, []);
  res.json(results);
});

app.get("/users/:uid", accessTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT uid, username FROM ${USER_TABLE} WHERE uid = ?`;
  const [results] = await conn.query(queryString, [req.params.uid]);
  res.json(results);
});

app.get("/staffs/:uid", accessTokenValidate, async (req, res) => {
  const conn = await pool.getConnection();
  const queryString = `SELECT uid, branchID, fName, lName FROM ${STAFF_TABLE} WHERE uid = ?`;
  const [results] = await conn.query(queryString, [req.params.uid]);
  res.json(results);
});

app.post("/staffs/", accessTokenValidate, async (req, res) => {
  const { branchID, username, password, fName, lName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const conn = await pool.getConnection();
    const queryString_addUser = `INSERT INTO ${USER_TABLE}(uid, username, password, role, deviceToken) VALUES (DEFAULT, ?, ?, "staff", NULL)`;
    await conn.query(queryString_addUser, [branchID, username, hashedPassword]);
    const queryString_getUID = `SELECT uid FROM ${USER_TABLE} WHERE username = ?`;
    const [results] = await conn.query(queryString_getUID, [username]);
    const queryString_addStaff = `INSERT INTO ${STAFF_TABLE}(id, uid, branchID, fName, lName) VALUES (DEFAULT, ?, ?, ?, ?)`;
    await conn.query(queryString_addStaff, [
      results.uid,
      branchID,
      fName,
      lName,
    ]);

    res.status(200).json({ message: "Staff Added" });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error" });
  }
});

app.patch("/staffs/:uid", accessTokenValidate, async (req, res) => {
  const { branchID } = req.body;
  try {
    const conn = await pool.getConnection();
    const queryString = `UPDATE ${STAFF_TABLE} SET branchID = ? WHERE uid = ?`;
    await conn.query(queryString, [branchID, req.params.uid]);
    res.status(200).json({ message: "Update branchID successfully" });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error" });
  }
});

app.delete("/staffs/:uid", accessTokenValidate, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const queryString_delStaff = `DELETE FROM ${STAFF_TABLE} WHERE uid = ?`;
    await conn.query(queryString_delStaff, [req.params.uid]);
    const queryString_delUser = `DELETE FROM ${USER_TABLE} WHERE uid = ?`;
    await conn.query(queryString_delUser, [req.params.uid]);
    res.status(200).json({ message: "Staff deleted" });
  } catch (e) {
    console.log(e);
    res.json({ message: "Error" });
  }
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
