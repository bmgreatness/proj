'use strict';

const Hapi = require('hapi');
const MongoDB = require('hapi-mongodb');
const Boom = require('boom');
const Joi = require('joi');
const DBConfig = require('./config/DBConfig');
var uuid = require('node-uuid');
let server = new Hapi.Server();
server.connection({ port: 8080 });





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
                    "balance": 0,
                    "tasks": []

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
        console.log(request);
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"id" : request.params.id}, (err, result) => {
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    return reply(result);
                })
            }

})

server.route({
    method: 'GET',
    path: '/user/{id}/tasks',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"id" : request.params.id}, (err, result) => {
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    return reply(result.tasks);
                })
            }

})

server.route({
    method: 'POST',
    path: '/user/{id}/tasks/add',
    handler: (request, reply) => {
                var task = {
                    "task_id" : uuid.v4(),
                    "title": request.payload.title,
                    "frequency": request.payload.frequency,
                    "creationDate": request.payload.creationDate,
                    "deadlineDate": request.payload.deadlineDate,
                    "endDate": request.payload.deadlineDate,
                    "counter":[]};

                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"id" : request.params.id}, (err, result) => {
                        
                        if(err) return reply(Boom.internal('Internal MongoDB error', err));
                        
                        var user = result;
                        
                        user.tasks.push(task);
                        
                        db.collection('users').updateOne({"id": request.params.id}, user, {upsert: true}, (err, result) => {
                            if(err) return reply(Boom.internal('Internal MongoDB error', err));
                            return reply({"success":true}).code(200);
                        });
                });
            }

})

server.route({
    method: 'POST',
    path: '/user/{id}/tasks/{task_id}/delete',
    handler: (request, reply) => {


        var db = request.server.plugins['hapi-mongodb'].db;
        db.collection('users').findOne({"id" : request.params.id }, (err, result) => {
                    
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    
                    var user = result;
                    var index;
                    var old;
                    console.log();
                    for(var i = 0; i < user.tasks.length; i++) {
                        if(user.tasks[i].task_id === request.params.task_id) {
                            index = i;
                           user.tasks.splice(i, 1);
                        }
                    }


                    
                        db.collection('users').updateOne({"id": request.params.id}, user, {upsert: true}, (err, result) => {
                            if(err) return reply(Boom.internal('Internal MongoDB error', err));
                        return reply({"success":true}).code(200);
                        });

                });



     }           
            

})

server.route({
    method: 'GET',
    path: '/user/{id}/tasks/{task_id}',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"id" : request.params.id}, (err, result) => {
                        
                        if(err) return reply(Boom.internal('Internal MongoDB error', err));

                        var user = result;
                        for(var i = 0; i < user.tasks.length; i--) {
                            if(user.tasks[i].task_id === task_id) {
                                reply(user.tasks[i]).code(200);  
                            }
                        }
                       
                });
            }

})
http://localhost:8080/user/5cb83a11-18f6-41fb-b5bd-6da465ef1954/tasks/3eff85ba-98df-42a6-9cc1-336946928cdd/edit
server.route({
    method: 'POST',
    path: '/user/{id}/tasks/{task_id}/edit',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"id" : request.params.id }, (err, result) => {
                    
                    if(err) return reply(Boom.internal('Internal MongoDB error', err));
                    
                    var user = result;
                    var index;
                    var old;
                    console.log();
                    for(var i = 0; i < user.tasks.length; i++) {
                        if(user.tasks[i].task_id === request.params.task_id) {
                            index = i;
                            old = user.tasks[i] ;

                           user.tasks.splice(i, 1);
                        }
                    }
                    
                    

                    var task = {
                    "task_id" : old.task_id,
                    "title": request.payload.title,
                    "frequency": request.payload.frequency,
                    "creationDate": old.creationDate,
                    "deadlineDate": request.payload.deadlineDate,
                    "endDate": request.payload.endDate,
                    "counter":[]};

                    user.tasks.push(task);
                        
                        db.collection('users').updateOne({"id": request.params.id}, user, {upsert: true}, (err, result) => {
                            if(err) return reply(Boom.internal('Internal MongoDB error', err));
                        return reply({"success":true}).code(200);
                        });

                });
            }

})

server.route({
    method: 'POST',
    path: '/login',
    handler: (request, reply) => {
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('users').findOne({"email" : request.payload.email, "password": request.payload.password}, (err, result) => {
                    if(err) return reply({"success": "fail"}).code(200);
                    if(result == null) return reply({"success": "fail"}).code(200) 
                    reply(result).code(200); 
                })
            }

})

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

