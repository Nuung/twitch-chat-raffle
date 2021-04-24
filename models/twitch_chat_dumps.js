const mongoose = require('mongoose'); // for mongoDB
const Schema = mongoose.Schema;
 
const twitch_chat_dumps = new Schema({
    dt: String,
    channel: String,
    username: String,
    message: String
});

twitch_chat_dumps.set('collection', 'twitch_chat_dumps'); // collection 이름 정하기
module.exports = mongoose.model('twitch_chat_dumps', twitch_chat_dumps);