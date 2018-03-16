import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';

export class MapContainer extends Component {
  constructor(props) {
    super(props);

    this.google = undefined;
    this.map = undefined;
    this.state = {
      activitiesHaveBeenLoaded: false
    };
  }

  componentWillUnmount() {
    this.map = null;
    this.google = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // If shouldComponentUpdate returns false,
    // then render() will be completely skipped until the next state change.
    // In addition, componentWillUpdate and componentDidUpdate will not be called.

    if (
      nextProps.activities.length > 0 &&
      nextProps.loaded &&
      this.map !== undefined &&
      nextState.activitiesHaveBeenLoaded === false
    ) {
      this.addActivitiesToMap(this.map, this.google, nextProps.activities);
      this.setState({ activitiesHaveBeenLoaded: true });
    }

    return this.state.map === undefined;
  }

  createRoute = (google, encodedPath, color) => {
    const defaultStrokeWeight = 4;
    const decodedPath = google.maps.geometry.encoding.decodePath(encodedPath);
    const route = new google.maps.Polyline({
      path: decodedPath,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeweight: defaultStrokeWeight
    });

    return route;
  };

  addActivitiesToMap = (map, google, activities) => {
    if (activities.length === 0) {
      return;
    }

    map.setCenter(this.props.initialCenter);
    map.setZoom(this.props.initialZoom);

    const routes = activities.map(activity =>
      this.createRoute(google, activity.map.summary_polyline, '#FF0000')
    );

    routes.map(route => route.setMap(map));
  };

  onMapReady = (mapProps, map) => {
    let activitiesHaveBeenLoaded = false;
    this.map = map;
    this.google = mapProps.google;
    if (this.props.activities.length > 0) {
      this.addActivitiesToMap(map, mapProps.google, this.props.activities);
      activitiesHaveBeenLoaded = true;
      this.setState({
        activitiesHaveBeenLoaded: activitiesHaveBeenLoaded
      });
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
