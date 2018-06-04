import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import MapHelper from '../maps/mapHelper.jsx';
import PropTypes from 'prop-types';

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
      editMode: props.match.params.mode === 'edit',
      pathClickedLocation: { lat: undefined, lng: undefined },
      mapClickedLocation: { lat: undefined, lng: undefined },
      name: '',
      camping: false,
      description: '',
      hotelNames: '',
      hotelTels: ''
    };

    this.handleOnMapClick = this.handleOnMapClick.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.onNameChange = this.onNameChange.bind(this);
    this.onFacilityChange = this.onFacilityChange.bind(this);

    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onHotelNameChange = this.onHotelNameChange.bind(this);
      this.onHotelTelChange = this.onHotelTelChange.bind(this);
  
  }

  handleMarkClick(a, marker, infoWindow) {
    return e => {
      const header = marker.getTitle();
      const description = marker.description;

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

  handleOnMapClick(mapProps, map, clickEvent) {
    this.setState({
      mapClickedLocation: {
        lat: clickEvent.latLng.lat().toFixed(6),
        lng: clickEvent.latLng.lng().toFixed(6)
      }
    });

    const pathPointsWithDistance = MapHelper.addCumulativeDistance(
      mapProps.google,
      this.route.getPath().getArray()
    );

    const nearest = MapHelper.findNearest(
      mapProps.google,
      pathPointsWithDistance,
      clickEvent.latLng,
      this.map
    );

    let result = `Distance from map click ${nearest.minDistance.toFixed(0)}`;

    this.setState({
      pathClickedLocation: {
        lat: nearest.latlng.lat().toFixed(6),
        lng: nearest.latlng.lng().toFixed(6),
        pathMetre: nearest.distance.toFixed(1),
        info: result
      }
    });
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

    const knownCamping = trailNotes
      .filter(camp => camp.point !== undefined && camp.point !== undefined)
      .map(x => {
        return {
          name: x.location,
          description: {
            en: x.descriptionEN,
            fr: x.descriptionFR
          },
          camping: x.camping,
          point: x.point
        };
      });

    //   const knownCamping = trailNotes.filter(camp => camp.point !== undefined);

  //  console.log(JSON.stringify(knownCamping));

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

  onNameChange(event) {
    this.setState({ name: event.target.value });
  }
  onDescriptionChange(event) {
    this.setState({ description: event.target.value });
  }

  onHotelNameChange(event) {
    this.setState({ hotelNames: event.target.value });
  }

  onHotelTelChange(event) {
    this.setState({ hotelTels: event.target.value });
  }

    onFacilityChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

    }

  render() {
    const name = `"name":"${this.state.name}"`;

    const point = `"point": {"lat":${
      this.state.mapClickedLocation.lat
    }, "lng":${this.state.mapClickedLocation.lng}}`;
    let description = '';
    if (this.state.description.length > 0) {
      description = `,"description": {"en":"${this.state.description}", "fr":"${
        this.state.description
      }"}`;
    }

    const hotelsList = this.state.hotelNames.split(',');
    const hotelsTels = this.state.hotelTels.split(',');

    const hotels = hotelsList.map((x, index) => {
      const tel = hotelsTels.length > index ? hotelsTels[index] : '';
      return `{"name": "${x.trim()}", "tel":"${tel.trim()}", "url":""}`;
    });

    let accommodations = '';
    if (this.state.hotelNames.length === 1) {
      accommodations = `,"accommodations": [${hotels[0]}]`;
    } else if (this.state.hotelNames.length > 1) {
      accommodations = `,"accommodations": [${hotels}]`;
    }

    const foodshop = this.state.foodshop ? `,"foodshop": true` : '';
    const restaurant = this.state.restaurant ? `,"restaurant": true` : '';
    const camping = this.state.camping ? `,"camping": true` : '';
      const gite = this.state.gite ? `,"gite": true` : '';
      const cabane = this.state.cabane ? `,"cabane": true` : '';
      const hotel = this.state.hotel ? `,"hotel": true` : '';

    return (
      <div className="row">
        <div className="col-12">
          <div className="gr10map">
            <Map
              google={this.props.google}
              zoom={12}
              onReady={this.onMapReady}
                        initialCenter={{ lat: 42.560067, lng: 2.000928 }}
              clickableIcons={true}
              onClick={this.handleOnMapClick}
            />
          </div>

          <p>
            {' '}
            The nearest point on the path is{' '}
            {this.state.pathClickedLocation.lat},{' '}
            {this.state.pathClickedLocation.lng} at{' '}
            {this.state.pathClickedLocation.pathMetre},
            {this.state.pathClickedLocation.info}
          </p>
          <p>
            name:{' '}
            <input
              type="text"
              value={this.state.name}
              onChange={this.onNameChange}
                    />
                    <label>
                        <input
                            type="checkbox"
                            name="hotel"
                            defaultChecked={this.state.hotel}
                            onChange={this.onFacilityChange}
                        />
                        Hotel
            </label>
                    <label>
                        <input
                            type="checkbox"
                            name="gite"
                            defaultChecked={this.state.gite}
                            onChange={this.onFacilityChange}
                        />
                        Gite
            </label>
                    <label>
                        <input
                            type="checkbox"
                            name="camping"
                            checked={this.state.camping}
                            onChange={this.onFacilityChange}
                        />
                        Camping
            </label>
                    <label>
                        <input
                            type="checkbox"
                            name="cabane"
                            defaultChecked={this.state.cabane}
                            onChange={this.onFacilityChange}
                        />
                        Cabane
            </label>



            <label>
              <input
                type="checkbox"
                name="foodshop"
                            checked={this.state.foodshop}
                            onChange={this.onFacilityChange}
              />
              Foodshop
            </label>{' '}
            <label>
              <input
                type="checkbox"
                name="restaurant"
                defaultChecked={this.state.restaurant}
                            onChange={this.onFacilityChange}
              />
              Restaurant
            </label>


                    
            <br />
            description:{' '}
            <input
                        type="text"
                        style={{width:'80%'}}
              value={this.state.description}
              onChange={this.onDescriptionChange}
            />
            <br />
            hotel name:(csv):
            <input
              type="text"
              style={{ width: '80%' }}
              value={this.state.hotelNames}
              onChange={this.onHotelNameChange}
            /><br/>
            tel:{' '}
            <input
                        type="text"
                        style={{ width: '80%' }}
              value={this.state.hotelTels}
              onChange={this.onHotelTelChange}
            />
            <br />
            {'{'}
            {name},
            {point}
            {description}
                    {accommodations}
                    {hotel}
                    {gite}
                    {camping}
                    {cabane}
            {foodshop}
            {restaurant}
            {'}'}
          </p>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCbTwcCRBzA9Qc5dT_aPYebyiprFlV1WVE',
  libraries: ['geometry'],
  language: 'en'
})(Gr10Map);
