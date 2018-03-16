import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';

export class Gr10Map extends Component {
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

    return this.state.map === undefined;
  }

  createRoute = (map, google, points) => {
    //const defaultStrokeWeight = 4;

    //const route = new google.maps.Polyline({
    //    path: pathCoordinates,
    //  strokeColor: color,
    //  strokeOpacity: 0.7,
    //  strokeweight: defaultStrokeWeight
    //});

    //return route;

    const route = new google.maps.Polyline({
      path: points,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 4
    });

    return route;
  };

  calculateDistance = (map, google, route) => {
    let path = route.getPath();
    let distance = 0;

    path.forEach((point, index) => {
      if (index === path.length - 1) {
        //the last point
        console.log(distance);
        return distance;
      }

      const nextPoint = path.getAt(index + 1);
      distance += google.maps.geometry.spherical.computeDistanceBetween(
        point,
        nextPoint
      );

      if (distance > 48300 && distance < 48400) {
        // console.log(`creating marker at ${point}`);
        new google.maps.Marker({
          position: point,
          title: 'bivouac de Gainekoborda',
          map: map,
          icon: '/tent.png'
        });
        return;
      }

      if (distance > 70800 && distance < 70900) {
        //  console.log(`creating marker at ${point}`);
        new google.maps.Marker({
          position: point,
          title: "bivouac du col d'harrieta (crêtes d'Iparla)",
          map: map,
          icon: '/tent.png'
        });
        return;
      }
    });
  };

  onMapReady = (mapProps, map) => {
    this.map = map;
    this.google = mapProps.google;

    fetch('/data/gr10/gpx/gr10-1-Hendaye.gpx')
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then(data => {
        const trkpts = Array.from(data.getElementsByTagName('trkpt'));
        const points = trkpts.map(trkpt => {
          const lat = parseFloat(trkpt.getAttribute('lat'));
          const lon = parseFloat(trkpt.getAttribute('lon'));
          return { lat: lat, lng: lon };
        });

        const route = this.createRoute(map, mapProps.google, points);
        route.setMap(map);
        this.calculateDistance(map, mapProps.google, route);
      });
  };

  render() {
    return (
      <div className="row">
        <div className="col-12">
          <div className="gr10map">
            <Map
              google={this.props.google}
              zoom={10}
              onReady={this.onMapReady}
              initialCenter={{ lat: 43.373138, lng: -1.77406 }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCbTwcCRBzA9Qc5dT_aPYebyiprFlV1WVE',
  libraries: ['geometry'],
  v: 3.2
})(Gr10Map);
