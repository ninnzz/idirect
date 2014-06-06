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
    globe_short_code = 21581131;
   
exports.globe_callback = function (req, res, next) {
    looger.log('info','Globe get callback');
	
	var data = req.body,
		code = data['code'];
	
	console.log(req.query);

	var auth = globe.Auth(globe_app_id, globe_app_secret);
	var login_url = auth.getLoginUrl();

	console.log(data);
	if (!code) {
       	res.send(400, {message : 'Login failed'});
        return;
    }



    res.send(200, {message : 'Login failed'});
    return;
	db.get().collection('users', function (err, collection) {
		if (err) return next(err);
		collection.find({_id : data.number, password : data.password}).toArray(function (err, docs) {
			if (err)
				return next(err);
			if (docs.length > 0)
				return res.send(200, {message : 'Login successful'});
			res.send(400, {message : 'Login failed'});
		});
	});
};

exports.globe_get_callback = function(req,res,next) {

    looger.log('info','Globe get Callback');
	
	var data = req.query;
	console.log(data);

	if (data.subscriber_number) {
		var inst =  {
			_id : '+63'+data.subscriber_number,
			access_token : data.access_token,
			number : data.subscriber_number
		}
		// db.get().collection('mobile_numbers', function (err, collection) {
		// 	if (err) return next(err);
		// 	collection.insert(inst, function (err) {
		// 		if (err) return next(err);
				res.send(200, {message : 'Update successful'});
		// 	});
		// });
	}
	if (data.code) {
		res.send(200, {message : 'Update successful'});
	}

	var sms = globe.SMS(globe_short_code, data.subscriber_number, data.access_token);
	sms.sendMessage("Maraming salamat sa pag gamit ng YoloApp, para mapabilang sa aming person tracker isend ang <KASALUKUYANG_ADDRESS> / <CELLPHONE NUMBER NG PWEDENG TUMULONG> at isend sa 21583946. Halimbawa: 'Tacloban Airport / 09155928321,09172957273' ", function(rq,rs) {
		console.log(rs.body);
	});

};

exports.globe_sms_notify = function (req, res, next) {
    looger.log('info','SMS notify.');
	
	var data = req.body;
	var categories = ['EMERGENCY', 'SERVICES', 'FOODS', 'OTHERS'];
	
	var msg_data = data.inboundSMSMessageList.inboundSMSMessage[0];
	var number = msg_data.senderAddress.split(':');
	var n_data;	
	
	console.log('------------for ESH-----------------');
	console.dir(data);
	console.log(msg_data);
	console.log(number);
	//parse msg_data

	if(msg_data.toLowerCase() === 'places') {
		//do database to retrieve all places
		//console.log(result)
	}
	n_data = msg_data.split(' ');

	//if(n_data[0].toLowercase() === 'details') {
		//search directory code in db
		//if not existing, console.log(error)


	// }

	// if(category place code)
	// query to db
	// console.log(result)


	//	1st step
	//	get the information from the db. kukunin muna ung atleast 1 number from a directory,
	//	nasa msg_data yung biong message info
	//	nasa number ung number nung nagtxt


	//	2nd step, magsend dun sa number from a directory yung message nung user
	//	record this in the db.




	res.send(200);
	return;
};

exports.globe_sms_notify2 = function (req, res, next) {
	var data = req.body;

	
	console.log('notify2');
	console.log(req.query);
	console.log(data);

	res.send(200);
	return;
};


exports.globe_send = function (req, res, next) {
	var data = req.body,
		id = data.number;
	delete data.number;
	db.get().collection('users', function (err, collection) {
		if (err) return next(err);
		collection.update({_id : id}, {$set : data}, function (err) {
			if (err) return next(err);
			res.send(200, {message : 'Update successful'});
		});
	});
};
exports.semaphore_send = function (req, res, next) {
	var data = req.body,
		id = data.number;
	delete data.number;
	db.get().collection('users', function (err, collection) {
		if (err) return next(err);
		collection.update({_id : id}, {$set : data}, function (err) {
			if (err) return next(err);
			res.send(200, {message : 'Update successful'});
		});
	});
};
