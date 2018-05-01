import React, { Component } from 'react';

class RadioButton extends Component {
  state = {
    isChecked: false,
  }

  toggleRadioChange = e => {
    const { handleRadioChange, label } = this.props;
    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));
    handleRadioChange(e);
  }

  render() {
    const { label, name, selected, handleChange } = this.props;
    const { isChecked } = this.state;
    return (
      <div className="new-field">
        <input
          type="radio"
          value={label}
          id={label}
          checked={isChecked}
          onChange={handleChange}
          name={name}
          checked={selected}
        />
        <label htmlFor={label}>
          {label}
        </label>
      </div>
    );
  }
}

export default RadioButton;
