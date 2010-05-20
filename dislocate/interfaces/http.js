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

var log = require('../log');
var config = require('./../config')
var nr = require('./../../extern/node-router');
var templates = require("./../templates");
var generic = require('./generic');
var server = null;

function renderResponse(res, name, context)
{
  templates.render(name, context,
    function (err, result) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end("Exception rendering template "+ name +": "+ err);
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(result);
    });
}

function renderJSON(res, context)
{
  data = JSON.stringify(context);
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(data);
}

exports.start = function()
{
  var c = config.get()
  server = nr.getServer()

  server.get("/", function (req, res, match) {
    return renderResponse(res, 'index', {});
  });

  server.get("/d/services", function (req, res, match) {
    var services = generic.list();
    return renderJSON(res, services);
  });

  log.info("Starting HTTP server on", c.port);
  server.listen(c.port);
};

exports.stop = function()
{
  if (server !== null) {
    server.close();
    server = null;
  }
};
