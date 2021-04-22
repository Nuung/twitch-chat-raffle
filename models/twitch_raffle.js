const mongoose = require('mongoose'); // for mongoDB
const Schema = mongoose.Schema;
 
const twitch_raffle = new Schema({
    user_id: String,
    cnt: Number,
    created_at: {
        type: Date,
        default: Date.now
    }
});

twitch_raffle.set('collection', 'twitch_raffle'); // collection 이름 정하기
module.exports = mongoose.model('twitch_raffle', twitch_raffle);