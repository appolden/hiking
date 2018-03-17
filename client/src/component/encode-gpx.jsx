import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react';

class EncodeGpx extends Component {
  constructor(props) {
    super(props);
    this.state = { encodedPath: '' };
    this.gpxFiles = [
      {
        url: '/data/gr10/gpx/gr10-1-hendaye.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-2-esterencuby.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-3-borce.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-4-cauterets.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-5-lac-de-loule.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-6-etang-daraing.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-7-etang-de-guzet.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-8-merens-les-vals.gpx'
      },
      {
        url: '/data/gr10/gpx/gr10-9-batere.gpx'
      }
    ];
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.google === undefined && nextProps.google !== undefined) {
      //google script have now loaded. Therfore it can now be used.
      this.retrieveAndEncodeGpx(nextProps.google, this.gpxFiles);
    }
    return true;
  }

  retrieveAndEncodeGpx(google, gpxFiles) {
    gpxFiles.forEach(gpxFile => {
      fetch(gpxFile.url)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(data => {
          const trkpts = Array.from(data.getElementsByTagName('trkpt'));
          const points = trkpts.map(trkpt => {
            const lat = parseFloat(trkpt.getAttribute('lat'));
            const lon = parseFloat(trkpt.getAttribute('lon'));
            return { lat: lat, lng: lon };
          });

          gpxFile.points = points;
          gpxFile.pointsExtracted = true;

          this.encodePathFromGpxExtraction(google, gpxFiles);
        });
    });
  }

  encodePathFromGpxExtraction(google, gpxFiles) {
    if (gpxFiles.every(gpxFile => gpxFile.pointsExtracted)) {
      const points = [].concat.apply([], gpxFiles.map(x => x.points));
      const polyLine = new google.maps.Polyline({
        path: points
      });

      const path = polyLine.getPath();
      const encodedPath = google.maps.geometry.encoding.encodePath(path);
      // console.log(encodedPath);
      this.setState({ encodedPath: encodedPath });
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col-12">
          <h2>Convert GPX file</h2>
          <p>Converts a GPX file to a google maps api encoded polyline</p>
        </div>
        <div className="row" />
        <div className="col-12">
          <textarea
            className="form-control"
            rows="15"
            value={this.state.encodedPath}
            style={{ fontSize: '0.75rem' }}
          />
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCbTwcCRBzA9Qc5dT_aPYebyiprFlV1WVE',
  libraries: ['geometry'],
  v: 3.2
})(EncodeGpx);
