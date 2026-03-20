import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { UserCircle, Plus, Edit2, Trash2, Camera } from 'lucide-react';

const Players = () => {
  const { players, teams, addPlayer, updatePlayer } = useMockData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    teamId: '',
    jerseyNumber: '',
    photo: '' // base64 string
  });

  const handleOpenForm = (player = null) => {
    if (player) {
      setFormData(player);
      setEditingId(player.id);
    } else {
      setFormData({ name: '', mobile: '', teamId: '', jerseyNumber: '', photo: '' });
      setEditingId(null);
    }
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updatePlayer(editingId, formData);
    } else {
      addPlayer(formData);
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Players Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage roster and individual player details.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => handleOpenForm()} 
            className="flex items-center gap-2 px-4 py-2 bg-cricket-green text-white rounded-xl font-semibold shadow-sm hover:bg-cricket-green/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Player
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? 'Edit Player' : 'Add New Player'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-600">
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-12 h-12 text-gray-400" />
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-medium">
                  <Camera className="w-6 h-6 mb-1" /> Add
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="font-semibold text-gray-900 dark:text-white">Profile Photo</p>
                <p>Click the circle to upload a photo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                  placeholder="E.g. Virat Kohli"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                <input 
                  type="tel"
                  value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Team</label>
                <select 
                  value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jersey Number</label>
                <input 
                  type="text"
                  value={formData.jerseyNumber} onChange={e => setFormData({...formData, jerseyNumber: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cricket-green focus:border-transparent transition-all outline-none"
                  placeholder="E.g. 18"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button type="submit" className="px-6 py-2 bg-cricket-green text-white rounded-xl font-semibold hover:bg-cricket-green/90 transition-colors">
                {editingId ? 'Save Changes' : 'Create Player'}
              </button>
              <button type="button" onClick={handleCloseForm} className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {players.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 border-dashed">
              <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No players found. Create a new player to get started.</p>
            </div>
          ) : players.map(player => (
            <div key={player.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm hover:border-cricket-green transition-all group relative">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => handleOpenForm(player)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden mb-4 shadow-sm">
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">{player.name}</h3>
                {player.jerseyNumber && (
                   <span className="text-xs font-black bg-cricket-green/10 text-cricket-green px-2 py-0.5 rounded-full mb-2">#{player.jerseyNumber}</span>
                )}
                <div className="w-full mt-4 space-y-2 text-sm">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Mobile:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{player.mobile || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Team:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{teams.find(t=>t.id===player.teamId)?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Players;
