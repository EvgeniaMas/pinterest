// Show home screen
exports.show = function(req, res) {
	// Render home screen
	res.render('index', {
		title: 'Photo share application'
		
	});
};
