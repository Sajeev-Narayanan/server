const jwt = require('jsonwebtoken')
const { User } = require("../model/userModal")
const bcrypt = require("bcrypt");
const { set } = require('mongoose');

const userToken = async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({email})
    
    let refreshTokens = user.refreshToken;

    
    const refreshToken = req.body.token
   
    if (refreshToken == null) return res.sendStatus(401)
    if (!user.refreshToken.includes(refreshToken))
    {
         res.sendStatus(403);
        
        
    }
    jwt.verify(refreshToken, process.env.USER_REFRESH_SECRET, (err, user) => {
        if (err) {
             res.sendStatus(403);
            
            console.log(err)
        }
        
        const accessToken = generateUserAccessToken({ name: user.name })
        
      res.json({ accessToken: accessToken })
    })
}

const logout = async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({email})
    
    let refreshTokens = user.refreshToken;
    const refreshTokens2 = refreshTokens.filter((token) => token !== req.body.token)
   
    if (refreshTokens2[0] == null) {
    jwt.verify(req.body.token, process.env.USER_REFRESH_SECRET, async(err, user) => {
            if (err) {
                res.sendStatus(403);
                
                console.log(err)
            }
       
        
        await User.updateOne({ name: user.name }, { $set:{ refreshToken: [] } })
      
        })
    }
    res.sendStatus(204)
}

const login = async (req, res) => { 
    
    
    const email = req.body.email;
    const password = req.body.password;
    const data = { email: email }
    const user = await User.find({ email });
   
    
    if (user) {
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (validPassword) {
            
            const accessToken = generateUserAccessToken(data)
            // const refreshToken = await jwt.sign(email, process.env.USER_REFRESH_SECRET, { expiresIn: '1d' })
            const refreshToken = await jwt.sign(data, process.env.USER_REFRESH_SECRET, { expiresIn: '1d' })
            
           
            await User.updateOne({ email }, { $push: { refreshToken: refreshToken } }, { upsert: true })
           
            // refreshTokens.push(refreshToken)
            res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken,user: email })
        } else {
            return res.sendStatus(403)
        }
    }else{return res.sendStatus(403)}
}

const generateUserAccessToken = (user) => {
    
    return jwt.sign(user, process.env.USER_ACCESS_SECRET, { expiresIn: '5m' })
}

  



exports.userToken = userToken;
exports.logout = logout;
exports.login = login;
exports.generateUserAccessToken = generateUserAccessToken;