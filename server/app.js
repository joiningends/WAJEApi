const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require("dotenv/config");

const authMiddleware = require('./middlewares/authMiddleware'); // Import the authentication middleware

const app = express();

// Middleware setup
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));

// Importing routes
const groupRoutes = require("./routes/groups");
const clientRoutes = require("./routes/clients");
const usersRoutes = require("./routes/users");
const waRoutes = require("./routes/wa");
const sectionsRoutes = require("./routes/sections");
const numbersRoutes = require("./routes/number");
const whatsappgroupRoutes = require("./routes/whatsappgroups");
const profileRoutes = require("./routes/profiles");
const campainRoutes = require("./routes/campain");
const storageRoutes = require("./routes/storages");
const eventRoutes = require("./routes/events");
const gstRoutes = require("./routes/gstverifications");
const einvoiceRoutes = require("./routes/einvoices");
const ewaybillRoutes = require("./routes/ewaybills");
const eibuyersetailsRoutes = require("./routes/eibuyerdetail");
const eidispatchdetails = require("./routes/dispatch");
const eishipingdetails = require("./routes/eiship");
const eisellerdetails = require("./routes/eisellerdetail");
const einvoiceuiRoutes = require("./routes/einvoiceui");
const facebookRoutes = require("./routes/facebookusers");
const eventmodelRoutes = require("./routes/eventmodels");
const registercustomerRoutes = require("./routes/registercustomers");
const roleRoutes = require("./routes/roles");
const eyePrescriptionRoutes = require("./routes/eyePrescriptions");
const emailConfigRoutes = require("./routes/emailconfigs");

const api = process.env.API_URL;

// Route setup with protected routes
app.use(`${api}/facebook`, facebookRoutes);
app.use(`${api}/groups`,  groupRoutes); // Protect groups route
app.use(`${api}/clients`,  clientRoutes); // Protect clients route
app.use(`${api}/users`,  usersRoutes); // Protect users route

app.use(`${api}/wa`, waRoutes);
app.use(`${api}/sections`, sectionsRoutes);
app.use(`${api}/numbers`, numbersRoutes);
app.use(`${api}/wgroup`, whatsappgroupRoutes);
app.use(`${api}/profiles`, profileRoutes);
app.use(`${api}/campain`, campainRoutes);
app.use(`${api}/storage`, storageRoutes);
app.use(`${api}/event`, eventRoutes);
app.use(`${api}/gst`, gstRoutes);
app.use(`${api}/einvoice`, einvoiceRoutes);
app.use(`${api}/ewaybill`, ewaybillRoutes);
app.use(`${api}/eibuyer`, eibuyersetailsRoutes);
app.use(`${api}/eidispatch`, eidispatchdetails);
app.use(`${api}/eiship`, eishipingdetails);
app.use(`${api}/eiseller`, eisellerdetails);
app.use(`${api}/einvoiceui`, einvoiceuiRoutes);
app.use(`${api}/eventmodel`, eventmodelRoutes);
app.use(`${api}/register`, registercustomerRoutes);
app.use(`${api}/role`, roleRoutes);
app.use(`${api}/prescription`, eyePrescriptionRoutes);
app.use(`${api}/emailconfig`, emailConfigRoutes);

// Serve React build files
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('/*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'whatsapp'
})
.then(() => {
    console.log('Database Connection is ready...');
})
.catch((err) => {
    console.log(err);
});

// Server setup
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
