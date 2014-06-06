var user = require(__dirname + '/../controllers/user'),
	sms_interface = require(__dirname + '/../controllers/interface'),
	call_interface = require(__dirname + '/../controllers/call'),
	directory = require(__dirname + '/../controllers/directory'),
	places = require(__dirname + '/../controllers/places'),
	police = require(__dirname + '/../controllers/police');

module.exports = function (router, logger) {

	router.get('/user', user.get);
	router.get('/users', user.search);
	router.post('/login', user.login);
	router.post('/register', user.register);
	router.put('/update', user.update);

	router.post('/globe', sms_interface.globe_callback);
	router.get('/globe', sms_interface.globe_get_callback);
	router.post('/globe/sms_notify', sms_interface.globe_sms_notify);
	router.get('/globe/sms_notify', sms_interface.globe_sms_notify2);
	
	router.post('/globe/accept', call_interface.call_accept);
	router.post('/globe/redirect', call_interface.call_redirect);

	router.get('/directory/search/:term', directory.search_entry);
	router.post('/directory/insert', directory.insert_entry);

	router.get('/places', places.get_all);
	router.get('/places/:category/:place_code', places.search_place);

	router.get('/police', police.get_all);
	router.get('/police/messages', police.get_messages);	

	router.all('*', function (req, res) {
		res.send(404, {message : 'Nothing to do here.'});
	});

	router.use(function (err, req, res, next) {
		logger.log('error', err.message || err);
		return res.send(400, {message : err.message || err});
	});

	return router;
};
