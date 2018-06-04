const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const https = require('https');
const strava = require('strava-v3');

const staticPath = path.join(__dirname, 'client/build');

const app = express();

app.disable('x-powered-by');

// Serve static files from the React app
app.use(express.static(staticPath));

app.get('/api/activities/gr10', (req, res) => {
    const fromDate = 1528675200;// 11th june 2018
    const toDate = 1538352000;// 1st Oct 2018;

    //listAllActivitiesPages(fromDate, toDate, 1, [], res);

    listAllActivitiesPages(1459803862, 1478293462, 1, [], res);
});

function listAllActivitiesPages(fromDate, toDate, pageNumber, activities, res) {
    strava.athlete.listActivities(
        {
            'access_token': process.env.STRAVA_ACCESS_TOKEN,
            'after': fromDate,
            'before': toDate,
            'page': pageNumber
        }
        , function (err, payload, limits) {
            if (payload.length === undefined) {
                res.send(payload);
                return;
            }

           // console.log(err);
           // console.log(limits);
           // console.log(payload);
          //  console.log(`length ${payload.length}`);
            if (payload.length === 0) {

                const hikingActivities = activities.filter(x => x.type === 'Hike');
                const activitiesToReturn = hikingActivities.map(x => {
                    return {
                        id: x.id,
                        name: x.name,
                        start_date_local: x.start_date_local,
                        map: {
                            summary_polyline: x.map.summary_polyline
                        },
                        elapsed_time: x.elapsed_time,
                        moving_time: x.moving_time,
                        distance: x.distance,
                        total_elevation_gain: x.total_elevation_gain
                    }
                });

                res.send(activitiesToReturn);
            }
            else {
                activities = activities.concat(payload);
                listAllActivitiesPages(fromDate, toDate, pageNumber + 1, activities, res);
            }
        });
}

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
