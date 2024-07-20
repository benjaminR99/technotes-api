
 
const whitelist = ['https://technotes-9esz.onrender.com', 'http://localhost:3000']
const corsOptions = {
  origin: function (origin, callback) {
    if ((whitelist.indexOf(origin) !== -1) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials:true,
  optionsSuccessStatus:200
}

module.exports = corsOptions
