const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const bidRoutes = require("./routes/bidRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

app.use("/user", userRoutes);
app.use("/request", requestRoutes);
app.use("/bid", bidRoutes);
app.use("/conversation", conversationRoutes);

exports.api = onRequest({ region: "asia-southeast1" }, app);