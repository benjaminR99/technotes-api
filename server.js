require('dotenv').config()
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORD || 3500 ;
const cookieParser = require('cookie-parser');
const {logger,logEvents} = require('./middleware/logger');
const handleError = require('./middleware/errorHandler')
const cors = require('cors');
const corsOptions = require('./config/allowOrigins')
const mongoose  = require('mongoose');
const connectDB = require('./config/dbConn')


connectDB();
app.use(logger);
app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.use(cookieParser())
app.use('/',require('./Routers/root'));
app.use('/auth', require('./Routers/authRoutes'));
app.use('/users',require('./Routers/user'))
app.use('/notes',require('./Routers/notes'))


app.all('*',(req,res)=>{
    if(req.accepts('html')){
        res.status(404).sendFile(path.join(__dirname,'..','views','404.html'))
    }else if(req.accepts('json')){
        res.status(404).json({"error":"page not found"})
    }else{
        res.type('txt').status(404).send("the requested page is not found")
    }
})

app.use(handleError)

mongoose.connection.once('open',()=>{
    console.log("connected to mongoDB")
    app.listen(PORT, ()=>{
        console.log("listening to PORT ", PORT)
    })
})

mongoose.connection.on('error',(err)=>{
    const msh = `${err.name} ${err.code} ${err.message} ${err.hostname}\n`
    logEvents(msh,'mongoError.log');
    console.log(err);
})
