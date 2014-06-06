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
	 	say = new Say('Welcome to iDirect! Please enter the code given to you.'),
	 	choices = new Choices("[DIGITS]"),
        tropo_ret;

		tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
		// use the on method https://www.tropo.com/docs/webapi/on.htm
		tropo.on("continue", null, "http://54.214.176.172/globe/redirect", true);

        tropo_ret = JSON.parse(tropowebapi.TropoJSON(tropo));
        tropo_ret.tropo[0].ask.terminator = '#';
        tropo_ret.tropo[0].ask.mode = 'dtmf';

		res.send(tropo_ret);
};

exports.call_redirect = function(req,res,next) {
    logger.log('info','Redirecting call');

	var tropo = new tropowebapi.TropoWebAPI();
    tropo.say("Hellooo");
	tropo.say("Your zip code is " + req.body['result']['actions']['interpretation']);

	res.send(tropowebapi.TropoJSON(tropo));

};