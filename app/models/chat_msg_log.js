const mongoose = require('mongoose'); // for mongoDB
const Schema = mongoose.Schema;
 
const chat_msg_log = new Schema({
    channel: String,
    username: String,
    message: String,
    created_at: Date,
}, { versionKey: false });

chat_msg_log.set('collection', 'chat_msg_log'); // collection 이름 정하기
module.exports = mongoose.model('chat_msg_log', chat_msg_log);