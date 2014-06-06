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

exports.insert_entry = function (req, res, next) {
    var data = util.get_data([
            'directory_code',
            'place_code',
            'category',
            'name',
            'numbers',
            'address',
        ], [], req.body);
    data.numbers = data.numbers.split(",");

    db.get().collection('directory', function (err, collection) {
        collection.insert(data, function(err, result){
                if(err) return next(err);
                
                if(result.length>0){
                    res.send(200, result);
                } else{
                    res.send(500, {message: 'Insertion failed.'});
                }
            });
    });
};

exports.search_entry = function (req, res, next) {
    var data = {},
        term = req.params.term;
    
    db.get().collection('directory', function (err, collection) {
        collection.find({$or: [{category : term}, {place_code: term}]}).toArray(function (err, docs) {
            if (err) return next(err);

            if (docs.length > 0)
                return res.send(200, docs);
            else 
                res.send(400, {message : 'Data not found.'});
        });
    });
};