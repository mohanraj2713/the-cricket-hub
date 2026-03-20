import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Scoring from './pages/Scoring';
import Players from './pages/Players';
import Teams from './pages/Teams';
import Leagues from './pages/Leagues';
import Series from './pages/Series';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="scoring" element={<Scoring />} />
          <Route path="players" element={<Players />} />
          <Route path="players/new" element={<Players />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/new" element={<Teams />} />
          <Route path="leagues" element={<Leagues />} />
          <Route path="leagues/new" element={<Leagues />} />
          <Route path="series" element={<Series />} />
          <Route path="series/new" element={<Series />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
