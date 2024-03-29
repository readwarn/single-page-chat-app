const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const socket = require("socket.io");
const app = express();
const message = require("./routes/message");
const user = require("./routes/user");
const request = require("./routes/request");
const chat = require("./routes/chat");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.connection.on("connected", function () {
  console.log("connected");
});

app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Origin",
    "https://ecstatic-hugle-48075c.netlify.app"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin, Authorization, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

app.use("/user", user);
app.use("/request", request);
app.use("/chat", chat);
app.use("/message", message);
app.get("/", (req, res) => {
  res.json({
    name: "Im avaialable for tech jobs. Email: akinyusuf5@gmail.com",
  });
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

const io = socket(server, {
  cors: {
    origin: "https://ecstatic-hugle-48075c.netlify.app",
    methods: ["GET", "PUT", "POST"],
  },
});
io.on("connection", (socket) => {
  socket.on("register", (id) => {
    socket.join(id);
  });
  socket.on("registerChats", (chats) => {
    chats.forEach((chat) => {
      socket.join(chat._id);
    });
  });
  socket.on("registerChat", (chat) => {
    socket.join(chat._id);
  });
  socket.on("messageSent", (chat) => {
    socket.to(chat._id).emit("messageReceived", chat);
  });
  socket.on("requestSent", (data) => {
    socket.to(data.id1).to(data.id2._id).emit("requestReceived", data.request);
  });
  socket.on("updateChat", (data) => {
    socket.to(data.id1).to(data.id2).emit("newChat", data.chat);
  });
});
