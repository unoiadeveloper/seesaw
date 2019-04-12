'use strict';
var app = require("../../server/server");
module.exports = function (Services) {

  Services.beforeRemote("create", function (context, data, next) {
    let req_data = context.req.body;
    if (req_data.usersId) {
      app.models.users.findById(req_data.usersId, function (err, res) {
        if (err) {
          console.log(err);
          next(err);
        } else {
          if (res) {
            console.log(res);
            if (res.name && res.profileImg && res.email) {
              if (res.verified.facebook) {
                if (!req_data.categoryId) req_data.categoryId = "5a72bc726064a81b78a03fb5";
                app.models.category.findById(req_data.categoryId, function (err, res) {
                  if (res) {
                    Services.findOne({
                      where: {
                        "usersId": req_data.usersId,
                        "title": req_data.title
                      }
                    }, (err, res) => {
                      if (res) {
                        var error = new Error();
                        error.message = `You have Already a service with same name`;
                        error.statusCode = 400;
                        next(error);
                      } else {
                        next()
                      }
                    })

                  } else {
                    var error = new Error();
                    error.message = `No Category With Id ${req_data.categoryId}`;
                    error.statusCode = 404;
                    next(error);

                  }
                })
                //next()
              } else {
                var error = new Error();
                error.message = `Please Verifiy Identities`;
                error.statusCode = 403;
                next(error);
              }
            } else {
              var error = new Error();
              error.message = `Please Complete Your Profile`;
              error.statusCode = 403;
              next(error);
            }

          } else {
            var error = new Error();
            error.message = `No user found with id ${req_data.usersId}`;
            error.statusCode = 404;
            next(error);
          }
        }

      });

    } else {
      var error = new Error();
      error.message = `user id required`;
      error.statusCode = 400;
      next(error);
    }
  });

};
