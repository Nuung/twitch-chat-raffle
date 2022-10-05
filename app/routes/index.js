const express = require('express');
const mongoose = require('mongoose'); // for mongoDB
const ObjectID = require('mongodb').ObjectID; // for mongoDB's OID
const router = express.Router();

// env value
const env = require('dotenv').config(); //add .env file 
const dbConfig = JSON.parse(env.parsed.DB_INFO);
const pageTitle = env.parsed.PAGE_TITLE;

// LOCAL DB connection with AUTH
// mongoose.connect(`mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.role}`, {
//     dbName: `${dbConfig.database}`,
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// })
//     .then(() => console.log('DB Connected!'))
//     .catch(err => {
//         console.log("DB Connection Error: " + err.message);
//     });

// LOCAL DB connection without AUTH
mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}`, {
    dbName: `${dbConfig.database}`,
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(() => console.log('DB Connected!'))
    .catch(err => {
        console.log("DB Connection Error: " + err.message);
    });

// load DB schema
const Config = require("../models/config");
const ChatMsgLog = require("../models/chat_msg_log");
const TwitchRaffleResult = require("../models/twitch_raffle_result");

// login, main page
router.get('/', function (req, res, next) {
    res.render('index', {pageTitle});
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// get Configue
router.get('/api/config', async (req, res, next) => {
    try {
        const targetConfig = await Config.find({});
        return res.status(200).json({ result: targetConfig[0] });
    }
    catch (err) {
        return res.status(500).json({ result: `Fail: ${err}` });
    }
});

// config setting 
router.put('/api/config', async (req, res, next) => {
    try {
        let targetConfig = await Config.find({});
        targetConfig = targetConfig[0]
        targetConfig.nick_name = req.body.nick_name;
        targetConfig.oauth_token = req.body.oauth_token;
        targetConfig.channel_name = req.body.channel_name;
        targetConfig.updated_at = new Date();
        await targetConfig.save();
        return res.status(201).json({ result: `new Config set up success!` });
    }
    catch (err) {
        return res.status(500).json({ result: `Fail: ${err}` });
    }
});

// get status 
router.get('/api/on-off', async (req, res, next) => {
    try {
        const targetConfig = await Config.find({})
        return res.status(200).json({ result: targetConfig[0].status });
    }
    catch (err) {
        return res.status(500).json({ result: `Fail: ${err}` });
    }
});

// on off status update
router.put('/api/on-off', async (req, res, next) => {

    let changedStatus = false;
    if (req.body.status == "true" || req.body.status === true) changedStatus = true;

    try {
        let targetConfig = await Config.find({})
        targetConfig = targetConfig[0]
        targetConfig.status = changedStatus
        await targetConfig.save()
        return res.status(201).json({ result: `ON/OFF Updated Well by ${req.body.status}` });
    }
    catch (err) {
        return res.status(500).json({ result: `Fail: ${err}` });
    }
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// get target ID's chat log
router.get('/api/chat/:id', function (req, res, next) {
    ChatMsgLog.find({ "username": req.params.id }, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else return res.status(200).json({ result: result });
    });
});

// get 실시간 상황 
router.get('/api/chats/live', async (req, res, next) => {
    const targetConfig = await Config.find({});
    const targetChannelName = `#${targetConfig[0]["channel_name"]}`;
    try {
        const msgTotalGroupCount = await ChatMsgLog.aggregate([
            {
                $match: { "channel": targetChannelName }
            },
            {
                $group: {
                    _id: "$username",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { 'count': -1 }
            }
        ]).limit(100);
        return res.status(200).json({ result: msgTotalGroupCount });
    }
    catch (err) {
        return res.status(500).json({ result: `Fail: ${err}` });
    }
});

//────────────────────────────────────────────────────────────────────────────────────────────//

function randomChoice(p) {
    let rnd = p.reduce((a, b) => a + b) * Math.random();
    return p.findIndex(a => (rnd -= a) < 0);
}

function randomChoices(p, count) {
    return Array.from(Array(count), randomChoice.bind(null, p));
}

// let result = randomChoices([0.1, 0, 0.3, 0.6, 0], 3);

// 당첨자 정하기
router.get('/api/prize', async (req, res, next) => {
    try {
        const targetConfig = await Config.find({});
        const targetChannelName = `#${targetConfig[0]["channel_name"]}`;

        const totalCount = await ChatMsgLog.count({ "channel": targetChannelName });
        const msgTotalGroupCount = await ChatMsgLog.aggregate([
            {
                $match: { "channel": targetChannelName }
            },
            {
                $group: {
                    _id: "$username",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { 'count': -1 }
            }
        ]).limit(100);

        const userArr = new Array();
        for (let i = 0; i < msgTotalGroupCount.length; i++) {
            userArr.push((msgTotalGroupCount[i]["count"] / totalCount) * 100);
        }

        // 가중치 랜덤, 누적확률값
        let prizeResult = msgTotalGroupCount[randomChoices(userArr, 1)];
        while (prizeResult["_id"] == targetConfig[0]["nick_name"]) {
            prizeResult = msgTotalGroupCount[randomChoices(userArr, 1)];
        }
        return res.status(200).json({ result: prizeResult });
    }
    catch (err) {
        return res.status(500).json({ result: `Fail: ${err}` });
    }
});


// 당첨자 결과 저장 및 message 초기화 
router.post('/api/prize/init', function (req, res, next) {
    const { comment, username } = req.body;

    ChatMsgLog.deleteMany({}, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else {
            const newTwitchRaffleResult = {
                "type": comment,
                "username": username
            };

            TwitchRaffleResult.create(newTwitchRaffleResult, function (err, result) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ result: `Fail: ${err}` });
                }
                else res.status(201).json({ result: `Initializing success!` });
            });
        }
    });
});

module.exports = router;
