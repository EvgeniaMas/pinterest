// get gravatar icon from email
var gravatar = require('gravatar');
var passport = require('passport');

var fs = require('fs');
var mime = require('mime');
// get gravatar icon from email
var gravatar = require('gravatar');

var Images = require('../models/images');
// set image file types
var IMAGE_TYPES = ['image/jpeg','image/jpg', 'image/png'];

// Signin GET
exports.signin = function(req, res) {
    // List all Users and sort by Date
    res.render('login', { title: 'Login Page', message: req.flash('loginMessage') });
};
// Signup GET
exports.signup = function(req, res) {
    // List all Users and sort by Date
    res.render('signup', { title: 'Signup Page', message: req.flash('signupMessage') });

};
// Profile GET
exports.profile = function(req, res) {
   
Images.find().sort('-created').populate('user').exec(function(error, images){
            
    res.render('profile', { title: 'Your profile', 
        images:images, user : req.user, 
        avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'identicon'}, true) });
       
    })
    
};

exports.delete = function(req, res) {
   
Images.findByIdAndRemove(req.params.id, function(err){
            if (err) throw err;
            res.redirect('/profile');
        });
    
};

// Image upload
exports.uploadImage = function(req, res) {
    var src;
    var dest;
    var targetPath;
    var targetName;
    var tempPath = req.file.path;
    console.log(req.file);
    //get the mime type of the file
    var type = mime.lookup(req.file.mimetype);
    // get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    // check support file types
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png.');
    }
    // Set new path to images
    targetPath = './public/images/' + req.file.originalname;
    // using read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

    // Show error
    src.on('error', function(err) {
        if (err) {
            return res.status(500).send({
                message: error
            });
        }
    });

    // Save file process
    src.on('end', function() {
        // create a new instance of the Images model with request body
        var image = new Images(req.body);
        // Set the image file name
        image.imageName = req.file.originalname;
        // Set current user (id)
        image.user = req.user;
        // save the data received
        image.save(function(error) {
            if (error) {
                return res.status(400).send({
                    message: error
                });
            }
        });
        // remove from temp folder
        fs.unlink(tempPath, function(err) {
            if (err) {
                return res.status(500).send('Woh, something bad happened here');
            }
            // Redirect to galley's page
            res.redirect('images-gallery');

        });
    });
};


exports.imageByID = function(req, res, next, id) {
    var sortedImage = 
  Image.findById(id).populate('user', 'local.name').exec((err, image) => {
    if (err) return next(err);
    if (!image) return next(new Error('Failed to load image ' + id));
    req.image = image;
    next();
  });
};


exports.update = function(req, res) {
  const image = req.image;
  image.title = req.body.title;
  image.content = req.body.content;

  image.save((err) => {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err)
      });
    } else {
      res.status(200).json(image);
    }
  });
};



// Images authorization middleware
exports.hasAuthorization = function(req, res, next) {
    if (req.isAuthenticated())
    return next();
    res.redirect('/login');
};




// Logout function
exports.logout = function () {
    req.logout();
    res.redirect('/');
};

// check if user is logged in
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};





