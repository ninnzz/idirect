var config = require(__dirname + '/../config/config'),
    logger = require(__dirname + '/../lib/logger'),
    util = require(__dirname + '/../helpers/util'),
    db = require(__dirname + '/../lib/mongodb'),
    curl = require(__dirname + '/../lib/curl'),
    globe = require(__dirname + '/../helpers/globe/globeapi')(),
    globe_app_secret = '0105b074e69a7d1e9284c09e0e7cebc2b967460476fdce2b69bf46ade2cf5e54',
    globe_app_id = 'XkLXRFjgxGEu67iaL7Txxzu8oLo5Fp4e',
    globe_voice_id = 269,
    globe_voice_token = '764d437854536865594f776b7a486e66736c734c464559495972664f414a484c52526f545674636356596765',
    globe_short_code = 21581131,
    tropowebapi = require('tropo-webapi');

exports.call_accept = function (req, res, next) {
	var tropo = new tropowebapi.TropoWebAPI(),
	 	say = new Say('Welcome to app name! Please enter the code given to you.'),
	 	choices = new Choices("[DIGITS]");


     

		tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
		// use the on method https://www.tropo.com/docs/webapi/on.htm
		tropo.on("continue", null, "/accept", true);

		res.send(tropowebapi.TropoJSON(tropo));
};

exports.call_redirect = function(req,res,next) {

	var tropo = new tropowebapi.TropoWebAPI();
	tropo.say("Your zip code is " + req.body['result']['actions']['interpretation']);

	res.send(tropowebapi.TropoJSON(tropo));

};