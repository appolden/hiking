import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import NavBar from './component/navbar.jsx';
import BivouacList from './component/bivouac-list.jsx';

import TrailsSummary from './component/trails-summary.jsx';
import TrailView from './component/trail-view.jsx';

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
          </div>
        </React.Fragment>
      </Router>
    );
  }
}

export default App;
