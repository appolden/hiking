import React, { Component } from 'react';
import UnitOfMeasurementSelector from './unit-of-measurement-selector.jsx';
import ActivityList from './activity-list.jsx';
import MapContainer from './map.jsx';

class TrailView extends Component {
  constructor(props) {
    super(props);
    this.unitChange = this.unitChange.bind(this);
    this.state = { activities: [], unit: 'metric' };
  }

  componentDidMount() {
    fetch(this.props.dataUrl)
      .then(res => res.json())
      .then(response => this.setState({ activities: response }));
  }

  unitChange(newUnit) {
    this.setState({ unit: newUnit });
  }

  render() {
    return (
      <div className="row">
        <div className="col-sm-8">
          <MapContainer
            activities={this.state.activities}
            initialCenter={this.props.initialCenter}
            initialZoom={this.props.initialZoom}
          />
        </div>

        <div className="col-sm-4 activityList">
          <UnitOfMeasurementSelector
            unit="metric"
            onUnitChange={this.unitChange}
          />
          <ActivityList
            activities={this.state.activities}
            unit={this.state.unit}
          />
        </div>
      </div>
    );
  }
}

export default TrailView;
