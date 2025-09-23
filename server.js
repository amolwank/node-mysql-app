const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// DB config from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpassword",
  database: process.env.DB_NAME || "testdb"
};

let db;

// Function to connect with retry
function connectWithRetry() {
  db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      console.error("❌ Database connection failed:", err.message);
      console.log("⏳ Retrying in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("✅ Connected to MySQL database!");
    }
  });
}

connectWithRetry();

// Simple route
app.get("/", (req, res) => {
  if (!db || db.state === "disconnected") {
    return res.status(500).json({ error: "Database not connected yet" });
  }

  db.query("SELECT NOW() AS now", (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Query failed" });
    }
    res.json({ message: "Hello from Node(v1) + MySQL!", time: results[0].now });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
