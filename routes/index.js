const express = require('express');
const mongoose = require('mongoose'); // for mongoDB
const router = express.Router();

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
const TwitchRaffle = require("../models/twitch_raffle");

// 넘어온 값이 빈값인지 체크합니다. -> !value 하면 생기는 논리적 오류를 제거하기 위해
// 명시적으로 value == 사용 / [], {} 도 빈값으로 처리
const isAllEmpty = function (value) {
  if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
    return true
  } else {
    return false
  }
};

//────────────────────────────────────────────────────────────────────────────────────────────//

/* MongoDB collection function setting */

// find collection 
function find(name, query, cb) {
  mongoose.connection.db.collection(name, function (err, collection) {
    collection.find(query).toArray(cb);
  });
}

// deleteData collection 
function deleteData(name, query) {
  mongoose.connection.db.collection(name, function (err, collection) {
    collection.deleteOne(query);
  });
}

//────────────────────────────────────────────────────────────────────────────────────────────//

// login page
router.get('/', function (req, res, next) {
  res.render('index');
});

module.exports = router;
