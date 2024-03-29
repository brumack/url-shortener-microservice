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

const Schema = mongoose.Schema

const ShortSchema = new Schema({
  long: String,
  short: Number
})

const shortURL = mongoose.model('ShortURL', ShortSchema)

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
  let urlRegexp = /http[s]{0,1}\:\/\/www\.(?<domain>[a-z0-9]{1,}\.org)(?<path>(\/\w+)*)/i
  let result = url.match(urlRegexp) ? url.match(urlRegexp).groups : null
  
  if (!result) {
    return res.json({"error":"invalid URL"})
  }
    
  const options = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };
    
  dns.lookup(result.domain, options, (err, address, family) => {
    if (address) {
      
      shortURL.find({long: url}, (err, foundURL) => {
                
        // IF ALREADY EXISTS, SEND RECORD
        if (foundURL.length != 0)
          return res.json({original_url: foundURL[0].long, short_url: foundURL[0].short})
        
        // COUNT NUMBER OF RECORDS
        shortURL.find({}, (err, urls) => {
          const total = urls.length
          
          // CREATE NEW RECORD
          new shortURL({
            long: url,
            short: total + 1
          }).save((err, url) => {
            if (err) return res.json({"error":"server error"})
            return res.json({original_url: url.long, short_url: url.short})
          })
        })
      })
    } else return res.json({"error":"invalid URL"})
  })
})
  
app.get('/api/shorturl/:short', (req, res) => {
  const { short } = req.params
  shortURL.find({short}, (err, urls) => {
    if (err) return res.json({"error":"server error"})
    if (urls.length === 0)
      return res.json({"error":"short url not found"})
    res.redirect(urls[0].long)
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});