/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * HTTP Interface to Dislocate.
 *
 * Provides read and write access to the state of the dislocate node.
 *
 * Only requests from 127.0.0.1 or peers with the correct secret are
 * allowed to modify any settings.
 */

var log = require('../log');
var config = require('../config');
var nr = require('../../extern/node-router');
var templates = require("../templates");
var generic = require('./generic');
var schema = require('../schema');
var sys = require('sys');
var server = null;

function shortResponse(res, status, message)
{
  message = message + "";
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": message.length
  });
  res.write(message);
  res.end();
}


function renderResponse(res, name, context)
{
  templates.render(name, context,
    function (err, result) {
      if (err) {
        shortResponse(res, 500, "Exception rendering template "+ name +": "+ err);
        return;
      }
      shortResponse(res, 200, result);
    });
}

function renderJSON(res, context)
{
  data = JSON.stringify(context);
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    "Content-Length": data.length
    });
  res.end(data);
}

function renderSuccess(res)
{
  /* TODO: make this a consistent JSON */
  shortResponse(res, 200, "great success!\n");
}

function checkAuth(req, res, success, failure)
{
  if (failure === undefined) {
    failure = function(reason) {
      shortResponse(res, 401, reason + '\n');
    };
  }

  /* TODO: HMAC auth support */
  if (req.connection.remoteAddress != "127.0.0.1") {
    return failure("must be from localhost");
  }

  return success();
}

function checkBody(req, res, object_name, object_to_check, success, failure)
{
  if (failure === undefined) {
    failure = function(reason) {
      shortResponse(res, 400, reason + '\n');
    };
  }

  var v = schema.validate(object_name, object_to_check);
  if (!v.valid) {
    var msg = "";
    for (var i = 0; i < v.errors.length; i++) {
      msg += v.errors[i].property +": "+ v.errors[i].message + "\n"; 
    }
    failure('Invalid JSON Object: '+ msg);
    return;
  }

  return success();
}

exports.start = function()
{
  var c = config.get();
  server = nr.getServer();

  server.get("/", function (req, res, match) {
    return renderResponse(res, 'index', {});
  });

  server.get("/d/services", function (req, res, match) {
    var services = generic.list();
    return renderJSON(res, services);
  });

  server.put("/d/service", function (req, res, body) {
    checkAuth(req, res, function() {
        checkBody(req, res, 'service', body, function(){
          //      generic.register(body);
          return renderSuccess(res);
        });
    });
  }, "json");

  log.info("Starting HTTP server on", c.port);
  server.listen(c.port, "0.0.0.0");
};

exports.stop = function()
{
  if (server !== null) {
    server.close();
    server = null;
  }
};
