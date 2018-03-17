import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import NavBar from './component/navbar.jsx';
import BivouacList from './component/bivouac-list.jsx';

import TrailsSummary from './component/trails-summary.jsx';
import TrailView from './component/trail-view.jsx';

import Gr10Map from './component/gr10-map.jsx';
import EncodeGpx from './component/encode-gpx.jsx';

class PctTrail extends Component {
  render() {
    const pctCenter = { lat: 40.709819, lng: -119.696672 };
    return (
      <React.Fragment>
        <TrailView
          dataUrl="/data/pct.json"
          initialCenter={pctCenter}
          initialZoom={5}
        />
      </React.Fragment>
    );
  }
}

class HwpTrail extends Component {
  render() {
    const hwpCenter = { lat: 54.99029, lng: -2.511721 };
    return (
      <React.Fragment>
        <TrailView
          dataUrl="/data/hwp.json"
          initialCenter={hwpCenter}
          initialZoom={8}
        />
      </React.Fragment>
    );
  }
}

class Gr5Trail extends Component {
  render() {
    const gr5Center = { lat: 46.187732, lng: 6.78428 };
    return (
      <React.Fragment>
        <TrailView
          dataUrl="/data/gr5.json"
          initialCenter={gr5Center}
          initialZoom={10}
        />
      </React.Fragment>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
          <NavBar />
          <div className="container-fluid">
            <Route exact path="/" component={TrailsSummary} />
            <Route exact path="/trail/hadrianswallpath" component={HwpTrail} />
            <Route exact path="/trail/pacificcresttrail" component={PctTrail} />
            <Route exact path="/trail/gr5" component={Gr5Trail} />
            <Route path="/bivvy" component={BivouacList} />
            <Route path="/gr10" component={Gr10Map} />
            <Route path="/tools/encodegpx" component={EncodeGpx} />
            <div className="row">
              <div className="col-12">
                Icons made by{' '}
                <a
                  href="http://www.freepik.com"
                  title="Freepik"
                  rel="noopener noreferrer"
                >
                  Freepik
                </a>{' '}
                from{' '}
                <a
                  href="https://www.flaticon.com/"
                  title="Flaticon"
                  rel="noopener noreferrer"
                >
                  www.flaticon.com
                </a>{' '}
                is licensed by{' '}
                <a
                  href="http://creativecommons.org/licenses/by/3.0/"
                  title="Creative Commons BY 3.0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC 3.0 BY
                </a>
              </div>
            </div>
          </div>
        </React.Fragment>
      </Router>
    );
  }
}

export default App;
