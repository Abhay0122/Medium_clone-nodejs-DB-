var express = require('express');
var router = express.Router();

const nodemailer = require("nodemailer");

const fs = require('fs');
const path = require('path');
const upload = require('./multer');

const User = require('../models/userSchema');
const Blog = require('../models/blogSchema');
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(User.createStrategy());


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home-page', });
});

router.get('/signinoptions', function (req, res, next) {
  res.render('signinOptions', { title: 'sigin-page' });
});

router.get('/signupoptions', function (req, res, next) {
  res.render('signupOptions', { title: 'signup-page' });
});

// signin
router.get('/signin', function (req, res, next) {
  res.render('signin', { title: 'signinWithEmail' });
});

router.post('/signin', passport.authenticate('local', {
  successRedirect: "/home",
  failureRedirect: '/',
})
  , function (req, res, next) { }

);

// signup
router.get('/signup', function (req, res, next) {
  res.render('signup', { title: 'signupWithEmail' });
});

router.post('/signup', function (req, res, next) {
  const { username, name, email, password } = req.body;

  const newUser = new User({
    username,
    name,
    email
  });

  User.register(newUser, password)
    .then((userCreated) => {
      // res.json(userCreated);
      const authenticate = User.authenticate();
      authenticate(email, password, function (err, result) {
        if (err) res.send(err);
        res.redirect("/signin");
      });
    })
    .catch((err) => {
      res.send(err);
    });

});

// -------------------------------------------------------------------------------
// logout
router.get("/signout", isLoggedIn, function (req, res, next) {
  req.logout(function () {
    res.redirect("/");
  });
});

// home
router.get('/home', isLoggedIn, function (req, res, next) {

  Blog.find()
    .populate("author")
    .then((blogs) => {
      res.render('home', { title: 'Home', user: req.user, blogs });
    })
    .catch((err) => {
      res.send(err);
    });

});

// profile
router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('profile', { user: req.user, title: 'Profile' });
});

router.get('/about', isLoggedIn, function (req, res, next) {
  res.render('about', { user: req.user, title: 'About' });
});

router.post('/about', isLoggedIn, function (req, res, next) {

  const userAbout = {
    about: req.body.about,
  };

  User.findByIdAndUpdate(req.user._id, userAbout)
    .then(() => {
      res.redirect("/about");
    })
    .catch((err) => res.send(err));

});

// settings
router.get('/settings', isLoggedIn, function (req, res, next) {
  res.render('settings', { user: req.user, title: 'Settings' });
});

// settings-email
router.post('/settings-email', function (req, res, next) {

  User.findByIdAndUpdate(req.user._id, req.body)
    .then(() => {
      res.redirect("/settings");
    })
    .catch((err) => res.send(err));

});

// settings-username
router.post('/settings-username', function (req, res, next) {

  User.findByIdAndUpdate(req.user._id, req.body)
    .then(() => {
      res.redirect("/settings");
    })
    .catch((err) => res.send(err));
});

// settings-profileinfo
router.post('/settings-profileinfo', function (req, res, next) {

  User.findByIdAndUpdate(req.user._id, req.body)
    .then(() => {
      res.redirect("/settings");
    })
    .catch((err) => res.send(err));

});

// settings-avatar
router.post('/settings-avatar', upload.single("avatar"), function (req, res, next) {
  const updatedAvatar = {};

  if (req.file) {
    if (req.body.oldavatar !== "dummy.png") {
      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          req.body.oldavatar
        )
      );
    }
    updatedAvatar.avatar = req.file.filename;
  };

  User.findByIdAndUpdate(req.user._id, updatedAvatar)
    .then(() => {
      res.redirect("/settings");
    })
    .catch((err) => res.send(err));

});

// delete-account
router.get('/delete-account', isLoggedIn, function (req, res, next) {

  User.findByIdAndDelete(req.user._id)
    .then(() => {
      res.redirect('/signout');
    })
    .catch((err) => {
      res.send(err);
    });

});

// reset-password
router.get("/reset-password", isLoggedIn, function (req, res, next) {
  res.render('reset', { title: "Reset-password", user: req.user })
});

router.post('/reset-password', isLoggedIn, function (req, res, next) {

  const { oldPassword, newPassword } = req.body;

  req.user.changePassword(oldPassword, newPassword, function (err, user) {
    if (err) return res.send(err);
    res.redirect('/signout');
  });

});

// Forget-password
router.get("/forget-password", function (req, res, next) {
  res.render('forget', { title: "Forget-password", user: req.user })
});

router.post("/forget-password", function (req, res, next) {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.send(
          "User Not found <a href='/forget-password'>Try Harder!</a>"
        );

      // next page url
      const pageurl =
        req.protocol +
        "://" +
        req.get("host") +
        "/set-password/" +
        user._id;

      // send email to the email with gmail
      const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: "developerabhay934@gmail.com",
          pass: "vooaajgfbfpytzwt",
        },
      });

      const mailOptions = {
        from: "Abhay Pvt. Ltd.<developerabhay934@gmail.com>",
        to: req.body.email,
        subject: "Password Reset Link",
        text: "Do not share this link to anyone.",
        html: `<a href=${pageurl}>Password Reset Link</a>`,
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) return res.send(err);
        console.log(info);
        user.forgetPasswordToken = 1;
        user.save();
        return res.send(
          "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        );
      });
      // ------------------------------
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/set-password/:id", function (req, res, next) {
  res.render('setpassword', { title: "Forget-password", id: req.params.id })
});

router.post("/set-password/:id", function (req, res) {
  User.findById(req.params.id)
    .then((user) => {
      if (user.forgetPasswordToken === 1) {
        user.setPassword(req.body.password, function (err) {
          if (err) return res.send(err);
          user.forgetPasswordToken = 0;
          user.save();
          res.redirect("/signout");
        });
      } else {
        res.send(
          "Link Expired! <a href='/forget-password'>Try Again.</a>"
        );
      }
    })
    .catch((err) => res.send(err));
});

// write
router.get("/write", isLoggedIn, function (req, res, next) {
  res.render('write', { user: req.user, title: "Write" })
});

router.post("/write", isLoggedIn, async function (req, res, next) {

  const newBlog = new Blog({
    author: req.user._id,
    blog: req.body.blog,
  });
  req.user.stories.push(newBlog._id);
  await req.user.save()
  await newBlog.save()
  res.send("/stories");
});

// write
router.get("/stories", isLoggedIn, function (req, res, next) {
  User.findById(req.user._id)
    .populate("stories")
    .then((user) => {
      res.render('stories', { user: req.user, stories: user.stories, title: "user-stories" });
    })
    .catch((err) => {
      res.send(err);
    });
});


// -------------------------------------------------------------------------------
// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}
// ---------------------------------------------------------------------------------
router.post("/uploadFile", upload.single("avatar"), function (req, res, next) {
  res.json({
    success: 1,
    file: {
      url: "http://localhost:3000/uploads/" + req.file.filename,
    },
  });
});

module.exports = router;
