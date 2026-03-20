import React from 'react';
import { useMockData } from '../context/MockDataContext';
import { Trophy, Users, UserCircle, Activity, Share2, Copy, Check, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const QuickAction = ({ title, desc, icon: Icon, to }) => (
  <Link to={to} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:border-cricket-green transition-all hover:-translate-y-1 block">
    <div className="flex items-center mb-4">
      <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg group-hover:bg-cricket-green/10 transition-colors">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-cricket-green" />
      </div>
      <h3 className="ml-3 font-semibold text-gray-900 dark:text-white group-hover:text-cricket-green transition-colors">{title}</h3>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
  </Link>
);

const overStr = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;
const calcSR = (r, b) => b > 0 ? ((r / b) * 100).toFixed(1) : '0.0';
const calcEcon = (r, b) => b > 0 ? (r / (b / 6)).toFixed(1) : '0.0';

const buildShareText = (m) => {
  if (!m) return '';

  const pad = (s, n) => String(s).padEnd(n);
  const rpad = (s, n) => String(s).padStart(n);

  const inningsBlock = (inn, teamName) => {
    if (!inn) return [];
    const { battingStats = [], bowlingStats = [], extras = {}, totalRuns = 0, totalWickets = 0, balls = 0, allBalls = [] } = inn;
    const lines = [];

    // ── Header ──
    lines.push(`${teamName}: ${totalRuns}/${totalWickets} (${overStr(balls)} Ov)`);
    lines.push('─'.repeat(36));

    // ── Batting ──
    lines.push('BATTING');
    lines.push(`${'Batter'.padEnd(16)} ${'R'.padStart(3)} ${'B'.padStart(3)} ${'4s'.padStart(3)} ${'6s'.padStart(3)} ${'SR'.padStart(6)}`);
    const batted = battingStats.filter(b => b.balls > 0 || b.dismissed);
    batted.forEach(b => {
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '-';
      const name = b.name.length > 14 ? b.name.slice(0, 13) + '.' : b.name;
      const status = b.dismissed ? b.howOut : 'not out';
      lines.push(`${pad(name, 16)} ${rpad(b.runs, 3)} ${rpad(b.balls, 3)} ${rpad(b.fours, 3)} ${rpad(b.sixes, 3)} ${rpad(sr, 6)}`);
      lines.push(`  └ ${status}`);
    });
    const ex = extras;
    const extTotal = (ex.wides || 0) + (ex.noBalls || 0) + (ex.legByes || 0) + (ex.byes || 0);
    lines.push(`Extras: ${extTotal} (WD:${ex.wides || 0} NB:${ex.noBalls || 0} LB:${ex.legByes || 0} B:${ex.byes || 0})`);
    lines.push('');

    // ── Bowling ──
    const bowled = bowlingStats.filter(b => b.balls > 0);
    if (bowled.length > 0) {
      lines.push('BOWLING');
      lines.push(`${'Bowler'.padEnd(16)} ${'O'.padStart(5)} ${'R'.padStart(3)} ${'W'.padStart(3)} ${'Econ'.padStart(6)}`);
      bowled.forEach(b => {
        const econ = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(1) : '-';
        const name = b.name.length > 14 ? b.name.slice(0, 13) + '.' : b.name;
        lines.push(`${pad(name, 16)} ${rpad(overStr(b.balls), 5)} ${rpad(b.runs, 3)} ${rpad(b.wickets, 3)} ${rpad(econ, 6)}`);
      });
      lines.push('');
    }

    // ── Over Summary ──
    if (allBalls.length > 0) {
      lines.push('OVER SUMMARY');
      const overs = [];
      let cur = [];
      for (const ball of allBalls) {
        cur.push(ball);
        const legalCount = cur.filter(b => !b.isWide && !b.isNoBall).length;
        if (legalCount === 6) { overs.push([...cur]); cur = []; }
      }
      if (cur.length) overs.push([...cur]);
      overs.forEach((over, oi) => {
        const runsThisOver = over.reduce((s, b) => s + (b.runs || 0), 0);
        const wkts = over.filter(b => b.isWicket).length;
        const balls = over.map(b => b.display).join(' ');
        lines.push(`Ov ${oi + 1}: ${balls.padEnd(22)} [${runsThisOver}R${wkts ? ` ${wkts}W` : ''}]`);
      });
      lines.push('');
    }

    // ── Fall of Wickets ──
    const fow = [];
    let runningRuns = 0;
    let wicketCount = 0;
    for (const ball of allBalls) {
      runningRuns += ball.runs || 0;
      if (ball.isWicket) {
        wicketCount++;
        fow.push(`${wicketCount}-${runningRuns}`);
      }
    }
    if (fow.length > 0) {
      lines.push(`FALL OF WICKETS: ${fow.join(', ')}`);
      lines.push('');
    }

    return lines;
  };

  const inn1Team = m.config?.battingFirst === 'team1' ? m.team1 : m.team2;
  const inn2Team = m.config?.battingFirst === 'team1' ? m.team2 : m.team1;

  const all = [
    `🏏 MATCH SCORECARD`,
    `📅 ${m.date}`,
    `${m.team1} vs ${m.team2}`,
    ``,
    `━━━ 1st INNINGS ━━━`,
    ...inningsBlock(m.inn1, inn1Team),
    `━━━ 2nd INNINGS ━━━`,
    ...inningsBlock(m.inn2, inn2Team),
    `🏆 RESULT: ${m.result}`,
    ``,
    `#Cricket #CricketScorer`,
  ];
  return all.join('\n');
};

const generatePDF = (m) => {
  if (!m) return;
  const ov = (b) => `${Math.floor(b / 6)}.${b % 6}`;
  const sr = (r, b) => b > 0 ? ((r / b) * 100).toFixed(2) : '0.00';
  const econ = (r, b) => b > 0 ? (r / (b / 6)).toFixed(2) : '0.00';

  const inn1Team = m.config?.battingFirst === 'team1' ? m.team1 : m.team2;
  const inn2Team = m.config?.battingFirst === 'team1' ? m.team2 : m.team1;

  const battingRows = (inn, teamName) => {
    if (!inn) return '';
    const { battingStats = [], extras = {}, totalRuns = 0, totalWickets = 0, balls = 0 } = inn;
    const batted = battingStats.filter(b => b.balls > 0 || b.dismissed);
    const ex = extras;
    const extTotal = (ex.wides || 0) + (ex.noBalls || 0) + (ex.legByes || 0) + (ex.byes || 0);
    const rows = batted.map(b => `
      <tr>
        <td style="padding:3px 6px">
          <div style="font-weight:600">${b.name}</div>
          <div style="font-size:10px;color:#555">${b.dismissed ? b.howOut : 'not out'}</div>
        </td>
        <td style="text-align:center;padding:3px 4px">${b.runs}</td>
        <td style="text-align:center;padding:3px 4px">${b.balls}</td>
        <td style="text-align:center;padding:3px 4px">${b.fours}</td>
        <td style="text-align:center;padding:3px 4px">${b.sixes}</td>
        <td style="text-align:right;padding:3px 6px">${sr(b.runs, b.balls)}</td>
      </tr>`).join('');
    return `
      <tr style="background:#4a7c59;color:#fff;font-weight:bold">
        <td style="padding:5px 6px">${teamName}</td>
        <td colspan="4"></td>
        <td style="text-align:right;padding:5px 6px">${totalRuns}-${totalWickets} (${ov(balls)})</td>
      </tr>
      <tr style="background:#e8f5e9;font-size:10px;font-weight:bold;color:#333">
        <td style="padding:3px 6px">Batsman</td>
        <td style="text-align:center;padding:3px 4px">R</td>
        <td style="text-align:center;padding:3px 4px">B</td>
        <td style="text-align:center;padding:3px 4px">4s</td>
        <td style="text-align:center;padding:3px 4px">6s</td>
        <td style="text-align:right;padding:3px 6px">SR</td>
      </tr>
      ${rows}
      <tr style="border-top:1px solid #ccc">
        <td style="padding:3px 6px;font-weight:600">Extras</td>
        <td colspan="5" style="text-align:right;padding:3px 6px;font-size:11px">
          (${extTotal}) ${ex.byes || 0} B, ${ex.legByes || 0} LB, ${ex.wides || 0} WD, ${ex.noBalls || 0} NB, 0 P
        </td>
      </tr>
      <tr style="border-top:1px solid #ccc;background:#f5f5f5">
        <td style="padding:3px 6px;font-weight:700">Total</td>
        <td colspan="5" style="text-align:right;padding:3px 6px;font-weight:700">
          ${totalRuns}-${totalWickets} (${ov(balls)}) ${econ(totalRuns, balls)}
        </td>
      </tr>`;
  };

  const bowlingRows = (inn) => {
    if (!inn) return '';
    const bowled = (inn.bowlingStats || []).filter(b => b.balls > 0);
    if (!bowled.length) return '';
    const rows = bowled.map((b, i) => `
      <tr style="${i % 2 === 1 ? 'background:#f9f9f9' : ''}">
        <td style="padding:3px 6px">${b.name}</td>
        <td style="text-align:center;padding:3px 4px">${ov(b.balls)}</td>
        <td style="text-align:center;padding:3px 4px">0</td>
        <td style="text-align:center;padding:3px 4px">${b.runs}</td>
        <td style="text-align:center;padding:3px 4px">${b.wickets}</td>
        <td style="text-align:right;padding:3px 6px">${econ(b.runs, b.balls)}</td>
      </tr>`).join('');
    return `
      <tr style="background:#4a7c59;color:#fff;font-weight:bold">
        <td style="padding:5px 6px">Bowler</td>
        <td style="text-align:center;padding:5px 4px">O</td>
        <td style="text-align:center;padding:5px 4px">M</td>
        <td style="text-align:center;padding:5px 4px">R</td>
        <td style="text-align:center;padding:5px 4px">W</td>
        <td style="text-align:right;padding:5px 6px">ER</td>
      </tr>
      ${rows}`;
  };

  const fowRows = (inn) => {
    if (!inn || !inn.allBalls?.length) return '';
    const fow = [];
    let runs = 0; let wkts = 0; let legal = 0;
    for (const ball of inn.allBalls) {
      runs += ball.runs || 0;
      if (!ball.isWide && !ball.isNoBall) legal++;
      if (ball.isWicket) {
        wkts++;
        const dismissed = (inn.battingStats || []).find(b => b.dismissed);
        const name = dismissed?.name || `Wicket ${wkts}`;
        fow.push({ name, score: `${runs}/${wkts}`, over: ov(legal) });
      }
    }
    if (!fow.length) return '';
    const rows = fow.map(f => `
      <tr>
        <td style="padding:3px 6px">${f.name}</td>
        <td style="text-align:center;padding:3px 4px">${f.score}</td>
        <td style="text-align:right;padding:3px 6px">${f.over}</td>
      </tr>`).join('');
    return `
      <tr style="background:#4a7c59;color:#fff;font-weight:bold">
        <td style="padding:5px 6px">Fall of wickets</td>
        <td style="text-align:center;padding:5px 4px">Score</td>
        <td style="text-align:right;padding:5px 6px">Over</td>
      </tr>
      ${rows}`;
  };

  const tossText = m.config
    ? `${m.config.battingFirst === 'team1' ? m.team1 : m.team2} won the toss and opted to Bat first.`
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${m.team1} v/s ${m.team2} - Scorecard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 20px; }
  h1 { font-size: 18px; text-align: center; font-weight: bold; margin-bottom: 4px; }
  .toss { font-size: 11px; color: #444; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  td { border: none; font-size: 12px; }
  tr { border-bottom: 1px solid #e8e8e8; }
  @media print { body { padding: 8px; } }
</style>
</head><body>
  <h1>${m.team1} v/s ${m.team2}</h1>
  <div class="toss">${tossText}</div>
  <table>
    ${battingRows(m.inn1, inn1Team)}
    ${bowlingRows(m.inn1)}
    ${fowRows(m.inn1)}
  </table>
  <br/>
  <table>
    ${battingRows(m.inn2, inn2Team)}
    ${bowlingRows(m.inn2)}
    ${fowRows(m.inn2)}
  </table>
  <br/>
  <div style="text-align:center;font-weight:bold;font-size:13px;padding:8px 0;border-top:2px solid #4a7c59">
    🏆 ${m.result}
  </div>
  <script>window.onload=()=>{window.print();}<\/script>
</body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
};

const captureScorecardImage = async (m) => {
  if (!m) return;

  // Create a temporary container for capturing
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '600px'; // fixed width for consistency
  container.className = 'social-scorecard-capture';
  document.body.appendChild(container);

  const ov = (b) => `${Math.floor(b / 6)}.${b % 6}`;
  const sr = (r, b) => b > 0 ? ((r / b) * 100).toFixed(2) : '0.00';
  const econ = (r, b) => b > 0 ? (r / (b / 6)).toFixed(2) : '0.00';

  const inn1Team = m.config?.battingFirst === 'team1' ? m.team1 : m.team2;
  const inn2Team = m.config?.battingFirst === 'team1' ? m.team2 : m.team1;

  const tossText = m.config
    ? `${m.config.battingFirst === 'team1' ? m.team1 : m.team2} won the toss and opted to Bat first.`
    : '';

  const renderSection = (inn, teamName) => {
    if (!inn) return '';
    const { battingStats = [], extras = {}, totalRuns = 0, totalWickets = 0, balls = 0 } = inn;
    const batted = battingStats.filter(b => b.balls > 0 || b.dismissed);
    const ex = extras;
    const extTotal = (ex.wides || 0) + (ex.noBalls || 0) + (ex.legByes || 0) + (ex.byes || 0);

    // Fall of wickets logic
    const fow = [];
    let runs = 0; let wkts = 0; let legal = 0;
    const dismissedBatters = (inn.battingStats || []).filter(b => b.dismissed);

    if (inn.allBalls) {
      for (const ball of inn.allBalls) {
        runs += ball.runs || 0;
        if (!ball.isWide && !ball.isNoBall) legal++;
        if (ball.isWicket) {
          const name = dismissedBatters[wkts]?.name || `Wicket ${wkts + 1}`;
          wkts++;
          fow.push({ name, score: `${runs}/${wkts}`, over: ov(legal) });
        }
      }
    }

    const bowled = (inn.bowlingStats || []).filter(b => b.balls > 0);

    return `
      <div style="background:#fff; margin-bottom:15px; border-bottom: 2px solid #4a7c59;">
        <!-- Header -->
        <div style="background:#2e5a31; color:#fff; padding:8px 12px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
          <span>${teamName}</span>
          <span>${totalRuns}-${totalWickets} (${ov(balls)})</span>
        </div>
        
        <!-- Batting Table -->
        <table style="width:100%; border-collapse:collapse; background:#e8f5e9; font-size:11px; font-weight:bold;">
          <tr style="color:#2e5a31;">
            <td style="padding:4px 12px;">Batsman</td>
            <td style="padding:4px 6px; text-align:center;">R</td>
            <td style="padding:4px 6px; text-align:center;">B</td>
            <td style="padding:4px 6px; text-align:center;">4s</td>
            <td style="padding:4px 6px; text-align:center;">6s</td>
            <td style="padding:4px 12px; text-align:right;">SR</td>
          </tr>
        </table>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          ${batted.map(b => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:4px 12px;">
                <div style="font-weight:bold; color:#111;">${b.name}</div>
                <div style="font-size:9px; color:#666;">${b.dismissed ? b.howOut : 'not out'}</div>
              </td>
              <td style="padding:4px 6px; text-align:center; width:30px;">${b.runs}</td>
              <td style="padding:4px 6px; text-align:center; width:30px;">${b.balls}</td>
              <td style="padding:4px 6px; text-align:center; width:30px;">${b.fours}</td>
              <td style="padding:4px 6px; text-align:center; width:30px;">${b.sixes}</td>
              <td style="padding:4px 12px; text-align:right; width:50px;">${sr(b.runs, b.balls)}</td>
            </tr>
          `).join('')}
          <!-- Extras -->
          <tr style="border-top:1px solid #ccc;">
            <td style="padding:6px 12px; font-weight:bold;">Extras</td>
            <td colspan="5" style="padding:6px 12px; text-align:right;">
             (${extTotal}) ${ex.byes || 0} B, ${ex.legByes || 0} LB, ${ex.wides || 0} WD, ${ex.noBalls || 0} NB, 0 P
            </td>
          </tr>
          <!-- Total -->
          <tr style="border-top:1px solid #ccc; background:#f9f9f9;">
            <td style="padding:6px 12px; font-weight:bold;">Total</td>
            <td colspan="5" style="padding:6px 12px; text-align:right; font-weight:bold;">
              ${totalRuns}-${totalWickets} (${ov(balls)}) ${econ(totalRuns, balls)}
            </td>
          </tr>
        </table>

         <!-- Bowling Table -->
        ${bowled.length > 0 ? `
          <div style="margin-top:10px;">
            <table style="width:100%; border-collapse:collapse; background:#e8f5e9; font-size:11px; font-weight:bold;">
              <tr style="color:#2e5a31;">
                <td style="padding:4px 12px;">Bowler</td>
                <td style="padding:4px 6px; text-align:center;">O</td>
                <td style="padding:4px 6px; text-align:center;">M</td>
                <td style="padding:4px 6px; text-align:center;">R</td>
                <td style="padding:4px 6px; text-align:center;">W</td>
                <td style="padding:4px 12px; text-align:right;">ER</td>
              </tr>
            </table>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              ${bowled.map((b, i) => `
                <tr style="border-bottom:1px solid #eee; ${i % 2 === 1 ? 'background:#fafafa' : ''}">
                  <td style="padding:4px 12px; font-weight:bold;">${b.name}</td>
                  <td style="padding:4px 6px; text-align:center; width:30px;">${ov(b.balls)}</td>
                  <td style="padding:4px 6px; text-align:center; width:30px;">0</td>
                  <td style="padding:4px 6px; text-align:center; width:30px;">${b.runs}</td>
                  <td style="padding:4px 6px; text-align:center; width:30px;">${b.wickets}</td>
                  <td style="padding:4px 12px; text-align:right; width:50px;">${econ(b.runs, b.balls)}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}

        <!-- FOW Table -->
        ${fow.length > 0 ? `
          <div style="margin-top:10px;">
            <table style="width:100%; border-collapse:collapse; background:#e8f5e9; font-size:11px; font-weight:bold;">
              <tr style="color:#2e5a31;">
                <td style="padding:4px 12px;">Fall of wickets</td>
                <td style="padding:4px 6px; text-align:center;">Score</td>
                <td style="padding:4px 12px; text-align:right;">Over</td>
              </tr>
            </table>
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              ${fow.map(f => `
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:4px 12px;">${f.name}</td>
                  <td style="padding:4px 6px; text-align:center; width:80px;">${f.score}</td>
                  <td style="padding:4px 12px; text-align:right; width:50px;">${f.over}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}
      </div>
    `;
  };

  container.innerHTML = `
    <div style="background:#fff; padding:20px; font-family: sans-serif; border: 4px solid #2e5a31;">
      <h1 style="text-align:center; margin:0 0 5px 0; color:#2e5a31;">${m.team1} v/s ${m.team2}</h1>
      <div style="text-align:center; font-size:11px; color:#666; margin-bottom:15px;">${tossText}</div>
      ${renderSection(m.inn1, inn1Team)}
      ${renderSection(m.inn2, inn2Team)}
      <div style="text-align:center; padding:15px; background:#f0f7f1; border-radius:8px; margin-top:10px;">
        <div style="font-weight:bold; color:#2e5a31; font-size:16px;">🏆 ${m.result}</div>
        <div style="font-size:10px; color:#555; margin-top:5px;">Scored with Cricket Scorer App</div>
      </div>
    </div>
  `;

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(container);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `scorecard_${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Match Scorecard',
            text: `Scorecard for ${m.team1} vs ${m.team2}`
          });
        } catch (e) {
          console.error("Share failed", e);
          downloadImage(canvas, m);
        }
      } else {
        // Fallback to download
        downloadImage(canvas, m);
      }
    });
  } catch (err) {
    console.error("Image generation failed", err);
    document.body.removeChild(container);
  }
};

const downloadImage = (canvas, m) => {
  const link = document.createElement('a');
  link.download = `scorecard_${m.team1}_vs_${m.team2}.png`;
  link.href = canvas.toDataURL();
  link.click();
};

const SocialShareBar = ({ match }) => {
  const [copied, setCopied] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const text = buildShareText(match);
  const encoded = encodeURIComponent(text);

  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${encoded}`, '_blank');

  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');

  const handleShareImage = async () => {
    setIsSharing(true);
    await captureScorecardImage(match);
    setIsSharing(false);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Share2 className="w-3 h-3" /> Share this match
      </p>
      <div className="flex flex-wrap gap-2">
        {/* Share Scorecard (Image) */}
        <button
          onClick={handleShareImage}
          disabled={isSharing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-cricket-green text-white hover:bg-cricket-green/90 transition-all shadow-md shadow-cricket-green/20"
        >
          {isSharing ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Smartphone className="w-3.5 h-3.5" />
          )}
          {isSharing ? 'Generating...' : 'Share Scorecard (Image)'}
        </button>

        {/* PDF */}
        <button
          onClick={() => generatePDF(match)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-900/30"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          PDF
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          WA
        </button>

        {/* Twitter / X */}
        <button
          onClick={shareTwitter}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter / X
        </button>

        {/* Copy */}
        <button
          onClick={copyText}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${copied
            ? 'bg-cricket-green/20 text-cricket-green'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
      </div>
    </div>
  );
};

const MatchScorecard = ({ innings, teamName }) => {
  if (!innings) return null;
  const { battingStats = [], bowlingStats = [], extras = { wides: 0, noBalls: 0, legByes: 0, byes: 0 }, totalRuns = 0, totalWickets = 0, balls = 0 } = innings;

  const batted = battingStats.filter(b => b.balls > 0 || b.dismissed);
  const bowled = bowlingStats.filter(b => b.balls > 0);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700/50 flex justify-between items-center border-b border-gray-200 dark:border-slate-700">
          <span className="font-bold text-sm text-gray-900 dark:text-white">{teamName} Batting</span>
          <span className="font-bold text-gray-900 dark:text-white">{totalRuns}/{totalWickets} ({overStr(balls)} Ov)</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-slate-700">
              <th className="text-left px-4 py-2 font-medium">Batter</th>
              <th className="px-2 py-2 font-medium text-center">R</th>
              <th className="px-2 py-2 font-medium text-center">B</th>
              <th className="px-2 py-2 font-medium text-center">4s</th>
              <th className="px-2 py-2 font-medium text-center">6s</th>
              <th className="px-2 py-2 font-medium text-center">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {batted.length > 0 ? batted.map((b, i) => (
              <tr key={b.id || i}>
                <td className="px-4 py-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{b.name}</p>
                  <p className="text-[10px] text-gray-400">{b.dismissed ? b.howOut : 'not out'}</p>
                </td>
                <td className="px-2 py-2 text-center font-bold text-gray-900 dark:text-white">{b.runs}</td>
                <td className="px-2 py-2 text-center text-gray-500">{b.balls}</td>
                <td className="px-2 py-2 text-center text-gray-500">{b.fours}</td>
                <td className="px-2 py-2 text-center text-gray-500">{b.sixes}</td>
                <td className="px-2 py-2 text-center text-gray-500">{calcSR(b.runs, b.balls)}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-4 py-4 text-center text-gray-400">No data available</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50/50 dark:bg-slate-800/30 text-[10px] text-gray-400 flex gap-4 border-t border-gray-100 dark:border-slate-700">
          <span>Extras: {(extras.wides || 0) + (extras.noBalls || 0) + (extras.legByes || 0) + (extras.byes || 0)}</span>
          <span>(WD: {extras.wides || 0}, NB: {extras.noBalls || 0}, LB: {extras.legByes || 0}, B: {extras.byes || 0})</span>
        </div>
      </div>

      {bowled.length > 0 && (
        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
            <span className="font-bold text-sm text-gray-900 dark:text-white">Bowling</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-slate-700">
                <th className="text-left px-4 py-2 font-medium">Bowler</th>
                <th className="px-2 py-2 font-medium text-center">O</th>
                <th className="px-2 py-2 font-medium text-center">R</th>
                <th className="px-2 py-2 font-medium text-center">W</th>
                <th className="px-2 py-2 font-medium text-center">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {bowled.map((b, i) => (
                <tr key={b.id || i}>
                  <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{b.name}</td>
                  <td className="px-2 py-2 text-center text-gray-500">{overStr(b.balls)}</td>
                  <td className="px-2 py-2 text-center text-gray-500">{b.runs}</td>
                  <td className="px-2 py-2 text-center font-bold text-red-500">{b.wickets}</td>
                  <td className="px-2 py-2 text-center text-gray-500">{calcEcon(b.runs, b.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { leagues, teams, players, matches } = useMockData();
  const [history, setHistory] = React.useState([]);
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('1st'); // '1st', '2nd'

  React.useEffect(() => {
    try {
      let saved = JSON.parse(localStorage.getItem('cricscorer_history'));
      if (!Array.isArray(saved)) saved = [];
      setHistory(saved);
    } catch (e) { }
  }, []);

  const totalMatches = [...matches, ...history];
  const liveMatchesCount = totalMatches.filter(m => m.status === 'live').length;
  const completedMatchesCount = totalMatches.filter(m => m.status === 'completed' || m.result).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white dark:border-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Welcome Back, Cricket Lovers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Here's what's happening in your cricket network today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Teams" value={teams.length} icon={Users} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
        <StatCard title="Total Players" value={players.length} icon={UserCircle} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" />
        <StatCard title="Live Matches" value={liveMatchesCount} icon={Activity} colorClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" />
        <StatCard title="Completed Matches" value={completedMatchesCount} icon={Trophy} colorClass="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" />
      </div>

      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAction title="Start Match" desc="Begin scoring a new match" icon={Activity} to="/scoring" />
          <QuickAction title="Create League" desc="Setup a new tournament" icon={Trophy} to="/leagues/new" />
          <QuickAction title="Add Team" desc="Register a new team" icon={Users} to="/teams/new" />
          <QuickAction title="Add Player" desc="Register a block of players" icon={UserCircle} to="/players/new" />
        </div>
      </section>

      {history.length > 0 && (
        <section className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Match History</h2>
            <button onClick={() => { localStorage.removeItem('cricscorer_history'); setHistory([]); }} className="text-xs text-red-500 hover:underline">Clear History</button>
          </div>
          <div className="space-y-4">
            {Array.isArray(history) && history.map((m, i) => (
              <div
                key={m.id || i}
                onClick={() => setSelectedMatch(m)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-cricket-green/50 hover:shadow-md transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.date}</span>
                    {m.result && <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase">Completed</span>}
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-cricket-green transition-colors">{m.team1} vs {m.team2}</h4>
                  <p className="text-sm text-cricket-green font-medium">{m.result}</p>
                </div>
                <div className="flex gap-4 items-center bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-2 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{m.team1}</p>
                    <p className="font-black dark:text-white">{m.inn1?.totalRuns}/{m.inn1?.totalWickets}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-slate-600" />
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{m.team2}</p>
                    <p className="font-black dark:text-white">{m.inn2?.totalRuns}/{m.inn2?.totalWickets}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Match Summary Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/30">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cricket-green" /> Match Scorecard
              </h3>
              <button
                onClick={() => { setSelectedMatch(null); setActiveTab('1st'); }}
                className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-bold">{selectedMatch.date}</p>
                  <div className="flex justify-center items-center gap-6 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-black dark:text-white">{selectedMatch.team1}</p>
                      <p className="text-2xl font-black text-cricket-green">
                        {selectedMatch.config?.battingFirst === 'team1' ?
                          `${selectedMatch.inn1?.totalRuns}/${selectedMatch.inn1?.totalWickets}` :
                          `${selectedMatch.inn2?.totalRuns}/${selectedMatch.inn2?.totalWickets}`}
                      </p>
                    </div>
                    <p className="text-xs font-bold opacity-30 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full italic">VS</p>
                    <div className="text-center">
                      <p className="text-lg font-black dark:text-white">{selectedMatch.team2}</p>
                      <p className="text-2xl font-black text-cricket-green">
                        {selectedMatch.config?.battingFirst === 'team1' ?
                          `${selectedMatch.inn2?.totalRuns}/${selectedMatch.inn2?.totalWickets}` :
                          `${selectedMatch.inn1?.totalRuns}/${selectedMatch.inn1?.totalWickets}`}
                      </p>
                    </div>
                  </div>
                  <div className="inline-block px-4 py-2 bg-cricket-green/10 rounded-xl">
                    <p className="font-black text-cricket-green uppercase tracking-wide text-xs">{selectedMatch.result}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl mb-6">
                  <button
                    onClick={() => setActiveTab('1st')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === '1st' ? 'bg-white dark:bg-slate-700 text-cricket-green shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    1st Innings
                  </button>
                  <button
                    onClick={() => setActiveTab('2nd')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === '2nd' ? 'bg-white dark:bg-slate-700 text-cricket-green shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    2nd Innings
                  </button>
                </div>

                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {activeTab === '1st' ? (
                    <MatchScorecard
                      innings={selectedMatch.inn1}
                      teamName={selectedMatch.config?.battingFirst === 'team1' ? selectedMatch.team1 : selectedMatch.team2}
                    />
                  ) : (
                    <MatchScorecard
                      innings={selectedMatch.inn2}
                      teamName={selectedMatch.config?.battingFirst === 'team1' ? selectedMatch.team2 : selectedMatch.team1}
                    />
                  )}
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-slate-700">
                <SocialShareBar match={selectedMatch} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
