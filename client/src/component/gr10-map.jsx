import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';

export class Gr10Map extends Component {
  constructor(props) {
    super(props);

    this.google = undefined;
    this.map = undefined;

    this.campingLocations = [
      {
        locatedAtTrailMetre: 9700,
        title: 'bivouac du col des Poiriers (Pitare, Osingo Lépoa)'
      },
      {
        locatedAtTrailMetre: 24500,
        title: ' bivouac des Trois Fontaines (sous la Rhune) '
      },

      {
        locatedAtTrailMetre: 32600,
        title: 'bivouac au camping La petite Rhune',
          point: {lat: 43.302383, lng: -1.587439}
      },

      {
        locatedAtTrailMetre: 39500,
        title: 'bivouac du pont du diable'
      },

      {
        locatedAtTrailMetre: 42300,
        title: 'bivouac au Camping Harazpy',
        point: {lat: 43.310206, lng: -1.501994}
      },
      {
        locatedAtTrailMetre: 48300,
        title: 'bivouac de Gainekoborda'
      }
    ];
  }


  componentWillUnmount() {
    this.map = null;
    this.google = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // If shouldComponentUpdate returns false,
    // then render() will be completely skipped until the next state change.
    // In addition, componentWillUpdate and componentDidUpdate will not be called.

    return this.map === undefined;
  }

  createRoute = (map, google, points) => {
    const route = new google.maps.Polyline({
      path: points,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 4
    });

    return route;
  };

  addCampingLocationsToMap = (map, google, route) => {
    let path = route.getPath();
    let distance = 0;

    this.campingLocations.filter(camp => camp.point !== undefined)
      .forEach(camp => {
          new google.maps.Marker({
              position: camp.point,
              title: camp.title,
              map: map,
              icon: '/tent.png'
          });
      });

    path.forEach((point, index) => {
      if (index === path.length - 1) {
        //the last point
        //console.log(distance);
        return distance;
      }

      const nextPoint = path.getAt(index + 1);
      const distanceToNextPoint =
        distance +
        google.maps.geometry.spherical.computeDistanceBetween(point, nextPoint);

      const found = this.campingLocations.find(function(element) {
        return (
          element.locatedAtTrailMetre >= distance &&
          element.locatedAtTrailMetre < distanceToNextPoint && element.point === undefined
        );
      });

      if (found !== undefined) {
        new google.maps.Marker({
          position: point,
          title: found.title + ' between ' + (distance * 0.001).toFixed(2) + ' and ' + (distanceToNextPoint * 0.001).toFixed(2),
          map: map,
          icon: '/tent.png'
        });
      }

      distance = distanceToNextPoint;

    });
  };

  onMapReady = (mapProps, map) => {
    this.map = map;
    this.google = mapProps.google;

    fetch('/data/gr10/gr10-route.json')
      .then(response => response.json())
      .then(data => {
        const decodedPath = mapProps.google.maps.geometry.encoding.decodePath(
          data.polyline
        );
        const route = new mapProps.google.maps.Polyline({
          path: decodedPath,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        //console.log(encodedPath);
        route.setMap(map);
        this.addCampingLocationsToMap(map, mapProps.google, route);
      });
  };

  render() {
    return (
      <div className="row">
        <div className="col-12">
          <div className="gr10map">
            <Map
              google={this.props.google}
              zoom={8}
              onReady={this.onMapReady}
              initialCenter={{ lat: 42.742489, lng: 0.278810 }}
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
