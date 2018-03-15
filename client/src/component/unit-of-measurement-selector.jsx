import React, { Component } from 'react';

class UnitOfMeasurementSelector extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { selectedOption: this.props.unit };
  }

  handleChange(e) {
    this.setState({ selectedOption: e.target.value });
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
            checked={this.state.selectedOption === 'metric'}
          />
          Metric
        </label>
        <label>
          <input
            type="radio"
            name="unit"
            value="imperial"
            onChange={this.handleChange}
            checked={this.state.selectedOption === 'imperial'}
          />
          Imperial
        </label>
      </div>
    );
  }
}

export default UnitOfMeasurementSelector;
