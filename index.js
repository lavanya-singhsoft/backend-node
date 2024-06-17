require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { routers } = require("./routes");

const port = process.env.PORT || 3700;

app.use(cors());
app.use(express.json());

app.use("/api/v1", routers);

app.use((err, req, res, next) => {
  res.status(err.code || 500).send(err.message || "internal server error");
});

app.listen(port, () => console.log(`app listening on ${port}`));
