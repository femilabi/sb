const express = require("express");
const app = express();
const http = require("http").Server(app);
// const io = require("socket.io")(http);
const ejs = require("ejs");
const glob = require("glob");
const path = require("path");
const cors = require("cors");
const { checkAuth } = require("./middlewares/auth");
const ResponseHandler = require("./utils/responseHandler");

// Block frames and others
// app.use(helmet());

// CORS
// app.use(cors());

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc
// app.set('trust proxy', 1);

// Template view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);

// Forbidden endpoints
app.use(/.*\.(ejs|html)$/, function (req, res) {
  res.status("404").json({ msg: "Page not found" });
});

// Incoming data parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialization
app.use(function (req, res, next) {
  req.App = new ResponseHandler(req, res);
  req.App.setToJSON();
  next();
});

// Check and load authentication if exists
app.use(checkAuth);

// Auto require main controllers
glob.sync("./controllers/*.js").forEach(function (file) {
  app.use(`/${path.parse(file)["name"]}`, require(path.resolve(file)));
});

// 404 error handler
app.use((req, res) => {
  req.App.setPage("404").setMsg("Invalid request", "error").send();
});

// Server listening to port
const PORT = process.env.PORT || 9000;
http.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});
