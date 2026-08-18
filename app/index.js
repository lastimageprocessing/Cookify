const express = require('express');
const fs 	  = require('fs');
const https   = require('http');
const compression  = require('compression');
const helmet       = require('helmet');
const passport     = require('passport');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');

const compressResponse = req => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return true;
};

/// setting up configurations
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};
const port = process.env.PORT || 8085;
const isProd = process.env.NODE_ENV === 'production';
const isDev  = process.env.NODE_ENV === 'development';

const app = express();

/// register all the middleware
if(isProd){
	app.use(compression({filter: compressResponse}));
	app.use(helmet());
}
app.use(require('./middleware/session'));
app.use(require('./middleware/https-redirect'));
app.use(require('./middleware/hash-removal'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
if(isDev){
	const morgan = require('morgan');
	app.use(morgan('dev'));
}


/// Start up passport so that it's available to every app.
app.use(passport.initialize());
app.use(passport.session());

/// setting the routes
app.use(require('./routes'));

module.exports = {
	run: function(){
		//https.createServer(options,app)
		https.createServer(app).listen(port, _ => {
			console.log(`Server running in ${app.get('env')} mode on https://localhost:${port}`);
			console.log('Press Ctrl+C to quit.');
		});
	}
}