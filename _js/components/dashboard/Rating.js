import React from 'react';

const Rating = ({ stars = 0 }) => {
  const starsRated = [];
  for (let i = 0; i < 5; i += 1) {
		if(i < stars){
			starsRated.push(<li className="filled" key={i} />);
		}else{
			starsRated.push(<li key={i} />);
		}
  }
  return (
    <ul className="rating-display">
      {starsRated}
    </ul>
  );
};

export default Rating;
