import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ──────────────────── helpers ──────────────────── */
const calcSR   = (r, b) => b === 0 ? '0.0' : ((r / b) * 100).toFixed(1);
const calcEcon = (r, b) => b === 0 ? '0.00' : ((r / b) * 6).toFixed(2);
const overStr  = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;
const crr      = (runs, balls) => balls === 0 ? '0.00' : ((runs / balls) * 6).toFixed(2);
const rrr      = (target, runs, ballsLeft) =>
  ballsLeft <= 0 ? '0.00' : (((target - runs) / ballsLeft) * 6).toFixed(2);

const BALL_COLORS = {
  '0':  'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200',
  '1':  'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white',
  '2':  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  '3':  'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  '4':  'bg-cricket-green/20 text-cricket-green font-bold',
  '6':  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 font-bold',
  'W':  'bg-red-500 text-white font-bold',
  'WD': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
  'NB': 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400',
  'LB': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  'B':  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
};

const BallBadge = ({ event, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const isWicket = event.toString().includes('W');
  const color = isWicket ? BALL_COLORS['W'] : (BALL_COLORS[event] ?? BALL_COLORS['0']);
  return (
    <span className={`${sz} rounded-full flex items-center justify-center font-semibold ${color} transition-all`}>
      {event}
    </span>
  );
};

/* ──────────────────── localStorage ──────────────────── */
const STORAGE_KEY = 'cricscorer_live_v2';

const saveToStorage = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

const loadFromStorage = (configKey) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s?.configKey === configKey ? s : null;
  } catch { return null; }
};

/* ──────────────────── Dialogs ──────────────────── */
const SelectDialog = ({ title, players, onSelect, exclude = [] }) => (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{title}</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {players.filter(p => !exclude.includes(p.id)).map((p, i) => (
          <button key={p.id} onClick={() => onSelect(p)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cricket-green/10 dark:hover:bg-cricket-green/20 transition text-left">
            <span className="w-7 h-7 rounded-full bg-cricket-green text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* New batter dialog: type a name OR pick from remaining squad */
const NewBatterDialog = ({ players, onSelect, onTyped, title = "Next Batsman", placeholder = "Enter name…" }) => {
  const [name, setName] = useState('');
  const available = players ? players.filter(p => !p.dismissed && !p.onCrease && p.name.trim() !== '') : [];
  const handleAdd = () => { if (name.trim()) onTyped(name.trim()); };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{title}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Type a name or pick from squad</p>

        {/* Type name */}
        <div className="flex gap-2 mb-4">
          <input
            autoFocus
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green"
            placeholder={placeholder}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="px-4 py-2 bg-cricket-green text-white rounded-xl font-semibold text-sm shadow-md shadow-cricket-green/30 disabled:opacity-40 transition"
          >
            Add
          </button>
        </div>

        {/* Squad picker */}
        {available.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700" />
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2">Squad</p>
              <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700" />
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {available.map((p, i) => (
                <button key={p.id} onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-cricket-green/10 dark:hover:bg-cricket-green/20 transition text-left">
                  <span className="w-6 h-6 rounded-full bg-cricket-green text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ExtraRunsDialog = ({ type, onConfirm, onCancel }) => {
  const isLborB = type === 'LB' || type === 'B';
  const [runs, setRuns] = useState(isLborB ? 1 : 0);
  let label = '';
  if (type === 'WD') label = 'Wide';
  else if (type === 'NB') label = 'No Ball';
  else if (type === 'LB') label = 'Leg Bye';
  else if (type === 'B')  label = 'Bye';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{isLborB ? `${label} runs` : `${label} + Runs`}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{isLborB ? 'Select runs scored' : 'Select additional runs (e.g. overthrows or boundaries)'}</p>
        <div className="flex justify-center gap-2 mb-8">
          {(isLborB ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 6]).map(r => (
            <button key={r} onClick={() => setRuns(r)}
              className={`w-11 h-11 rounded-full font-black text-sm transition-all
                ${runs === r
                  ? 'bg-cricket-green text-white shadow-lg scale-110'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-transparent'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold transition hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
          <button onClick={() => onConfirm(runs)} className="flex-1 px-4 py-2.5 bg-cricket-green text-white rounded-xl font-semibold shadow-lg shadow-cricket-green/30 transition hover:bg-cricket-green/90">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const WicketDialog = ({ striker, nonStriker, onConfirm, onCancel }) => {
  const [howOut, setHowOut] = useState('Caught');
  const [outId, setOutId] = useState(striker?.id);
  const [runs, setRuns] = useState(0);
  const modes = ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Retired Hurt'];

  useEffect(() => {
    if (howOut !== 'Run Out') {
      setOutId(striker?.id);
      setRuns(0);
    }
  }, [howOut, striker]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-red-500 text-lg mb-1">Wicket!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select dismissal type</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {modes.map(m => (
            <button key={m} onClick={() => setHowOut(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                ${howOut === m ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          {howOut === 'Run Out' && (
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-red-200 dark:border-red-900/50">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Who is Out?</p>
              <div className="grid grid-cols-2 gap-3">
                {[striker, nonStriker].map(b => (
                  <button
                    key={b?.id}
                    onClick={() => setOutId(b?.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-2
                      ${outId === b?.id
                        ? 'bg-red-500 border-red-500 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {b?.name || 'Unknown'}
                    {b?.id === striker?.id ? ' (Str)' : ' (N-Str)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Runs completed on this ball</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map(r => (
                <button
                  key={r}
                  onClick={() => setRuns(r)}
                  className={`w-10 h-10 rounded-full font-bold transition-all
                    ${runs === r
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold">
            Cancel
          </button>
          <button onClick={() => onConfirm(howOut, outId, runs)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold shadow-md">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────── Scorecard ──────────────────── */
const Scorecard = ({ innings, label }) => {
  const { battingStats, bowlingStats, extras, totalRuns, totalWickets, balls } = innings;
  const batted = battingStats.filter(b => b.balls > 0 || b.dismissed || b.onCrease);
  const bowled = bowlingStats.filter(b => b.balls > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 flex items-center justify-between">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm">🏏 Batting — {label}</h4>
          <span className="font-bold text-gray-900 dark:text-white">{totalRuns}/{totalWickets} ({overStr(balls)} Ov)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-slate-700">
                <th className="text-left px-4 py-2 font-medium">Batter</th>
                <th className="px-3 py-2 font-medium">R</th>
                <th className="px-3 py-2 font-medium">B</th>
                <th className="px-3 py-2 font-medium">4s</th>
                <th className="px-3 py-2 font-medium">6s</th>
                <th className="px-3 py-2 font-medium">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {batted.map((b, i) => (
                <tr key={b.id ?? i} className={b.onCrease ? 'bg-cricket-green/5 dark:bg-cricket-green/10' : ''}>
                  <td className="px-4 py-2.5">
                    <p 
                      className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 cursor-pointer hover:underline"
                      onClick={() => setEditingName({ type: 'player', playerId: b.id, currentName: b.name })}
                    >
                      {b.onCrease && <span className="w-1.5 h-1.5 rounded-full bg-cricket-green inline-block mr-1" />}
                      {b.name || `Player ${i + 1}`}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {b.dismissed ? b.howOut : b.onCrease ? 'batting*' : 'yet to bat'}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-gray-900 dark:text-white">{b.runs}</td>
                  <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{b.balls}</td>
                  <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{b.fours}</td>
                  <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{b.sixes}</td>
                  <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{calcSR(b.runs, b.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
          <span>Extras: {extras.wides + extras.noBalls + extras.legByes + extras.byes}</span>
          <span>WD: {extras.wides}</span><span>NB: {extras.noBalls}</span>
          <span>LB: {extras.legByes}</span><span>B: {extras.byes}</span>
        </div>
      </div>

      {bowled.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">🎳 Bowling</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left px-4 py-2 font-medium">Bowler</th>
                  <th className="px-3 py-2 font-medium">O</th>
                  <th className="px-3 py-2 font-medium">R</th>
                  <th className="px-3 py-2 font-medium">W</th>
                  <th className="px-3 py-2 font-medium">Econ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {bowled.map((b, i) => (
                  <tr key={b.id ?? i} className={b.bowling ? 'bg-cricket-green/5 dark:bg-cricket-green/10' : ''}>
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        {b.bowling && <span className="w-1.5 h-1.5 rounded-full bg-cricket-green inline-block mr-1" />}
                        {b.name}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{overStr(b.balls)}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{b.runs}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-red-500">{b.wickets}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{calcEcon(b.runs, b.balls)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────── Over Summary ──────────────────── */
const OverSummary = ({ allBalls }) => {
  const overs = [];
  let cur = [];
  for (const ball of allBalls) {
    cur.push(ball);
    if (!ball.isWide && !ball.isNoBall) {
      if (cur.filter(b => !b.isWide && !b.isNoBall).length === 6) {
        overs.push([...cur]);
        cur = [];
      }
    }
  }
  if (cur.length) overs.push([...cur]);
  const displayOvers = [...overs].reverse().slice(0, 12);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Over Summary</h4>
      {displayOvers.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">No overs yet</p>
      )}
      <div className="space-y-2">
        {displayOvers.map((over, oi) => {
          const overIdx = overs.length - 1 - oi;
          const runsThisOver = over.reduce((s, b) => s + b.runs + (b.isWide ? 1 : 0) + (b.isNoBall ? 1 : 0), 0);
          const wickets = over.filter(b => b.isWicket).length;
          return (
            <div key={oi} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-6 text-right shrink-0">{overIdx + 1}</span>
              <div className="flex gap-1.5 flex-wrap">
                {over.map((b, bi) => <BallBadge key={bi} event={b.display} size="sm" />)}
              </div>
              <span className="ml-auto text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap shrink-0">
                {runsThisOver} runs{wickets > 0 ? `, ${wickets}W` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ──────────────────── Init innings ──────────────────── */
const initInnings = (battingPlayers, bowlingPlayers) => ({
  battingStats: battingPlayers.map(p => ({
    id: p.id, name: p.name, runs: 0, balls: 0, fours: 0, sixes: 0,
    dismissed: false, howOut: '', onCrease: false,
  })),
  bowlingStats: bowlingPlayers.map(p => ({
    id: p.id, name: p.name, runs: 0, balls: 0, wickets: 0,
    wides: 0, noBalls: 0, bowling: false,
  })),
  totalRuns: 0, totalWickets: 0, balls: 0,
  extras: { wides: 0, noBalls: 0, legByes: 0, byes: 0 },
  allBalls: [], overBalls: [],
  strikerId: null, nonStrikerId: null, bowlerId: null,
});

/* ──────────────────── Main Component ──────────────────── */
const LiveScoring = ({ config, onQuit }) => {
  const navigate = useNavigate();
  const { team1, team2, overs, battingFirst, players1, players2 } = config;
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [history, setHistory] = useState([]);
  const [editingName, setEditingName] = useState(null); // { type: 'team'|'player', id, currentName }
  const [extraPending, setExtraPending] = useState(null); // { type: 'WD'|'NB', additionalRuns: 0 }

  const batPl1   = battingFirst === 'team1' ? players1 : players2;
  const bowlPl1  = battingFirst === 'team1' ? players2 : players1;
  const batTeam1 = battingFirst === 'team1' ? team1 : team2;
  const bowlTeam1= battingFirst === 'team1' ? team2 : team1;

  const configKey = `${team1}|${team2}|${overs}|${battingFirst}`;

  // Restore saved state if config matches
  const [saved] = useState(() => loadFromStorage(configKey));

  const [innings,        setInnings]        = useState(saved?.innings        ?? (config.isManualTarget ? 2 : 1));
  const [inn1,           setInn1]           = useState(saved?.inn1           ?? initInnings(batPl1, bowlPl1));
  const [inn2,           setInn2]           = useState(saved?.inn2           ?? (config.isManualTarget ? initInnings(bowlPl1, batPl1) : null));
  const [activeTab,      setActiveTab]      = useState('live');
  const [needStriker,    setNeedStriker]    = useState(saved?.needStriker    ?? true);
  const [needNonStriker, setNeedNonStriker] = useState(saved?.needNonStriker ?? false);
  const [needBowler,     setNeedBowler]     = useState(saved?.needBowler     ?? false);
  const [newBatter,      setNewBatter]      = useState(saved?.newBatter      ?? false);
  const [wicketPending,  setWicketPending]  = useState(false);
  const [inningsOver,    setInningsOver]    = useState(saved?.inningsOver    ?? false);
  const [matchOver,      setMatchOver]      = useState(saved?.matchOver      ?? false);
  const [matchResult,    setMatchResult]    = useState(saved?.matchResult    ?? '');

  const currentInn    = innings === 1 ? inn1 : inn2;
  const setCurrentInn = innings === 1 ? setInn1 : setInn2;

  /* ── Derive UI values ── */
  const batTeamName  = innings === 1 ? batTeam1 : bowlTeam1;
  const bowlTeamName = innings === 1 ? bowlTeam1 : batTeam1;
  const target       = innings === 2 ? inn1.totalRuns + 1 : null;
  const totalBalls   = overs * 6;
  const ballsLeft    = totalBalls - (currentInn?.balls ?? 0);
  const currRuns     = currentInn?.totalRuns ?? 0;

  // Persist to localStorage on every relevant state change
  useEffect(() => {
    saveToStorage({
      config, configKey, innings, inn1, inn2,
      needStriker, needNonStriker, needBowler, newBatter,
      inningsOver, matchOver, matchResult, history
    });
  }, [innings, inn1, inn2, needStriker, needNonStriker, needBowler,
      newBatter, inningsOver, matchOver, matchResult, config, history]);

  const takeSnapshot = () => {
    const snapshot = {
      innings,
      inn1: JSON.parse(JSON.stringify(inn1)),
      inn2: JSON.parse(JSON.stringify(inn2)),
      needStriker, needNonStriker, needBowler, newBatter,
      inningsOver, matchOver
    };
    setHistory(prev => [...prev.slice(-10), snapshot]); // Keep last 10 balls
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    setInnings(last.innings);
    setInn1(last.inn1);
    setInn2(last.inn2);
    setNeedStriker(last.needStriker);
    setNeedNonStriker(last.needNonStriker);
    setNeedBowler(last.needBowler);
    setNewBatter(last.newBatter);
    setInningsOver(last.inningsOver);
    setMatchOver(last.matchOver);
    setMatchResult('');
  };

  const handleExtraRunsConfirm = (additionalRuns) => {
    if (!extraPending) return;
    const type = extraPending.type;
    const isWide = type === 'WD';
    const isNoBall = type === 'NB';
    const isLB = type === 'LB';
    const isByes = type === 'B';
    const display = (additionalRuns > 0 || isLB || isByes) 
      ? `${additionalRuns > 0 && !isWide && !isNoBall ? additionalRuns : (additionalRuns > 0 ? additionalRuns : '')}${type}` 
      : type;
    
    takeSnapshot();
    
    setCurrentInn(prev => {
      const battingStats = prev.battingStats.map(b => {
        if (b.id !== prev.strikerId) return b;
        return {
          ...b,
          // Runs on wide don't count for batter. Runs on NB DO count for batter. Runs on LB/B don't count.
          runs: b.runs + (isNoBall ? additionalRuns : 0),
          balls: isWide ? b.balls : b.balls + 1,
          fours: b.fours + (isNoBall && additionalRuns === 4 ? 1 : 0),
          sixes: b.sixes + (isNoBall && additionalRuns === 6 ? 1 : 0),
        };
      });

      const bowlingStats = prev.bowlingStats.map(b => {
        if (b.id !== prev.bowlerId) return b;
        return {
          ...b,
          balls: (isWide || isNoBall) ? b.balls : b.balls + 1,
          runs: b.runs + (isWide || isNoBall ? additionalRuns + 1 : 0), // LB/B do NOT count against bowler
          wides: b.wides + (isWide ? 1 : 0),
          noBalls: b.noBalls + (isNoBall ? 1 : 0),
        };
      });

      const extras = {
        ...prev.extras,
        wides: prev.extras.wides + (isWide ? (1 + additionalRuns) : 0),
        noBalls: prev.extras.noBalls + (isNoBall ? 1 : 0),
        legByes: (prev.extras.legByes || 0) + (isLB ? additionalRuns : 0),
        byes: (prev.extras.byes || 0) + (isByes ? additionalRuns : 0),
      };

      const totalRuns = prev.totalRuns + additionalRuns + (isWide || isNoBall ? 1 : 0);
      const isLegalBall = !isWide && !isNoBall;
      
      let strikerId = prev.strikerId;
      let nonStrikerId = prev.nonStrikerId;
      if (additionalRuns % 2 !== 0) {
        strikerId = prev.nonStrikerId;
        nonStrikerId = prev.strikerId;
      }

      const ballRec = { display, runs: additionalRuns + (isWide || isNoBall ? 1 : 0), isWicket: false, isWide, isNoBall };
      return {
        ...prev, totalRuns, 
        balls: isLegalBall ? prev.balls + 1 : prev.balls,
        battingStats, bowlingStats, extras, 
        strikerId, nonStrikerId,
        allBalls: [...prev.allBalls, ballRec],
        overBalls: [...prev.overBalls, ballRec],
      };
    });

    setExtraPending(null);
    setTimeout(() => {
      setCurrentInn(prev => { checkEndState(prev); return prev; });
    }, 30);
  };

  const handleSaveName = () => {
    if (!editingName) return;
    const { type, currentName } = editingName;
    if (type === 'team') {
      // Note: team names are in config but we need to update our local display names
      // Scoring.jsx saves config, so we might need a way to update it.
      // For now we update the match state specifically.
      if (editingName.teamKey === 'team1') {
        const key = battingFirst === 'team1' ? team1 : team2;
        // This is tricky because team names are passed as props. 
        // We'll just alert that team name editing is coming soon or 
        // handle it by updating the config if the parent allows.
        // For now, let's focus on players which is easier.
      }
    } else if (type === 'player') {
      const update = (inn) => ({
        ...inn,
        battingStats: inn.battingStats.map(b => b.id === editingName.playerId ? { ...b, name: currentName } : b),
        bowlingStats: inn.bowlingStats.map(b => b.id === editingName.playerId ? { ...b, name: currentName } : b),
      });
      setInn1(update);
      setInn2(update);
    }
    setEditingName(null);
  };

  const striker    = currentInn?.battingStats.find(b => b.id === currentInn.strikerId);
  const nonStriker = currentInn?.battingStats.find(b => b.id === currentInn.nonStrikerId);
  const bowler     = currentInn?.bowlingStats.find(b => b.id === currentInn.bowlerId);

  /* ── Batter / Bowler selectors ── */
  const handleSelectStriker = (p) => {
    setCurrentInn(prev => ({
      ...prev, strikerId: p.id,
      battingStats: prev.battingStats.map(b => b.id === p.id ? { ...b, onCrease: true } : b),
    }));
    setNeedStriker(false); setNeedNonStriker(true);
  };

  const handleSelectNonStriker = (p) => {
    setCurrentInn(prev => ({
      ...prev, nonStrikerId: p.id,
      battingStats: prev.battingStats.map(b => b.id === p.id ? { ...b, onCrease: true } : b),
    }));
    setNeedNonStriker(false); setNeedBowler(true);
  };

  const handleSelectBowler = (p) => {
    setCurrentInn(prev => ({
      ...prev, bowlerId: p.id,
      bowlingStats: prev.bowlingStats.map(b =>
        b.id === p.id ? { ...b, bowling: true } : { ...b, bowling: false }
      ),
    }));
    setNeedBowler(false);
  };

  /* ── New batter: from squad ── */
  const handleSelectNewBatter = (p) => {
    setCurrentInn(prev => {
      const isStrikerNull = prev.strikerId === null;
      return {
        ...prev,
        strikerId: isStrikerNull ? p.id : prev.strikerId,
        nonStrikerId: isStrikerNull ? prev.nonStrikerId : p.id,
        battingStats: prev.battingStats.map(b => b.id === p.id ? { ...b, onCrease: true } : b),
      };
    });
    setNewBatter(false);
  };

  /* ── New batter: typed name (not in squad) ── */
  const handleNewBatterTyped = (typedName) => {
    const newId = `dyn_${Date.now()}`;
    setCurrentInn(prev => {
      const isStrikerNull = prev.strikerId === null;
      const newBatterRec = { id: newId, name: typedName, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false, howOut: '', onCrease: true };
      return {
        ...prev,
        strikerId: isStrikerNull ? newId : prev.strikerId,
        nonStrikerId: isStrikerNull ? prev.nonStrikerId : newId,
        battingStats: [...prev.battingStats, newBatterRec],
      };
    });
    setNewBatter(false);
  };

  /* ── Wicket confirm ── */
  const handleWicketConfirm = (howOut, outId, wicketRuns) => {
    takeSnapshot();
    setCurrentInn(prev => {
      const isStrikerOut = outId === prev.strikerId;
      const isLegalBall = true; // Wickets are usually on legal balls

      // update score of striker before he gets out (or if he stays)
      const battingStats = prev.battingStats.map(b => {
        if (b.id === prev.strikerId) {
          return {
            ...b,
            runs: b.runs + wicketRuns,
            balls: b.balls + 1,
            onCrease: b.id === outId ? false : true,
            dismissed: b.id === outId ? true : false,
            howOut: b.id === outId ? `${howOut} b. ${bowler?.name || ''}` : '',
          };
        }
        if (b.id === prev.nonStrikerId) {
          return {
            ...b,
            onCrease: b.id === outId ? false : true,
            dismissed: b.id === outId ? true : false,
            howOut: b.id === outId ? `${howOut} b. ${bowler?.name || ''}` : '',
          };
        }
        return b;
      });

      // bowling stats
      const bowlingStats = prev.bowlingStats.map(b => {
        if (b.id !== prev.bowlerId) return b;
        return {
          ...b,
          balls: b.balls + 1,
          runs: b.runs + wicketRuns,
          wickets: ['Run Out', 'Retired Hurt', 'Hit Wicket'].includes(howOut) ? b.wickets : b.wickets + 1,
        };
      });

      // rotate strike if runs are odd
      let newStriker = isStrikerOut ? null : prev.strikerId;
      let newNonStriker = isStrikerOut ? prev.nonStrikerId : null;

      // if runs are scored, they might have swapped ends. 
      // but usually the next batsman just takes the vacant end.
      // let's keep it simple: the empty slot is filled by new batsman.

      const lastBall = { display: wicketRuns > 0 ? `${wicketRuns}W` : 'W', runs: wicketRuns, isWicket: true, isWide: false, isNoBall: false };

      return {
        ...prev,
        totalRuns: prev.totalRuns + wicketRuns,
        totalWickets: prev.totalWickets + 1,
        balls: prev.balls + 1,
        battingStats,
        bowlingStats,
        strikerId: newStriker,
        nonStrikerId: newNonStriker,
        allBalls: [...prev.allBalls, lastBall],
        overBalls: [...prev.overBalls, lastBall],
      };
    });
    setWicketPending(false);
    setNewBatter(true);

    // check end state after update
    setTimeout(() => {
      setCurrentInn(prev => { checkEndState(prev); return prev; });
    }, 50);
  };

  const saveMatchHistory = (res, i1, i2) => {
    try {
      let historyData = JSON.parse(localStorage.getItem('cricscorer_history') || '[]');
      if (!Array.isArray(historyData)) historyData = [];
      const newMatch = {
        id: Date.now(),
        team1: config.team1,
        team2: config.team2,
        date: new Date().toLocaleString(),
        result: res,
        inn1: i1,
        inn2: i2,
        config: config
      };
      localStorage.setItem('cricscorer_history', JSON.stringify([newMatch, ...historyData].slice(0, 20)));
    } catch (e) {
      console.error("Match save error", e);
    }
  };

  /* ── End of over / innings checks ── */
  const checkEndState = useCallback((updatedInn) => {
    const isAllOut = updatedInn.totalWickets >= (updatedInn.battingStats.length - 1);
    const allOversPlayed = updatedInn.balls >= totalBalls;
    const isChased = innings === 2 && target && updatedInn.totalRuns >= target;

    if (isChased) {
      const wleft = updatedInn.battingStats.filter(b => !b.dismissed && b.onCrease).length - 1 +
                    updatedInn.battingStats.filter(b => !b.dismissed && !b.onCrease).length;
      const res = `${batTeamName} won by ${Math.max(0, 10 - updatedInn.totalWickets)} wicket${(10 - updatedInn.totalWickets) !== 1 ? 's' : ''}!`;
      setMatchResult(res);
      setMatchOver(true);
      saveMatchHistory(res, inn1, updatedInn);
      return;
    }

    if (isAllOut || allOversPlayed) {
      if (innings === 1) {
        setInningsOver(true);
      } else {
        // 2nd innings ended without chasing
        let res = '';
        if (updatedInn.totalRuns < target - 1) {
          const runs = (target - 1) - updatedInn.totalRuns;
          res = `${bowlTeamName} won by ${runs} run${runs !== 1 ? 's' : ''}!`;
        } else {
          res = "Match Tied!";
        }
        setMatchResult(res);
        setMatchOver(true);
        saveMatchHistory(res, inn1, updatedInn);
      }
      return;
    }

    if (updatedInn.balls > 0 && updatedInn.balls % 6 === 0) {
      // End of over
      setCurrentInn(prev => ({
        ...prev,
        strikerId: prev.nonStrikerId,
        nonStrikerId: prev.strikerId,
        overBalls: [],
      }));
      setNeedBowler(true);
    }
  }, [innings, inn1, totalBalls, batTeamName, bowlTeamName, config, target]);

  /* ── Ball delivery ── */

  /* ── Ball delivery ── */
  const handleBall = (type) => {
    if (needStriker || needNonStriker || needBowler || newBatter || wicketPending || inningsOver || matchOver) return;
    takeSnapshot();

    let runs = 0, legalBall = true, isWicket = false, isWide = false, isNoBall = false;
    const display = type;

    if      (type === 'W')  { isWicket = true; }
    else if (type === 'WD') { setExtraPending({ type: 'WD' }); return; }
    else if (type === 'NB') { setExtraPending({ type: 'NB' }); return; }
    else if (type === 'LB') { setExtraPending({ type: 'LB' }); return; }
    else if (type === 'B')  { setExtraPending({ type: 'B'  }); return; }
    else                    { runs = parseInt(type); }

    setCurrentInn(prev => {
      const newBalls   = legalBall ? prev.balls + 1 : prev.balls;
      const overBalls  = [...prev.overBalls, { display, runs: isWicket ? 0 : runs, isWicket, isWide, isNoBall }];

      // Wicket logic is now handled in handleWicketConfirm entirely to support runs
      if (isWicket) return prev; 

      const battingStats = prev.battingStats.map(b => {
        if (b.id !== prev.strikerId) return b;
        if (isWide) return b;
        return {
          ...b,
          runs:  b.runs  + (type === 'LB' || type === 'B' ? 0 : runs),
          balls: legalBall ? b.balls + 1 : b.balls,
          fours: b.fours + (runs === 4 && type !== 'LB' && type !== 'B' && !isWide ? 1 : 0),
          sixes: b.sixes + (runs === 6 ? 1 : 0),
        };
      });

      const bowlingStats = prev.bowlingStats.map(b => {
        if (b.id !== prev.bowlerId) return b;
        return {
          ...b,
          balls:   legalBall ? b.balls + 1 : b.balls,
          runs:    b.runs + runs + (isWide ? 1 : 0) + (isNoBall ? 1 : 0),
          wides:   b.wides   + (isWide   ? 1 : 0),
          noBalls: b.noBalls + (isNoBall ? 1 : 0),
        };
      });

      const extras = {
        ...prev.extras,
        wides:   prev.extras.wides   + (isWide   ? 1 : 0),
        noBalls: prev.extras.noBalls + (isNoBall ? 1 : 0),
        legByes: prev.extras.legByes + (type === 'LB' ? 1 : 0),
        byes:    prev.extras.byes    + (type === 'B'  ? 1 : 0),
      };

      const extraRuns = (isWide ? 1 : 0) + (isNoBall ? 1 : 0);
      const totalRuns = prev.totalRuns + runs + extraRuns;

      // rotate strike on odd non-extra runs
      let strikerId    = prev.strikerId;
      let nonStrikerId = prev.nonStrikerId;
      if (!isWide && runs % 2 !== 0) {
        strikerId    = prev.nonStrikerId;
        nonStrikerId = prev.strikerId;
      }

      const allBalls = [...prev.allBalls, { display, runs, isWicket: false, isWide, isNoBall }];

      return {
        ...prev, totalRuns, balls: newBalls,
        battingStats, bowlingStats, extras, allBalls, overBalls,
        strikerId, nonStrikerId,
      };
    });

    if (type === 'W') {
      setWicketPending(true);
    } else {
      // check end state after update
      setTimeout(() => {
        setCurrentInn(prev => { checkEndState(prev); return prev; });
      }, 30);
    }
  };

  /* ── Second innings ── */
  const startInnings2 = () => {
    const bat2  = battingFirst === 'team1' ? players2 : players1;
    const bowl2 = battingFirst === 'team1' ? players1 : players2;
    setInn2(initInnings(bat2, bowl2));
    setInnings(2);
    setInningsOver(false);
    setNeedStriker(true);
  };

  /* ── New match ── */
  const handleNewMatch = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    navigate('/');
  };

  const tabs = [
    { id: 'live',      label: '🏏 Live'      },
    { id: 'scorecard', label: '📊 Scorecard' },
    { id: 'overs',     label: '📋 Overs'     },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-4 max-w-5xl mx-auto overflow-x-hidden">

      {editingName && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 text-center">Edit Player Name</h3>
            <input
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white mb-6 focus:ring-2 focus:ring-cricket-green focus:outline-none"
              value={editingName.currentName}
              onChange={e => setEditingName(prev => ({ ...prev, currentName: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingName(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveName}
                className="flex-1 px-4 py-2.5 bg-cricket-green text-white rounded-xl font-semibold shadow-lg shadow-cricket-green/30 hover:bg-cricket-green/90 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quit Match?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">This will clear the current match scoring session and return to setup. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold"
              >
                No, Keep Scoring
              </button>
              <button 
                onClick={onQuit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:bg-red-600 transition"
              >
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DIALOGS ── */}
      {needStriker && currentInn && (
        <NewBatterDialog
          title="Select Striker (Opening Bat)"
          placeholder="Enter striker name…"
          players={currentInn.battingStats.filter(b => !b.dismissed && !b.onCrease)}
          onSelect={handleSelectStriker}
          onTyped={(name) => {
            // Find first empty record or create new
            const emptyIdx = currentInn.battingStats.findIndex(p => !p.name.trim() && !p.onCrease);
            if (emptyIdx > -1) {
              const p = currentInn.battingStats[emptyIdx];
              setCurrentInn(prev => ({
                ...prev,
                battingStats: prev.battingStats.map(b => b.id === p.id ? { ...b, name } : b)
              }));
              handleSelectStriker({ ...p, name });
            } else {
              handleNewBatterTyped(name);
              setNeedStriker(false); setNeedNonStriker(true);
            }
          }}
        />
      )}
      {needNonStriker && currentInn && (
        <NewBatterDialog
          title="Select Non-Striker"
          placeholder="Enter non-striker name…"
          players={currentInn.battingStats.filter(b => !b.dismissed && !b.onCrease && b.id !== currentInn.strikerId)}
          onSelect={handleSelectNonStriker}
          onTyped={(name) => {
            const emptyIdx = currentInn.battingStats.findIndex(p => !p.name.trim() && !p.onCrease && p.id !== currentInn.strikerId);
            if (emptyIdx > -1) {
              const p = currentInn.battingStats[emptyIdx];
              setCurrentInn(prev => ({
                ...prev,
                battingStats: prev.battingStats.map(b => b.id === p.id ? { ...b, name } : b)
              }));
              handleSelectNonStriker({ ...p, name });
            } else {
              // Create new record
              const newId = `dyn_${Date.now()}`;
              setCurrentInn(prev => ({
                ...prev,
                nonStrikerId: newId,
                battingStats: [...prev.battingStats, { id: newId, name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false, howOut: '', onCrease: true }]
              }));
              setNeedNonStriker(false); setNeedBowler(true);
            }
          }}
        />
      )}
      {needBowler && currentInn && (
        <NewBatterDialog
          title={`Bowler — Over ${Math.floor((currentInn?.balls ?? 0) / 6) + 1}`}
          placeholder="Enter bowler name…"
          players={currentInn.bowlingStats}
          exclude={currentInn.bowlingStats.filter(b => b.id === currentInn.bowlerId).map(b => b.id)}
          onSelect={handleSelectBowler}
          onTyped={(name) => {
            // Find first empty record or create new
            const emptyIdx = currentInn.bowlingStats.findIndex(p => !p.name.trim());
            if (emptyIdx > -1) {
              const p = currentInn.bowlingStats[emptyIdx];
              setCurrentInn(prev => ({
                ...prev,
                bowlingStats: prev.bowlingStats.map(b => b.id === p.id ? { ...b, name } : b)
              }));
              handleSelectBowler({ ...p, name });
            } else {
              const newId = `bowl_${Date.now()}`;
              setCurrentInn(prev => ({
                ...prev,
                bowlerId: newId,
                bowlingStats: [...prev.bowlingStats, { id: newId, name, runs: 0, balls: 0, wickets: 0, wides: 0, noBalls: 0, bowling: true }]
              }));
              setNeedBowler(false);
            }
          }}
        />
      )}
      {newBatter && currentInn && !inningsOver && (
        <NewBatterDialog
          title="Next Batsman"
          placeholder="Enter batsman name…"
          players={currentInn.battingStats.filter(b => !b.dismissed && !b.onCrease && b.id !== currentInn.nonStrikerId)}
          onSelect={handleSelectNewBatter}
          onTyped={handleNewBatterTyped}
        />
      )}
      {extraPending && (
        <ExtraRunsDialog 
          type={extraPending.type}
          onConfirm={handleExtraRunsConfirm}
          onCancel={() => setExtraPending(null)}
        />
      )}
      {wicketPending && striker && (
        <WicketDialog
          striker={striker} nonStriker={nonStriker}
          onConfirm={handleWicketConfirm}
          onCancel={() => setWicketPending(false)}
        />
      )}

      {/* ── INNINGS OVER MODAL ── */}
      {inningsOver && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="text-5xl mb-4">🏏</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">1st Innings Over!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-1"><strong className="text-gray-900 dark:text-white">{batTeamName}</strong> scored</p>
            <p className="text-4xl font-black text-cricket-green mb-1">{currentInn?.totalRuns}/{currentInn?.totalWickets}</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">({overStr(currentInn?.balls ?? 0)} overs)</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Target for <strong>{bowlTeamName}</strong>: <span className="text-cricket-green font-black text-xl">{(currentInn?.totalRuns ?? 0) + 1}</span>
            </p>
            <button onClick={startInnings2}
              className="w-full py-3 bg-cricket-green text-white rounded-xl font-bold shadow-lg shadow-cricket-green/30 hover:bg-cricket-green/90 transition">
              Start 2nd Innings →
            </button>
          </div>
        </div>
      )}

      {/* ── MATCH OVER MODAL ── */}
      {matchOver && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Match Over!</h3>
            <p className="text-xl font-black text-cricket-green mb-6">{matchResult}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">1st Innings</p>
                <p className="font-bold text-gray-900 dark:text-white">{batTeam1}</p>
                <p className="text-cricket-green font-black text-lg">{inn1?.totalRuns}/{inn1?.totalWickets}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs">2nd Innings</p>
                <p className="font-bold text-gray-900 dark:text-white">{bowlTeam1}</p>
                <p className="text-cricket-green font-black text-lg">{inn2?.totalRuns}/{inn2?.totalWickets}</p>
              </div>
            </div>
            <button onClick={handleNewMatch}
              className="w-full py-3 bg-cricket-green text-white rounded-xl font-bold shadow-lg shadow-cricket-green/30 hover:bg-cricket-green/90 transition">
              🏏 New Match
            </button>
          </div>
        </div>
      )}

      {/* ── SCORE HEADER ── */}
      <div className="bg-gradient-to-br from-cricket-green to-emerald-700 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-0.5">
              {innings === 1 ? '1st' : '2nd'} Innings · {overs} Overs
            </p>
            <p 
              className="text-sm font-medium opacity-80 cursor-pointer hover:underline"
              onClick={() => setEditingName({ type: 'team', teamKey: battingFirst === 'team1' ? 'team1' : 'team2', currentName: batTeamName })}
            >
              {batTeamName} <span className="opacity-50">vs</span> {bowlTeamName}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {innings === 2 && target && (
              <div className="text-right bg-white/10 rounded-xl px-3 py-1.5">
                <p className="text-xs opacity-70">Target</p>
                <p className="font-black text-xl">{target}</p>
              </div>
            )}
            <button 
              onClick={() => setShowQuitConfirm(true)}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition text-white border border-white/20"
              title="Quit Match"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <span className="text-5xl font-black leading-none">{currentInn?.totalRuns ?? 0}</span>
            <span className="text-2xl font-bold opacity-60">/{currentInn?.totalWickets ?? 0}</span>
          </div>
          <div className="mb-1">
            <p className="text-sm font-semibold opacity-90">{overStr(currentInn?.balls ?? 0)} / {overs}.0 Ov</p>
            <p className="text-xs opacity-70">
              CRR: {crr(currentInn?.totalRuns ?? 0, currentInn?.balls ?? 0)}
              {innings === 2 && target && <span className="ml-3">NRR: {rrr(target, currRuns, ballsLeft)}</span>}
            </p>
          </div>
          {/* current over balls */}
          <div className="ml-auto flex gap-1.5 flex-wrap justify-end">
            {(currentInn?.overBalls ?? []).map((b, i) => (
              <BallBadge key={i} event={b.display} />
            ))}
            {Array.from({ length: Math.max(0, 6 - (currentInn?.overBalls ?? []).filter(b => !b.isWide && !b.isNoBall).length) }).map((_, i) => (
              <span key={`e-${i}`} className="w-9 h-9 rounded-full border-2 border-white/20" />
            ))}
          </div>
        </div>

        {striker && (
          <div className="mt-4 pt-4 border-t border-white/20">
            {innings === 2 && target && !matchOver && (
              <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-sm font-bold text-emerald-100">
                    Need <span className="text-white text-lg">{target - currRuns}</span> runs in <span className="text-white text-lg">{ballsLeft}</span> balls
                  </p>
                  <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Win Prediction</p>
                </div>
                {/* Win Prediction Bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                  {(() => {
                    const reqRR = target && ballsLeft > 0 ? ((target - currRuns) / ballsLeft) * 6 : 0;
                    const curRR = currRuns && (totalBalls - ballsLeft) > 0 ? (currRuns / (totalBalls - ballsLeft)) * 6 : 0;
                    // Simple prediction logic: if curRR >= reqRR, batter likely wins
                    let batterProb = 50;
                    if (reqRR > 0) {
                      const ratio = curRR / reqRR;
                      batterProb = Math.min(95, Math.max(5, 50 * ratio));
                    }
                    if (currRuns >= target) batterProb = 100;
                    if (ballsLeft === 0 && currRuns < target) batterProb = 0;
                    
                    return (
                      <>
                        <div style={{ width: `${batterProb}%` }} className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        <div style={{ width: `${100 - batterProb}%` }} className="h-full bg-black/30 transition-all duration-1000" />
                      </>
                    );
                  })()}
                </div>
                <div className="flex justify-between mt-1 text-[9px] font-bold opacity-60 uppercase tracking-tighter">
                  <span>{batTeamName}</span>
                  <span>{bowlTeamName}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs opacity-60 mb-0.5">🏏 {striker?.name} *</p>
                <p className="font-bold">{striker?.runs} <span className="text-sm opacity-70">({striker?.balls}b)</span></p>
              </div>
              {nonStriker && (
                <div>
                  <p className="text-xs opacity-60 mb-0.5">{nonStriker?.name}</p>
                  <p className="font-bold">{nonStriker?.runs} <span className="text-sm opacity-70">({nonStriker?.balls}b)</span></p>
                </div>
              )}
              {bowler && (
                <div className="col-span-2 border-t border-white/10 pt-2 mt-1">
                  <p className="text-xs opacity-60 mb-0.5">🎳 {bowler?.name}</p>
                  <p className="font-bold text-sm">{overStr(bowler?.balls ?? 0)}-{bowler?.runs}-{bowler?.wickets}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="flex bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-1 gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === t.id
                ? 'bg-cricket-green text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LIVE TAB ── */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Runs</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-5">
              <button 
                onClick={handleUndo}
                disabled={history.length === 0}
                className="h-14 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition disabled:opacity-30"
                title="Undo Last Ball"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
              {['0', '1', '2', '3', '4', '6'].map(r => (
                <button key={r} onClick={() => handleBall(r)}
                  className={`h-14 rounded-2xl font-black text-lg transition-all active:scale-95
                    ${r === '4' ? 'bg-cricket-green/15 text-cricket-green hover:bg-cricket-green/25 ring-2 ring-cricket-green/30' :
                      r === '6' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 ring-2 ring-yellow-400/30' :
                      'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}>
                  {r}
                </button>
              ))}
              <button onClick={() => handleBall('W')}
                className="h-14 rounded-2xl font-black text-lg bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95">
                W
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Extras</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Wide',   value: 'WD', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 ring-2 ring-orange-300/30' },
                { label: 'No Ball',value: 'NB', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 ring-2 ring-pink-300/30' },
                { label: 'Leg Bye',value: 'LB', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 ring-2 ring-purple-300/30' },
                { label: 'Bye',    value: 'B',  color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 ring-2 ring-indigo-300/30' },
              ].map(e => (
                <button key={e.value} onClick={() => handleBall(e.value)}
                  className={`h-14 rounded-2xl font-bold text-sm transition-all active:scale-95 ${e.color}`}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {innings === 2 && target && (
            <div className={`rounded-2xl p-4 border text-sm font-semibold
              ${currRuns >= target
                ? 'bg-cricket-green/10 border-cricket-green/30 text-cricket-green'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'}`}>
              {currRuns >= target
                ? `🎉 ${bowlTeamName} have won!`
                : `${target - currRuns} needed from ${ballsLeft} balls · RRR ${rrr(target, currRuns, ballsLeft)}`}
            </div>
          )}
        </div>
      )}

      {/* ── SCORECARD TAB ── */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {inn1 && inn1.balls > 0 && <Scorecard innings={inn1} label={batTeam1} />}
          {inn2 && inn2.balls > 0 && <Scorecard innings={inn2} label={bowlTeam1} />}
          {(!inn1 || inn1.balls === 0) && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">No balls played yet.</div>
          )}
        </div>
      )}

      {/* ── OVERS TAB ── */}
      {activeTab === 'overs' && (
        <div className="space-y-4">
          {innings === 2 && inn1 && (
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">1st Innings — {batTeam1}</p>
              <OverSummary allBalls={inn1.allBalls} />
            </div>
          )}
          <div>
            {innings === 2 && <p className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">2nd Innings — {bowlTeamName}</p>}
            {currentInn && <OverSummary allBalls={currentInn.allBalls} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoring;
