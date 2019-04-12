"use strict";
const ObjectId = require('mongodb').ObjectId;
var app = require("../../server/server");
module.exports = function (Swap) {
  Swap.beforeRemote("create", function (context, data, next) {
    let req_data = context.req.body;
    let p1, p2, boot;
    app.models.users.findById(req_data.wanterId, function (err, res) {
      if(err)
        {
            console.log(err);
            next(err);
        }else
        {
          if(res) {
            req_data.service_want.username = res.username;
            //next();
          }
         else {
          var error = new Error();
          error.message = `No user found with id ${req_data.wanterId}`;
          error.statusCode = 404;
          next(error);
        }
        }
     
    });
    app.models.users.findById(req_data.providerId, function (err, res) {
      if(err)
        {
            console.log(err);
            next(err);
        }else
        {
          if(res) {
            req_data.service_provide.username = res.username;
          }
          else {
           var error = new Error();
           error.message = `No user found with id ${req_data.providerId}`;
           error.statusCode = 404;
           next(error);
         }
         }
    });
    app.models.services.findOne({
        where: {
          id: req_data.service_want.id,
          usersId: req_data.wanterId
        }
      },
      function (err, res) {
        if(err)
        {
            console.log(err);
            next(err);
        }else
        {
          if(res) {        
        req_data.service_want.name = res.title;
        req_data.service_want.price = res.price;
        p1 = res.price;
          } else {
            var error = new Error();
            error.message = `No Service found related to ${req_data.wanterId} with service_id ${req_data.service_want.id}`;
            error.statusCode = 404;
            next(error);
          }
        }
      }
    );
    app.models.services.findOne({
        where: {
          id: req_data.service_provide.id,
          usersId: req_data.providerId
        }
      },
      function (err, res) {
        if(err)
        {
            console.log(err);
            next(err);
        }else
        {
          if(res) {  
        req_data.service_provide.name = res.title;
        req_data.service_provide.price = res.price;
        p2 = res.price;
        
        if (p1 > p2) {
          boot = p1 - p2;
        } else {
          boot = p2 - p1;
        }
        req_data.boot = boot;
        console.log(`p1 = ${p1} & p2 = ${p2} boot = ${boot}`)
        next();
      } else {
        var error = new Error();
        error.message = `No Service found related to ${req_data.service_provide.username} with service_id ${req_data.service_provide.id}`;
        error.statusCode = 404;
        next(error);
      }
    }
      }
    );
  });
  Swap.greet = function(msg, cb) {
    Swap.find({
      where: {
      service_want: {
        username : "user"
      }
    }, function (err, res) {
      if(err)
        {
            console.log(err);
            cb(err);
        }else
        {
          if(res) {
            console.log(res);
            //next();
          }
         else {
          var error = new Error();
          error.message = `No user found with id ${req_data.service_want.userid}`;
          error.statusCode = 404;
          cb(error);
        }
        }
      }
    });
  }

  Swap.remoteMethod('greet', {
        accepts: {arg: 'msg', type: 'string'},
        returns: {arg: 'greeting', type: 'object'}
  });
};
