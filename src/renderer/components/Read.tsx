// src/App.tsx
import { Provider } from 'react-redux';
import store from './store/store';
import { Container } from '@mui/material';
import SearchList from '../../../common/search-list';
import SearchStat from './ReadItem/search-stat';
import React from 'react';

const Home: React.FC = () => {
  return (
    <Provider store={store}>
      <Container maxWidth="md">
        <SearchList />
        <SearchStat />
      </Container>
    </Provider>
  );
};

export default Home;
