module.exports = function(app, passport, db) {
  const ObjectID = require('mongodb').ObjectID;
  // video chatroom
  app.get('/videoChat/:room', (req, res) => {
    console.log('videochat', req.params.room)
    res.render('videoRoom.ejs', {
      roomId: req.params.room
    })
  })


  // assessment Page gets rendered

  // middlewate
  app.get('/assessment', isLoggedIn, servicesNeeded, function(req, res) {
    res.render('assessment.ejs', {
      user: req.user,
      // userProfile: req.userProfile,
      areServicesNeeded: Boolean(req.found)
    })
  })
  // query for userprofile languages to show up on assessment page


  // assessment Page gets rendered
  app.get('/right-sidebar', isLoggedIn, servicesNeeded, function(req, res) {
    res.render('right-sidebar.ejs', {
      user: req.user,
      // userProfile: req.userProfile
      areServicesNeeded: Boolean(req.found)
    })
  })

  app.get('/left-sidebar', isLoggedIn, servicesNeeded, function(req, res) {
    res.render('left-sidebar.ejs', {
      user: req.user,
      // userProfile: req.userProfile
      areServicesNeeded: Boolean(req.found)
    })
  })

  app.get('/premium', isLoggedIn, servicesNeeded, function(req, res) {
    res.render('premium.ejs', {
      user: req.user,
      userProfile: req.userProfile,
      areServicesNeeded: Boolean(req.found)
    })
  })

  app.get('/checkout', isLoggedIn,  function(req, res) {
    res.render('checkout.ejs', {
      user: req.user,
      userProfile: req.userProfile,
    })
  })

  app.get('/sessionEnded', isLoggedIn, function(req, res) {
    res.render('sessionEnded.ejs', {
      user: req.user,
      userProfile: req.userProfile,

    })
  })

  //
    app.get('/success', isLoggedIn, function(req, res) {
      res.render('success.ejs', {
        user: req.user,
        userProfile: req.userProfile,
      })
    })


  app.get('/deleteLang/:language', isLoggedIn, function(req, res) {
    console.log('about to delete language', req.params.language, 'for',
  req.user._id)
    db.collection('userProfile').updateOne({

        userId: req.user._id

      }, {
        $pull: {
          'languages': {
            language: req.params.language
          }
        }
      },{
        upsert:false
      },
      (err, result) => {
        if (err) {
          console.log("deleteLang", err)
          res.redirect('/profile')
        } else {
          console.log('about to delete request', req.user.local.email, req.params.language)
          db.collection('requests').deleteMany({
              fromUser: req.user.local.email,
              language: req.params.language
            },
            (err, result) => {
              if (err) {
                console.log("deleteLang", err)
                res.redirect('/profile')
              } else {
                res.redirect('/profile')
              }

            }
          )
        }
      });
  })




  // next is a value and a function that tells it when its done
  // middleware created
  function servicesNeeded(req, res, next) {
    db.collection('userProfile').findOne({
      email: req.user.local.email
    }, (err, userProfile) => {
      if (err) return console.log(err)
      let languages = userProfile.languages.filter(element => element.teachOrLearn ==
        "teach").map(element => element.language)
      // console.log('languages I teach', languages)
      if (!languages) {
        languages = []
      }
      // inside find() we need a filter to find a teacher
      // get an array of all the languages user teaches
      // use that array with mongo DB $in to find the requests
      //of students who want to lean that langauge
      // finds students
      // pick first one and match wit that student
      db.collection('requests').find({
        status: "waiting",

        language: {
          $in: languages
        },
        fromUser: {
          $ne: userProfile.email
        }
      }).toArray((err, requests) => {
        // console.log('chat requests', requests)
        let found = null
        if (!requests) {
          requests = []
        }
        // pick one of the requests
        // needs to be random later on
        if (requests.length != 0) {
          found = requests[0]
        }

        req.userProfile = userProfile
        req.requests = requests
        req.found = found
        // console.log('we found a teacher', found)
        next()
      })
    });
  }


  // normal routes ===============================================================

  // show the home page (will also have our login links)


  // PROFILE SECTION =========================
  //     Create (POST) - Make match between users
  // url to access this information localhost:1000/pair/Spanish
  // create
  app.post('/profile', isLoggedIn, function(req, res) {
    if (req.files) {
      console.log('uploading pic', req.files)
      var file = req.files.file
      var fileName = decodeURIComponent(file.name)
      console.log('name of file', fileName)

      file.mv('public/uploads/' + fileName, function(err) {
        if (err) {
          res.send(err)

        } else {
          db.collection('userProfile').findOneAndUpdate({
            email: req.user.local.email
          }, {
            $set: {
              img: "/uploads/" + fileName

            }
          }, (err, result) => {
            if (err) {
              console.log("upload picture", err)
              res.send(err)
            } else {
              res.redirect('/profile')
            }
          });
        }
      })


    }
  })
  // who speaks desired langugage gets chosen /read
  // get is reading
  app.get('/pair/:language', /*isLoggedIn,*/ function(req, res) {
    // console.log('language', req.params.language)
    db.collection('userProfile').find({
      languages: {
        $elemMatch: {
          language: req.params.language,
          teachOrLearn: "teach"
        }
      }
    }).toArray((err, result) => {
      // console.log('paired choices', result)
      const randomPair = Math.floor(Math.random() * result.length)
      if (err) return console.log(err)
      res.send(result[randomPair])
    })
  });
  // end session path
  app.get('/endVideoChat/:roomId', isLoggedIn, function(req, res) {
    // delete request
    db.collection('requests').findOneAndUpdate({
        // app.get needs to have the same data type as findone and Update filter
        _id: ObjectID(req.params.roomId),
        // if this doesnt work, convert string to object ID
      }, {
        $set: {
          status: "complete"
        }
      },
      (err, result) => {
        if (err) {
          console.log("end video chat", err)
          res.send(err)
        } else {
          res.redirect('/sessionEnded')
        }
      })
  })

  // THIS PUTS LANGUAGE ON USER PROFILE
  app.post('/addLanguage', isLoggedIn, function(req, res) {
    // console.log('addLanguage', req.body)
    const fluency = parseInt(req.body.country) + parseInt(req.body.teach) + parseInt(req.body.help)
    const languageObject = {
      language: req.body.language,
      teachOrLearn: req.body.teachOrLearn,
      fluency: fluency

    }
    db.collection('userProfile').findOneAndUpdate(
      //filter
      {
        email: req.user.local.email
      },
      //update
      {
        $pull: {
          "languages": {
            language: req.body.language
          }
        }
      }, (err, result) => {
        db.collection('userProfile').findOneAndUpdate(
          //filter
          {
            email: req.user.local.email
          },
          //update
          {
            $push: {
              "languages": languageObject
            }
          }, (err, result) => {

            if (err) {
              console.log("addLanguage", err)
              res.redirect('/profile')
            } else {
              res.redirect('/profile')
            }
          })

      })

  });

  // displaying people in need of specific services (ends by rendering the profile)
  //express knows to run servicesNeeded middleware -
  app.get('/profile', isLoggedIn, servicesNeeded, function(req, res) {
    console.log(req.user)
    db.collection('userProfile').find({
        email: req.user.local.email
      }

    ).toArray((err, profile) => {
      db.collection('requests').find({
        fromUser: req.user.local.email
      }).toArray((error, myRequests) => {
        res.render('profile.ejs', {
          user: req.user,
          userProfile: req.userProfile,
          userProfiles: profile,
          requests: req.requests,
          found: req.found,
          myRequests: myRequests,
          // if req.found is a value services will be true, if null, false
          areServicesNeeded: Boolean(req.found)
        })
      })
    })
  })






  app.get('/', function(req, res) {
    res.render('index.ejs', {

    })

  });



  // then figure out combining matching of two people (student and teacher ) and putting them in the same room
  // web rtc implementation
  // we need requests accepted by a teacher to lead to video Page

  // reading paired match
  // add event listeners so that when button is clicked, teacher is redirected to video chat room
  // student recieves an alert " A teacher is waiting for you. Go to your profile to accept"
  // on student profile page - they click and meet teacher in chat room

  app.get('/pair/:language', /*isLoggedIn,*/ function(req, res) {
    // console.log('language', req.params.language)
    db.collection('userProfile').find({
      languages: {
        $elemMatch: {
          language: req.params.language,
          teachOrLearn: "teach"
        }
      }
    }).toArray((err, result) => {
      // console.log('paired choices', result)
      const randomPair = Math.floor(Math.random() * result.length)
      if (err) return console.log(err)
      res.send(result[randomPair])
    })
  });




  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });


  app.delete('/profile', (req, res) => {
    db.collection('userProfile').findOneAndDelete({
      language: req.body.language
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =================================== PAIRING PPL TO VIDEO CHAT



  //needs to create video request in request collection on mongodb
  // needs to redirect user to a res.redirect to the video page

  app.get('/pair', isLoggedIn, servicesNeeded, function(req, res) {
    const profileObject = {
      language: req.query.language,
      learning: req.query.learning
    }
    // people who made requests will wait until someone is available
    console.log("profile object", profileObject)
    db.collection('requests').insertOne({
      fromUser: req.user.local.email,
      time: new Date,
      language: req.query.learning,
      status: "waiting",
      toUser: null
    }, (error, pairing) => {
      console.log('HELOOOOOOO', pairing)
      if (error) {
        res.redirect('request failed, try again')
      } else {
        res.redirect('/profile')
      }
      // if () ? //insert button here//  : "could not find a match"
    })
  });



  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    // successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), function signupCallback(req, res, err) {
    console.log("signup callback, user:", req.user, err);
    db.collection('userProfile').save({
      email: req.body.email,
      userId: req.user._id,
      languages: []
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database userProfile')
      res.redirect('/profile')
    })
  });


  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
