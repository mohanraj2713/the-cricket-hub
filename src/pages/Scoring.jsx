import React, { useState } from 'react';
import { Trophy, Users, Activity, CheckCircle, ChevronRight, Plus, Trash2, RefreshCw } from 'lucide-react';
import LiveScoring from './LiveScoring';

const OVER_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

const defaultPlayers = (count = 11) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: '' }));

const steps = ['Teams & Overs', 'Toss & Batting Order', 'Playing XI'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center mb-8 gap-0">
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
              ${i < current ? 'bg-cricket-green text-white shadow-lg shadow-cricket-green/30' :
                i === current ? 'bg-cricket-green text-white ring-4 ring-cricket-green/20' :
                'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500'}`}
          >
            {i < current ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          <span className={`mt-1 text-xs font-medium whitespace-nowrap ${i === current ? 'text-cricket-green' : 'text-gray-400 dark:text-gray-500'}`}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`h-0.5 w-16 mb-4 transition-all ${i < current ? 'bg-cricket-green' : 'bg-gray-200 dark:bg-slate-700'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ---------- STEP 1 ----------
const Step1 = ({ data, onChange, onNext }) => {
  const valid = data.team1.trim() && data.team2.trim() && data.overs > 0;
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Team 1</h3>
          </div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Team Name</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition"
            placeholder="e.g. Mumbai Indians"
            value={data.team1}
            onChange={e => onChange('team1', e.target.value)}
          />
        </div>

        {/* Team 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Team 2</h3>
          </div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Team Name</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition"
            placeholder="e.g. Chennai Super Kings"
            value={data.team2}
            onChange={e => onChange('team2', e.target.value)}
          />
        </div>
      </div>

      {/* Overs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
            <Activity className="w-5 h-5 text-cricket-green" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Number of Overs</h3>
        </div>

        {/* Preset quick-select */}
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">Quick select</p>
        <div className="flex flex-wrap gap-3 mb-5">
          {OVER_OPTIONS.map(o => (
            <button
              key={o}
              onClick={() => onChange('overs', o)}
              className={`w-14 h-14 rounded-xl font-bold text-sm transition-all
                ${data.overs === o
                  ? 'bg-cricket-green text-white shadow-lg shadow-cricket-green/30 scale-110'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
            >
              {o}
            </button>
          ))}
        </div>

        {/* Manual / custom input */}
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">Or enter custom overs</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="100"
            value={data.overs === '' ? '' : data.overs}
            onChange={e => {
              const val = e.target.value;
              onChange('overs', val === '' ? '' : parseInt(val) || '');
            }}
            className="w-28 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            overs &nbsp;·&nbsp; <span className="font-semibold text-gray-800 dark:text-white">{(data.overs || 0) * 6}</span> balls total
          </span>
        </div>
      </div>

      {/* Manual Target Toggle */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Skip 1st Innings?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set target manually (e.g. 101)</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => onChange('isManualTarget', !data.isManualTarget)}
            className={`w-12 h-6 rounded-full transition-colors relative ${data.isManualTarget ? 'bg-cricket-green' : 'bg-gray-200 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${data.isManualTarget ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        {data.isManualTarget && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Target to reach (e.g. 101)</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white font-bold text-xl focus:ring-2 focus:ring-cricket-green focus:outline-none"
              placeholder="Enter Target"
              value={data.targetScore || ''}
              onChange={e => onChange('targetScore', parseInt(e.target.value) || 0)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          disabled={!valid}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-cricket-green text-white rounded-xl font-semibold shadow-lg shadow-cricket-green/30 hover:bg-cricket-green/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ---------- STEP 2 ----------
const Step2 = ({ data, onChange, onNext, onBack }) => {
  const { team1, team2, battingFirst, tossWinner, isManualTarget } = data;
  const valid = isManualTarget ? battingFirst : (battingFirst && tossWinner);

  const TeamCard = ({ teamKey, label, color }) => {
    const isSelected = tossWinner === teamKey;
    return (
      <button
        onClick={() => onChange('tossWinner', teamKey)}
        className={`flex-1 rounded-2xl p-5 border-2 text-left transition-all
          ${isSelected
            ? 'border-cricket-green bg-cricket-green/5 dark:bg-cricket-green/10'
            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cricket-green/50'
          }`}
      >
        <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center font-bold text-white ${color}`}>
          {label.charAt(0)}
        </div>
        <p className="font-semibold text-gray-900 dark:text-white truncate">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Won the toss</p>
        {isSelected && <CheckCircle className="w-5 h-5 text-cricket-green mt-2" />}
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toss winner - Hidden if Skipping 1st Innings */}
      {!isManualTarget && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Who won the toss?</h3>
          </div>
          <div className="flex gap-4">
            <TeamCard teamKey="team1" label={team1 || 'Team 1'} color="bg-blue-500" />
            <TeamCard teamKey="team2" label={team2 || 'Team 2'} color="bg-purple-500" />
          </div>
        </div>
      )}

      {/* Batting first or Chasing */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {isManualTarget ? 'Who is Chasing (Batting)?' : 'Who bats first?'}
          </h3>
        </div>
        <div className="flex gap-4">
          {[
            { key: 'team1', label: team1 || 'Team 1', color: 'bg-blue-500' },
            { key: 'team2', label: team2 || 'Team 2', color: 'bg-purple-500' },
          ].map(({ key, label, color }) => {
            const isChasingConfig = isManualTarget;
            const chasingTeam = battingFirst === 'team1' ? 'team2' : (battingFirst === 'team2' ? 'team1' : '');
            const isSelected = isChasingConfig ? chasingTeam === key : battingFirst === key;
            
            return (
              <button
                key={key}
                onClick={() => {
                  if (isChasingConfig) {
                    onChange('battingFirst', key === 'team1' ? 'team2' : 'team1');
                  } else {
                    onChange('battingFirst', key);
                  }
                }}
                className={`flex-1 rounded-2xl p-5 border-2 text-left transition-all
                  ${isSelected
                    ? 'border-cricket-green bg-cricket-green/5 dark:bg-cricket-green/10'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cricket-green/50'
                  }`}
              >
                <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center font-bold text-white ${color}`}>
                  {label.charAt(0)}
                </div>
                <p className="font-semibold text-gray-900 dark:text-white truncate">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isChasingConfig ? 'Chasing target' : 'Batting first'}
                </p>
                {isSelected && <CheckCircle className="w-5 h-5 text-cricket-green mt-2" />}
              </button>
            );
          })}
        </div>

        {battingFirst && !isManualTarget && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-sm text-gray-600 dark:text-gray-300">
            🏏 <strong className="text-gray-900 dark:text-white">{battingFirst === 'team1' ? team1 : team2}</strong> will bat first &nbsp;·&nbsp;
            🎳 <strong className="text-gray-900 dark:text-white">{battingFirst === 'team1' ? team2 : team1}</strong> will bowl first
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition">
          Back
        </button>
        <button
          disabled={!valid}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-cricket-green text-white rounded-xl font-semibold shadow-lg shadow-cricket-green/30 hover:bg-cricket-green/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ---------- STEP 3 ----------
const PlayerInput = ({ index, player, onChange, onRemove, canRemove }) => (
  <div className="flex items-center gap-3">
    <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-bold flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
      {index + 1}
    </span>
    <input
      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition"
      placeholder={`Player ${index + 1} name`}
      value={player.name}
      onChange={e => onChange(player.id, e.target.value)}
    />
    {canRemove && (
      <button onClick={() => onRemove(player.id)} className="p-2 text-red-400 hover:text-red-600 transition">
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
);

const Step3 = ({ data, onChange, onBack, onStart }) => {
  const { team1, team2, battingFirst, players1, players2 } = data;

  const handlePlayerChange = (teamKey, id, value) => {
    const key = teamKey === 'team1' ? 'players1' : 'players2';
    onChange(key, data[key].map(p => p.id === id ? { ...p, name: value } : p));
  };

  const addPlayer = (teamKey) => {
    const key = teamKey === 'team1' ? 'players1' : 'players2';
    const list = data[key];
    onChange(key, [...list, { id: Date.now(), name: '' }]);
  };

  const removePlayer = (teamKey, id) => {
    const key = teamKey === 'team1' ? 'players1' : 'players2';
    onChange(key, data[key].filter(p => p.id !== id));
  };

  const allFilled = (list) => list.length >= 11 && list.every(p => p.name.trim());
  const valid = allFilled(players1) && allFilled(players2);

  const TeamPlayers = ({ teamKey, title, color }) => {
    const list = teamKey === 'team1' ? players1 : players2;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${color} rounded-lg`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {teamKey === battingFirst ? '🏏 Batting First' : '🎳 Bowling First'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onChange(teamKey === 'team1' ? 'players1' : 'players2', defaultPlayers(11))}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            title="Reset players"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2.5">
          {list.map((player, i) => (
            <PlayerInput
              key={player.id}
              index={i}
              player={player}
              onChange={(id, val) => handlePlayerChange(teamKey, id, val)}
              onRemove={(id) => removePlayer(teamKey, id)}
              canRemove={list.length > 11}
            />
          ))}
        </div>
        {list.length < 15 && (
          <button
            onClick={() => addPlayer(teamKey)}
            className="mt-3 flex items-center gap-2 text-sm text-cricket-green hover:text-cricket-green/80 font-medium transition"
          >
            <Plus className="w-4 h-4" /> Add player
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamPlayers teamKey="team1" title={team1 || 'Team 1'} color="bg-blue-50 dark:bg-blue-500/10 text-blue-500" />
        <TeamPlayers teamKey="team2" title={team2 || 'Team 2'} color="bg-purple-50 dark:bg-purple-500/10 text-purple-500" />
      </div>

      {!valid && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          ⚠️ Please enter names for all 11 players in each team before starting.
        </p>
      )}

      <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition">
          Back
        </button>
        <div className="flex gap-3">
          {!valid && (
            <button
              onClick={onStart}
              className="px-6 py-2.5 rounded-xl border-2 border-cricket-green text-cricket-green font-bold hover:bg-cricket-green hover:text-white transition"
            >
              Skip & Start 🏏
            </button>
          )}
          <button
            disabled={!valid}
            onClick={onStart}
            className={`flex items-center gap-2 px-8 py-2.5 bg-cricket-green text-white rounded-xl font-bold shadow-lg shadow-cricket-green/30 hover:bg-cricket-green/90 transition ${!valid ? 'opacity-50 grayscale' : ''}`}
          >
            Start Match 🏏
          </button>
        </div>
      </div>
    </div>
  );
};

const STORAGE_KEY = 'cricscorer_live_v2';

// ---------- MAIN ----------
const Scoring = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    team1: '',
    team2: '',
    overs: 20,
    tossWinner: '',
    battingFirst: '',
    players1: defaultPlayers(11),
    players2: defaultPlayers(11),
    isManualTarget: false,
    targetScore: 0,
  });
  const [matchStarted, setMatchStarted] = useState(false);

  // Auto-resume logic
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.configKey && !parsed.matchOver) {
          if (parsed.config) {
            setForm(parsed.config);
            // Wait for form to be set or use functional update if needed,
            // but for matchStarted we can just set it true.
            // Actually, LiveScoring will read from localStorage itself if we want,
            // but it's better if everything is synced.
            setMatchStarted(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
  }, []);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleStart = () => {
    // Save config into the storage so auto-resume works fully
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...parsed,
        config: form,
        configKey: `${form.team1}|${form.team2}|${form.overs}|${form.battingFirst}`,
        // If manual target, we initialize inn1 as completed
        innings: form.isManualTarget ? 2 : (parsed.innings || 1),
        inn1: form.isManualTarget ? { totalRuns: form.targetScore - 1, totalWickets: 10, balls: form.overs * 6, overBalls: [], allBalls: [], battingStats: [], bowlingStats: [], extras: { wides: 0, noBalls: 0, legByes: 0, byes: 0 } } : parsed.inn1
      }));
    } catch (e) {}
    setMatchStarted(true);
  };

  const handleQuit = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    setMatchStarted(false);
    setStep(0); // Optional: go back to the first step
  };

  if (matchStarted) {
    return <LiveScoring config={form} onQuit={handleQuit} />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start a New Match</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Set up the match details to begin live scoring.</p>
      </div>

      <StepIndicator current={step} />

      {step === 0 && <Step1 data={form} onChange={handleChange} onNext={() => setStep(1)} />}
      {step === 1 && <Step2 data={form} onChange={handleChange} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <Step3 data={form} onChange={handleChange} onBack={() => setStep(1)} onStart={handleStart} />}
    </div>
  );
};

export default Scoring;
