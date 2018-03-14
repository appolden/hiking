import React, { Component } from 'react';
import { Link } from 'react-router-dom';

function FormattedDate(props) {
  const parsedDate = new Date(props.date);

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour12: false
  }).format(parsedDate);
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
  }

  render() {
    const rows = this.state.trailSummaries.map(summary => (
      <div className="row" key={summary.trailName}>
        <div className="col-md12">
          <h3>
            <Link to={summary.url}>{summary.trailName}</Link>
          </h3>

          <ul>
            <li>
              From <FormattedDate date={summary.start_date} /> to{' '}
              <FormattedDate date={summary.end_date} />
            </li>
            <li>
              Distance: {(summary.distance * 0.001).toFixed(2)} kms{' '}
              {(summary.distance * 0.000621371).toFixed(2)} miles
            </li>
            <li> Elevation gain: {summary.total_elevation_gain} metres</li>
            <li> Moving time: {summary.moving_time.toHHMM()} hh:mm </li>
          </ul>
        </div>
      </div>
    ));

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md12">
            <h1>Trails Summary</h1>
            <p>
              I like to go hiking. These are some of the trails I have walked
              and remembered to record on Strava. I have also completed, "The
              Pennine Way", "GR20" in Corsica, "The West Highland Way" and
              "Wainwright's Coast to Coast". Sadly, these were completed pre
              Strava.{' '}
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
