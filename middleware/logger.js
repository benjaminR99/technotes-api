const {format} =  require('date-fns') ;
const {v4 : uuidv4} = require('uuid');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs');


const logEvents = async(message, filename) =>{
    try{
        const msg = `${uuidv4()}\t${format(new Date(), "yyyy-MM-dd")}`
        if(!fs.existsSync(path.join(__dirname,'..','logs'))){
            await fsPromises.mkdir(path.join(__dirname,'..','logs'));
        }
        await fsPromises.appendFile(path.join(__dirname,'..','logs',`${filename}`),`${msg} ${message}`)
    }catch(err){
        console.log(err)
    }
}

const logger = (req, res, next) =>{
    const message = `${req.method}\t${req.url}\t${req.headers.origin}\n`
    logEvents(message,'reqlog.log');
    next();
}

module.exports = {logger,logEvents} ;