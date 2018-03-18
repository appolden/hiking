import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import MapHelper from '../maps/mapHelper.jsx';

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
      trailNotes: [],
      editMode: props.match.params.mode === 'edit'
    };

    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  handleMarkClick(a, marker, infoWindow) {
    return e => {
      const header = marker.getTitle();
      const description = marker.description;
      //  <div>
      //    {this.state.activeTrailNote.descriptionEN !== ''
      //      ? this.state.activeTrailNote.descriptionEN
      //      : this.state.activeTrailNote.descriptionFR}
      //  </div>
      //</div>

      infoWindow.open(marker.getMap(), marker);
      infoWindow.setContent(
        `<h6>${header}</h6><div><p>${marker.description}</p></div>`
      );
    };
  }
  handleMarkerDragend(marker) {
    return e => {
      const updatedTrailNote = {
        position: marker.getTitle(),
        point: {
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng()
        }
      };

      console.log(JSON.stringify(updatedTrailNote));
    };
  }

  addCampingLocationsToMap = (map, google, route, trailNotes) => {
    const iw = (this.infowindow = new google.maps.InfoWindow({
      content: ''
    }));

    const trailNotesToAddToMap = [];

    trailNotes.filter(camp => camp.point !== undefined).forEach(camp => {
      trailNotesToAddToMap.push(camp);
    });

    if (this.props.match.params.mode === 'edit') {
      console.log('add points to edit');
      let path = route.getPath();
      let distance = 0;

      path.forEach((point, index) => {
        if (index === path.length - 1) {
          //the last point
          return distance;
        }

        const nextPoint = path.getAt(index + 1);
        const distanceToNextPoint =
          distance +
          google.maps.geometry.spherical.computeDistanceBetween(
            point,
            nextPoint
          );

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
          locatedTrailNote.point = { lat: point.lat(), lng: point.lng() };
          locatedTrailNote.locatedByTrailMile = true;
          trailNotesToAddToMap.push(locatedTrailNote);
        }

        distance = distanceToNextPoint;
      });
    }

    trailNotesToAddToMap.forEach(trailNote => {
      let iconUrl = '/tent.png';

      if (trailNote.camping && trailNote.locatedByTrailMile) {
        iconUrl = '/red-tent.svg';
      }

      if (trailNote.gite) {
        iconUrl = '/kennel.svg';
      }

      const marker = new google.maps.Marker({
        map: map,
        position: { lat: trailNote.point.lat, lng: trailNote.point.lng },
        title: trailNote.location,
        icon: iconUrl,
        draggable: this.props.match.params.mode === 'edit'
      });

      marker.description = trailNote.descriptionFR;

      marker.addListener(
        'click',
        this.handleMarkClick(this.google, marker, iw)
      );

      if (this.props.match.params.mode === 'edit') {
        marker.addListener('dragend', this.handleMarkerDragend(marker));
      }
    });
  };

  handleRouteClickEvent(google, route, evtName) {
    return e => {
      const latlng = e.latLng;

      const nearestMetre = MapHelper.findNearestTrailMetre(
        google,
        route,
        latlng
      );

      alert(`This is the ${(nearestMetre * 0.001).toFixed(2)}km of the trail`);
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

  onClose(a, b, c) {
    let ff = this.map;
    alert('it closed');
  }

  onOpen(a, b, c) {
    let ff = this.map;
    alert('it onOpen');
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
          draggable={this.state.editMode}
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
