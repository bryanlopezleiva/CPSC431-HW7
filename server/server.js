const express = require("express");
const cors = require("cors");
const connectDB = require("./db/conn");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use("/api/lists", require("./routes/lists"));

// Serve the frontend part
const path = require("path");
app.use(express.static(path.join(__dirname, "../client")));

// Set up so can just CTRL click to open it from console
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});