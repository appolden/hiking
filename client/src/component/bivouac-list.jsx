import React, { Component } from 'react';

class BivouacList extends Component {
  // Initialize state
  state = { bivvies: [] };

  // Fetch after first mount
  componentDidMount() {
    this.getBivvies();
  }

  getBivvies = () => {
    // Get the passwords and store them in state
    fetch('/data/bivouacs.json')
      .then(res => res.json())
      .then(bivvies => this.setState({ bivvies }));
  };

  render() {
    const bivvies = this.state.bivvies;

    const rowss = bivvies.map((bivvyLocation, index) => (
      <div className="row" key={index}>
        <div>
          <div className="col-md-12">
            <strong>
              {bivvyLocation.position} {bivvyLocation.location}
            </strong>
          </div>
          <div className="col-md-12">
            <p>{bivvyLocation.descriptionFR}</p>
            <p>{bivvyLocation.descriptionEN}</p>
          </div>
        </div>
      </div>
    ));

    return <React.Fragment>{rowss}</React.Fragment>;
  }
}

export default BivouacList;
