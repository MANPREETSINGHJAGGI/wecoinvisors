const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample API Route
app.get("/", (req, res) => {
  res.send({ message: "Welcome to WeCoinVisors API!" });
});

// Sample AI-powered stock recommendation endpoint
app.get("/api/recommendations", (req, res) => {
  const recommendations = [
    { stock: "AAPL", confidence: 92 },
    { stock: "TSLA", confidence: 89 },
    { stock: "GOOGL", confidence: 87 },
  ];
  res.json(recommendations);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
npm init -y
npm install express cors dotenv
