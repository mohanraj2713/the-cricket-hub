import React, { createContext, useContext, useState } from 'react';

const MockDataContext = createContext({
  leagues: [],
  teams: [],
  players: [],
  matches: [],
  series: [],
  addLeague: () => {},
  addTeam: () => {},
  addPlayer: () => {},
  addMatch: () => {},
  addSeries: () => {},
  updateLeague: () => {},
  updateTeam: () => {},
  updatePlayer: () => {},
  updateMatch: () => {},
  updateSeries: () => {}
});

export const useMockData = () => useContext(MockDataContext);

export const MockDataProvider = ({ children }) => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [series, setSeries] = useState([]);

  // Helper functions to add/update mock data
  const addLeague = (league) => setLeagues([...leagues, { ...league, id: Date.now().toString() }]);
  const addTeam = (team) => setTeams([...teams, { ...team, id: Date.now().toString() }]);
  const addPlayer = (player) => setPlayers([...players, { ...player, id: Date.now().toString() }]);
  const addMatch = (match) => setMatches([...matches, { ...match, id: Date.now().toString() }]);
  const addSeries = (s) => setSeries([...series, { ...s, id: Date.now().toString() }]);
  
  const updateLeague = (id, data) => setLeagues(leagues.map(l => l.id === id ? { ...l, ...data } : l));
  const updateTeam = (id, data) => setTeams(teams.map(t => t.id === id ? { ...t, ...data } : t));
  const updatePlayer = (id, data) => setPlayers(players.map(p => p.id === id ? { ...p, ...data } : p));
  const updateMatch = (id, data) => setMatches(matches.map(m => m.id === id ? { ...m, ...data } : m));
  const updateSeries = (id, data) => setSeries(series.map(s => s.id === id ? { ...s, ...data } : s));

  return (
    <MockDataContext.Provider value={{
      leagues, teams, players, matches, series,
      addLeague, addTeam, addPlayer, addMatch, addSeries,
      updateLeague, updateTeam, updatePlayer, updateMatch, updateSeries
    }}>
      {children}
    </MockDataContext.Provider>
  );
};
