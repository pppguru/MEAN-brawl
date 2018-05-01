const express = require('express')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const cacheControl = require('express-cache-controller');

const app = express()

app.use(cacheControl({
  noCache: true
}));
app.set('trust proxy', 1)
app.use(cookieSession({name: 'bbv1', keys:['bbKey', 'bbKey2']}))
app.use(express.static('public'))
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb'}));
app.set('views', './_views')
app.set('view engine', 'ejs')

var routes = require('./_routes/static');
var api = require('./_routes/api');
app.use('/', routes);
app.use('/api/v1', api);

// 404 last route
app.use(function(req, res, next) {
    res.status(400);
    res.render('404', {title: '404 Error'});
});

const port = process.env.PORT || 9000;
app.listen(port, ()=>{
  console.log('Listening on port ' + port);
});
