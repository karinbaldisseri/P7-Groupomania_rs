require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dbSequelize = require('./config/database');

const userRoutes = require('./routes/userroutes');
const postRoutes = require('./routes/postroutes');
const commentRoutes = require('./routes/commentroutes');
const limiter = require('./middlewares/rate-limiter');

const app = express();

// Verify connection status
dbSequelize.authenticate()
  .then(() => {
    console.log("Connection to database successful !")
    dbSequelize.sync({ alter: true })
      .then(console.log('Database synced !'))
      .catch(error => console.log(error))
  })
    .catch (() => { console.log("Error connecting to database sorry!")});


// MIDDLEWARES

// Express.json - Parses incoming JSON requests and puts the parsed data in req.body. (instead of Body-parse)
app.use(express.json());
// and ?? app.use(express.urlencoded({ extended: true}));
// Helmet security - Express.js security with HTTP headers
app.use(helmet());
//or ??
//app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Express-rate-limit - Protects from brute force type attacks 
app.use(limiter);
// Sécurité CORS (Cross-origin resource sharing) -  Prevents from Cors attacks
app.use(cors());
// add specific headers to allow controlled acces between different origins / servers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}); 


// ROUTES
app.use('/api/auth', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


// EXPORTS
module.exports = app;