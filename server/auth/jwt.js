require('dotenv').config();

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

function toJWT(data) {
    return jwt.sign(data, jwtSecret, { expiresIn: '24h' });
}

function toData(token) {
    return jwt.verify(token, jwtSecret);
}

module.exports = { toJWT, toData };
