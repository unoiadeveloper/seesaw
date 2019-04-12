'use strict';
module.exports = function (users) {
  var http = require("http");
  var request = require('request');
  var loopback = require("loopback");
  var path = require('path');
  var app = require('../../server/server');
  //     users.certifications = function(id, cb) {
  //         users.findById(id, function(err,res){
  //             cb(null,res.certifications);
  //         })

  //       }

  //       users.remoteMethod('certifications', {
  //             accepts: {arg: 'id', type: 'string', required: true},
  //             http: {"verb": "get", "path": "/certifications"},
  //             returns: {arg: 'certifications', type: 'any'},
  //             description: "Get list of user's Certificates"
  //       });
  //       users.remoteMethod('certifications', {
  //         accepts: [
  //             {
  //                 arg: 'data',
  //                 type: "certificate",
  //                 http: { source: 'body' },
  //                 required: true
  //             }],
  //         http: {"verb": "Post", "path": "/certifications"},
  //         returns: {arg: 'certifications', type: 'any'},
  //         description: "Add New Certificate"
  //   });

  //Sending Emails
  users.afterRemote('create', function (context, usersInstance, next) {
    console.log('> users.afterRemote triggered');
    if (!usersInstance.verified.facebook) {
      var options = {
        type: 'email',
        to: usersInstance.email,
        from: 'noreply@seesaw.com',
        subject: 'Thanks for registering.',
        template: path.resolve(__dirname, '../../server/views/verify.ejs'),
        redirect: '/verified',
        users: users
      };
      usersInstance.verify(options, function (err, response, next) {
        if (err) return next(err);

        console.log('> verification email sent:', response);
      });
    } else {
      users.upsertWithWhere({
        id: usersInstance.id
      }, {
        emailVerified: true,
        newUser: true
      }, (err, res) => {
        //console.log(res);
        users.login({
          email: res.email,
          password: 'm!;?*7@h9^NE#:yB'
        }, function (err, token) {
          console.log('logging in user');
          //console.log(context);
          console.log(token);
          if (token) {} else {
            console.log(err);
          }
        });
      });
    }
    next();
  });
  users.afterRemoteError ('create', function (context, next) {
    console.log(`After Error ${context.req.body.name}`);   
   if(context.req.body.verified.facebook && context.req.body.fbId) { 
    users.upsertWithWhere({
      fbId: context.req.body.fbId
    }, {
      newUser: false
    }, (err, res) => {
      if(res){
        console.log(res);
      }      else{
        var error = new Error();
            error.message = `Not allowed`;
            error.statusCode = 403;
            //next()
      }
    })
    // context.error.message = 'User Already Exists';
    // console.log(context.instance)
    // delete context.error.stack;
   }
    next();
  });  

  /*Set Email verified if user login with fb*/
  // users.observe('after save', function (ctx, next) {
  //   console.log('update email'+ctx);
  //   users.upsertWithWhere({id : ctx.instance.id}, {yoyo:'wwww'}, (err,res)=>{
  //     console.log(err);
  //     next(null,res);
  //   });
  // if (ctx.instance.verified.facebook) {
  //console.log('update email');
  //ctx.instance.updateAttribute('emailVerified', 'true')
  //}
  //   users.login({email: ctx.instance.email, password: 'm!;?*7@h9^NE#:yB'}, function (err, token) {
  //     console.log('logging in user');
  //     console.log(`Email : ${ctx.instance.email}`)
  //     console.log(token);
  //     if(token){
  //       ctx.instance.access_token = token.id;
  //     }else{
  //       next(err);
  //     }
  //   });
  //  next();
  // } else {
  //   var options = {
  //     type: 'email',
  //     to: ctx.instance.email,
  //     from: 'noreply@seesaw.com',
  //     subject: 'Thanks for registering.',
  //     template: path.resolve(__dirname, '../../server/views/verify.ejs'),
  //     redirect: '/verified',
  //     users: users
  //   };
  //   ctx.instance.verify(options, function (err, response, next) {
  //     if (err) return next(err);

  //     console.log('> verification email sent:', response);

  //     // context.res.render('response', {
  //     //   title: 'Signed up successfully',
  //     //   content: 'Please check your email and click on the verification link ' -
  //     //       'before logging in.',
  //     //   redirectTo: '/',
  //     //   redirectToLinkText: 'Log in'
  //     // });

  //   });
  //   next()
  // }
  //   next();
  // });
  users.beforeRemote("create", function (context, data, next) {
    if (context.req.body.verified.facebook) {
      if (context.req.body.fbAccessToken) {
        request(`https://graph.facebook.com/me?fields=id,name,picture.width(200).height(200),birthday,email,gender,location&access_token=${context.req.body.fbAccessToken}`, function (error, response, body) {
          let fbDeatils = JSON.parse(body);
          if (!error && response.statusCode == 200) {
            context.req.body.password = 'm!;?*7@h9^NE#:yB';
            context.req.body.fbId = fbDeatils.id;
            context.req.body.created_at = new Date().toISOString();
            //   // context.req.body.name = fbDeatils.name;
            //   // context.req.body.image = fbDeatils.picture.data.url;
            //   context.req.body.email = fbDeatils.email;
            //   if(fbDeatils.location.name){
            //     context.req.body.address = fbDeatils.location.name;
            // }
            console.log(fbDeatils);
            next();
          } else {
            var error = new Error();
            error.message = `${fbDeatils.error.message}`;
            error.statusCode = 400;
            next(error);
          }
        });

      } else {
        var error = new Error();
        error.message = `Facebook Access Token is Required`;
        error.statusCode = 400;
        next(error);
      }
    } else {
      next()
    }

  });
  //Reset Password
  users.on('resetPasswordRequest', function (info) {
    var url = 'http://localhost:3000/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    users.app.models.Email.send({
      to: info.email,
      from: 'noreply@seesaw.com',
      subject: 'Password reset',
      html: html
    }, function (err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });
  //render UI page after password reset
  users.afterRemote('setPassword', function (context, user, next) {
    let token = context.req.query.access_token;
    users.logout(token);
    //console.log(token)
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });




//Login with facebook remote method

users.fbLogin = function (req, cb) {
 // console.log(req);
let profileImg;
if (req.verified.facebook) {
  if (req.fbAccessToken) {
    request(`https://graph.facebook.com/me?fields=id,name,picture.width(200).height(200),birthday,email,gender,location&access_token=${req.fbAccessToken}`, function (error, response, body) {
      let fbDeatils = JSON.parse(body);
      if (!error && response.statusCode == 200) {
        if(!req.profileImg){
          profileImg = fbDeatils.picture.data.url;
        }else{
          profileImg=req.profileImg;
        }
        let save = {
          "name": fbDeatils.name,
          "fbId": fbDeatils.id,
          "fbAccessToken": req.fbAccessToken,
          "profileImg": profileImg,
          "verified": {
            "facebook": true,
            "phone": false
          },
          "created_at": new Date().toISOString(),
          "updated_at": new Date().toISOString(),
          "email": req.email,
          "password": "m!;?*7@h9^NE#:yB"
        };
        users.create(save, function(err, res) {
          if(err){
            users.findOne({
              where: {
                fbId: req.fbId
              }
            }, function (err, res) {
              if(err)
        {
            console.log(err);
            cb(err);
        }else
        {
              if (res) {
                console.log(`find resopones${res}`)
                users.login({
                  email: res.email,
                  password: 'm!;?*7@h9^NE#:yB'
                }, function (err, token) {
                  let output = {
                    token: token.id,
                    newuser: false
                  }
                  if (token) {
                    cb(null, output);
                  } else {
                    cb(err);
                  }
                });
              }
              else{
                var error = new Error();
                    error.message = `Not allowed`;
                    error.statusCode = 403;
                    cb(error);
              }
            }
            })
            //cb(err);

          }else{
           // cb(null,res);
            let resp = res; 
            users.upsertWithWhere({
              id: resp.id
            }, {
              emailVerified: true,
              newUser: true
            }, (err, res) => {
              //console.log(res);
              users.login({
                email: res.email,
                password: 'm!;?*7@h9^NE#:yB'
              }, function (err, token) {
                let output = {
                  token: token.id,
                  newuser: res.newUser
                }
                if (token) {
                  cb(null, output);
                } else {
                  cb(err);
                }
              });
            });
          }
        });
      } else {
        var error = new Error();
        error.message = `${fbDeatils.error.message}`;
        error.statusCode = 400;
        cb(error);
      }
    });

  } else {
    var error = new Error();
    error.message = `Facebook Access Token is Required`;
    error.statusCode = 400;
    next(error);
  }
}
};
users.remoteMethod (
  'fbLogin',
  {
    http: {path: '/fbLogin', verb: 'post'},
    accepts: {arg: 'data', type: 'object', http: { source: 'body' } },
    returns: {arg: 'result', type: 'object'},
    description: "Login With Facebook"
  }
);
    /*Promises */
    //Check is category is exists
    const ckCat = (id,name) =>{
      return new Promise((resolve,reject)=>{
          app.models.category.findOne({where: {"id": id,"name":name}},
          (err,res)=>{
              if(res){
                  console.log(res);
                  resolve();
              }else{
                  reject(Error(`No Category Exits With name ${name} & id ${id}`));
              }
          })
      })
  }
users.beforeRemote('*.__create__userdata', function(ctx, user, cb) {
  console.log(ctx.methodString, 'was invoked remotely with customers'); // customers.prototype.save was invoked remotely
  let req = ctx.req.body;
 req.categories.forEach((cat,i) => {
  ckCat(cat.id,cat.name)
  .then(() => {
    console.log('fonud')
    if(i == req.categories.length - 1){
      cb();
    }
  })
  .catch(error => cb(error))
  })
});
};
