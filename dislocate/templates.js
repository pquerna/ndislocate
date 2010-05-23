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
 * Provides JSON based templates for use by other modules.
 */

var Template = require("../extern/json-template").Template;
var sys = require('sys');
var fs = require('fs');
var path = require('path');
var utils = require("./utils");
var template_dir = null;

function load(name, cb)
{
  p = path.join(template_dir, name + ".tpl");
  fs.readFile(p, function(err, data) {
    if (err) {
      msg = "Loading "+ p +" got: "+ err + "\n";
      cb(msg);
      return;
    }
    /* TODO: Cache parsed template files? */
    t = Template(data.toString());
    cb(null, t);
  });
}

exports.render = function(name, ctx, cb)
{
  default_vars = {};
  ctx = utils.merge(ctx, default_vars);
  load(name, function(err, tpl) {
    if (err) {
      cb(err);
      return;
    }
    tpl.render(ctx, function(result) {
      cb(null, result);
    });
  });
};

(function() {
  template_dir = path.join(__dirname, "templates");
})();
