import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';

export class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.google = undefined;
    this.map = undefined;
    this.state = { map: undefined, google: undefined };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // If shouldComponentUpdate returns false,
    // then render() will be completely skipped until the next state change.
    // In addition, componentWillUpdate and componentDidUpdate will not be called.
    if (
      nextProps.activities.length > 0 &&
      nextProps.loaded &&
      this.state.map !== undefined
    ) {
      this.addActivitiesToMap(nextProps.activities);
    }

    return this.state.map === undefined;
  }

  createRoute = (google, encodedPath, color) => {
    const defaultStrokeWeight = 4;
    const selectedStrokeWeight = 10;

    var decodedPath = this.state.google.maps.geometry.encoding.decodePath(
      encodedPath
    );
    var route = new this.state.google.maps.Polyline({
      path: decodedPath,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeweight: defaultStrokeWeight
    });

    return route;
  };

  addActivitiesToMap = activities => {
    if (activities.length === 0) {
      return;
    }

    this.state.map.setCenter(this.props.initialCenter);
    this.state.map.setZoom(this.props.initialZoom);

    const routes = activities.map(activity =>
      this.createRoute(this.google, activity.map.summary_polyline, '#FF0000')
    );

    routes.map(route => route.setMap(this.state.map));
  };

  onMapReady = (mapProps, map) => {
    this.map = map;
    this.google = mapProps.google;
    this.setState({ google: mapProps.google, map: map });
    if (this.props.activities.length > 0) {
      this.addActivitiesToMap(this.props.activities);
    }
  };

  render() {
    return (
      <div className="map">
        <Map
          google={this.props.google}
          zoom={this.props.initialZoom}
          onReady={this.onMapReady}
          initialCenter={this.props.initialCenter}
        />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCbTwcCRBzA9Qc5dT_aPYebyiprFlV1WVE',
  libraries: ['geometry'],
  v: 3.2
})(MapContainer);
