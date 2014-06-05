var config = require(__dirname + '/../config/config'),
    logger = require(__dirname + '/../lib/logger'),
    util = require(__dirname + '/../helpers/util'),
    db = require(__dirname + '/../lib/mongodb'),
    curl = require(__dirname + '/../lib/curl'),
    globe_app_secret = '0105b074e69a7d1e9284c09e0e7cebc2b967460476fdce2b69bf46ade2cf5e54',
    globe_app_id = 'XkLXRFjgxGEu67iaL7Txxzu8oLo5Fp4e',
    globe_voice_id = 269,
    globe_voice_token = '764d437854536865594f776b7a486e66736c734c464559495972664f414a484c52526f545674636356596765',
    globe_short_code = 21581131;
   
exports.globe_callback = function (req, res, next) {
	console.log('g1');
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

	console.log('g2');
	var data = req.query;
	console.log(data);

	if(data.subscriber_number) {
		var inst =  {
			_id : '+63'+data.subscriber_number,
			access_token : data.access_token,
			number : data.subscriber_number
		}
		db.get().collection('mobile_numbers', function (err, collection) {
			if (err) return next(err);
			collection.insert(inst, function (err) {
				if (err) return next(err);
				res.send(200, {message : 'Update successful'});
			});
		});
	}

	var sms = globe.SMS(globe_short_code, data.subscriber_number, data.access_token);
	sms.sendMessage("Maraming salamat sa pag gamit ng YoloApp, para mapabilang sa aming person tracker isend ang <KASALUKUYANG_ADDRESS> / <CELLPHONE NUMBER NG PWEDENG TUMULONG> at isend sa 21583946. Halimbawa: 'Tacloban Airport / 09155928321,09172957273' ", function(rq,rs) {
		console.log(rs.body);
	});

};

exports.globe_sms_notify = function (req, res, next) {
	var data = req.body;
	var updt = false;

	
	console.log('notify');
	var msg_data = data.inboundSMSMessageList.inboundSMSMessage[0];
	var number = msg_data.senderAddress.split(':');
	var n_data;
	db.get().collection('mobile_numbers', function (err, collection) {
		if (err) return next(err);
		collection.find({_id : number[1]}).toArray(function (err,dn) {
			n_data = dn;
			console.log(n_data);
			if (err) return next(err);
			var msg_args = msg_data.message.split('/');
		
			if(msg_args != '' && msg_args.length > 0) {
				var addr = msg_args[0];
				if(msg_args[0].toLowerCase() ===  "lipat_ako") {
					addr = msg_args[1];
					updt = true;
				}


				 curl.request('GET')
			        .to("maps.googleapis.com",443,'/maps/api/geocode/json')
			        .secured()
			        .send({address:addr,sensor:false,key:'AIzaSyDKQ3Yg0wQf1oFcHCbdHNdqAQ3PgBFIFIU'})
			        .then(function(status,data) {
			        	if(updt) {
			        		if(data.results.length === 0) {
				        		var sms = globe.SMS(globe_short_code, n_data[0].number, n_data[0].access_token);
								sms.sendMessage("[ERROR] Maaring magbigay po ng tamang address.", function(rq,rs) {
									
								});
								return;
				        	}
			        		db.get().collection('users', function (err, collection) {
								if (err) return next(err);
								collection.update({_id:'0'+n_data[0].number},{$set:{lat:data.results[0].geometry.location.lat,long:data.results[0].geometry.location.lng}}, function (err) {
									if (err) return next(err);
									var sms = globe.SMS(globe_short_code, n_data[0].number, n_data[0].access_token);
									sms.sendMessage("Tagumpay! Kung gusto mong magpalit ng lokasyon, maaring mag send ng LIPAT_AKO/ <location> at isend sa 21583946. Halimbawa LIPAT_AKO/ Metro Manila ", function(rq,rs) {
										
									});
									res.send(200, {
										username : data._id,
										password : data.password
									});
								});
							});
			        	} else {
				        	if(data.results.length === 0) {
				        		var sms = globe.SMS(globe_short_code, n_data[0].number, n_data[0].access_token);
								sms.sendMessage("[ERROR] Maaring magbigay po ng tamang address.", function(rq,rs) {
									
								});
								return;
				        	}
				        	var lv = [];
	        				if(msg_args.length == 2) {
	        					(msg_args[1].split(',')).forEach(function(val) {
	        						
	        						lv.push({number:val});
	        					});
	        				}

				        	var c_inst = {
				        		_id : '0'+n_data[0].number,
				        		lat :	data.results[0].geometry.location.lat,
				        		long :	data.results[0].geometry.location.lng,
				        		loved_ones : lv
				        	}

				        	console.log(c_inst);
				        	db.get().collection('users', function (err, collection) {
								if (err) return next(err);
								collection.insert(c_inst, function (err) {
									if (err) return next(err);
									var sms = globe.SMS(globe_short_code, n_data[0].number, n_data[0].access_token);
									sms.sendMessage("Tagumpay! Kung gusto mong magpalit ng lokasyon, maaring mag send ng LIPAT_AKO/ <location> at isend sa 21583946. Halimbawa LIPAT_AKO/ Metro Manila ", function(rq,rs) {
										
									});
									res.send(200, {
										username : data._id,
										password : data.password
									});
								});
							});
						}

			        })
			        .onerror(function(err) {

			        });

			}
		});
	});



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
