'use strict';

const Hapi = require('hapi');
const MongoDB = require('hapi-mongodb');
const Boom = require('boom');
const Joi = require('joi');
const DBConfig = require('./config/DBConfig');
var uuid = require('node-uuid');
let server = new Hapi.Server();
server.connection({ port: 80 });





// SHOW ALL USERS
server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        reply(db.collection('users').find().toArray()).code(200);
    }
});

server.route({
    method: 'POST',
    path: '/register',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                var user = {
                    "name" : request.payload.name,
                    "password": request.payload.password,
                    "email": request.payload.email,
                    "id": uuid.v4(),
                    "tasks": null

                };
                console.log(user);
                db.collection('users').updateOne({"email": user.email}, user, {upsert: true}, (err, result) => {
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    return reply(user).code(200);
                });
            }

})

server.route({
    method: 'GET',
    path: '/user/{id}',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"id" : request.params.id}, (err, result) => {
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    return reply(result);
                })
            }

})

server.route({
    method: 'POST',
    path: '/login',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"email" : request.payload.email, "password": request.payload.password}, (err, result) => {
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    return reply(result);
                })
            }

})



// server.route({
//     method:'POST',
//     path:'/register',
//     handler: function(req,res) {
//         console.log(req.payload);
//         var user = req.payload;
//         console.log(user.name);
//         res(user).code(200);
//     }
// });

server.register({
    register: MongoDB,
    options: DBConfig.opts
}, (err) => {
    if (err) {
        console.error(err);
        throw err;
    }
    
    server.start((err) => console.log('Server started at:', server.info.uri));
});

