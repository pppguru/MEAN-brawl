import React, { Component } from 'react';

class Checkbox extends Component {

  render() {
    const { label, name, validate, minCheck, maxCheck, validation, checked, handleCheckboxChange } = this.props;
    return (
      <div className="new-field">
        <input
          data-min={minCheck}
          data-max={maxCheck}
          onBlur={validate}
          data-validation={validation}
          type="checkbox"
          value={label}
          id={label}
          checked={checked}
          name={name}
          onChange={handleCheckboxChange}
        />
        <label htmlFor={label}>
          {label}
        </label>
      </div>
    );
  }
}

export default Checkbox;
