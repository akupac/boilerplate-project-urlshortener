require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
let URLModel = require('./urlModel');



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
 
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/shorturl/:short_url', async function(req, res) {
  let url = await URLModel.findOne({ short_url: req.params.short_url })
  if (url) {
    return res.redirect(url.original_url);
  } else {
    return res.json({ error: 'invalid url' });
  }
});

app.post('/api/shorturl', 
  function(req, res, next) {
    console.log("\n\nreq.body", req.body);
    console.log("\n\nreq.params", req.params);

    try {
      if (!req.body.url.startsWith('http://') && !req.body.url.startsWith('https://')) {
        req.body.parsedUrl = new URL(`http://${req.body.url}`);
      } else {
        req.body.parsedUrl = new URL(req.body.url);
      }
      dns.lookup(req.body.parsedUrl.host, (err) => {
        if (err) {
          return res.json({ error: 'invalid url' });
        } else {
          next();
        }
      });
    } catch (error) {
      return res.json({ error: 'invalid url' });
    }
  }, 
  function(req, res) {
  var urlObj = new URLModel({ 
    original_url: req.body.url, 
    short_url: Math.floor(Math.random() * 2001)
  });
  urlObj.save().then((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  })
  return res.json({ 
    original_url: urlObj.original_url, 
    short_url: urlObj.short_url 
  }); 
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

