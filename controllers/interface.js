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
    globe_short_code = '21581132';
   
exports.globe_callback = function (req, res, next) {
    logger.log('info','Globe get callback');
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
			_id : data.subscriber_number,
			access_token : data.access_token,
			number : data.subscriber_number
		}
		db.get().collection('mobile_numbers', function (err, collection) {
			if (err) return next(err);
			collection.insert(inst, function (err) {
				if (err) return next(err);
				res.send(200, {message : 'Insert successful'});
			});
		});
	}
	if (data.code) {
		res.send(200, {message : 'Update successful'});
	}

	var sms = globe.SMS(globe_short_code, data.subscriber_number, data.access_token);
	sms.sendMessage("Maraming salamat sa pag register sa iyugyog app!", function(rq,rs) {
		console.log(rs.body);
	});

};

exports.globe_sms_notify = function (req, res, next) {
    looger.log('info','SMS notify.');
	var data = req.body,
		msg_data = data.inboundSMSMessageList.inboundSMSMessage[0],
		number = msg_data.senderAddress.split(':'),
		components,
		find_location = function(err, _data) {
			if (err) next(err);
			console.log(_data);
			res.send(200,{message:'nice'});

		};

	try {
		components = JSON.parse(msg_data.message);
		db.get().collection('mobile_numbers', function (err, collection) {
        	collection.find(_id:number[0].substring(3)).toArray(find_location);
		});
	} catch (e) {
		console.log('not json');
	}

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
