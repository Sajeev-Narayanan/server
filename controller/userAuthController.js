const jwt = require('jsonwebtoken')
const { User } = require("../model/userModal")
const bcrypt = require("bcrypt");
const { set } = require('mongoose');

const userToken = async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email })

    let refreshTokens = user.refreshToken;


    const refreshToken = req.body.token

    if (refreshToken == null) return res.sendStatus(401)
    if (!user.refreshToken.includes(refreshToken)) {
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
    console.log(email + "############")
    console.log(req.body.token + "############")
    const user = await User.findOne({ email })
    console.log(user)
    let refreshTokens = user.refreshToken;
    const refreshTokens2 = refreshTokens.filter((token) => token !== req.body.token)

    if (refreshTokens2) {
        jwt.verify(req.body.token, process.env.USER_REFRESH_SECRET, async (err, user) => {
            if (err) {
                res.status(403).json({ message: err });

                console.log(err)
            } else {
                await User.updateOne({ name: user.name }, { $set: { refreshToken: [] } })
                res.status(204).json({ message: "success" })
            }

        })
    }
    // res.status(204).json({message:"success"})
}

const login = async (req, res) => {


    const email = req.body.email;
    const password = req.body.password;
    const data = { email: email }
    const user = await User.findOne({ email, approved: true });


    if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            const accessToken = generateUserAccessToken(data)
            // const refreshToken = await jwt.sign(email, process.env.USER_REFRESH_SECRET, { expiresIn: '1d' })
            const refreshToken = await jwt.sign(data, process.env.USER_REFRESH_SECRET, { expiresIn: '15d' })


            await User.updateOne({ email }, { $push: { refreshToken: refreshToken } }, { upsert: true })

            // refreshTokens.push(refreshToken)
            res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken, user: email, id: user._id })
        } else {
            return res.status(403).json({ message: 'error' })
        }
    } else { return res.status(403).json({ message: 'error' }) }
}

const googleLogin = async (req, res) => {


    const email = req.body.email;
    const data = { email: email }
    const user = await User.findOne({ email, approved: true });

    console.log(user)
    if (user != null) {
        const accessToken = generateUserAccessToken(data)
        // const refreshToken = await jwt.sign(email, process.env.USER_REFRESH_SECRET, { expiresIn: '1d' })
        const refreshToken = await jwt.sign(data, process.env.USER_REFRESH_SECRET, { expiresIn: '15d' })


        await User.updateOne({ email }, { $push: { refreshToken: refreshToken } }, { upsert: true })

        // refreshTokens.push(refreshToken)
        res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken, user: email, id: user._id })

    } else {
        return res.status(403).json({ message: 'error' })
    }
}




const generateUserAccessToken = (user) => {

    return jwt.sign(user, process.env.USER_ACCESS_SECRET, { expiresIn: '5m' })
}





exports.userToken = userToken;
exports.logout = logout;
exports.login = login;
exports.googleLogin = googleLogin;
exports.generateUserAccessToken = generateUserAccessToken;