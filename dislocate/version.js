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
 * Provides the current version of dislocate.
 *
 * These are written in an easily parsable format for use by 
 * other (non-js) scripts to easily grep out the version number.
 */

var DISLOCATE_VERSION_MAJOR = 0;
var DISLOCATE_VERSION_MINOR = 1;
var DISLOCATE_VERSION_PATCH = 0

/* change this on release tags */
var DISLCOATE_IS_DEV = true;

/* Used in the network protocol for compatibility testing. */
var DISLOCATE_MAGIC = 2010052200;

exports.MAJOR = DISLOCATE_VERSION_MAJOR;
exports.MINOR = DISLOCATE_VERSION_MINOR;
exports.PATCH = DISLOCATE_VERSION_PATCH;
exports.IS_DEV = DISLCOATE_IS_DEV;
exports.MAGIC = DISLOCATE_MAGIC;

exports.toString = function()
{
  dstr = '-dev';

  if (DISLCOATE_IS_DEV == false) {
    dstr = '-release';
  }

  return 'dislcoate-'+  DISLOCATE_VERSION_MAJOR +'.'+ DISLOCATE_VERSION_MINOR +'.'+ DISLOCATE_VERSION_PATCH +''+dstr;
}
