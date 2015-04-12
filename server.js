
var http = require('http');
var youtubedl = require('youtube-dl');
var bodyParser = require('body-parser');
var search = require('youtube-search');

/*
var url = 'http://www.youtube.com/watch?v=Isi-LxscQy4';
var options = [];
youtubedl.getInfo(url, options, function(err, info) {
  if (err) throw err;
 
  console.log('id:', info.id);
  console.log('title:', info.title);
  console.log('url:', info.url);
  console.log('thumbnail:', info.thumbnail);
  console.log('description:', info.description);
  console.log('filename:', info._filename);
  console.log('format id:', info.format_id);
});
*/
var express = require('express');

var httpApp = express();

httpApp.use(bodyParser.json());
httpApp.use(bodyParser.urlencoded({ extended: true }));
httpApp.use('/', express.static(__dirname + '/static'));
httpApp.set('views', __dirname + '/static');
httpApp.set('view engine', 'ejs');

httpApp.get('/autocomplete/:search', function(req, res) {
  var word = req.params.search;
  search(word, {maxResults: 20, startIndex: 1}, function(err, results) {
    if (err) {
      res.jsonp([]);
      return;
    }
    res.jsonp(results);
  });
});

httpApp.get('/gettube', function(req, res) {
  var link = req.query.link;
  youtubedl.getInfo(link, [], function(err, info) {
    if (err) {
      res.send();
      return;
    }
    res.send(info);
  });
});

httpApp.get('/', function(req, res) {
  res.render('index');
});

httpApp.listen(8080);
