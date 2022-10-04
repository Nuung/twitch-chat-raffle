const express = require('express');
const mongoose = require('mongoose'); // for mongoDB
const ObjectID = require('mongodb').ObjectID; // for mongoDB's OID
const router = express.Router();
const child_process = require('child_process'); // for process checking and running

// env value
const env = require('dotenv').config(); //add .env file 
const dbConfig = JSON.parse(env.parsed.DB_INFO);

// LOCAL DB connection
mongoose.connect(`mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.role}`, {
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
const TwitchRaffleResult = require("../models/twitch_raffle_result");
const TwitchChatDumps = require("../models/twitch_chat_dumps");

//────────────────────────────────────────────────────────────────────────────────────────────//

// login page
router.get('/', function (req, res, next) {
    res.render('index');
});

// get 실시간 상황 
router.get('/api/live', function (req, res, next) {
    TwitchRaffleResult.findById({ "_id": ObjectID('6084495e957d77dac7e864e9') }, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else return res.status(200).json({ result: result['result_json'] });
    });
});

// get 실시간 상황 Cnt by id!
router.get('/api/live/:id', function (req, res, next) {
    TwitchRaffleResult.findById({ "_id": ObjectID('6084495e957d77dac7e864e9') }, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else {
            const result_json = result['result_json'];
            for (const [key, value] of Object.entries(result_json)) {
                if (key == req.params.id) {
                    return res.status(200).json({ result: value });
                }
            }
        }
    });
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// get raffle result
router.get('/api/raffle', function (req, res, next) {
    const command = `python3 /home/ubuntu/twitch_calculation.py`;
    child_process.exec(command, (err, stdout, stdin) => {
        if (err) res.status(500).json({ result: err });
        else res.status(200).json({ result: stdout });
    });
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// get target ID's chat log
router.get('/api/chat/:id', function (req, res, next) {
    TwitchChatDumps.find({ "username": req.params.id }, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else return res.status(201).json({ result: result });
    });
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// get Configue
router.get('/api/config', function (req, res, next) {
    Config.findById({ "_id": ObjectID('60827e0d957d77dac7e864e8') }, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else res.status(200).json({ result: result });
    });
});

// config setting 
router.put('/api/config', function (req, res, next) {
    Config.updateOne({ "_id": ObjectID('60827e0d957d77dac7e864e8') },
        { "$set": { "nick_name": req.body.nick_name, "oauth_token": req.body.oauth_token, "channel_name": req.body.channel_name, "updated_at": new Date() } },
        function (err, result) {
            console.log(result);
            if (err) {
                console.error(err);
                return res.status(500).json({ result: `Fail: ${err}` });
            }
            else res.status(201).json({ result: `new Config set up success!` });
        }
    );
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// get status 
router.get('/api/onoff', function (req, res, next) {
    mongoose.connection.db.collection("on_off_check", function (err, collection) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else {
            collection.findOne({ "_id": ObjectID('6085c8b8957d77dac7e864ea') }, function (findOne_err, result) {
                if (findOne_err) {
                    console.error(findOne_err);
                    return res.status(500).json({ result: `Fail: ${findOne_err}` });
                }
                else return res.status(200).json({ result: result });
            });
        }
    });
});

// on off status update
router.put('/api/onoff', function (req, res, next) {
    mongoose.connection.db.collection("on_off_check", function (err, collection) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else {
            let changedStatus = false;
            if (req.body.status == "true") changedStatus = true;
            collection.findOneAndUpdate({ "_id": ObjectID('6085c8b8957d77dac7e864ea') },
                { "$set": { status: changedStatus } },
                function (update_err, result) {
                    if (update_err) {
                        console.error(update_err);
                        return res.status(500).json({ result: `Fail: ${update_err}` });
                    }
                    else return res.status(201).json({ result: `ON/OFF Updated Well by ${req.body.status}` });
                }
            );
        }
    });
});

//────────────────────────────────────────────────────────────────────────────────────────────//

// init request
router.delete('/api/init', function (req, res, next) {
    TwitchChatDumps.deleteMany({}, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ result: `Fail: ${err}` });
        }
        else {
            TwitchRaffleResult.updateOne({ "type": "Leaderboard" }, { "$set": { "result_json": "" } }, function (err, result) {
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
