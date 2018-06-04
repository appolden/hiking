import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import PropTypes from 'prop-types';

export class TrailBuilder extends Component {
  constructor(props) {
    super(props);

    this.onMapClick = this.onMapClick.bind(this);
    this.state = {
      pointCounter: 1,
      markers: [],
      path: undefined,
      snappedPath: undefined,
      snappedPathPoints: [],
      test: false
    };
  }

  onMapReady = (mapProps, map) => {
    this.map = map;
      this.google = mapProps.google;

      fetch('/data/gr10/gr10-route.json')
          .then(response => response.json())
          .then(data => {
              const decodedPath = mapProps.google.maps.geometry.encoding.decodePath(
                  data.polyline
              );
              this.route = new mapProps.google.maps.Polyline({
                  path: decodedPath,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 4
              });

              this.route.setMap(map);

          });
  };

  onMapClick(mapProps, map, clickEvent) {
    //lat: clickEvent.latLng.lat().toFixed(6),
    //    lng: clickEvent.latLng.lng().toFixed(6)
    const marker = new mapProps.google.maps.Marker({
      map: map,
      position: clickEvent.latLng,
      title: 'Point ' + this.state.pointCounter,
      //icon: iconUrl,
      draggable: true
    });

    marker.addListener('dragend', e => {
      //this.onMarkerDragEnd(e);
      console.log(`dragged ${marker.getTitle()}`);

      this.snapToPath(mapProps, map);
    });

    this.setState((prevState, props) => {
      const newPointCounter = prevState.pointCounter++;
      prevState.markers.push(marker);
      return {
        pointCounter: prevState.pointCounter++,
        markers: prevState.markers
      };
    });

    this.snapToPath(mapProps, map);
  }

  onMarkerDragEnd(e) {
    console.log(e);
  }

  snapToPath(mapProps, map) {
    if (this.state.markers.length > 1) {
      const positions = this.state.markers.map(x => x.position);

      if (this.state.path === undefined) {
        const path = new mapProps.google.maps.Polyline({
          path: positions,
          strokeColor: 'blue',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        this.setState({ path: path });
        this.state.path.setMap(map);
      } else {
        this.state.path.setPath(positions);
      }

      if (this.state.snappedPath === undefined) {
        this.state.snappedPath = new mapProps.google.maps.Polyline({
          path: [],
          strokeColor: 'red',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        this.state.snappedPath.setMap(map);
      }

      let snappedPathPoints = [];
      const directionService = new mapProps.google.maps.DirectionsService();

      positions.forEach((position, index) => {
        if (index === positions.length - 1) {
          return;
        }

        directionService.route(
          {
            origin: position,
            destination: positions[index + 1],
            travelMode: mapProps.google.maps.DirectionsTravelMode.WALKING
          },
          (result, status) => {
            if (status == mapProps.google.maps.DirectionsStatus.OK) {
              snappedPathPoints = snappedPathPoints.concat(
                result.routes[0].overview_path
              );

              if (this.state.snappedPath !== undefined) {
                this.state.snappedPath.setPath(snappedPathPoints);
              }

                const pathLength = mapProps.google.maps.geometry.spherical.computeLength(snappedPathPoints);
                const encodedPath = mapProps.google.maps.geometry.encoding.encodePath(snappedPathPoints);
                this.setState({ snappedPathPoints: snappedPathPoints, distance: pathLength, encodedPath: encodedPath });
            } else console.log('Directions request failed: ' + status);
          }
        );
      }, this);
    }
  }

  render() {
      let gpxRows = [];

    if (this.state.snappedPathPoints !== undefined) {

      gpxRows = this.state.snappedPathPoints.map(x => {
        return (
          <div key={x.lat()}>
            {'<trkpt lat="' + x.lat().toFixed(6)}{' '}
            {'lon="' + x.lng().toFixed(6) + '"></trkpt>'}{' '}
          </div>
        );
      });
    }

    return (
      <React.Fragment>
        <div className="map">
          <Map
            google={this.props.google}
            zoom={this.props.initialZoom}
            onReady={this.onMapReady}
            initialCenter={this.props.initialCenter}
            onClick={this.onMapClick}
          />
            </div>
            Distance: {this.state.distance}
            <h3>Gpx coordinates</h3>
            <div className="row">
            <div className="col-12">
                <textarea
                    className="form-control"
                    rows="15"
                    value={this.state.encodedPath}
                    style={{ fontSize: '0.75rem' }}
                />
            </div>
            </div>
        <div className="row">
          <div className="col-12" style={{ lineheight: 0 }}>
            {gpxRows}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

TrailBuilder.propTypes = {
  children: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  })
};

TrailBuilder.defaultProps = {
    initialCenter: { lat: 42.834500, lng: 0.934289 }   
};


export default GoogleApiWrapper({
  apiKey: 'AIzaSyCbTwcCRBzA9Qc5dT_aPYebyiprFlV1WVE',
  libraries: ['geometry'],
  v: 3.2
})(TrailBuilder);
