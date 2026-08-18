#!/usr/bin/env node
/**
 * @license
 * Copyright 2016 Webber Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const fs = require('fs');
const walk = require('walk');
const hashFileName = require('./plugins/hash').hashFileName;
const ignore = [
	'cache-manifest.js'
];
const resourceList = [];
const pathList = [
  '/',
  '/about',
  '/musics/',
  '/videos/',
  '/contact/',
  '/history/',
  '/settings/',
  '/downloads/',
  '/playlists/'
];

const walkStaticFiles = _ => {
  return new Promise((resolve, reject) => {
    const walker = walk.walk('./static');
    const staticFiles = [];
    walker.on('file', (root, fileStats, next) => {
      const name = fileStats.name;
      const path = `${root}/${name}`;
      if (ignore.indexOf(name) !== -1) {
        return next();
      }
      root = root.replace(/^\.\/static/, '/static');
      if(name.endsWith('.js') || name.endsWith('.css') || name.endsWith('.json')) {
        const hashedName = /*hashFileName(path)*/path.replace(/^\.\/static/, '/static');
        staticFiles.push(`${hashedName}`);
      } else {
        staticFiles.push(`${root}/${name}`);
      }
      next();
    });
    walker.on('end', _ => resolve(staticFiles));
  });
};

module.exports = function(){
    return Promise.all([
      walkStaticFiles()
    ]).then(resources => {
      resourceList.push(...resources[0]);
      const manifest = [
        `const pathManifest = ${JSON.stringify(pathList, null, 2)};\n`,
        `const cacheManifest = ${JSON.stringify(resourceList, null, 2)};\n`
      ];

      return manifest;
  });
}
