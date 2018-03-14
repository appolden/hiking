import React, { Component } from 'react';

class UnitOfMeasurementSelector extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onUnitChange(e.target.value);
  }

  render() {
    return (
      <div>
        <label>
          <input
            type="radio"
            name="unit"
            value="metric"
            onChange={this.handleChange}
          />
          Metric
        </label>
        <label>
          <input
            type="radio"
            name="unit"
            value="imperial"
            onChange={this.handleChange}
          />
          Imperial
        </label>
      </div>
    );
  }
}

export default UnitOfMeasurementSelector;
