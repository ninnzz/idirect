var config = require(__dirname + '/../config/config'),
    logger = require(__dirname + '/../lib/logger'),
    util = require(__dirname + '/../helpers/util'),
    db = require(__dirname + '/../lib/mongodb'),
    curl = require(__dirname + '/../lib/curl'),
    globe = require(__dirname + '/../helpers/globe/globeapi')(),
    globe_app_secret = 'fce9dc687589bfbffc0882206f4384df73e3a9619e0da6d848c8135eba3a6ee1',
    globe_app_id = 'qbk4ACBrMMeCp5irapTMnGC8kkqdCKdX',
    globe_voice_id = '271',
    globe_voice_token = '6e6c5175564462684e5659497679764558434a737259655142537273764b756f6d446e6474446c4959615064',
    globe_short_code = 21581138,
    tropowebapi = require('tropo-webapi');


exports.get_all = function (req, res, next) {
    db.get().collection('police', function (err, collection) {
        collection.find().toArray(function (err, docs) {
            if (err) return next(err);

            if (docs.length > 0)
                return res.send(200, docs);
            else 
                res.send(400, {message : 'No results.'});
        });
    });
};

exports.get_messages = function (req, res, next) {
    db.get().collection('messages', function (err, collection) {
        collection.find().toArray(function (err, docs) {
            if (err) return next(err);

            if (docs.length > 0)
                return res.send(200, docs);
            else 
                res.send(400, {message : 'No results.'});
        });
    });
};