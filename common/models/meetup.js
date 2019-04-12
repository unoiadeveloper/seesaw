'use strict';

module.exports = function(Meetup) {
    var app = require('../../server/server');
    Meetup.test = function(id, cb) {
        cb(null,id.hash);
       
      }
      Meetup.observe('access', function logQuery(ctx, next) {
        console.log('Accessing %s matching', ctx);
        next();
      });
      Meetup.remoteMethod('test', {
            accepts:{arg: 'body', type: 'object'},
            http: {"verb": "get", "path": "/test"},
            returns: {arg: 'test', type: 'any'},
      });
};
