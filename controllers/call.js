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

exports.call_accept = function (req, res, next) {
    logger.log('info','Call accept');

	var tropo = new tropowebapi.TropoWebAPI(),
        caller_id = req.body.session.from.id,
	 	say = new Say('Welcome to ShakeCast! For local police services, press five. For local hospital sevrices, press six. Press # to confirm.'),
	 	choices = new Choices("[DIGITS]"),
        tropo_ret;

		tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
		// use the on method https://www.tropo.com/docs/webapi/on.htm
		tropo.on("continue", null, "http://54.214.176.172/globe/redirect?caller_id="+caller_id, true);

        tropo_ret = JSON.parse(tropowebapi.TropoJSON(tropo));
        tropo_ret.tropo[0].ask.terminator = '#';
        tropo_ret.tropo[0].ask.mode = 'dtmf';

		res.send(tropo_ret);
};

exports.call_redirect = function(req,res,next) {
    logger.log('info','Redirecting call');

	var tropo = new tropowebapi.TropoWebAPI(),
        choice,
        user_info,
        caller_id = req.query.caller_id.substring(3),
        found_location = function(status, _data) {
            console.log(_data);

            if (status !== 200 || !_data.terminalLocationList.terminalLocation.currentLocation)
                return next('Failed to get location');
            location = _data.terminalLocationList.terminalLocation.currentLocation;

            db.get().collection('directories', function (err, collection) {
                collection.find(
                    {   location :
                        {
                            $near: [ location.longitude, location.latitude ]
                        }
                    }).toArray(function (err,results) {
                        if(err) return res.send(500,err);
                        if(results.length > 0) {
                            var say = new Say("http://www.phono.com/audio/holdmusic.mp3");
                            var on = {"event":"ring", "say": say};
                            var prsd;
                            
                            tropo.transfer(['+63'+results[0].data[0].contact_number[0],'sip:21581150@sip.tropo.net'], {playvalue: "http://www.phono.com/audio/holdmusic.mp3", terminator : "*", from: "ShakeCast"});
                            // console.log(tropowebapi.TropoJSON(tropo));
                            prsd =  JSON.parse(tropowebapi.TropoJSON(tropo));
                            prsd.tropo[1].transfer.playvalue = "http://www.phono.com/audio/holdmusic.mp3";
                            prsd.tropo[1].transfer.terminator = "*";
                            prsd.tropo[1].transfer.from = "21581150";
                            console.dir(JSON.stringify(prsd));
                            res.send(prsd);
                        }
                        else {
                            res.send(400,{message:"No results"});
                        }

                    });
            });
        };
    
    tropo.say("Please wait while we connect you to someone.");
    choice = req.body['result']['actions']['interpretation'];


    tropo.transfer(['9268339986','sip:21581150@sip.tropo.net']);
    console.log(tropowebapi.TropoJSON(tropo));
    prsd =  JSON.parse(tropowebapi.TropoJSON(tropo));
    prsd.tropo[1].transfer.playvalue = "http://www.phono.com/audio/holdmusic.mp3";
    prsd.tropo[1].transfer.terminator = "*";
    prsd.tropo[1].transfer.from = "21581150";
    console.log(prsd);
    res.writeHead(200, {'Content-Type': 'application/json'}); 
    res.end(JSON.stringify(prsd));
    return;
    if( choice*1 === 5) {

        db.get().collection('mobile_numbers', function (err, _collection) {
            if (err) return next(err);
            _collection.find({_id: caller_id}).toArray(function (err, usr) {
                if (err) return next(err);
                if (usr.length !== 0) {
                    user_info = usr[0];
                    curl.get
                        .to('devapi.globelabs.com.ph', 80, '/location/v1/queries/location')
                        .send({
                            access_token : user_info.access_token,
                            requestedAccuracy : 100,
                            address : user_info.number
                        })
                        .then(found_location)
                        .then(next);
                }
            });
        });


    } else if( choice*1 === 6) {

    } else {
        tropo.say("Sorry but we cant identify your input.");
    	res.send(tropowebapi.TropoJSON(tropo));
    }

};