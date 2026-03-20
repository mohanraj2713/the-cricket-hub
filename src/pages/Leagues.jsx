import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Trophy, Plus, Edit2, GripVertical, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leagues = () => {
  const { leagues, teams, addLeague, updateLeague } = useMockData();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  
  // Ordered array of team IDs for this league
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);

  // Available teams not yet in the league
  const availableTeams = teams.filter(t => !selectedTeamIds.includes(t.id));

  const handleOpenForm = (league = null) => {
    if (league) {
      setFormData({ name: league.name });
      setEditingId(league.id);
      setSelectedTeamIds(league.teams || []);
    } else {
      setFormData({ name: '' });
      setEditingId(null);
      setSelectedTeamIds([]);
    }
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setSelectedTeamIds([]);
  };

  const handleAddTeam = (e) => {
    const tid = e.target.value;
    if (tid && !selectedTeamIds.includes(tid)) {
      setSelectedTeamIds([...selectedTeamIds, tid]);
    }
    e.target.value = '';
  };

  const handleRemoveTeam = (tid) => {
    setSelectedTeamIds(selectedTeamIds.filter(id => id !== tid));
  };

  // Drag and Drop Logic
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;
    
    const newTeamIds = [...selectedTeamIds];
    const [movedId] = newTeamIds.splice(sourceIndex, 1);
    newTeamIds.splice(targetIndex, 0, movedId);
    
    setSelectedTeamIds(newTeamIds);
  };

  const handleSaveLeague = (e) => {
    e.preventDefault();
    if (editingId) {
      updateLeague(editingId, { name: formData.name, teams: selectedTeamIds });
    } else {
      addLeague({ name: formData.name, teams: selectedTeamIds });
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Leagues & Tournaments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create and manage leagues, arrange teams.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => handleOpenForm()} 
            className="flex items-center gap-2 px-4 py-2 bg-cricket-green text-white rounded-xl font-semibold shadow-sm hover:bg-cricket-green/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Create League
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Edit League' : 'Create New League'}
          </h2>
          
          <form onSubmit={handleSaveLeague} className="space-y-8 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">League Name <span className="text-red-500">*</span></label>
              <input 
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none text-lg font-bold"
                placeholder="E.g. Premier League 2026"
              />
            </div>

            <div className="p-5 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-700">
              <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cricket-green" /> Participating Teams ({selectedTeamIds.length})
              </h3>
              <p className="text-xs text-gray-500 mb-4 tracking-tight">Drag and drop teams to change their order or grouping priority.</p>
              
              <div className="space-y-2 mb-6 min-h-[50px]">
                {selectedTeamIds.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-center text-sm text-gray-500 dark:text-gray-400">
                    No teams added to this league yet.
                  </div>
                ) : (
                  selectedTeamIds.map((tid, index) => {
                    const t = teams.find(x => x.id === tid);
                    if (!t) return null;
                    return (
                      <div 
                        key={tid}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm cursor-grab active:cursor-grabbing hover:border-cricket-green/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          <div className="w-8 h-8 rounded-lg bg-cricket-green/10 text-cricket-green flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{t.name}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveTeam(tid)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-md transition-colors text-xs font-bold px-3">
                          Remove
                        </button>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                <select 
                  onChange={handleAddTeam} defaultValue=""
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                >
                  <option value="" disabled>Add a team to the league...</option>
                  {availableTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button type="submit" className="px-6 py-2 bg-cricket-green text-white rounded-xl font-semibold hover:bg-cricket-green/90 transition-colors">
                {editingId ? 'Save League Details' : 'Create League'}
              </button>
              <button type="button" onClick={handleCloseForm} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 border-dashed">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No leagues found. Create a new league to get started.</p>
            </div>
          ) : leagues.map(league => {
            const leagueTeams = (league.teams || []).map(tid => teams.find(t => t.id === tid)).filter(Boolean);
            return (
              <div key={league.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:border-cricket-green transition-all group relative cursor-default flex flex-col h-full">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenForm(league)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cricket-green/10 text-cricket-green rounded-xl">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{league.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{leagueTeams.length} Teams Participating</p>
                  </div>
                </div>

                <div className="flex-1 space-y-2 mb-6">
                  {leagueTeams.slice(0, 3).map((t, idx) => (
                    <div key={t.id} className="flex items-center gap-3 text-sm">
                       <span className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                       <span className="font-semibold text-gray-700 dark:text-gray-300">{t.name}</span>
                    </div>
                  ))}
                  {leagueTeams.length > 3 && (
                    <p className="text-xs text-gray-400 italic pl-8">...and {leagueTeams.length - 3} more</p>
                  )}
                  {leagueTeams.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No teams in this league</p>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/scoring', { state: { sourceInfo: { type: 'league', id: league.id } } })}
                  disabled={leagueTeams.length < 2}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-cricket-green text-white hover:bg-cricket-green/90 transition-colors disabled:opacity-50 tracking-wide"
                >
                  <Play className="w-4 h-4" /> Start League Match
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leagues;
