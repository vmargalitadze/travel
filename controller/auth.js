const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const crypto = require('crypto');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    errorMessage: message,
    name: req.session.user ? req.session.user.name : null,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const name = req.body.name
  User.findOne({email:email})
    .then(user => {
     if(!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login', );
     }
     bcrypt.compare(password, user.password)
     .then( match => {
      if(match) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        })
      }
      req.flash('error', 'Invalid email or password');
      res.redirect('/login', );
     })
     .catch(err => {
      console.log(err);
      res.redirect('/login');
     })
  
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    name: req.session.user ? req.session.user.name : null,
    errorMessage: message
  });
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'Email already exists');
        return res.redirect('/signup');
      }

      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          email: email,
          name: name,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save();
      });
    })
    .then(() => {
      
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'vaqsii23@gmail.com',
        subject: 'Registration Successful',
        html: '<h1>Welcome !</h1>',
      })
      .catch((err) => {
        console.log(err);
       
      });
    })
   
    .catch((err) => {
      console.log(err);
     
    });
};


exports.getReset = (req, res, next) => {
  res.render('reset', {
    path: '/reset',
    pageTitle: 'reset',
    isAuthenticated: false,
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.error(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }

       

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; 
        return user.save();
      })
      .then(result => {
        transporter.sendMail({
          to: req.body.email,
          from: 'vaqsii23@gmail.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="https://nodetravel-b5cddf95dbc5.herokuapp.com/reset/${token}">link</a> to set a new password.</p>
          `
        });
        res.redirect('/');
      })
      .catch(err => {
        console.error(err);
        
      });
  });
};

exports.getNewPassword = (req, res, next) => {

  const token = req.params.token

  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt:Date.now()
    }
  })
  .then(user => {
    res.render('new-password', {
      path: '/new-password',
      pageTitle: 'new-password',
      isAuthenticated: false,
      isAuthenticated: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userId: user._id.toString(),
      passwordToken:token
    });
  })
  .catch(err => console.log(err))

}


exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser;
  User.findOne({
    resetToken:passwordToken,
    resetTokenExpiration: {
      $gt:Date.now()
    },
    _id:userId
  })
  .then(user => {
    resetUser = user
   return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword
    resetUser.resetToken = undefined
    resetUser.resetTokenExpiration = undefined
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => console.log(err))
}