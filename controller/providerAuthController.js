const jwt = require('jsonwebtoken')

const bcrypt = require("bcrypt");
const { set } = require('mongoose');
const { Provider } = require('../model/eventManagerModel');


const managersToken = async (req, res) => {
    const email = req.body.email;
    const provider = await Provider.findOne({ email })

    let refreshTokens = user.refreshToken;


    const refreshToken = req.body.token

    if (refreshToken == null) return res.sendStatus(401)
    if (!provider.refreshToken.includes(refreshToken)) {
        res.sendStatus(403);


    }
    jwt.verify(refreshToken, process.env.PROVIDER_REFRESH_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403);
        }

        const accessToken = generateUserAccessToken({ name: user.name })

        res.json({ accessToken: accessToken })
    })
}

const logout = async (req, res) => {
    const email = req.body.email
    const provider = await Provider.findOne({ email })

    let refreshTokens = provider.refreshToken;
    const refreshTokens2 = refreshTokens.filter((token) => token !== req.body.token)

    if (refreshTokens2) {
        await Provider.updateOne({ _id: provider._id }, { $set: { refreshToken: [] } })
        res.status(204).json({ message: "success" })

    } else {
        res.status(204).json({ message: "success" })
    }
}

const login = async (req, res) => {


    const email = req.body.email;
    const password = req.body.password;
    const data = { email: email }
    try {

        const provider = await Provider.findOne({ email, verified: true, approved: true });

        if (provider) {
            const validPassword = await bcrypt.compare(password, provider.password);
            if (validPassword) {

                const accessToken = generateUserAccessToken(data)

                const refreshToken = await jwt.sign(data, process.env.PROVIDER_REFRESH_SECRET, { expiresIn: '15d' })



                await Provider.updateOne({ email }, { $push: { refreshToken: refreshToken } }, { upsert: true })

                res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken, managers: email, managerId: provider._id })
            } else {
                return res.sendStatus(403)
            }
        } else { return res.sendStatus(403) }
    } catch (error) {
        return res.sendStatus(403)
    }
}



const generateUserAccessToken = (user) => {
    return jwt.sign(user, process.env.PROVIDER_ACCESS_SECRET, { expiresIn: '5m' })
}





exports.managersToken = managersToken;
exports.logout = logout;
exports.login = login;
exports.generateUserAccessToken = generateUserAccessToken;