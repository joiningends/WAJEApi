const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const path = require("path");

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
const groupRoutes = require("./routes/groups");
const clientRoutes = require("./routes/clients");
const usersRoutes = require("./routes/users");
const waRoutes = require("./routes/wa");
const sectionsRoutes = require("./routes/sections");
const numbersRoutes = require("./routes/number");
const api = process.env.API_URL;
app.use(`${api}/groups`, groupRoutes);
app.use(`${api}/clients`, clientRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/wa`, waRoutes);
app.use(`${api}/sections`, sectionsRoutes);
app.use(`${api}/numbers`, numbersRoutes);

const _dirname = path.dirname("");
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));
app.get("/*", (_, res) => {
  res.sendFile(path.join(buildPath, "index.html")),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    };
});
mongoose.connect(process.env.CONNECTION_STRING,{
  useNewUrlParser:true,
  useUnifiedTopology: true,
  dbName:'whatsapp'
  
  })  .then(() => {
    console.log('Database Connection is ready...');

    
   
  })
  .catch((err) => {
    console.log(err);
  });
  
  //Server
  app.listen(4000, () => {
    console.log("server is running http://localhost:3000");
  });
  