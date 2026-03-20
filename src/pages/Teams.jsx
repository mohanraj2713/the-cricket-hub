import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Users, Plus, Edit2, Trash2, UserPlus, X } from 'lucide-react';

const Teams = () => {
  const { teams, players, addTeam, updateTeam, addPlayer, updatePlayer } = useMockData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  
  // Players assigned to the current team being edited/created
  const [assignedPlayerIds, setAssignedPlayerIds] = useState([]);
  
  // Inline new player form state
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', mobile: '', jerseyNumber: '' });

  const unassignedPlayers = players.filter(p => !p.teamId || p.teamId === '' || p.teamId === editingId || assignedPlayerIds.includes(p.id));
  const trulyUnassigned = players.filter(p => (!p.teamId || p.teamId === '') && !assignedPlayerIds.includes(p.id));

  const handleOpenForm = (team = null) => {
    if (team) {
      setFormData({ name: team.name });
      setEditingId(team.id);
      setAssignedPlayerIds(players.filter(p => p.teamId === team.id).map(p => p.id));
    } else {
      setFormData({ name: '' });
      setEditingId(null);
      setAssignedPlayerIds([]);
    }
    setShowNewPlayerForm(false);
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setAssignedPlayerIds([]);
  };

  const handleAssignPlayer = (e) => {
    const pid = e.target.value;
    if (pid && !assignedPlayerIds.includes(pid)) {
      setAssignedPlayerIds([...assignedPlayerIds, pid]);
    }
    e.target.value = ''; // reset select
  };

  const handleRemoveAssigned = (pid) => {
    setAssignedPlayerIds(assignedPlayerIds.filter(id => id !== pid));
    // If it was already saved in context to this team, we should remove it from context
    if (editingId) {
      updatePlayer(pid, { teamId: '' });
    }
  };

  const handleInlineCreatePlayer = (e) => {
    e.preventDefault();
    if (!newPlayer.name) return;
    
    // Create player immediately in context
    const newId = Date.now().toString() + Math.floor(Math.random() * 1000);
    const playerToSave = { ...newPlayer, id: newId, teamId: editingId || '' }; // Will assign properly on team save if new
    
    addPlayer(playerToSave);
    setAssignedPlayerIds([...assignedPlayerIds, newId]);
    
    // Reset inline form
    setNewPlayer({ name: '', mobile: '', jerseyNumber: '' });
    setShowNewPlayerForm(false);
  };

  const handleSaveTeam = (e) => {
    e.preventDefault();
    let finalTeamId = editingId;
    
    if (editingId) {
      updateTeam(editingId, { name: formData.name });
    } else {
      finalTeamId = Date.now().toString();
      addTeam({ id: finalTeamId, name: formData.name });
    }

    // Ensure all assigned players have this teamId
    assignedPlayerIds.forEach(pid => {
      const p = players.find(x => x.id === pid);
      if (p && p.teamId !== finalTeamId) {
        updatePlayer(pid, { teamId: finalTeamId });
      }
    });

    // Also strictly unassign players who were in the team but removed
    if (editingId) {
       const originalTeamPlayers = players.filter(p => p.teamId === editingId).map(p => p.id);
       originalTeamPlayers.forEach(pid => {
         if (!assignedPlayerIds.includes(pid)) {
           updatePlayer(pid, { teamId: '' });
         }
       });
    }

    handleCloseForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Teams Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create teams and assign players to them.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => handleOpenForm()} 
            className="flex items-center gap-2 px-4 py-2 bg-cricket-green text-white rounded-xl font-semibold shadow-sm hover:bg-cricket-green/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Team
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Edit Team' : 'Create New Team'}
          </h2>
          
          <form onSubmit={handleSaveTeam} className="space-y-8 max-w-2xl">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name <span className="text-red-500">*</span></label>
              <input 
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none text-lg font-bold"
                placeholder="E.g. Royal Challengers"
              />
            </div>

            {/* Players Assignment Section */}
            <div className="p-5 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cricket-green" /> Assigned Players ({assignedPlayerIds.length})
              </h3>
              
              <div className="space-y-3 mb-6">
                {assignedPlayerIds.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No players assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedPlayerIds.map(pid => {
                      const p = players.find(x => x.id === pid);
                      if (!p) return null;
                      return (
                        <div key={pid} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</p>
                            {p.jerseyNumber && <p className="text-xs text-gray-500">#{p.jerseyNumber}</p>}
                          </div>
                          <button type="button" onClick={() => handleRemoveAssigned(pid)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-md transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Add Players Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-slate-600">
                <div className="flex-1">
                  <select 
                    onChange={handleAssignPlayer} defaultValue=""
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                  >
                    <option value="" disabled>Select from unassigned players...</option>
                    {trulyUnassigned.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.jerseyNumber ? `(#${p.jerseyNumber})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center sm:text-left text-gray-400 font-medium py-2">OR</div>
                <button 
                  type="button" 
                  onClick={() => setShowNewPlayerForm(!showNewPlayerForm)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-100 dark:border-blue-900/30"
                >
                  <UserPlus className="w-4 h-4" /> Create New Player
                </button>
              </div>

              {/* Inline Player Form */}
              {showNewPlayerForm && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-inner">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Add Player</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" placeholder="Name *" required
                      value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-sm w-full outline-none focus:border-blue-500"
                    />
                    <input 
                      type="tel" placeholder="Mobile"
                      value={newPlayer.mobile} onChange={e => setNewPlayer({...newPlayer, mobile: e.target.value})}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-sm w-full outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                       <input 
                        type="text" placeholder="Jersey #"
                        value={newPlayer.jerseyNumber} onChange={e => setNewPlayer({...newPlayer, jerseyNumber: e.target.value})}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-sm w-full outline-none focus:border-blue-500"
                      />
                      <button type="button" onClick={handleInlineCreatePlayer} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700">Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button type="submit" className="px-6 py-2 bg-cricket-green text-white rounded-xl font-semibold hover:bg-cricket-green/90 transition-colors">
                {editingId ? 'Save Team Details' : 'Create Team'}
              </button>
              <button type="button" onClick={handleCloseForm} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 border-dashed">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No teams found. Create a new team to get started.</p>
            </div>
          ) : teams.map(team => {
            const teamPlayers = players.filter(p => p.teamId === team.id);
            return (
              <div key={team.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:border-cricket-green transition-all group relative cursor-default">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => handleOpenForm(team)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cricket-green/10 text-cricket-green flex items-center justify-center font-black text-xl">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{team.name}</h3>
                    <p className="text-sm text-gray-500">{teamPlayers.length} Players</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {teamPlayers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No players assigned</p>
                  ) : teamPlayers.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                      {p.jerseyNumber && <span className="text-xs text-gray-400">#{p.jerseyNumber}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Teams;
