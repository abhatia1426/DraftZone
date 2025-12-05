const express = require("express");
const cors = require("cors");

const oddsRoutes = require("./routes/odds");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", oddsRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
