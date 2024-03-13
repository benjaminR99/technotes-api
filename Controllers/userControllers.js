const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const Note  = require('../Model/Note')
const User =  require('../Model/User');

// @desc get all users
// @route GET /users
// @access private
const getAllEmployees = asyncHandler(
    async(req,res) =>{
        const allusers = await User.find().select('-password').lean();
        if(!allusers.length || allusers.length==0 ){
            return res.status(404).json({message : "No user found"})
        }
        return res.json(allusers)
    }
)

// @desc create new user
// @route POST /users
// @access private
const createNewEmployee = asyncHandler(
    async(req,res) =>{
        const {username, password, roles} = req.body ;
        if(!username || !password || !Array.isArray(roles) || !roles.length){
            return res.status(400).json({message:"all fields are requires"})
        }
        const duplicate = await User.findOne({username}).collation({ locale: 'en', strength: 2 }).lean().exec();
        if(duplicate){
            return res.status(400).json({message:"username already existes"})
        }
        const hashedpwd = await bcrypt.hash(password,10) ;
        const newuser = {
            "username":username,
            "password": hashedpwd,
            "roles":roles
        }
        const result = await User.create(newuser)
        if(result){
            res.status(201).json({message : `New user ${username} created`})
        }else{
            res.status(400).json({message : `invalid user data received`})
        }
    }
)

// @desc update user
// @route PATCH /users
// @access private
const deleteEmployee = asyncHandler(async(req,res) =>{
    const {id} = req.body;
    if(!id){
        return  res.status(400).json({message: "User ID required"})
    }
    
    const note = await Note.findOne({user: id}).lean().exec();
    if(note){
        return res.status(400).json({message: "User has assigned notes"})
    }
    const foundUser = await User.findById(id).exec();
    if(!foundUser){
        return  res.status(400).json({message: "no user found"})
    }

    const result = await foundUser.deleteOne() ;
    console.log(result)
    res.json({message : `${foundUser.username} deleted`}) ;
})

// @desc update user
// @route PATCH /users
// @access private
const updateEmployee = asyncHandler(
    async(req,res) =>{
        const {id,username, password, roles, active} = req.body ;
        if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
            return res.status(400).json({message: "All feilds are required"})
        }
        
        //finding user
        const founduser = await User.findOne({_id:id}).exec();
        if(!founduser){
            return res.status(400).json({"message": "user does not exist"})
        }
        //checking for duplicate username
        const duplicate = await User.findOne({username}).collation({ locale: 'en', strength: 2 }).lean().exec();
        if(duplicate && duplicate?._id.toString() !== id){
            return res.status(409).json({message: "username already exists"})
        }

        //updating founduser
        if(password){
            founduser.password = await bcrypt.hash(password,10);
        }if(roles && Array.isArray(roles)){
            founduser.roles = roles
        }
        
        founduser.active = active;
        if(username){
            founduser.username = username;
        }
    
        const updatedUser = await founduser.save()
        res.json({message:`${updatedUser.username} updated`})
    }
)
module.exports = {getAllEmployees,createNewEmployee,deleteEmployee,updateEmployee}

