const rateLimit = require("express-rate-limit");
 

// EXPRESS-RATE-LIMIT CONFIGURATION
const limiter = rateLimit({
    max: 100, // max number of requests a user can make within
    windowMS: 60000, // 60 seconds
    message: "You can't make any more requests at the moment. Try again later",
});
 

// EXPORTS
module.exports = limiter;
