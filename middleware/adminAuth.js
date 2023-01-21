const jwt = require('jsonwebtoken')
// const { generateAccessToken } = require('../controller/adminAuthController')


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.ADMIN_ACCESS_SECRET, (err, user) => {
      console.log(err.message)
      if (err.message === "jwt expired") {
        
        req.user = "expired"
        next()
        // const accessToken = generateAccessToken()
        // res.json({ message: err.message });
      } else { res.status(403).json({ message: "something wrong access token" }) }
      if (user) {
        console.log("user"+user)
        req.user = user
        next()
      }
    })
}
  
exports.authenticateToken = authenticateToken;

