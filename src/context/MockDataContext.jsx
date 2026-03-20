import React, { createContext, useContext, useState } from 'react';

const MockDataContext = createContext({
  leagues: [],
  teams: [],
  players: [],
  matches: [],
  addLeague: () => {},
  addTeam: () => {},
  addPlayer: () => {},
  addMatch: () => {}
});

export const useMockData = () => useContext(MockDataContext);

export const MockDataProvider = ({ children }) => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  // Helper functions to add/update mock data
  const addLeague = (league) => setLeagues([...leagues, { ...league, id: Date.now().toString() }]);
  const addTeam = (team) => setTeams([...teams, { ...team, id: Date.now().toString() }]);
  const addPlayer = (player) => setPlayers([...players, { ...player, id: Date.now().toString() }]);
  const addMatch = (match) => setMatches([...matches, { ...match, id: Date.now().toString() }]);

  return (
    <MockDataContext.Provider value={{
      leagues, teams, players, matches,
      addLeague, addTeam, addPlayer, addMatch
    }}>
      {children}
    </MockDataContext.Provider>
  );
};
