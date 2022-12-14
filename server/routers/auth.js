const bcrypt = require('bcrypt');
const { Router } = require('express');
const { toJWT } = require('../auth/jwt');
const authMiddleware = require('../auth/middleware');
const Users = require('../models/').users;
const Settings = require('../models/').settings;
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const getRandomColor = require('../functions/getRandomColor');
const getRandomImage = require('../functions/getRandomImage');

const router = new Router();

//login
router.post('/login', async (req, res, next) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res
                .status(400)
                .send({ message: 'Please provide both email and password' });
        }

        const user = await Users.findOne({ where: { name } });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).send({
                message: 'User with that email not found or password incorrect',
            });
        }

        delete user.dataValues['password']; // don't send back the password hash
        const token = toJWT({ userId: user.id });
        return res.status(200).send({ token, user: user.dataValues });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'Something went wrong, sorry' });
    }
});

//signup
router.post('/signup', async (req, res) => {
    const { password, name } = req.body;
    if (!password || !name) {
        return res.status(400).send('Please provide a  password and a name');
    }

    try {
        const newUser = await Users.create({
            password: bcrypt.hashSync(password, +SALT_ROUNDS),
            name,
        });
        await Settings.create({
            imageURL: getRandomImage(),
            color: getRandomColor(),
            activePresets: '0!0!0!0!0!0!0!0!0',
            showInstrumentButtons: true,
            showPresetButtons: true,
            displayerOn: true,
            recordsOn: true,
            userId: newUser.id,
        });
        delete newUser.dataValues['password']; // don't send back the password hash

        const token = toJWT({ userId: newUser.id });

        res.status(201).json({ token, user: newUser.dataValues });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send({
                message: 'There is an existing account with this email',
            });
        }
        console.log(error);
        return res.status(400).send({ message: 'Something went wrong, sorry' });
    }
});

router.get('/self', authMiddleware, async (req, res) => {
    delete req.user.dataValues['password'];
    res.status(200).send({ ...req.user.dataValues });
});

module.exports = router;
