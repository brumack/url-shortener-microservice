'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser')

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', (req, res) => {
  const { url } = req.body
  dns.lookup('https://www.google.com', (err, address, family) => {
    console.log(address)
  })
  // check if url already exists
  // create new short url
  // save to db
  // send response
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});