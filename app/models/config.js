const mongoose = require('mongoose'); // for mongoDB
const Schema = mongoose.Schema;

const config = new Schema({
    nick_name: String,
    oauth_token: String,
    channel_name: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true
    }
}, { versionKey: false });

config.set('collection', 'config'); // collection 이름 정하기
module.exports = mongoose.model('config', config);