import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import MapHelper from '../maps/mapHelper.jsx';

export class GpxEdit extends Component {
  constructor(props) {
    super(props);

    this.google = undefined;
    this.map = undefined;
    this.polyLine = undefined;
    this.trailNotes = [];
    this.state = {
      mapClickedLocation: { lat: undefined, lng: undefined },
      polyLineClickedLocation: { lat: undefined, lng: undefined }
    };

    this.handleOnMapClick = this.handleOnMapClick.bind(this);
  }

  handleOnMapClick(mapProps, map, clickEvent) {
    this.setState({
      mapClickedLocation: {
        lat: clickEvent.latLng.lat().toFixed(6),
        lng: clickEvent.latLng.lng().toFixed(6)
      }
    });
  }

  onMapReady = (mapProps, map) => {
    this.map = map;
    this.google = mapProps.google;

      fetch('/data/gr10/gpx/gr10-5-lac-de-loule.gpx')
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then(data => {
        const trkpts = Array.from(data.getElementsByTagName('trkpt'));
        const points = trkpts.map(trkpt => {
          const lat = parseFloat(trkpt.getAttribute('lat'));
          const lon = parseFloat(trkpt.getAttribute('lon'));
          return { lat: lat, lng: lon };
        });

        this.polyLine = new mapProps.google.maps.Polyline({
          path: points,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 4,
          editable: false
        });

        this.polyLine.addListener('click', e => {
          const point = {
            lat: e.latLng.lat().toFixed(6),
            lng: e.latLng.lng().toFixed(6)
          };

          this.setState({ polyLineClickedLocation: point });
        });

        this.polyLine.addListener('dragend', e => {
          const point = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };

          this.setState({ polyLineDraggedLocation: point });
        });

        this.polyLine.setMap(map);
      });
  };

  // 42.907154, "lng": -0.082397
  render() {
    return (
      <div className="row">
        <div className="col-12">
          <div className="gr10map">
            <Map
              google={this.props.google}
              zoom={12}
              onReady={this.onMapReady}
                        initialCenter={{ lat: 42.834682, lng: 0.873311}}
              clickableIcons={true}
              onClick={this.handleOnMapClick}
            />
          </div>

          <div>
            {' '}
            You clicked on "lat": {this.state.mapClickedLocation.lat}, "lng":{' '}
            {this.state.mapClickedLocation.lng}{' '}
            <p>
              You clicked on "lat": {this.state.polyLineClickedLocation.lat},
              "lng": {this.state.polyLineClickedLocation.lng}
            </p>
            <p>
              {'<trkpt lat="' +
                this.state.polyLineClickedLocation.lat +
                '" lon="' +
                this.state.polyLineClickedLocation.lng +
                '">'}
              {'</trkpt>'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCbTwcCRBzA9Qc5dT_aPYebyiprFlV1WVE',
  libraries: ['geometry'],
  language: 'fr'
})(GpxEdit);
