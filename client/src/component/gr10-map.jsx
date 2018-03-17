import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

export class Gr10Map extends Component {
  constructor(props) {
    super(props);

    this.google = undefined;
    this.map = undefined;
    this.route = undefined;
    this.trailNotes = [];
    this.state = {
      showingInfoWindow: false,
      infoWindowContent: 'hello',
      trailNotes: []
    };

    this.onMarkerClick = this.onMarkerClick.bind(this);
  }



  addCampingLocationsToMap = (map, google, route) => {
    let path = route.getPath();
    let distance = 0;
    const trailNotes = [];
    this.trailNotes.filter(camp => camp.point !== undefined).forEach(camp => {
      trailNotes.push(camp);
    });

    path.forEach((point, index) => {
      if (index === path.length - 1) {
        //the last point
        return distance;
      }

      const nextPoint = path.getAt(index + 1);
      const distanceToNextPoint =
        distance +
        google.maps.geometry.spherical.computeDistanceBetween(point, nextPoint);

      const locatedTrailNote = this.trailNotes.find(function(element) {
        return (
          element.locatedAtTrailMetre >= distance &&
          element.locatedAtTrailMetre < distanceToNextPoint &&
          element.point === undefined &&
          (element.camping || element.gite)
        );
      });

      if (locatedTrailNote !== undefined) {
        locatedTrailNote.point = point;
        trailNotes.push(locatedTrailNote);
      }

      distance = distanceToNextPoint;
    });

    this.setState({ trailNotes: trailNotes });
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
        this.route = new mapProps.google.maps.Polyline({
          path: decodedPath,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });

        this.route.setMap(map);

        if (this.trailNotes !== undefined) {
          this.addCampingLocationsToMap(
            map,
            mapProps.google,
            this.route,
            this.trailNotes
          );
        }
      });

    fetch('/data/bivouacs.json')
      .then(res => res.json())
      .then(trailNotes => {
        this.trailNotes = trailNotes;

        if (this.map !== undefined) {
          this.addCampingLocationsToMap(
            this.map,
            this.google,
            this.route,
            this.trailNotes
          );
        }
      });
  };

  onMarkerClick(props, marker, e) {
    this.setState({
      activeMarker: marker,
      showingInfoWindow: true,
      activeTrailNote: props.name
    });
  }

  render() {
    const markers = this.state.trailNotes.map(trailNote => {
      return (
        <Marker
          key={trailNote.position}
          title={trailNote.location}
          name={trailNote}
          position={trailNote.point}
          icon={{
            url: trailNote.camping ? '/tent.png' : '/kennel.svg'
          }}
          onClick={this.onMarkerClick}
        />
      );
    });

    return (
      <div className="row">
        <div className="col-12">
          <div className="gr10map">
            <Map
              google={this.props.google}
              zoom={8}
              onReady={this.onMapReady}
              initialCenter={{ lat: 42.742489, lng: 0.27881 }}
            >
              {markers}
              {this.state.activeTrailNote && (
                <InfoWindow
                  marker={this.state.activeMarker}
                  visible={this.state.showingInfoWindow}
                >
                  <div>
                    <h6>{this.state.activeTrailNote.location}</h6>
                    <div>
                      {this.state.activeTrailNote.descriptionEN !== ''
                        ? this.state.activeTrailNote.descriptionEN
                        : this.state.activeTrailNote.descriptionFR}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
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
