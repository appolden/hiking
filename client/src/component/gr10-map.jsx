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
    this.onDragEnd = this.onDragEnd.bind(this);
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
        const offset = 1.012845867; // to correct the actual GPX distance compared to the official distance.
        return (
          element.locatedAtTrailMetre * offset >= distance &&
          element.locatedAtTrailMetre * offset < distanceToNextPoint &&
          element.point === undefined &&
          (element.camping || element.gite)
        );
      });

      if (locatedTrailNote !== undefined) {
        locatedTrailNote.point = point;
        locatedTrailNote.locatedByTrailMile = true;
        trailNotes.push(locatedTrailNote);
      }

      distance = distanceToNextPoint;
    });

    this.setState({ trailNotes: trailNotes });
  };

  handleRouteClickEvent(google, route, evtName) {
    return e => {
      const latlng = e.latLng;
      const path = route.getPath();
      let pathDistance = 0;
      const needle = {
        minDistance: 9999999999,
        index: -1,
        latlng: null,
        distance: 0
      };

      path.forEach(function(routePoint, index) {
        var dist = google.maps.geometry.spherical.computeDistanceBetween(
          latlng,
          routePoint
        );
        if (dist < needle.minDistance) {
          needle.minDistance = dist;
          needle.index = index;
          needle.latlng = routePoint;
          needle.distance = pathDistance;
        }

        if (index !== path.length - 1) {
          //Not the last point
          const nextPoint = path.getAt(index + 1);
          pathDistance += google.maps.geometry.spherical.computeDistanceBetween(
            routePoint,
            nextPoint
          );
        }
      });

      alert(
        `This is the ${(needle.distance * 0.001).toFixed(2)}km of the trail`
      );
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

        //TODO: This handleRouteClickEvent doesn't seem right.
        this.route.addListener(
          'click',
          this.handleRouteClickEvent(this.google, this.route, 'click')
        );
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

  onDragEnd(props, marker, e) {
    props.name.point = {
      lat: marker.getPosition().lat(),
      lng: marker.getPosition().lng()
    };

    const updatedTrailNote = {
      position: props.name.position,
      point: {
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
      }
    };

    console.log(JSON.stringify(updatedTrailNote));
  }

  render() {
    const markers = this.state.trailNotes.map(trailNote => {
      let iconUrl = '/tent.png';

      if (trailNote.camping && trailNote.locatedByTrailMile) {
        iconUrl = '/red-tent.svg';
      }

      if (trailNote.gite) {
        iconUrl = '/kennel.svg';
      }

      return (
        <Marker
          key={trailNote.position}
          title={trailNote.location}
          name={trailNote}
          position={trailNote.point}
          icon={{ url: iconUrl }}
          onClick={this.onMarkerClick}
          draggable={true}
          onDragend={this.onDragEnd}
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
              gestureHandling={'greedy'}
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
