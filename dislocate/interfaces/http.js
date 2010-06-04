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
var auth = require('../auth');
var sys = require('sys');
var server = null;

function addResponseAuth(res)
{
  res.writeAll = function (code, headers, body) {
    if (headers.Date === undefined) {
      /* TODO: not correct */
      headers.Date = (new Date()).toUTCString();
    }
    var sig = auth.generateFromResponse(res, code, headers, body);
    headers['X-Dislocate-Signature'] = sig.hmac;
    res.writeHead(code, headers);
    res.write(body);
    res.end();
  };
}

function shortResponse(res, status, message)
{
  message = message + "";
  res.writeAll(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": message.length
  }, message);
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
  res.writeAll(200, {
    'Content-Type': 'application/json; charset=utf-8',
    "Content-Length": data.length
    }, data);
}

function renderSuccess(res)
{
  /* TODO: make this a consistent JSON */
  shortResponse(res, 200, "great success!\n");
}

function checkAuth(req, res, body, success, failure)
{
  addResponseAuth(res);

  if (failure === undefined) {
    failure = function(reason) {
      shortResponse(res, 401, reason + '\n');
    };
  }

  var proposed = req.headers["x-dislocate-signature"];
  if (proposed !== undefined) {
    var good = auth.generateFromRequest(req, body);

    if (good.err !== false) {
      log.info('sending failure');
      return failure("request failed to authenticate: "+ good.err);
    }

    if (auth.validate(good.hmac, proposed) === true) {
      return success();
    }

    return failure("request failed to authenticate");
  }

  /* TODO: this is just wrong for IPb6 enabled machines */
  if (req.connection.remoteAddress == "127.0.0.1") {
    return success();
  }

  return failure("must be from localhost");
}

function checkBody(req, res, object_name, object_to_check, success, failure)
{
  if (failure === undefined) {
    failure = function(reason) {
      shortResponse(res, 400, reason + '\n');
    };
  }

  /* TODO: Figure out how much this hurts performance */
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
    checkAuth(req, res, body, function() {
        checkBody(req, res, 'service', body, function(){
          var rv = generic.register(body);
          if (rv === true) {
            return renderSuccess(res);
          }
          else {
            return shortResponse(res, 500, rv + '\n');
          }
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
