const mongoose = require('mongoose'); // for mongoDB
const Schema = mongoose.Schema;
 
const twitch_raffle_result = new Schema({
    type: String,
    result_json: Object,
    created_at: {
        type: Date,
        default: Date.now
    }
});

twitch_raffle_result.set('collection', 'twitch_raffle_result'); // collection 이름 정하기
module.exports = mongoose.model('twitch_raffle_result', twitch_raffle_result);