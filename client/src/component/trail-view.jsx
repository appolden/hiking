import React, { Component } from 'react';

class TrailView extends Component {
  constructor(props) {
    super(props);
    this.state = { activities: [] };
  }

  componentDidMount() {
    fetch(this.props.dataUrl)
      .then(res => res.json())
      .then(response => this.setState({ activities: response }));
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-8">
          <MapContainer
            activities={this.state.activities}
            initialCenter={this.props.initialCenter}
            initialZoom={this.props.initialZoom}
          />
        </div>
        <ActivityList activities={this.state.activities} />
      </div>
    );
  }
}

export default TrailView;
