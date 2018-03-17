import React, { Component } from 'react';

class BivouacList extends Component {
  constructor(props) {
    super(props);
    this.state = { bivvies: [] };
  }

  // Fetch after first mount
  componentDidMount() {
    fetch('/data/bivouacs.json')
      .then(res => res.json())
      .then(bivvies => this.setState({ bivvies }));
  }

  render() {
    const bivvies = this.state.bivvies;

    const rowss = bivvies.map((bivvyLocation, index) => (
      <div className="row" key={bivvyLocation.position}>
        <div className="col-12">
          <h2>
            {bivvyLocation.position} {bivvyLocation.location}
          </h2>
        </div>
        <div className="col-12">
          <p>{bivvyLocation.descriptionFR}</p>
          <p>{bivvyLocation.descriptionEN}</p>
        </div>
      </div>
    ));

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12">
            <h1>GR10 Trail Notes</h1>
            <p>
              Thanks to{' '}
              <a href="http://www.gr10.fr/" title="GR10">
                www.gr10.fr
              </a>{' '}
              for the information. This page presents the same information in a
              more user friendly layout. It can easily be printed to PDF and
              accessed offline for those times when there is no cellphone
              coverage and you need to find the next camping spot. Also, a
              portion of the original French has been translated to English.
            </p>
          </div>
        </div>

        {rowss}
      </React.Fragment>
    );
  }
}

export default BivouacList;
