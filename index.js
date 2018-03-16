const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const https = require('https');

const staticPath = path.join(__dirname, 'client/build');

const app = express();

app.disable('x-powered-by');

// Serve static files from the React app
app.use(express.static(staticPath, {
    setHeaders: setCustomCacheControl
}));

// Put all API endpoints under '/api'
app.get('/api/passwords', (req, res) => {
    const greeting = { message: 'hello world!', secret: process.env.SECRET_CODE};

    //// Return them as json
    res.json(greeting);
});

app.get('/api/strava', (req, res) => {
    const fromDate = 1494716400;
    const toDate = 1495321200;
    const access_token = process.env.STRAVA_ACCESS_TOKEN;
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${fromDate}&before=${toDate}&page=1&per_page=30&access_token=${access_token}`;
   
    //todo: iterate through the pages of results
    //todo: extract the required fields. There is no need to return everything.

    https.get(url, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            res.send(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.send(err);
    });


});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    console.log("no match");
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port);


console.log(`listening on ${port}`);
console.log(`static path on ${staticPath}`);

function setCustomCacheControl(res, path, stat) {
    if (serveStatic.mime.lookup(path) === 'application/javascript') {
        // Custom Cache-Control for HTML files
        res.setHeader('Cache-Control', 'public, max-age=86400')
    }

    if (serveStatic.mime.lookup(path) === 'text/css') {
        // Custom Cache-Control for HTML files
        res.setHeader('Cache-Control', 'public, max-age=86400')
    }
}