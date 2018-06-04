import React, { Component } from 'react';
import { Link } from 'react-router-dom';

function FormatDate(props) {
  const parsedDate = new Date(props.date);

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour12: false
  }).format(parsedDate);
}

function FormatSeconds(props) {
  const sec_num = parseInt(props.seconds, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  const time = `${hours} hours and ${minutes} minutes`;
  return time;
}

class TrailSummary {
  constructor(trailName, url, activities) {
    this.trailName = trailName;
    this.url = url;
    this.distance = 0;
    this.elapsed_time = 0;
    this.moving_time = 0;
    this.total_elevation_gain = 0;
    this.start_date = undefined;
    this.end_date = undefined;

    activities.forEach(activity => {
      this.distance += activity.distance;
      this.elapsed_time += activity.elapsed_time;
      this.moving_time += activity.moving_time;
      this.total_elevation_gain += activity.total_elevation_gain;

      const dateOne = new Date(activity.start_date_local);

      if (this.start_date === undefined || dateOne < this.start_date) {
        this.start_date = dateOne;
      }

      if (this.end_date === undefined || dateOne > this.end_date) {
        this.end_date = dateOne;
      }
    });
  }
}

class TrailsSummary extends Component {
  constructor(props) {
    super(props);
    this.state = { trailSummaries: [] };
  }

  componentDidMount() {
    fetch('/data/hwp.json')
      .then(response => response.json())
      .then(response => {
        this.setState(function(prevState, props) {
          let trailSummary = new TrailSummary(
            "Hadrian's Wall Path",
            '/trail/hadrianswallpath',
            response
          );
          prevState.trailSummaries.push(trailSummary);

          return { trailSummaries: prevState.trailSummaries };
        });
      });

    fetch('/data/pct.json')
      .then(response => response.json())
      .then(response => {
        this.setState(function(prevState, props) {
          let trailSummary = new TrailSummary(
            'Pacific Crest Trail',
            '/trail/pacificcresttrail',
            response
          );
          prevState.trailSummaries.push(trailSummary);

          return { trailSummaries: prevState.trailSummaries };
        });
      });

    fetch('/data/gr5.json')
      .then(response => response.json())
      .then(response => {
        this.setState(function(prevState, props) {
          let trailSummary = new TrailSummary(
            'GR5 - Lake Geneva to Chamonix',
            '/trail/gr5',
            response
          );
          prevState.trailSummaries.push(trailSummary);

          return { trailSummaries: prevState.trailSummaries };
        });
          });

      fetch('/api/activities/gr10')
          .then(response => response.json())
          .then(response => {
              this.setState(function (prevState, props) {
                  let trailSummary = new TrailSummary(
                      'GR10 - Hendaye to Banyuls-sur-mer',
                      '/trail/gr10',
                      response
                  );
                  prevState.trailSummaries.push(trailSummary);

                  return { trailSummaries: prevState.trailSummaries };
              });
          });
  }

  render() {
    const sorted = this.state.trailSummaries.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);

      return dateA < dateB ? 1 : 0;
    });

    const rows = sorted.map(summary => (
      <div className="row" key={summary.trailName}>
        <div className="col-sm-12">
          <h2>
            <Link to={summary.url}>{summary.trailName}</Link>
          </h2>
          <ul>
            <li>
              From <FormatDate date={summary.start_date} /> to{' '}
              <FormatDate date={summary.end_date} />
            </li>
            <li>
              Distance: {(summary.distance * 0.001).toFixed(2)} kms{', '}
              {(summary.distance * 0.000621371).toFixed(2)} miles
            </li>
            <li>Elevation gain: {summary.total_elevation_gain} metres</li>
            <li>
              Moving time: <FormatSeconds seconds={summary.moving_time} />{' '}
            </li>
          </ul>
        </div>
      </div>
    ));

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-sm-12">
            <h1>My hiking trips</h1>
            <p>
              I like to go hiking. These are some of the trails I have walked
              and remembered to record on Strava. I have also completed,{' '}
              <a
                href="https://en.wikipedia.org/wiki/Pennine_Way"
                title="The
              Pennine Way"
              >
                The Pennine Way
              </a>,{' '}
              <a href="https://en.wikipedia.org/wiki/GR_20" title="GR20">
                GR20
              </a>{' '}
              in Corsica,{' '}
              <a
                href="https://en.wikipedia.org/wiki/West_Highland_Way"
                title="The West Highland Way"
              >
                The West Highland Way
              </a>{' '}
              and{' '}
              <a
                href="https://en.wikipedia.org/wiki/Coast_to_Coast_Walk"
                title="Wainwright's Coast to Coast"
              >
                Wainwright's Coast to Coast
              </a>. Sadly, these were completed pre Strava.{' '}
            </p>
            <p>Click on any of the links below for more detail</p>
          </div>
        </div>

        {rows}
      </React.Fragment>
    );
  }
}

export default TrailsSummary;
