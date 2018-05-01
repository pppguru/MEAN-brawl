import React, { Component } from 'react';

class SearchCheckbox extends Component {
  state = {
    isChecked: false,
  }

  toggleCheckboxChange = e => {
    const { handleCheckboxChange, label } = this.props;
    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));
    handleCheckboxChange(e);
  }

  render() {
    const { label, name, val } = this.props;
    const { isChecked } = this.state;
    return (
      <li>
        <input
          type="checkbox"
          value={`${label}`}
          id={`${label}-${val}`}
          checked={isChecked}
          onChange={this.toggleCheckboxChange}
          name={name}
        />
        <label htmlFor={`${label}-${val}`}>
          {label}
        </label>
      </li>
    );
  }
}

export default SearchCheckbox;
