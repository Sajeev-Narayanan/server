const jwt = require('jsonwebtoken')


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ADMIN_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "acceess token is not vaild ",
      });
    }
    if (user) {
      // req.user = user
      next()
    }
  })
}

exports.authenticateToken = authenticateToken;

