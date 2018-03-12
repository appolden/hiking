import React, { Component } from 'react';

Number.prototype.toHHMM = function() {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  var time = hours + ':' + minutes;
  return time;
};

function FormattedDate(props) {
  const parsedDate = new Date(props.date);

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour12: false
  }).format(parsedDate);
}

function FormattedTime(props) {
  const parsedDate = new Date(props.date);

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(parsedDate);
}

class ActivityList extends Component {
  render() {
    const activityRow = this.props.activities.map(activity => (
      <div key={activity.id}>
        <div className="col-md12">
          <strong>
            <FormattedDate date={activity.start_date_local} />{' '}
            <FormattedTime date={activity.start_date_local} />
          </strong>{' '}
          {activity.name}
        </div>
        <ul className="unstyled">
          <li>
            <span>
              Time {activity.elapsed_time.toHHMM()} Moving{' '}
              {activity.moving_time.toHHMM()}{' '}
            </span>
          </li>
          <li>
            <span>
              {activity.distance.toFixed(2)} kms Ascent{' '}
              {activity.total_elevation_gain.toFixed(0)} metres
            </span>
          </li>
          <li>
            <a
              target="_blank"
              href={'https://www.strava.com/activities/' + activity.id}
            >
              View hike on Strava
            </a>
          </li>
        </ul>
      </div>
    ));

    return (
      <div className="col-md-4 activityList">
        <div>
          <label>
            <input type="radio" value="metric" />
            Metric
          </label>
          <label>
            <input type="radio" value="imperial" />
            Imperial
          </label>
        </div>
        <div id="activityList">{activityRow}</div>
      </div>
    );
  }
}

export default ActivityList;
