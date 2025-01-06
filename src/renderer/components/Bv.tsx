// src/App.tsx
import { Provider } from 'react-redux';
import store from './store/store';
import { Container } from '@mui/material';
import BvList from '../../../common/bv-list';
import BvStat from './BvItem/bv-stat';
import React from 'react';

const Home: React.FC = () => {
  return (
    <Provider store={store}>
      <Container maxWidth="md">
        <BvList />
        <BvStat />
      </Container>
    </Provider>
  );
};

export default Home;
