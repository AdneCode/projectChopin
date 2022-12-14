const { Router } = require('express');
const authMiddleware = require('../auth/middleware');
const Recordings = require('../models/').recordings;
const RecordStrings = require('../models/').recordstrings;
const SharedRecordings = require('../models/').sharedrecordings;
const { Op } = require('sequelize');
const { v4 } = require('uuid');

const router = new Router();
router.post('/saveRecording', authMiddleware, async (req, res) => {
    try {
        const { strings, name } = req.body;
        if (strings.length === 0) {
            return res.status(400).send({
                message: 'Record is empty',
            });
        }
        const { id } = req.user;
        if (!strings || !id || !name)
            return res.status(400).send({
                message: 'Inappriopriate action',
            });
        const v4uuid = v4();
        const uuid = v4uuid.split('-')[0];
        const newRecording = await Recordings.create({
            name,
            userId: id,
            createdBy: req.user.name,
            uuid,
            isPublished: false,
        });

        const bulkArray = strings.map((i) => {
            return { recordingId: newRecording.id, string: i };
        });
        await RecordStrings.bulkCreate(bulkArray);
        return res.status(200).send({
            message: 'Succesfully created new record',
        });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ message: 'Something went wrong while saving!' });
    }
});

router.post('/addSharedKey', authMiddleware, async (req, res) => {
    try {
        const { key } = req.body;
        const { id } = req.user;
        if (!key || !id)
            return res.status(400).send({
                message: 'Inappriopriate action',
            });
        const record = await Recordings.findOne({ where: { uuid: key } });
        if (record.userId === id)
            return res.status(403).send({
                message: 'You cant add your own recordings as a share!',
            });
        if (!record)
            return res.status(400).send({
                message: 'No record found with that key!',
            });
        const SharedRecording = await SharedRecordings.findOne({
            where: { [Op.and]: [{ userId: id }, { recordingId: record.id }] },
        });
        if (SharedRecording)
            return res.status(400).send({
                message: 'This recording is already shared with you!',
            });
        if (record.userId === id)
            return res.status(403).send({
                message: 'You cant add your own recordings as a share!',
            });
        await SharedRecordings.create({
            userId: id,
            recordingId: record.id,
        });
        const newSharedRecording = await SharedRecordings.findOne({
            where: { [Op.and]: [{ userId: id }, { recordingId: record.id }] },
            include: [
                {
                    model: Recordings,
                    attributes: ['name', 'isPublished', 'createdBy', 'id'],
                    include: [{ model: RecordStrings }],
                },
            ],
        });
        return res.status(200).send({
            message: 'Key was succesfully added!',
            record: newSharedRecording,
        });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ message: 'Something went wrong while saving!' });
    }
});

router.delete('/deleteRecording', authMiddleware, async (req, res) => {
    try {
        const { recordId } = req.body;
        const { id } = req.user;
        if (!recordId || !id)
            return res.status(400).send({
                message: 'Inappriopriate action',
            });
        const record = await Recordings.findOne({ where: { id: recordId } });
        if (record.userId !== id)
            return res.status(403).send({
                message: `You are not the creator of this recording!`,
            });
        const name = record.name;
        await record.destroy();
        return res.status(200).send({
            message: `Succesfully destroyed ${name}`,
        });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ message: 'Something went wrong while deleting!' });
    }
});

router.patch('/togglePublish', authMiddleware, async (req, res) => {
    try {
        const { recordId } = req.body;
        const { id } = req.user;
        if (!recordId || !id)
            return res.status(400).send({
                message: 'Inappriopriate action',
            });
        const record = await Recordings.findOne({ where: { id: recordId } });
        if (record.userId !== id)
            return res.status(403).send({
                message: `You are not the creator of this recording!`,
            });
        const { name, isPublished } = record;
        await record.update({ isPublished: !isPublished });
        return res.status(200).send({
            message: `Succesfully (un)published ${name}`,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: 'Something went wrong while changing the publish status!',
        });
    }
});

router.get('/getPublishedRecords', async (req, res) => {
    try {
        const records = await Recordings.findAll({
            where: { isPublished: true },
            attributes: ['name', 'isPublished', 'createdBy', 'id'],
            include: [{ model: RecordStrings }],
        });
        return res.status(200).send({
            records,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: 'Something went wrong while retrieving published records!',
        });
    }
});

router.patch('/editName', authMiddleware, async (req, res) => {
    try {
        const { id, name } = req.body;
        const foundRecord = await Recordings.findOne({
            where: { id },
        });
        if (req.user.id !== foundRecord.userId)
            return res.status(403).send({
                message:
                    'You have no access to edit the name of this recording.',
            });
        foundRecord.update({ name });
        return res
            .status(200)
            .send({ message: 'Record was succesfully renamed!' });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'Something went wrong!' });
    }
});

module.exports = router;
