/*
 * Copyright 2017 Webber Inc. All rights reserved.
 *  
 * Webber Media Player
 * http://www.wmplayer.org
 *
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Litet Li Mbeleg Perrin
 * Version: 1.0.0
 * Date: 14th September 2017
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';

const express	 = require('express');
const path   	 = require('path');
const fs      	 = require('fs');
const etag    	 = require('../utils/etag');
const twig       = require('twig');

const viewPath = path.join(__dirname, '..', '..', 'views');
const helpersPath = path.join(__dirname, '..', 'helpers');
const hash = require(`${helpersPath}/hash`);

// adding hash filter to twig engine
hash(twig);
const dynamic = express();
// setting twig as default view engine
dynamic.set('view engine', 'twig');
dynamic.set('views', viewPath);
dynamic.use(require('../middleware/no-cache.js'));
dynamic.get('/',(req,res) => {
	let viewOptions = {};
	res.render('index', viewOptions, (err, html) => {
		if (err) {
			return res.status(500).send('Fail');
		}
		res.set('etag', etag(req, html));
		res.status(200).send(html);
	});
});

dynamic.get('/test',(req,res) => {
	let viewOptions = {};
	res.render('test', viewOptions, (err, html) => {
		if (err) {
			return res.status(500).send('Fail');
		}
		res.set('etag', etag(req, html));
		res.status(200).send(html);
	});
});

dynamic.get('/about',(req,res) => {
	res.send('About');
});

dynamic.get('/contact',(req,res) => {
	res.send('Contact');
});

dynamic.get('/musics',(req,res) => {
	res.send('Musics');
});

dynamic.get('/videos',(req,res) => {
	res.send('Videos');
});

dynamic.get('/contact',(req,res) => {
	res.send('Contact');
});

dynamic.get('/history',(req,res) => {
	res.send('History');
});

dynamic.get('/settings',(req,res) => {
	res.send('Settings');
});

dynamic.get('/downloads',(req,res) => {
	res.send('Downloads');
});

dynamic.get('/playlists',(req,res) => {
	res.send('Plylists');
});

dynamic.get('/sw.js', (req,res)=>{
	const input = fs.createReadStream(`${__dirname}/../../sw.js`);
	res.set('Content-Type', 'application/javascript');
	input.pipe(res);
});

dynamic.get('/manifest.json', (req, res) => {
  const input = fs.createReadStream(`${__dirname}/../../manifest.json`);
  res.set('Content-Type', 'application/json');
  input.pipe(res);
});

dynamic.get('/manifest.appcache', (req, res) => {
  const input = fs.createReadStream(`${__dirname}/../../manifest.appcache`);
  res.set('Content-Type', 'application/text');
  input.pipe(res);
});


// catch 404 Errors and forward to error handler
dynamic.use((req, res, next) => {
	let err = new Error('Page Not Found!');
	err.status = 404;
	next(err);
});

// error handler
dynamic.use(function(err,req,res,next){
	//set locals and only provide errors in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') == 'development' ? err : {};
	//render the error page
	if( err.status===undefined){
		res.send(err.message);
	}
	res.status(err.status || 500);
	res.render(`errors/error${err.status}`);
});

console.log('[Linkify: Dynamic] initialized.');
module.exports = dynamic;