import React from 'react';
import ReactDOM from 'react-dom';

import SearchContainer from '../../containers/search/SearchContainer';

const SearchPage = () => (
  <SearchContainer />
);

if (document.getElementById('search-page')) {
  ReactDOM.render(
    <SearchPage />,
    document.getElementById('search-page'),
  );
}
