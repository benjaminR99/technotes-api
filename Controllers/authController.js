const asyncHandler = require('express-async-handler')
const User = require('../Model/User') ;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const login = asyncHandler( async(req, res)=>{
    
    const {username, password} = req.body ;
    if(!username || !password){
        return res.status(400).json({message : "All feilds are required"})
    }
    const foundUser = await User.findOne({username}).exec() ;
    if(!foundUser || !foundUser.active){
        return res.status(401).json({message : "User does not exist"})
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if(!match){
        return res.status(401).json({message : "incorrect password"})
    }
    
    const accessToken = jwt.sign({
        "userinfo" :{
            "username" : foundUser.username,
            "roles" : foundUser.roles
        }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : '15m'}

    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt',refreshToken,{
        
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    res.json({accessToken})
})

const refresh = (req, res) => {
    
    const cookies = req.cookies
    
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            
            const foundUser = await User.findOne({ username: decoded.username }).exec()
           
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign({
                "userinfo" :{
                    "username" : foundUser.username,
                    "roles" : foundUser.roles
                }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '30s'}
        
            )

            res.json({ accessToken })
        })
    )
}

const logout = asyncHandler((req, res)=>{
    /*console.log(req.cookies)
    const cookies = req.cookies
    if (!cookies?.jwt) {
        console.log(req.cookies)
        return res.status(204).json({message : "no content no"})//No content
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })*/
    res.json({ message: 'Cookie cleared' })
    
})

module.exports = {login, logout, refresh} ;