import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Trophy, Plus, Edit2, Play, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Series = () => {
  const { series, teams, addSeries, updateSeries } = useMockData();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', team1Id: '', team2Id: '', totalMatches: 3 });

  const handleOpenForm = (s = null) => {
    if (s) {
      setFormData({ name: s.name, team1Id: s.team1Id, team2Id: s.team2Id, totalMatches: s.totalMatches });
      setEditingId(s.id);
    } else {
      setFormData({ name: '', team1Id: '', team2Id: '', totalMatches: 3 });
      setEditingId(null);
    }
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSaveSeries = (e) => {
    e.preventDefault();
    if (formData.team1Id === formData.team2Id) {
      alert("Please select two different teams for the series.");
      return;
    }
    
    if (editingId) {
      updateSeries(editingId, formData);
    } else {
      addSeries({ ...formData, matchWins: { [formData.team1Id]: 0, [formData.team2Id]: 0 } });
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Series Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create head-to-head series between two teams.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => handleOpenForm()} 
            className="flex items-center gap-2 px-4 py-2 bg-cricket-green text-white rounded-xl font-semibold shadow-sm hover:bg-cricket-green/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Series
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Edit Series' : 'Create New Series'}
          </h2>
          
          <form onSubmit={handleSaveSeries} className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Series Name <span className="text-red-500">*</span></label>
              <input 
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                placeholder="E.g. The Ashes 2026"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team 1 <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.team1Id} onChange={e => setFormData({...formData, team1Id: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                >
                  <option value="" disabled>Select Team 1</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team 2 <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.team2Id} onChange={e => setFormData({...formData, team2Id: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                >
                  <option value="" disabled>Select Team 2</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Matches <span className="text-red-500">*</span></label>
              <select 
                required
                value={formData.totalMatches} onChange={e => setFormData({...formData, totalMatches: parseInt(e.target.value, 10)})}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
              >
                <option value={1}>1 Match</option>
                <option value={3}>Best of 3</option>
                <option value={5}>Best of 5</option>
                <option value={7}>Best of 7</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button type="submit" className="px-6 py-2 bg-cricket-green text-white rounded-xl font-semibold hover:bg-cricket-green/90 transition-colors">
                {editingId ? 'Save Series' : 'Create Series'}
              </button>
              <button type="button" onClick={handleCloseForm} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 border-dashed">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No series found. Create a head-to-head series to get started.</p>
            </div>
          ) : series.map(s => {
            const team1 = teams.find(t => t.id === s.team1Id);
            const team2 = teams.find(t => t.id === s.team2Id);
            const wins1 = s.matchWins?.[s.team1Id] || 0;
            const wins2 = s.matchWins?.[s.team2Id] || 0;
            const matchesPlayed = wins1 + wins2;
            
            return (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:border-cricket-green transition-all group relative cursor-default flex flex-col h-full">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenForm(s)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pr-10">{s.name}</h3>

                <div className="flex-1 flex flex-col gap-4 mb-6 relative">
                  {/* VS line */}
                  <div className="absolute left-[40px] top-4 bottom-4 w-px bg-gray-200 dark:bg-slate-700 -z-10 bg-dashed"></div>
                  
                  {/* Team 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cricket-green/10 text-cricket-green flex items-center justify-center font-black text-xl shrink-0">
                      {team1?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{team1?.name || 'Unknown Team'}</p>
                      <p className="text-xs text-gray-500">{wins1} Wins</p>
                    </div>
                    <div className="text-2xl font-black dark:text-white">
                      {wins1}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl shrink-0">
                      {team2?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{team2?.name || 'Unknown Team'}</p>
                      <p className="text-xs text-gray-500">{wins2} Wins</p>
                    </div>
                    <div className="text-2xl font-black dark:text-white">
                      {wins2}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mb-4 text-center">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Match {matchesPlayed + 1} of {s.totalMatches}
                  </p>
                  {matchesPlayed >= s.totalMatches && (
                     <p className="text-xs text-cricket-green font-bold uppercase mt-1">Series Complete</p>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/scoring', { state: { sourceInfo: { type: 'series', id: s.id } } })}
                  disabled={matchesPlayed >= s.totalMatches || !team1 || !team2}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-cricket-green text-white hover:bg-cricket-green/90 transition-colors disabled:opacity-50 tracking-wide"
                >
                  <Play className="w-4 h-4" /> Start Next Match
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Series;
