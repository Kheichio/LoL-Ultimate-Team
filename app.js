// app.js

const _SPECIAL_QUALITIES = new Set(['Champion', 'MVP', 'Finalist', 'MSI', 'FirstStand', 'Signature']);

function ratingToQuality(rating) {
    if (rating >= 98) return 'Challenger';
    if (rating >= 96) return 'Grandmaster';
    if (rating >= 94) return 'Master';
    if (rating >= 90) return 'Diamond';
    if (rating >= 85) return 'Platinum';
    if (rating >= 80) return 'Gold';
    return 'Silver';
}

function getDB() {
    const raw = typeof playerDatabase !== 'undefined' ? playerDatabase : window.playerDatabase;
    if (!raw) return raw;
    return raw.map(c => _SPECIAL_QUALITIES.has(c.quality) ? c : { ...c, quality: ratingToQuality(c.rating) });
}

function getSellValue(quality) {
    const vals = { Silver: 5, Gold: 15, Platinum: 30, Diamond: 50, Master: 90, Grandmaster: 150, MVP: 175, Challenger: 300, Champion: 250, Finalist: 200, MSI: 220, FirstStand: 180, Coach: 20 };
    return vals[quality] || 5;
}

const collectionRewards = { Silver: 10, Gold: 20, Platinum: 40, Diamond: 80, Master: 150, Grandmaster: 300, Challenger: 500, Champion: 500, MVP: 500, Finalist: 400, MSI: 420, FirstStand: 350 };

// --- GLOBAL STATE ---
let blueEssence = 1000;
let activeLoans = 0;
let club = [];
let squad = { COACH: null, TOP: null, JNG: null, MID: null, ADC: null, SUP: null, SUB1: null, SUB2: null, SUB3: null };
let hasBoughtStarter = false;
let teamIdentity = { name: "My Team", logo: "🛡️" };
let hasNewClubItems = false; 

// Progression State
let managerXP = 0;
let managerLevel = 1;
let skillPoints = 0;
let skills = { scouting: 0, negotiation: 0, tactics: 0, transfer: 0, conditioning: 0, mentorship: 0, bootcamp: 0 };
let tradeRoleFilter = null;

// New Systems State
let collectionRegistry = {};
let archiveLastSeen = {};
let tradeMarket = { expires: 0, offers: [] };
let teamCompletionRewards = {};
let unlocks = { firstStand: false, msi: false, worlds: false, draftMode: false };

let trackStats = {
    packs: 0, tournamentsWon: 0, goldenRoads: 0, soldCount: 0, soldBE: 0, matchesPlayed: {},
    cafeWins: 0, regionalSplitWon: 0, firstStandWon: 0, msiWon: 0, worldsWon: 0,
    losses: 0, draftModesPlayed: 0, draftModesWon: 0, upgradesPerformed: 0,
    splitsCompleted: 0, undefeatedSplits: 0, splitsWithDebuffedWin: 0, splitsWithoutMeta: 0, eliteSplitsCompleted: 0
};

let seasonData = { currentSplit: 1, splitWins: 0, splitLosses: 0, gamesPerSplit: 10, trophyCase: [], opponents: [], matchResults: [], lastMatchTs: 0, splitComplete: false, metaTeams: [], metaPlaysUsedThisSplit: 0, slumpTeams: [], eliteMode: false, eliteTeams: [] };
let _smState = null; // active season match game state
let _smCdInterval = null; // cooldown countdown interval
let compareMode = false;
let compareSlots = [];

let quests = [
    // One-time milestones (rewards nerfed ~20% in 0.4.6 to slow progression)
    { id: 'q1', desc: 'Open 5 Card Packs', target: 5, type: 'packs', reward: 650, claimed: false },
    { id: 'q5', desc: 'Open 25 Card Packs', target: 25, type: 'packs', reward: 2000, claimed: false },
    { id: 'q2', desc: 'Liquidate 10 Players', target: 10, type: 'soldCount', reward: 400, claimed: false },
    { id: 'q6', desc: 'Liquidate 50 Players', target: 50, type: 'soldCount', reward: 1600, claimed: false },
    { id: 'q3', desc: 'Win 2 Tournaments', target: 2, type: 'tournamentsWon', reward: 1000, claimed: false },
    { id: 'q7', desc: 'Win 10 Tournaments', target: 10, type: 'tournamentsWon', reward: 4000, claimed: false },
    { id: 'q4', desc: 'Complete the Golden Road', target: 1, type: 'goldenRoads', reward: 4000, claimed: false },
    { id: 'q8', desc: 'Complete 3 Golden Roads', target: 3, type: 'goldenRoads', reward: 12000, claimed: false },
    { id: 'q9', desc: 'Win a Regional Split', target: 1, type: 'regionalSplitWon', reward: 2500, claimed: false },
    { id: 'q10', desc: 'Win First Stand', target: 1, type: 'firstStandWon', reward: 1600, claimed: false },
    { id: 'q11', desc: 'Win MSI', target: 1, type: 'msiWon', reward: 3200, claimed: false },
    { id: 'q12', desc: 'Win the World Championship', target: 1, type: 'worldsWon', reward: 6500, claimed: false },
    // Repeatable contracts (unique objectives, infinite, lower reward, baseline resets on each claim)
    { id: 'rq1', desc: 'Pull a Challenger card', target: 1, type: 'challengerPulled', reward: 320, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    { id: 'rq2', desc: 'Open 3 Champion Packs', target: 3, type: 'champPacksOpened', reward: 400, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    { id: 'rq3', desc: 'Liquidate 5 Grandmaster+ cards', target: 5, type: 'gmSoldCount', reward: 280, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    // New milestone quests (0.3.2)
    { id: 'q13', desc: 'Win a Draft Mode', target: 1, type: 'draftModesWon', reward: 2500, claimed: false },
    { id: 'q14', desc: 'Win 5 Draft Modes', target: 5, type: 'draftModesWon', reward: 8000, claimed: false },
    { id: 'q15', desc: 'Win 5 Gaming Cafe Tournaments', target: 5, type: 'cafeWins', reward: 1600, claimed: false },
    { id: 'q16', desc: 'Perform your first card Upgrade', target: 1, type: 'upgradesPerformed', reward: 800, claimed: false },
    { id: 'q17', desc: 'Perform 10 card Upgrades', target: 10, type: 'upgradesPerformed', reward: 4000, claimed: false },
    // New repeatable quests (0.3.2)
    { id: 'rq5', desc: 'Perform 3 card Upgrades', target: 3, type: 'upgradesPerformed', reward: 800, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    // Season Split quests (0.4.6)
    { id: 'q18', desc: 'Win a Season Split Undefeated (10-0)', target: 1, type: 'undefeatedSplits', reward: 3000, claimed: false },
    { id: 'q19', desc: 'Win a Split With 2 Slumped Players in your Squad', target: 1, type: 'splitsWithDebuffedWin', reward: 2500, claimed: false },
    { id: 'q20', desc: 'Win a Split Without Ever Using a Meta Play', target: 1, type: 'splitsWithoutMeta', reward: 2500, claimed: false },
    { id: 'q21', desc: 'Complete an Elite Split', target: 1, type: 'eliteSplitsCompleted', reward: 3500, claimed: false },
    { id: 'q22', desc: 'Complete 5 Season Splits', target: 5, type: 'splitsCompleted', reward: 4000, claimed: false },
    // Pack-opening milestone quests (0.4.7)
    { id: 'q23', desc: 'Open 10 Standard Packs', target: 10, type: 'standardPacksOpened', reward: 1000, claimed: false },
    { id: 'q24', desc: 'Open 10 Elite Packs', target: 10, type: 'elitePacksOpened', reward: 1000, claimed: false },
    { id: 'q25', desc: 'Open 10 Supreme Packs', target: 10, type: 'supremePacksOpened', reward: 1000, claimed: false },
    { id: 'q26', desc: 'Open 10 First Stand Packs', target: 10, type: 'firstStandPacksOpened', reward: 1000, claimed: false },
    { id: 'q27', desc: 'Open 10 MSI Packs', target: 10, type: 'msiPacksOpened', reward: 1000, claimed: false },
    { id: 'q28', desc: 'Open 10 Champion Packs', target: 10, type: 'champPacksOpened', reward: 1000, claimed: false },
    { id: 'q29', desc: 'Open 10 MVP Packs', target: 10, type: 'mvpPacksOpened', reward: 1000, claimed: false },
    // Season Match repeatable (0.4.7)
    { id: 'rq6', desc: 'Play 5 Season Matches', target: 5, type: 'seasonMatchesPlayed', reward: 600, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    // New mode quests (0.5.3)
    { id: 'q30', desc: 'Reach Floor 10 in Infinite Tower', target: 10, type: 'towerHighestFloor', reward: 2000, claimed: false },
    { id: 'q31', desc: 'Reach Floor 25 in Infinite Tower', target: 25, type: 'towerHighestFloor', reward: 5000, claimed: false },
    { id: 'q32', desc: 'Reach Floor 50 in Infinite Tower', target: 50, type: 'towerHighestFloor', reward: 10000, claimed: false },
    { id: 'q33', desc: 'Win a Salary Cap Draft', target: 1, type: 'salaryCapWon', reward: 3000, claimed: false },
    { id: 'q34', desc: 'Win 5 Salary Cap Drafts', target: 5, type: 'salaryCapWon', reward: 8000, claimed: false },
    { id: 'q35', desc: 'Pull a Signature Card', target: 1, type: 'signaturesPulled', reward: 5000, claimed: false }
];

// Achievements — live state checks (squad rating, archive progress) rather than tracked counters. Replaces Timed Challenges.
let achievements = [
    { id: 'a1', desc: 'Field a Squad Averaging 80+ Rating (Raw)', type: 'squadAvg', target: 80, reward: 1500, claimed: false },
    { id: 'a2', desc: 'Field a Squad Averaging 90+ Rating (Raw)', type: 'squadAvg', target: 90, reward: 3000, claimed: false },
    { id: 'a3', desc: 'Field a Squad Averaging 95+ Rating (Raw)', type: 'squadAvg', target: 95, reward: 5000, claimed: false },
    { id: 'a4', desc: 'Field a Squad Averaging 99+ Rating (Raw)', type: 'squadAvg', target: 99, reward: 10000, claimed: false },
    { id: 'a5', desc: 'Archive 50 Unique Cards', type: 'archiveCount', target: 50, reward: 1500, claimed: false },
    { id: 'a6', desc: 'Archive 150 Unique Cards', type: 'archiveCount', target: 150, reward: 3500, claimed: false },
    { id: 'a7', desc: 'Archive 300 Unique Cards', type: 'archiveCount', target: 300, reward: 7000, claimed: false },
    { id: 'a8', desc: 'Complete a Full Region Archive', type: 'fullRegionArchive', target: 1, reward: 6000, claimed: false }
];

let isGoldenRoad = false;
let grStageIndex = 0;
let grAccruedEssence = 0;
let grLastRunTs = 0;
let _grCdInterval = null;
const GR_COOLDOWN_MS = 30 * 60 * 1000;
const grStages = [
    { name: "Regional Split 1", diff: 75, rounds: 3, r1: 300, r2: 50 },
    { name: "First Stand", diff: 81, rounds: 3, r1: 500, r2: 100 },
    { name: "Regional Split 2", diff: 85, rounds: 3, r1: 600, r2: 150 },
    { name: "MSI Arena", diff: 90, rounds: 3, r1: 1100, r2: 300 },
    { name: "Regional Split 3", diff: 93, rounds: 3, r1: 1300, r2: 400 },
    { name: "World Championship", diff: 96, rounds: 4, r1: 3000, r2: 800 }
];

let tourActive = false;
let tourData = null; 
let tourRound = 0; 
let enemies = []; 
let simIntervalId = null;
let tacticalBonus = 0;

let trainingActiveUntil = 0;
let trainingTier = 0; // 1=Basic, 2=Medium, 3=Hard
let trainingTimerInterval = null;

let draftModeActive = false;
let draftUserPool = [];     // 15 cards from user's club
let draftCpuPool = [];      // 15 cards from DB (difficulty-scaled)
let draftUserBanIds = [];   // IDs user bans from CPU pool (max 5)
let draftCpuBanIds = [];    // IDs CPU bans from user pool (max 5)
let draftPickRoles = { TOP: null, JNG: null, MID: null, ADC: null, SUP: null, COACH: null };
let draftActivePickRole = null; // currently selected role slot in pick UI
let draftCpuTeam = {};      // { TOP: card, JNG: card, ... }
let draftMatchRound = 0;    // 0=tactical(MEC/TMF/MAP), 1=fundamentals(FRM/CMP/LDR), 2=1v1
let draftMatchWins = 0;
let draftMatchLosses = 0;
let draftHybridScore1 = null;
let draft1v1Cards = { my: null, cpu: null };
let marketTimerInterval = null;
let activeSlot = "TOP";

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    const target = document.getElementById('tab-' + tabId);
    if(target) target.classList.remove('hidden');

    // Highlight active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('nav-active');
    });
    const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('nav-active');

    // Clear notification badges when visiting their tabs
    if (tabId === 'club') {
        hasNewClubItems = false;
        saveGame();
    }

    if (tabId === 'quests') renderQuests();
    if (tabId === 'upgrade') renderUpgradeLab();

    updateBadges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPulls(cards, title) {
    const area = document.getElementById("pack-opening-area");
    const container = document.getElementById("pulled-cards");
    const titleEl = document.getElementById("pack-opening-title");
    const confirmBtn = document.getElementById("pack-confirm-btn");

    if (!area || !container || !titleEl) return;

    titleEl.innerText = title || "Pack Opened!";
    container.innerHTML = "";
    if (confirmBtn) confirmBtn.classList.add("hidden");

    area.classList.remove("hidden");
    area.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Lay down face-down placeholders first
    const wrappers = cards.map(() => {
        const wrap = document.createElement("div");
        const placeholder = document.createElement("div");
        placeholder.className = "card-face-down";
        placeholder.innerHTML = `<span>?</span>`;
        wrap.appendChild(placeholder);
        container.appendChild(wrap);
        return wrap;
    });

    // Reveal cards one at a time with staggered delays
    const WILDCARD_Q = ['Champion', 'MVP', 'Finalist', 'MSI', 'FirstStand'];
    cards.forEach((card, i) => {
        setTimeout(() => {
            const cardEl = createCardElement(card, false, null, null);
            cardEl.classList.add("card-reveal-anim");
            wrappers[i].innerHTML = "";
            wrappers[i].appendChild(cardEl);
            requestAnimationFrame(() => requestAnimationFrame(() => cardEl.classList.add("card-revealed")));

            // Special effects for wildcard / signature pulls
            const isWildcard = WILDCARD_Q.includes(card.quality);
            const isSig = card.signature;
            if (isWildcard || isSig) {
                // Screen flash
                const flash = document.createElement('div');
                const flashColor = card.quality === 'Champion' ? 'rgba(234,179,8,0.4)' : card.quality === 'MVP' ? 'rgba(236,72,153,0.4)' : isSig ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.3)';
                flash.style.cssText = `position:fixed;inset:0;background:${flashColor};z-index:9999;pointer-events:none;animation:pullFlash 0.6s ease-out forwards;`;
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 700);
                // Card glow burst
                wrappers[i].style.animation = 'pullBurst 0.8s ease-out';
                // Particle sparks
                for (let p = 0; p < 12; p++) {
                    const spark = document.createElement('div');
                    const angle = (p / 12) * 360;
                    const dist = 60 + Math.random() * 40;
                    spark.style.cssText = `position:absolute;width:6px;height:6px;border-radius:50%;background:${isSig ? '#a855f7' : card.quality === 'Champion' ? '#fbbf24' : card.quality === 'MVP' ? '#ec4899' : '#818cf8'};top:50%;left:50%;z-index:50;pointer-events:none;animation:sparkFly 0.7s ease-out forwards;--sx:${Math.cos(angle*Math.PI/180)*dist}px;--sy:${Math.sin(angle*Math.PI/180)*dist}px;`;
                    wrappers[i].style.position = 'relative';
                    wrappers[i].appendChild(spark);
                    setTimeout(() => spark.remove(), 800);
                }
            }

            if (i === cards.length - 1 && confirmBtn) {
                setTimeout(() => confirmBtn.classList.remove("hidden"), 500);
            }
        }, 300 + i * 550);
    });
}

function rollTier(type) {
    // Scouting skill provides +0.25% RNG bonus per level (max +1.25 at level 5)
    let bonus = skills.scouting * 0.25;
    let rng = (Math.random() * 100) + bonus;

    if (type === 'Standard') {
        // Silver most common, Gold possible. Max: Gold
        if (rng > 92) return 'Gold';
        return 'Silver';
    }

    if (type === 'Elite') {
        // Rebalanced 0.4.7: Gold is now the most common outcome, with a real shot at Diamond/Master.
        if (rng > 99) return 'Master';
        if (rng > 91) return 'Diamond';
        if (rng > 66) return 'Platinum';
        if (rng > 26) return 'Gold';
        return 'Silver';
    }

    if (type === 'Supreme') {
        // Challenger 0.5%, Grandmaster 1.5%, Master 5%, Diamond 25%, Platinum 30%, Gold 22%, Silver 16%
        if (rng > 99.5) return 'Challenger';
        if (rng > 98)   return 'Grandmaster';
        if (rng > 93)   return 'Master';
        if (rng > 68)   return 'Diamond';
        if (rng > 38)   return 'Platinum';
        if (rng > 16)   return 'Gold';
        return 'Silver';
    }

    return 'Silver';
}

function getRoundLabel(current, max) {
    let left = max - current;
    if (left === 1) return "Finals";
    if (left === 2) return "Semifinals";
    if (left === 3) return "Quarterfinals";
    return `Round ${current + 1}`;
}

function populateLiveArenaVisualizer() {
    const myContainer = document.getElementById("live-arena-my-roster");
    const enemyContainer = document.getElementById("live-arena-enemy-roster");
    if(!myContainer || !enemyContainer) return;
    
    myContainer.innerHTML = "";
    enemyContainer.innerHTML = "";
    
    ["TOP", "JNG", "MID", "ADC", "SUP", "COACH"].forEach(r => {
        if(squad[r]) myContainer.appendChild(createCardElement(squad[r], true));
    });
    
    let currentEnemy = enemies[tourRound];
    if(currentEnemy && currentEnemy.rosterNames) {
        currentEnemy.rosterNames.forEach((name, i) => {
            let roles = ["TOP", "JNG", "MID", "ADC", "SUP", "COACH"];
            let baseP = currentEnemy.power;
            
            let dummyCard = {
                name: name, role: roles[i], team: currentEnemy.name.split('[')[0].trim(), 
                quality: (roles[i] === "COACH") ? "Coach" : getTierFromRating(baseP), region: "CPU", year: "2026",
                rating: baseP + Math.floor(Math.random()*7 - 3), 
                stats: currentEnemy.generatedStats ? currentEnemy.generatedStats[i] : { mec: baseP, tmf: baseP, frm: baseP, cmp: baseP, map: baseP, ldr: baseP }
            };
            enemyContainer.appendChild(createCardElement(dummyCard, true));
        });
    }
    
    const teamColor = teamIdentity.color || '#3b82f6';
    const nameEl = document.getElementById("live-team-name");
    nameEl.innerText = teamIdentity.name;
    nameEl.style.color = teamColor;
    document.getElementById("live-team-logo").innerText = teamIdentity.logo;
    document.getElementById("tour-my-power").style.color = teamColor;
}


function renderQuests() {
    const container = document.getElementById("quests-container");
    if (!container) return;

    const milestones = quests.filter(q => !q.repeatable);
    const repeatables = quests.filter(q => q.repeatable);

    // Compact single-line row layout — fits far more quests on screen than the old card grid
    function questRow(desc, progress, target, reward, claimed, questId, color, extraLabel, claimFn) {
        claimFn = claimFn || 'claimQuest';
        const isDone = progress >= target;
        const pct = Math.min(100, (progress / target) * 100);
        let btn;
        if (claimed) {
            btn = `<button disabled class="shrink-0 bg-slate-700 text-slate-500 px-2.5 py-1.5 rounded-md font-bold cursor-not-allowed text-[10px] whitespace-nowrap">Claimed</button>`;
        } else if (isDone) {
            btn = `<button onclick="${claimFn}('${questId}')" class="shrink-0 bg-${color}-500 hover:bg-${color}-400 text-slate-900 px-2.5 py-1.5 rounded-md font-black cursor-pointer transition text-[10px] whitespace-nowrap uppercase">Claim ${reward}</button>`;
        } else {
            btn = `<span class="shrink-0 text-slate-500 font-mono text-[10px] w-14 text-right">${progress}/${target}</span>`;
        }
        const rowBorder = claimed ? 'border-slate-800 bg-slate-900/40 opacity-50' : isDone ? `border-${color}-700/50 bg-${color}-950/20` : 'border-slate-700 bg-slate-800/60';
        return `<div class="flex items-center gap-2.5 px-3 py-2 rounded-lg border ${rowBorder}">
            <div class="flex-1 min-w-0">
                <div class="text-slate-200 text-xs font-bold truncate">${desc}${extraLabel || ''}</div>
                <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700/50 mt-1"><div class="bg-${color}-500 h-full transition-all" style="width:${pct}%"></div></div>
            </div>
            ${btn}
        </div>`;
    }

    const milestoneHTML = milestones.map(q => {
        const progress = trackStats[q.type] || 0;
        return questRow(q.desc, progress, q.target, q.reward, q.claimed, q.id, 'yellow');
    }).join("");

    const repeatableHTML = repeatables.map(q => {
        const progress = Math.max(0, (trackStats[q.type] || 0) - (q.baselineAtReset || 0));
        const badge = q.timesCompleted > 0 ? ` <span class="text-cyan-500">×${q.timesCompleted}</span>` : '';
        return questRow(q.desc, progress, q.target, q.reward, false, q.id, 'cyan', badge);
    }).join("");

    const achievementHTML = achievements.map(a => {
        const progress = _achievementProgress(a);
        return questRow(a.desc, progress, a.target, a.reward, a.claimed, a.id, 'violet', '', 'claimAchievement');
    }).join("");

    container.innerHTML = `
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
            <div class="xl:col-span-1">
                <h3 class="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-2">🔄 Repeatable Contracts</h3>
                <p class="text-[10px] text-slate-500 mb-3">Infinite · progress resets after each claim</p>
                <div class="space-y-1.5">${repeatableHTML}</div>
            </div>
            <div class="xl:col-span-2">
                <h3 class="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">🏆 Milestone Quests</h3>
                <p class="text-[10px] text-slate-500 mb-3">One-time · claimed forever once complete</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5">${milestoneHTML}</div>
            </div>
            <div class="xl:col-span-1">
                <h3 class="text-xs font-black text-violet-400 uppercase tracking-widest mb-1">🎖️ Achievements</h3>
                <p class="text-[10px] text-slate-500 mb-3">Squad rating &amp; archive milestones</p>
                <div class="space-y-1.5">${achievementHTML}</div>
            </div>
        </div>`;
}

function claimQuest(id) {
    const q = quests.find(x => x.id === id);
    if (!q) return;

    let progress;
    if (q.repeatable) {
        progress = Math.max(0, (trackStats[q.type] || 0) - (q.baselineAtReset || 0));
    } else {
        if (q.claimed) return;
        progress = trackStats[q.type] || 0;
    }
    if (progress < q.target) return;

    blueEssence += q.reward;
    showToast(`Quest completed! +${q.reward} BE`, "success");

    if (q.repeatable) {
        q.baselineAtReset = trackStats[q.type] || 0;
        q.timesCompleted = (q.timesCompleted || 0) + 1;
    } else {
        q.claimed = true;
    }

    saveGame();
    renderQuests();
}

function _squadAvgRating() {
    const roles = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const cards = roles.map(r => squad[r]).filter(Boolean);
    if (cards.length < 5) return 0;
    return cards.reduce((sum, c) => sum + c.rating, 0) / cards.length;
}

function _hasFullRegionArchive() {
    const db = getDB(); if (!db) return false;
    return ['LCK', 'LPL', 'LEC', 'LCS', 'LCP'].some(region => {
        const regionCards = db.filter(c => c.region === region && !_SPECIAL_QUALITIES.has(c.quality));
        return regionCards.length > 0 && regionCards.every(c => collectionRegistry[c.id]);
    });
}

function _achievementProgress(a) {
    if (a.type === 'squadAvg') return Math.min(a.target, Math.round(_squadAvgRating()));
    if (a.type === 'archiveCount') return Math.min(a.target, Object.keys(collectionRegistry).length);
    if (a.type === 'fullRegionArchive') return _hasFullRegionArchive() ? 1 : 0;
    return 0;
}

function claimAchievement(id) {
    const a = achievements.find(x => x.id === id);
    if (!a || a.claimed) return;
    if (_achievementProgress(a) < a.target) return;
    blueEssence += a.reward;
    a.claimed = true;
    showToast(`Achievement unlocked! +${a.reward} BE`, "success");
    saveGame();
    renderQuests();
}

function closePatchModal(dontShowAgain) {
    if (dontShowAgain) localStorage.setItem('lol_patch_seen_v0_5_5a', '1');
    const modal = document.getElementById('patch-modal');
    if (modal) modal.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const container = document.getElementById("toast-container");
    if(!container) return;
    const toast = document.createElement("div");
    let colorClasses = 'bg-slate-800/90 text-slate-200 border-slate-600'; 
    if (type === 'error') colorClasses = 'bg-red-950/90 text-red-200 border-red-800';
    if (type === 'success') colorClasses = 'bg-emerald-950/90 text-emerald-200 border-emerald-800';
    toast.className = `p-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 translate-y-full opacity-0 flex items-center gap-3 border ${colorClasses}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove("translate-y-full", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");
    });
    setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-4", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showConfirm(message, description, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    if(!modal) return;
    const modalBox = document.getElementById("confirm-modal-box");

    // Restore default buttons in case a custom modal previously replaced them
    const btnContainer = modalBox.querySelector('.flex.gap-3');
    if (btnContainer && !document.getElementById('confirm-btn-cancel')) {
        btnContainer.innerHTML = `<button id="confirm-btn-cancel" class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2.5 rounded-lg font-bold transition w-full text-base">Cancel</button><button id="confirm-btn-yes" class="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg font-bold transition w-full text-base">Confirm</button>`;
    }

    const btnYes = document.getElementById("confirm-btn-yes");
    const btnCancel = document.getElementById("confirm-btn-cancel");

    document.getElementById("confirm-title").innerText = message;
    document.getElementById("confirm-desc").innerText = description;
    
    modal.classList.remove("hidden");
    requestAnimationFrame(() => {
        modal.classList.remove("opacity-0");
        modalBox.classList.remove("scale-95");
        modalBox.classList.add("scale-100");
    });

    const closeModal = () => {
        modal.classList.add("opacity-0");
        modalBox.classList.remove("scale-100");
        modalBox.classList.add("scale-95");
        setTimeout(() => { modal.classList.add("hidden"); }, 200);
        btnYes.onclick = null;
        btnCancel.onclick = null;
    };

    btnCancel.onclick = closeModal;
    btnYes.onclick = () => {
        closeModal();
        onConfirm();
    };
}

window.onload = () => {
    const savedBE = localStorage.getItem("lol_be_v7_pro");
    if (savedBE) blueEssence = parseInt(savedBE, 10);
    const savedLoans = localStorage.getItem("lol_loans_v7_pro");
    if (savedLoans) activeLoans = parseInt(savedLoans, 10);
    const savedClub = localStorage.getItem("lol_club_v7_pro");
    if (savedClub) club = JSON.parse(savedClub);
    const savedSquad = localStorage.getItem("lol_squad_v7_pro");
    if (savedSquad) squad = JSON.parse(savedSquad);
    const savedStarter = localStorage.getItem("lol_starter_v7_pro");
    if (savedStarter === "true") hasBoughtStarter = true;
    const savedIdentity = localStorage.getItem("lol_identity_v7_pro");
    if (savedIdentity) {
        teamIdentity = JSON.parse(savedIdentity);
        document.getElementById("custom-team-name").value = teamIdentity.name;
        document.getElementById("custom-team-logo").value = teamIdentity.logo;
        const colorEl = document.getElementById("custom-team-color");
        if (colorEl && teamIdentity.color) colorEl.value = teamIdentity.color;
    }
    const savedStats = localStorage.getItem("lol_stats_v7_pro");
    if (savedStats) trackStats = JSON.parse(savedStats);
    const savedNewItems = localStorage.getItem("lol_new_items_v7_pro");
    if (savedNewItems === "true") hasNewClubItems = true;

    const savedProg = localStorage.getItem("lol_prog_v7_pro");
    if (savedProg) {
        let p = JSON.parse(savedProg);
        managerXP = p.managerXP || 0; 
        managerLevel = p.managerLevel || 1; 
        skillPoints = p.skillPoints || 0; 
        skills = p.skills || { scouting: 0, negotiation: 0, tactics: 0, transfer: 0, conditioning: 0, mentorship: 0, bootcamp: 0 };
        if (skills.transfer === undefined) skills.transfer = 0;
        if (skills.conditioning === undefined) skills.conditioning = 0;
        if (skills.mentorship === undefined) skills.mentorship = 0;
        if (skills.bootcamp === undefined) skills.bootcamp = 0;
        if (skills.clubhouse === undefined) skills.clubhouse = 0;
    }
    
    const savedCol = localStorage.getItem("lol_collection_v7_pro");
    if (savedCol) collectionRegistry = JSON.parse(savedCol);
    const savedArchiveSeen = localStorage.getItem("lol_archive_seen_v1");
    if (savedArchiveSeen) archiveLastSeen = JSON.parse(savedArchiveSeen);
    const savedTrade = localStorage.getItem("lol_trade_v7_pro");
    if (savedTrade) tradeMarket = JSON.parse(savedTrade);
    const savedTeamComplete = localStorage.getItem("lol_team_complete_v8");
    if (savedTeamComplete) teamCompletionRewards = JSON.parse(savedTeamComplete);
    const savedGrTs = localStorage.getItem("lol_gr_last_run_ts");
    if (savedGrTs) grLastRunTs = parseInt(savedGrTs, 10);
    const savedSeason = localStorage.getItem("lol_season_v1");
    if (savedSeason) {
        seasonData = JSON.parse(savedSeason);
        if (!seasonData.opponents) seasonData.opponents = [];
        if (!seasonData.matchResults) seasonData.matchResults = [];
        if (!seasonData.lastMatchTs) seasonData.lastMatchTs = 0;
        if (seasonData.splitComplete === undefined) seasonData.splitComplete = false;
        if (!seasonData.metaTeams) seasonData.metaTeams = [];
        if (seasonData.metaPlaysUsedThisSplit === undefined) seasonData.metaPlaysUsedThisSplit = 0;
        if (!seasonData.slumpTeams) seasonData.slumpTeams = [];
        if (seasonData.eliteMode === undefined) seasonData.eliteMode = false;
        if (!seasonData.eliteTeams) seasonData.eliteTeams = [];
    }
    if (localStorage.getItem("lol_light_mode") === "1") {
        document.documentElement.classList.add("light-mode");
        const dmBtn = document.getElementById("dark-mode-btn");
        if (dmBtn) dmBtn.textContent = "🌙";
    }

    if(!trackStats.soldCount) trackStats.soldCount = 0;
    if(!trackStats.soldBE) trackStats.soldBE = 0;
    if(!trackStats.matchesPlayed) trackStats.matchesPlayed = {};
    if(!trackStats.challengerPulled) trackStats.challengerPulled = 0;
    if(!trackStats.champPacksOpened) trackStats.champPacksOpened = 0;
    if(!trackStats.gmSoldCount) trackStats.gmSoldCount = 0;
    if(!trackStats.regionalSplitWon) trackStats.regionalSplitWon = 0;
    if(!trackStats.firstStandWon) trackStats.firstStandWon = 0;
    if(!trackStats.msiWon) trackStats.msiWon = 0;
    if(!trackStats.worldsWon) trackStats.worldsWon = 0;
    if(!trackStats.cafeWins) trackStats.cafeWins = 0;
    if(!trackStats.losses) trackStats.losses = 0;
    if(!trackStats.draftModesPlayed) trackStats.draftModesPlayed = 0;
    if(!trackStats.draftModesWon) trackStats.draftModesWon = 0;
    if(!trackStats.upgradesPerformed) trackStats.upgradesPerformed = 0;
    if(!trackStats.splitsCompleted) trackStats.splitsCompleted = 0;
    if(!trackStats.undefeatedSplits) trackStats.undefeatedSplits = 0;
    if(!trackStats.splitsWithDebuffedWin) trackStats.splitsWithDebuffedWin = 0;
    if(!trackStats.splitsWithoutMeta) trackStats.splitsWithoutMeta = 0;
    if(!trackStats.eliteSplitsCompleted) trackStats.eliteSplitsCompleted = 0;
    if(!trackStats.standardPacksOpened) trackStats.standardPacksOpened = 0;
    if(!trackStats.elitePacksOpened) trackStats.elitePacksOpened = 0;
    if(!trackStats.supremePacksOpened) trackStats.supremePacksOpened = 0;
    if(!trackStats.firstStandPacksOpened) trackStats.firstStandPacksOpened = 0;
    if(!trackStats.msiPacksOpened) trackStats.msiPacksOpened = 0;
    if(!trackStats.mvpPacksOpened) trackStats.mvpPacksOpened = 0;
    if(!trackStats.seasonMatchesPlayed) trackStats.seasonMatchesPlayed = 0;
    if(!trackStats.towerHighestFloor) trackStats.towerHighestFloor = 0;
    if(!trackStats.towerRuns) trackStats.towerRuns = 0;

    const savedUnlocks = localStorage.getItem("lol_unlocks_v1");
    if (savedUnlocks) unlocks = JSON.parse(savedUnlocks);
    if (unlocks.firstStand === undefined) unlocks.firstStand = false;
    if (unlocks.msi === undefined) unlocks.msi = false;
    if (unlocks.worlds === undefined) unlocks.worlds = false;
    if (unlocks.draftMode === undefined) unlocks.draftMode = false;
    if (unlocks.goldenRoad === undefined) unlocks.goldenRoad = false;
    // Grandfather in players who already met the criteria before this patch
    if (trackStats.firstStandWon >= 1 || seasonData.trophyCase.some(t => t.wins >= 6)) unlocks.firstStand = true;
    if (trackStats.msiWon >= 1) unlocks.msi = true;
    if (trackStats.worldsWon >= 1) unlocks.worlds = true;
    if (trackStats.worldsWon >= 1 || (trackStats.regionalSplitWon >= 1 && seasonData.trophyCase.some(t => t.wins >= 6))) unlocks.draftMode = true;
    if (trackStats.worldsWon >= 1) unlocks.goldenRoad = true;
    updateTournamentLocks();

    const patchKey = 'lol_patch_seen_v0_5_5a';
    if (!localStorage.getItem(patchKey)) {
        const modal = document.getElementById('patch-modal');
        if (modal) modal.classList.remove('hidden');
    }

    const savedQuests = localStorage.getItem("lol_quests_v8_pro");
    if (savedQuests) {
        const saved = JSON.parse(savedQuests);
        const savedMap = {};
        saved.forEach(q => { savedMap[q.id] = q; });
        // Only carry over player progress fields — reward/desc/target always come from the current
        // definition above, so balance changes (like reward nerfs) apply to existing saves too.
        const progressFields = ['claimed', 'accepted', 'acceptedAt', 'baselineAtAccept', 'baselineAtReset', 'timesCompleted'];
        quests = quests.map(q => {
            const s = savedMap[q.id];
            if (!s) return q;
            const merged = { ...q };
            progressFields.forEach(f => { if (f in s) merged[f] = s[f]; });
            return merged;
        });
    } else {
        // Migrate claimed state from v7 if it exists
        const oldSaved = localStorage.getItem("lol_quests_v7_pro");
        if (oldSaved) {
            const oldData = JSON.parse(oldSaved);
            const oldMap = {};
            oldData.forEach(q => { oldMap[q.id] = q; });
            quests = quests.map(q => (oldMap[q.id] && oldMap[q.id].claimed) ? { ...q, claimed: true } : q);
        }
    }

    const savedAchievements = localStorage.getItem("lol_achievements_v1");
    if (savedAchievements) {
        const savedA = JSON.parse(savedAchievements);
        const savedAMap = {};
        savedA.forEach(a => { savedAMap[a.id] = a; });
        achievements = achievements.map(a => savedAMap[a.id] ? { ...a, claimed: savedAMap[a.id].claimed } : a);
    }

    // Refresh check: sync existing club cards with latest database definitions
    // so balance changes (stat buffs/nerfs, rating adjustments) apply to cards already in the player's club
    const db = getDB();
    if (db && club.length > 0) {
        club.forEach((card, idx) => {
            const base = db.find(p => p.id === card.id);
            if (base && !card.signature) {
                club[idx] = { ...card, rating: base.rating, stats: { ...base.stats }, quality: base.quality, name: base.name, team: base.team, region: base.region };
            }
        });
        // Also refresh squad references
        Object.keys(squad).forEach(slot => {
            if (squad[slot]) {
                const base = db.find(p => p.id === squad[slot].id);
                if (base && !squad[slot].signature) {
                    squad[slot] = { ...squad[slot], rating: base.rating, stats: { ...base.stats }, quality: base.quality, name: base.name, team: base.team, region: base.region };
                }
            }
        });
        saveGame();
    }

    populateDropdownFilters();
    recalculateRegionalPrice();
    updateDisplays();
    checkAndRecoverTrainingTimer();
    _grStartCdTimer();
    startTradeMarketTimer();
    // Global Season cooldown ticker (updates the header timer every second)
    setInterval(() => {
        const globalCd = document.getElementById('global-sm-cd');
        if (!globalCd) return;
        const smElapsed = Date.now() - (seasonData.lastMatchTs || 0);
        const smRem = _smCooldownMs() - smElapsed;
        if (smRem > 0 && (seasonData.matchResults || []).some(r => r !== null) && !seasonData.splitComplete) {
            globalCd.classList.remove('hidden');
            const timerEl = document.getElementById('global-sm-cd-timer');
            if (timerEl) timerEl.textContent = Math.ceil(smRem / 1000) + 's';
        } else {
            globalCd.classList.add('hidden');
        }
    }, 1000);
    switchTab('welcome');
};

function saveGame() {
    localStorage.setItem("lol_be_v7_pro", blueEssence);
    localStorage.setItem("lol_loans_v7_pro", activeLoans);
    localStorage.setItem("lol_club_v7_pro", JSON.stringify(club));
    localStorage.setItem("lol_squad_v7_pro", JSON.stringify(squad));
    localStorage.setItem("lol_starter_v7_pro", hasBoughtStarter);
    localStorage.setItem("lol_identity_v7_pro", JSON.stringify(teamIdentity));
    localStorage.setItem("lol_stats_v7_pro", JSON.stringify(trackStats));
    localStorage.setItem("lol_quests_v8_pro", JSON.stringify(quests));
    localStorage.setItem("lol_achievements_v1", JSON.stringify(achievements));
    localStorage.setItem("lol_prog_v7_pro", JSON.stringify({managerXP, managerLevel, skillPoints, skills}));
    localStorage.setItem("lol_new_items_v7_pro", hasNewClubItems);
    localStorage.setItem("lol_collection_v7_pro", JSON.stringify(collectionRegistry));
    localStorage.setItem("lol_archive_seen_v1", JSON.stringify(archiveLastSeen));
    localStorage.setItem("lol_trade_v7_pro", JSON.stringify(tradeMarket));
    localStorage.setItem("lol_team_complete_v8", JSON.stringify(teamCompletionRewards));
    localStorage.setItem("lol_season_v1", JSON.stringify(seasonData));
    localStorage.setItem("lol_unlocks_v1", JSON.stringify(unlocks));
    updateDisplays();
}

function updateBadges() {
    const clubBadge = document.getElementById("badge-club");
    const skillsBadge = document.getElementById("badge-skills");
    const questsBadge = document.getElementById("badge-quests");
    const collBadge = document.getElementById("badge-collection");
    const upgradeBadge = document.getElementById("badge-upgrade");

    if (hasNewClubItems && clubBadge) clubBadge.classList.remove("hidden");
    else if(clubBadge) clubBadge.classList.add("hidden");

    if (hasAvailableUpgrade() && upgradeBadge) upgradeBadge.classList.remove("hidden");
    else if (upgradeBadge) upgradeBadge.classList.add("hidden");

    // Skills badge: show with count of unspent skill points
    if (skillPoints > 0 && skillsBadge) {
        skillsBadge.classList.remove("hidden");
        skillsBadge.setAttribute("data-count", skillPoints);
        // Update the inner count span if it exists
        const countEl = document.getElementById("badge-skills-count");
        if (countEl) countEl.innerText = skillPoints;
    } else if(skillsBadge) {
        skillsBadge.classList.add("hidden");
    }

    let hasClaimableQuest = quests.some(q => {
        if (q.repeatable) {
            return Math.max(0, (trackStats[q.type] || 0) - (q.baselineAtReset || 0)) >= q.target;
        }
        return (trackStats[q.type] || 0) >= q.target && !q.claimed;
    }) || achievements.some(a => !a.claimed && _achievementProgress(a) >= a.target);
    if (hasClaimableQuest && questsBadge) questsBadge.classList.remove("hidden");
    else if(questsBadge) questsBadge.classList.add("hidden");

    const archiveDb = getDB();
    if (collBadge && archiveDb) {
        const totalUnseen = ['regular','firststand','msi','finalists','champion','mvp']
            .reduce((sum, cat) => sum + _archiveNewCount(archiveDb, cat, null), 0);
        if (totalUnseen > 0) {
            collBadge.classList.remove('hidden');
            const countEl = document.getElementById('badge-collection-count');
            if (countEl) countEl.innerText = totalUnseen > 99 ? '99+' : totalUnseen;
        } else {
            collBadge.classList.add('hidden');
        }
    } else if (collBadge) {
        collBadge.classList.add('hidden');
    }
}

function secretMoneyCheat() {
    blueEssence += 10000;
    saveGame();
    showToast("Cheat Activated: +10,000 BE!", "success");
}

function secretSkillPointCheat() {
    skillPoints += 10;
    saveGame();
    renderSkillsUI();
    showToast("Cheat Activated: +10 Skill Points!", "success");
}

function processNewCards(cards) {
    cards.forEach(c => {
        if (!collectionRegistry[c.id]) {
            collectionRegistry[c.id] = { claimed: false, acquiredAt: Date.now() };
        }
        if (c.signature) collectionRegistry[c.id].signature = true;
    });
}

function startTradeMarketTimer() {
    if (marketTimerInterval) clearInterval(marketTimerInterval);
    checkTradeMarket(); 
    marketTimerInterval = setInterval(checkTradeMarket, 1000);
}

function checkTradeMarket() {
    let db = getDB();
    if (!db) return;
    let now = Date.now();
    if (now > tradeMarket.expires || !tradeMarket.offers || tradeMarket.offers.length === 0) {
        generateTradeOffers();
    }
    let remaining = Math.round((tradeMarket.expires - now) / 1000);
    const display = document.getElementById("trade-timer");
    if(display) {
        let min = Math.floor(remaining / 60);
        let sec = remaining % 60;
        display.innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
}

function generateTradeOffers() {
    let db = getDB();
    if(!db) return;
    let elitePool = db.filter(p => ["Master", "Grandmaster", "Challenger", "Champion", "MVP", "Finalist", "MSI", "FirstStand"].includes(p.quality));
    // Transfer Window skill: levels 2-3 → 4 offers, levels 4-5 → 5 offers
    const offerCount = skills.transfer >= 4 ? 5 : skills.transfer >= 2 ? 4 : 3;
    // Level 5: if a role filter is active, draw exclusively from that role's pool
    let drawPool = [...elitePool];
    if (skills.transfer >= 5 && tradeRoleFilter) {
        const rolePool = elitePool.filter(p => p.role === tradeRoleFilter);
        if (rolePool.length >= offerCount) drawPool = rolePool;
    }
    let offers = [];
    for(let i = 0; i < offerCount; i++) {
        if(drawPool.length === 0) break;
        let cIdx = Math.floor(Math.random() * drawPool.length);
        let rewardCard = drawPool[cIdx];
        drawPool.splice(cIdx, 1);
        let reqQuality = "Platinum";
        let reqCount = 4;
        if (rewardCard.quality === "Master") {
            reqQuality = Math.random() > 0.5 ? "Platinum" : "Diamond";
            reqCount = reqQuality === "Platinum" ? 7 : 3;
        } else if (rewardCard.quality === "Grandmaster") {
            reqQuality = Math.random() > 0.5 ? "Diamond" : "Master";
            reqCount = reqQuality === "Diamond" ? 6 : 3;
        } else if (rewardCard.quality === "Challenger") {
            reqQuality = Math.random() > 0.5 ? "Diamond" : "Master";
            reqCount = reqQuality === "Diamond" ? 10 : 4;
        } else if (["MVP", "Champion", "Finalist", "MSI", "FirstStand"].includes(rewardCard.quality)) {
            reqQuality = Math.random() > 0.5 ? "Master" : "Grandmaster";
            reqCount = reqQuality === "Master" ? 6 : 3;
        }

        // Transfer Window Lv1: 25% chance per offer to land a discount, knocking ~25% off the asking price
        const originalReqCount = reqCount;
        let discounted = false;
        if (skills.transfer >= 1 && Math.random() < 0.25) {
            reqCount = Math.max(1, reqCount - Math.max(1, Math.round(reqCount * 0.25)));
            discounted = reqCount < originalReqCount;
        }
        offers.push({ id: Date.now() + i, rewardBaseId: rewardCard.id, reqQuality, reqCount, originalReqCount, discounted, completed: false });
    }
    tradeMarket = { expires: Date.now() + (15 * 60 * 1000), offers };
    saveGame();
    if(document.getElementById("tab-trade") && !document.getElementById("tab-trade").classList.contains("hidden")) {
        renderTradeMarket();
    }
}

function forceTradeRefresh() {
    if (blueEssence < 500) { showToast("Insufficient BE to refresh market.", "error"); return; }
    blueEssence -= 500;
    generateTradeOffers();
    showToast("Black Market refreshed!", "success");
}

function setTradeRoleFilter(role) {
    tradeRoleFilter = role;
    renderTradeMarket();
}

function renderTradeMarket() {
    const container = document.getElementById("trade-offers-container");
    if(!container) return;
    container.innerHTML = "";
    let db = getDB();

    // Transfer Window level 3+: role filter bar
    const filterBar = document.getElementById("trade-filter-bar");
    if (filterBar) {
        if (skills.transfer >= 3) {
            const roles = ['ALL', 'TOP', 'JNG', 'MID', 'ADC', 'SUP', 'COACH'];
            const lv5Note = skills.transfer >= 5
                ? `<span class="text-[10px] text-orange-400 font-bold ml-1">· Lv5: Force Refresh locks to role</span>` : '';
            filterBar.innerHTML = `
                <div class="flex items-center gap-2 flex-wrap py-3 border-b border-slate-700/50 mb-4">
                    <span class="text-xs text-slate-400 font-black uppercase tracking-widest mr-1">Target Role</span>
                    ${roles.map(r => {
                        const active = (r === 'ALL' && !tradeRoleFilter) || r === tradeRoleFilter;
                        return `<button onclick="setTradeRoleFilter(${r === 'ALL' ? 'null' : `'${r}'`})"
                            class="text-xs font-black px-3 py-1.5 rounded-lg border cursor-pointer transition ${active ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-orange-600 hover:text-slate-200'}">${r}</button>`;
                    }).join('')}
                    ${lv5Note}
                </div>`;
            filterBar.classList.remove("hidden");
        } else {
            filterBar.classList.add("hidden");
        }
    }

    // Apply role filter to displayed offers
    let visibleOffers = tradeMarket.offers;
    if (tradeRoleFilter) {
        visibleOffers = tradeMarket.offers.filter(offer => {
            const card = db.find(p => p.id === offer.rewardBaseId);
            return card && card.role === tradeRoleFilter;
        });
    }

    if (visibleOffers.length === 0) {
        container.innerHTML = `<div class="col-span-3 text-center py-16 text-slate-500 text-sm">
            No offers match the <strong class="text-slate-400">${tradeRoleFilter}</strong> filter in the current market.<br>
            <button onclick="forceTradeRefresh()" class="mt-3 text-orange-400 underline cursor-pointer text-xs">Force Refresh (500 BE)</button>
            ${skills.transfer >= 5 ? ' to lock offers to this role.' : '.'}
        </div>`;
        return;
    }

    visibleOffers.forEach(offer => {
        let rewardCardDef = db.find(p => p.id === offer.rewardBaseId);
        if(!rewardCardDef) return;
        let availableFodder = club.filter(c => c.quality === offer.reqQuality && !Object.values(squad).some(s => s && s.uniqueId === c.uniqueId));
        let hasEnough = availableFodder.length >= offer.reqCount;
        
        const wrapper = document.createElement("div");
        wrapper.className = `bg-slate-800/80 p-5 rounded-2xl border ${offer.completed ? 'border-emerald-900/50 opacity-50' : 'border-orange-900/40'} flex flex-col items-center shadow-lg relative overflow-hidden w-56`;
        
        let cardObj = { ...rewardCardDef, uniqueId: "preview" };
        let visual = createCardElement(cardObj, false, null, null);
        wrapper.appendChild(visual);
        
        let reqBlock = document.createElement("div");
        reqBlock.className = "mt-4 w-full text-center bg-slate-900/60 rounded-xl p-3 border border-slate-700/50";
        if (offer.completed) {
            reqBlock.innerHTML = `<span class="text-emerald-400 font-black tracking-widest uppercase">Acquired</span>`;
        } else {
            let colorClass = hasEnough ? 'text-emerald-400' : 'text-red-400';
            const countDisplay = offer.discounted
                ? `<span class="text-slate-500 line-through mr-1">${offer.originalReqCount}</span><span class="text-emerald-400">${offer.reqCount}</span>`
                : `${offer.reqCount}`;
            const discountBadge = offer.discounted
                ? `<p class="text-[10px] font-black text-emerald-400 mt-1">🏷️ Transfer Window Discount!</p>` : '';
            reqBlock.innerHTML = `
                <p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Cost / Exchange</p>
                <p class="font-mono text-sm font-bold text-slate-300">Requires <span class="text-${offer.reqQuality === 'Diamond' ? 'blue' : 'emerald'}-400">${offer.reqQuality}</span> assets</p>
                <p class="text-xs mt-1 ${colorClass} font-bold">Have: ${availableFodder.length} / ${countDisplay}</p>
                ${discountBadge}
            `;
            let btn = document.createElement("button");
            btn.className = `mt-3 w-full py-2.5 rounded-lg font-black uppercase tracking-wider transition text-xs ${hasEnough ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer shadow-[0_0_10px_rgba(234,88,12,0.4)]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`;
            btn.innerText = "Execute Trade";
            btn.disabled = !hasEnough;
            btn.onclick = () => { executeTrade(offer.id); };
            reqBlock.appendChild(btn);
        }
        wrapper.appendChild(reqBlock);
        container.appendChild(wrapper);
    });
}

function executeTrade(offerId) {
    let offer = tradeMarket.offers.find(o => o.id === offerId);
    if(!offer || offer.completed) return;
    let availableFodder = club.filter(c => c.quality === offer.reqQuality && !Object.values(squad).some(s => s && s.uniqueId === c.uniqueId));
    if (availableFodder.length < offer.reqCount) { showToast("Not enough unlocked assets to trade.", "error"); return; }
    
    for(let i=0; i<offer.reqCount; i++) {
        let burnId = availableFodder[i].uniqueId;
        club = club.filter(c => c.uniqueId !== burnId);
    }
    let db = getDB();
    let rewardDef = db.find(p => p.id === offer.rewardBaseId);
    let newCard = { ...rewardDef, uniqueId: Date.now() + "T" + Math.random().toString(36).substring(2) };
    club.push(newCard);
    processNewCards([newCard]);
    offer.completed = true;
    hasNewClubItems = true;
    saveGame();
    renderTradeMarket();
    showToast(`${rewardDef.name} securely extracted to Club!`, "success");
}

let currentArchiveCategory = 'regular';
let currentCollectionRegion = 'LCK';
let currentCollectionSort = 'team';
let teamYearFilter = {};

function setArchiveCategory(cat) {
    currentArchiveCategory = cat;
    if (cat !== 'regular') { archiveLastSeen[cat] = Date.now(); saveGame(); }
    else { archiveLastSeen[`regular_${currentCollectionRegion}`] = Date.now(); saveGame(); }
    renderCollection();
}
function setCollectionRegion(reg) {
    currentCollectionRegion = reg;
    archiveLastSeen[`regular_${reg}`] = Date.now();
    saveGame();
    renderCollection();
}
function setCollectionSort(sort) { currentCollectionSort = sort; renderCollection(); }
function setTeamYearFilter(teamKey, year) {
    if (year === null || teamYearFilter[teamKey] === year) delete teamYearFilter[teamKey];
    else teamYearFilter[teamKey] = year;
    renderCollection();
}

function _getArchiveCards(db) {
    const SPECIAL_Q = ["Champion", "Finalist", "MSI", "FirstStand", "MVP"];
    if (currentArchiveCategory === 'regular') {
        return db.filter(c => c.region === currentCollectionRegion && !SPECIAL_Q.includes(c.quality));
    }
    const qualMap = { firststand: 'FirstStand', msi: 'MSI', finalists: 'Finalist', champion: 'Champion', mvp: 'MVP' };
    return db.filter(c => c.quality === qualMap[currentArchiveCategory]);
}

function _archiveNewCount(db, cat, region) {
    const SPECIAL_Q = ["Champion", "Finalist", "MSI", "FirstStand", "MVP"];
    const qualMap = { firststand: 'FirstStand', msi: 'MSI', finalists: 'Finalist', champion: 'Champion', mvp: 'MVP' };
    if (cat === 'regular') {
        if (region) {
            const lastSeen = archiveLastSeen[`regular_${region}`] || 0;
            return db.filter(c => c.region === region && !SPECIAL_Q.includes(c.quality) && collectionRegistry[c.id] && (collectionRegistry[c.id].acquiredAt || 0) > lastSeen).length;
        }
        return ['LCK','LPL','LEC','LCS','LCP'].reduce((sum, r) => sum + _archiveNewCount(db, 'regular', r), 0);
    }
    const lastSeen = archiveLastSeen[cat] || 0;
    return db.filter(c => c.quality === qualMap[cat] && collectionRegistry[c.id] && (collectionRegistry[c.id].acquiredAt || 0) > lastSeen).length;
}

function renderCollection() {
    let db = getDB(); if (!db) return;

    // Category button styles
    const catDefs = [
        { id: 'arch-cat-regular',    cat: 'regular',    label: '⚔️ Regular Season', active: 'bg-blue-600/20 border-blue-500/50 text-blue-300' },
        { id: 'arch-cat-firststand', cat: 'firststand', label: '🟠 First Stand',     active: 'bg-orange-600/20 border-orange-500/50 text-orange-300' },
        { id: 'arch-cat-msi',        cat: 'msi',        label: '🌊 MSI',             active: 'bg-teal-600/20 border-teal-500/50 text-teal-300' },
        { id: 'arch-cat-finalists',  cat: 'finalists',  label: '🥈 Finalists',       active: 'bg-slate-500/30 border-slate-400/60 text-slate-200' },
        { id: 'arch-cat-champion',   cat: 'champion',   label: '🏆 Champion',        active: 'bg-amber-600/20 border-amber-500/50 text-amber-300' },
        { id: 'arch-cat-mvp',        cat: 'mvp',        label: '✨ MVP',             active: 'bg-pink-600/20 border-pink-500/50 text-pink-300' },
    ];
    catDefs.forEach(({ id, cat, label, active }) => {
        let btn = document.getElementById(id); if (!btn) return;
        btn.className = cat === currentArchiveCategory
            ? `flex-1 py-2 px-3 rounded-lg font-black text-sm cursor-pointer border shadow-inner relative ${active}`
            : 'flex-1 py-2 px-3 rounded-lg font-bold text-sm cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-transparent relative';
        const newCount = _archiveNewCount(db, cat, null);
        const badge = newCount > 0
            ? `<span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-red-500 text-white rounded-full flex items-center justify-center border border-slate-900 z-10 pointer-events-none">${newCount > 99 ? '99+' : newCount}</span>`
            : '';
        btn.innerHTML = label + badge;
    });

    // Show/hide region bar
    const regionBar = document.getElementById('arch-region-bar');
    if (regionBar) regionBar.style.display = currentArchiveCategory === 'regular' ? '' : 'none';

    // Region button styles
    if (currentArchiveCategory === 'regular') {
        const regionLabels = { LCK: '🇰🇷 LCK', LPL: '🇨🇳 LPL', LEC: '🇪🇺 LEC', LCS: '🇺🇸 LCS', LCP: '🌏 LCP' };
        ['LCK', 'LPL', 'LEC', 'LCS', 'LCP'].forEach(r => {
            let btn = document.getElementById(`col-reg-${r}`); if (!btn) return;
            let hasClaimable = db.filter(c => c.region === r).some(c => collectionRegistry[c.id] && !collectionRegistry[c.id].claimed);
            btn.className = r === currentCollectionRegion
                ? 'flex-1 py-2 px-4 rounded-lg font-black text-sm transition bg-blue-600/20 border border-blue-500/50 text-blue-300 shadow-inner cursor-pointer relative'
                : 'flex-1 py-2 px-4 rounded-lg font-bold text-sm transition bg-slate-800 hover:text-slate-200 hover:bg-slate-700 cursor-pointer relative text-slate-400 border border-transparent';
            const newCount = _archiveNewCount(db, 'regular', r);
            const newBadge = newCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-red-500 text-white rounded-full flex items-center justify-center border border-slate-900 z-10 pointer-events-none">${newCount > 99 ? '99+' : newCount}</span>`
                : '';
            const claimDot = hasClaimable
                ? `<span class="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full border border-slate-900 animate-pulse z-10 pointer-events-none"></span>`
                : '';
            btn.innerHTML = regionLabels[r] + newBadge + claimDot;
        });
    }

    // Sort button styles
    ["team", "completion", "latest"].forEach(s => {
        let btn = document.getElementById(`col-sort-${s}`); if (!btn) return;
        btn.className = s === currentCollectionSort
            ? "flex-1 py-1.5 px-4 rounded-lg font-black text-xs transition bg-slate-600 border border-slate-500 text-slate-100 uppercase tracking-widest shadow-inner cursor-pointer"
            : "flex-1 py-1.5 px-4 rounded-lg font-bold text-xs transition text-slate-400 hover:text-slate-200 uppercase tracking-widest bg-slate-800 border border-transparent cursor-pointer";
    });

    let dbCards = _getArchiveCards(db);
    let claimableBE = 0;
    dbCards.forEach(c => { let rec = collectionRegistry[c.id]; if (rec && !rec.claimed) claimableBE += (collectionRewards[c.quality] || 10); });
    let claimBtn = document.getElementById("btn-claim-collection");
    if (claimBtn) {
        let label = currentArchiveCategory === 'regular' ? 'Region' : 'Category';
        claimBtn.innerText = `Claim ${label} Rewards (${claimableBE} BE)`;
        claimBtn.disabled = claimableBE === 0;
    }

    const grid = document.getElementById("collection-grid"); if (!grid) return; grid.innerHTML = "";

    // Latest sort
    if (currentCollectionSort === 'latest') {
        let ownedCards = dbCards.filter(c => collectionRegistry[c.id]).sort((a, b) => (collectionRegistry[b.id].acquiredAt || 0) - (collectionRegistry[a.id].acquiredAt || 0));
        if (ownedCards.length === 0) { grid.innerHTML = `<p class="text-slate-500 text-center py-10 font-mono">No cards archived yet in this category.</p>`; return; }
        let section = document.createElement("div"); section.className = "bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50";
        section.innerHTML = `<h3 class="text-xl font-black text-slate-300 mb-4 border-b border-slate-700/50 pb-2">Recently Acquired</h3>`;
        let cardContainer = document.createElement("div"); cardContainer.className = "flex flex-wrap gap-4 justify-center";
        ownedCards.forEach(c => {
            let wrapper = document.createElement("div"); wrapper.className = "shrink-0 transition duration-500 relative";
            if (!collectionRegistry[c.id].claimed) { let dot = document.createElement("div"); dot.className = "absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20 animate-pulse"; wrapper.appendChild(dot); }
            const displayCard = collectionRegistry[c.id].signature ? { ...c, signature: true } : c;
            wrapper.appendChild(createCardElement(displayCard, false, null, null)); cardContainer.appendChild(wrapper);
        });
        section.appendChild(cardContainer); grid.appendChild(section); return;
    }

    // Team-grouped view
    let grouped = {};
    dbCards.forEach(c => {
        let tName = window.teamLineageBridges[c.team] || c.team;
        if (!grouped[tName]) grouped[tName] = { team: tName, cards: [], owned: 0, total: 0 };
        grouped[tName].cards.push(c); grouped[tName].total++;
        if (collectionRegistry[c.id]) grouped[tName].owned++;
    });
    let groupArray = Object.values(grouped);
    if (currentCollectionSort === 'completion') groupArray.sort((a, b) => (b.total - b.owned) - (a.total - a.owned));
    else groupArray.sort((a, b) => a.team.localeCompare(b.team));

    if (groupArray.length === 0) { grid.innerHTML = `<p class="text-slate-500 text-center py-10 font-mono">No cards archived yet in this category.</p>`; return; }

    groupArray.forEach(group => {
        const roleOrder = { "TOP": 1, "JNG": 2, "MID": 3, "ADC": 4, "SUP": 5, "COACH": 6 };
        let allYears = [...new Set(group.cards.map(c => c.year))].sort((a, b) => b - a);
        let selectedYear = teamYearFilter[group.team] || null;
        let displayCards = selectedYear ? group.cards.filter(c => c.year === selectedYear) : group.cards;
        displayCards.sort((a, b) => b.year !== a.year ? b.year - a.year : (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));
        let displayOwned = displayCards.filter(c => collectionRegistry[c.id]).length;

        let section = document.createElement("div"); section.className = "bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-3 shadow";

        // Header row: team name + year pills + count
        let header = document.createElement("div"); header.className = "flex items-center gap-2 mb-3 border-b border-slate-700/50 pb-2 flex-wrap";
        let titleEl = document.createElement("span"); titleEl.className = "text-sm font-black text-slate-300 mr-auto"; titleEl.textContent = `${group.team}`;
        header.appendChild(titleEl);

        if (allYears.length > 1) {
            let allBtn = document.createElement("button");
            allBtn.textContent = "All";
            allBtn.className = !selectedYear ? "px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white cursor-pointer" : "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400 hover:bg-slate-600 cursor-pointer";
            allBtn.onclick = () => setTeamYearFilter(group.team, null);
            header.appendChild(allBtn);
            allYears.forEach(yr => {
                let yrBtn = document.createElement("button");
                yrBtn.textContent = yr;
                yrBtn.className = selectedYear === yr ? "px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white cursor-pointer" : "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400 hover:bg-slate-600 cursor-pointer";
                yrBtn.onclick = () => setTeamYearFilter(group.team, yr);
                header.appendChild(yrBtn);
            });
        }

        let countEl = document.createElement("span"); countEl.className = `text-xs font-mono ${displayOwned === displayCards.length && displayCards.length > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`; countEl.textContent = `${displayOwned}/${displayCards.length}`;
        header.appendChild(countEl);
        section.appendChild(header);

        // Roster completion bonus (all-year view only)
        if (!selectedYear && group.owned === group.total && group.total >= 4) {
            let alreadyClaimed = teamCompletionRewards[group.team]?.claimed;
            let bonusBtn = document.createElement("button");
            bonusBtn.className = alreadyClaimed ? "w-full mb-3 py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed" : "w-full mb-3 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40 transition cursor-pointer";
            bonusBtn.textContent = alreadyClaimed ? "Roster Bonus Claimed" : "Claim Roster Bonus +5000 BE";
            bonusBtn.disabled = alreadyClaimed;
            if (!alreadyClaimed) bonusBtn.onclick = () => claimTeamCompletion(group.team);
            section.appendChild(bonusBtn);
        }

        let cardContainer = document.createElement("div"); cardContainer.className = "flex overflow-x-auto gap-3 pb-2 snap-x";
        displayCards.forEach(c => {
            let isOwned = !!collectionRegistry[c.id];
            let wrapper = document.createElement("div"); wrapper.className = `snap-start shrink-0 transition duration-500 ${isOwned ? 'relative' : 'grayscale opacity-25 scale-95 hover:opacity-40'}`;
            if (isOwned && !collectionRegistry[c.id].claimed) { let dot = document.createElement("div"); dot.className = "absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-yellow-400 rounded-full border border-slate-900 shadow z-20 animate-pulse"; wrapper.appendChild(dot); }
            const displayCard = (isOwned && collectionRegistry[c.id].signature) ? { ...c, signature: true } : c;
            wrapper.appendChild(createCardElement(displayCard, false, null, null)); cardContainer.appendChild(wrapper);
        });
        section.appendChild(cardContainer); grid.appendChild(section);
    });
}

function claimTeamCompletion(teamKey) {
    if (teamCompletionRewards[teamKey]?.claimed) return;
    if (!teamCompletionRewards[teamKey]) teamCompletionRewards[teamKey] = {};
    teamCompletionRewards[teamKey].claimed = true;
    blueEssence += 5000;
    showToast(`Roster Complete! +5000 BE`, "success");
    saveGame();
    renderCollection();
}

function claimCollectionRewards() {
    let db = getDB(); if (!db) return;
    let dbFilt = _getArchiveCards(db);
    let claimedAmount = 0;
    dbFilt.forEach(c => {
        let rec = collectionRegistry[c.id];
        if (rec && !rec.claimed) { claimedAmount += (collectionRewards[c.quality] || 10); rec.claimed = true; }
    });
    if (claimedAmount > 0) { blueEssence += claimedAmount; showToast(`Extracted ${claimedAmount} BE from Archives!`, "success"); saveGame(); renderCollection(); updateBadges(); }
}

function addXP(amount) {
    const xpMultipliers = [1, 1.5, 2, 2.5, 3, 4];
    const boosted = Math.round(amount * (xpMultipliers[Math.min(skills.mentorship || 0, 5)]));
    managerXP += boosted; let needed = managerLevel * 250; let leveledUp = false;
    while(managerXP >= needed) { managerXP -= needed; managerLevel++; skillPoints++; needed = managerLevel * 250; leveledUp = true; }
    if (leveledUp) showToast(`LEVEL UP! You are now Level ${managerLevel}. +1 Skill Point!`, "success");
    saveGame();
}

const _SKILL_DOUBLE_COST = new Set(['bootcamp']);
const _SKILL_FLAT_COST = new Set(['clubhouse']);
function _skillCost(skillName, currentLvl) {
    if (_SKILL_FLAT_COST.has(skillName)) return 1;
    const base = currentLvl + 1;
    return _SKILL_DOUBLE_COST.has(skillName) ? base * 2 : base;
}

function _skillMaxLvl(skillName) { return skillName === 'clubhouse' ? 10 : 5; }
function upgradeSkill(skillName) {
    let currentLvl = skills[skillName]; let cost = _skillCost(skillName, currentLvl);
    if (skillPoints >= cost && currentLvl < _skillMaxLvl(skillName)) { skillPoints -= cost; skills[skillName]++; saveGame(); renderSkillsUI(); updateBadges(); }
}

function renderSkillsUI() {
    document.getElementById("ui-manager-level").innerText = managerLevel;
    document.getElementById("ui-manager-xp").innerText = managerXP;
    document.getElementById("ui-manager-xp-needed").innerText = managerLevel * 250;
    document.getElementById("ui-skill-points").innerText = skillPoints;
    let pct = (managerXP / (managerLevel * 250)) * 100;
    document.getElementById("ui-xp-bar").style.width = `${pct}%`;

    const container = document.getElementById("skills-container"); if (!container) return;
    const skillDefs = [
        { key: "scouting",     name: "Scouting Network",      desc: "Adds +0.25% to the drop-tier RNG roll per level (max +1.25 at level 5) on every pack you open — Standard, Elite, Supreme, and the milestone-quality packs — improving your odds of pulling higher-tier cards.",                       color: "blue"   },
        { key: "negotiation",  name: "Corporate Negotiation",  desc: "Reduces the BE inflation penalty charged per active loan by 20 BE per level — from a 150 BE base down to 50 BE at level 5.",                                                                          color: "amber"  },
        { key: "tactics",      name: "Tactical Acumen",        desc: "Grants a guaranteed +3 flat power bonus per level (max +15 at level 5) to your squad during the Tactical Draft phase of tournament matches.",                                                          color: "emerald"},
        { key: "transfer",      name: "Transfer Window",        desc: "Lv1: 25% chance per trade offer to land a Transfer Window Discount (~25% off asset cost). Lv2: +4 trade offers. Lv3: unlocks Role Filter in Exchange Hub. Lv4: +5 offers. Lv5: Force Refresh locks the market to your chosen role.",  color: "orange" },
        { key: "conditioning",  name: "Team Conditioning",      desc: "Reduces the cooldown between Season Matches (60s base). Lv1: 45s. Lv2: 30s. Lv3: 20s. Lv4: 10s. Lv5: No cooldown — play matches back to back.",                                                       color: "rose"   },
        { key: "mentorship",    name: "Mentorship Program",     desc: "Multiplies all XP gains. Lv1: ×1.5 (+50%). Lv2: ×2 (double). Lv3: ×2.5. Lv4: ×3 (triple). Lv5: ×4 — massively accelerates manager level progression.",                                           color: "violet" },
        { key: "bootcamp",      name: "Bootcamp Director",      desc: "Costs double SP per level. Increases the Bootcamp power bonus by +2 per level — from +5 base up to +15 at level 5.",                                       color: "lime"   },
        { key: "clubhouse",    name: "Club House Capacity",    desc: "Increases max club size by 50 per level. Base: 100. Lv10: 600 cards. Costs only 1 SP per level. Max level: 10.",                                                                  color: "sky", maxLvl: 10 },
    ];
    container.innerHTML = "";
    skillDefs.forEach(def => {
        const maxLvl = def.maxLvl || 5;
        let currentLvl = skills[def.key]; let maxed = currentLvl >= maxLvl; let cost = _skillCost(def.key, currentLvl); let canUpgrade = skillPoints >= cost && !maxed;
        let dotsHTML = "";
        for(let i=1; i<=maxLvl; i++) {
            let active = i <= currentLvl ? `bg-${def.color}-400 border-${def.color}-500 shadow-[0_0_8px_theme(colors.${def.color}.400)]` : "bg-slate-800 border-slate-700";
            dotsHTML += `<div class="w-2.5 h-2.5 rounded-full border ${active}"></div>`;
        }
        let btnHTML = maxed 
            ? `<button disabled class="w-full bg-slate-800 text-slate-500 py-1.5 rounded-lg font-bold text-xs cursor-not-allowed">MAX LEVEL</button>`
            : `<button onclick="upgradeSkill('${def.key}')" class="w-full ${canUpgrade ? `bg-${def.color}-600 hover:bg-${def.color}-500 text-white cursor-pointer shadow` : `bg-slate-700 text-slate-400 cursor-not-allowed`} py-1.5 rounded-lg font-bold transition text-xs" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${cost} SP)</button>`;

        container.innerHTML += `<div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between"><div><h3 class="text-sm font-black text-${def.color}-400 mb-1">${def.name}</h3><p class="text-[11px] text-slate-400 mb-3 leading-relaxed">${def.desc}</p><div class="flex gap-1.5 mb-3 justify-center">${dotsHTML}</div></div>${btnHTML}</div>`;
    });

}

function renderPrestigeTitlePanel() {
    const container = document.getElementById('prestige-panel');
    if (!container) return;
    const currentTitle = getPrestigeTitle();
    const titleTiers = [
        { title: 'Scout', emoji: '🔍', color: 'text-slate-400', req: 'Default' },
        { title: 'Director', emoji: '📋', color: 'text-emerald-400', req: '5 wins OR 2 splits' },
        { title: 'GM', emoji: '⭐', color: 'text-blue-400', req: '15 wins + 5 splits + 1 GR' },
        { title: 'President', emoji: '🏛️', color: 'text-purple-400', req: '30 wins + 10 splits + 3 GR' },
        { title: 'Legend', emoji: '👑', color: 'text-yellow-400', req: '50 wins + 20 splits + 5 GR + 3 drafts' },
    ];
    let html = `<h4 class="text-purple-400 font-black mb-2 text-xs uppercase tracking-widest">Manager Title Progression</h4>
        <p class="text-slate-400 text-xs mb-2">Current: <span class="${currentTitle.color} font-bold">${currentTitle.emoji} ${currentTitle.title}</span></p>
        <div class="space-y-1 text-xs font-mono">`;
    titleTiers.forEach(t => {
        const isCurrent = t.title === currentTitle.title;
        const hl = isCurrent ? 'bg-slate-800/80 border border-slate-600 rounded-lg px-2 py-1' : 'px-2 py-1';
        html += `<div class="flex justify-between ${hl}"><span class="${t.color}">${t.emoji} ${t.title}${isCurrent ? ' ◀' : ''}</span><span class="text-slate-500">${t.req}</span></div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function executeTeamTraining() {
    if (_smState || tourActive || draftModeActive) { showToast("Bootcamp cannot be activated while a match is in progress.", "error"); return; }
    if (Date.now() < trainingActiveUntil) { showToast("A bootcamp session is already active!", "info"); return; }
    if (blueEssence < 50) { showToast("Insufficient assets.", "error"); return; }
    blueEssence -= 50;
    trainingTier = 1;
    trainingActiveUntil = Date.now() + 60000;
    localStorage.setItem("lol_training_expiry", trainingActiveUntil);
    localStorage.setItem("lol_training_tier", trainingTier);
    saveGame(); startTrainingVisualCountdown();
    showToast(`Bootcamp started! +${getTrainingBonus()} Power for 60s.`, "success");
}

function checkAndRecoverTrainingTimer() {
    const savedExpiry = localStorage.getItem("lol_training_expiry");
    if (savedExpiry) {
        trainingActiveUntil = parseInt(savedExpiry, 10);
        trainingTier = 1;
        if (trainingActiveUntil > Date.now()) startTrainingVisualCountdown();
    }
}

function startTrainingVisualCountdown() {
    if(trainingTimerInterval) clearInterval(trainingTimerInterval);
    const display = document.getElementById("training-timer-display");
    if(!display) return;
    const disableBootcampBtn = (disabled) => {
        const btn = document.getElementById("btn-bootcamp-1");
        if (!btn) return;
        btn.disabled = disabled;
        if (disabled) { btn.classList.replace("bg-orange-500","bg-slate-700"); btn.classList.add("cursor-not-allowed","opacity-60"); }
        else { btn.classList.replace("bg-slate-700","bg-orange-500"); btn.classList.remove("cursor-not-allowed","opacity-60"); }
    };
    disableBootcampBtn(true);
    trainingTimerInterval = setInterval(() => {
        let remaining = Math.round((trainingActiveUntil - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(trainingTimerInterval);
            display.innerText = "Facility Idle"; display.className = "font-mono font-bold text-slate-500 text-sm";
            disableBootcampBtn(false); computeChemistry();
        } else {
            display.innerText = `Bootcamp: ${remaining}s (+${getTrainingBonus()} Power active)`;
            display.className = "font-mono font-bold text-orange-400 animate-pulse text-sm";
            computeChemistry();
        }
    }, 1000);
}

function getTrainingBonus() { return (Date.now() < trainingActiveUntil) ? (5 + (skills.bootcamp || 0) * 2) : 0; }
function getClubCapacity() { return 100 + (skills.clubhouse || 0) * 50; }
function isClubFull() { return club.length >= getClubCapacity(); }
function getLoanPremium() { let basePremium = 150 - (skills.negotiation * 20); return activeLoans * Math.max(0, basePremium); }
function takeLoan() { activeLoans++; blueEssence += 500; saveGame(); showToast("Credit allocated!", "success"); }
function payLoan() {
    if (blueEssence < 500) { showToast("Insufficient liquidity.", "error"); return; }
    if (activeLoans <= 0) { showToast("No active debt.", "error"); return; }
    activeLoans--; blueEssence -= 500; saveGame(); showToast("Loan amortized!", "success");
}

function checkProgressionUnlocks() {
    const splitsCompleted = trackStats.splitsCompleted || 0;
    let changed = false;
    if (!unlocks.firstStand && seasonData.trophyCase.some(t => t.wins >= 6)) {
        unlocks.firstStand = true; changed = true;
        showToast("🔓 First Stand unlocked!", "success");
    }
    if (!unlocks.msi && (trackStats.firstStandWon || 0) >= 1 && splitsCompleted >= 2) {
        unlocks.msi = true; changed = true;
        showToast("🔓 MSI unlocked!", "success");
    }
    if (!unlocks.worlds && (trackStats.msiWon || 0) >= 1 && splitsCompleted >= 3) {
        unlocks.worlds = true; changed = true;
        showToast("🔓 Worlds unlocked!", "success");
    }
    if (!unlocks.draftMode && (trackStats.regionalSplitWon || 0) >= 1 && seasonData.trophyCase.some(t => t.wins >= 6)) {
        unlocks.draftMode = true; changed = true;
        showToast("🔓 Draft Mode unlocked!", "success");
    }
    if (!unlocks.goldenRoad && (trackStats.worldsWon || 0) >= 1) {
        unlocks.goldenRoad = true; changed = true;
        showToast("🔓 The Golden Road unlocked!", "success");
    }
    updateTournamentLocks();
    if (changed) saveGame();
}

function updateTournamentLocks() {
    function applyLock(lockId, btnId, isUnlocked) {
        const lockEl = document.getElementById(lockId);
        const btnEl = document.getElementById(btnId);
        if (lockEl) lockEl.classList.toggle("hidden", isUnlocked);
        if (btnEl) {
            btnEl.disabled = !isUnlocked;
            btnEl.classList.toggle("opacity-50", !isUnlocked);
            btnEl.classList.toggle("cursor-not-allowed", !isUnlocked);
        }
    }
    applyLock("lock-firststand", "btn-firststand", unlocks.firstStand);
    applyLock("lock-msi", "btn-msi", unlocks.msi);
    applyLock("lock-worlds", "btn-worlds", unlocks.worlds);
    applyLock("lock-draftmode", "btn-draftmode", unlocks.draftMode);
    applyLock("lock-goldenroad", "btn-goldenroad", unlocks.goldenRoad);
    _grRenderCooldown(); // re-assert cooldown-disabled state in case it was just overwritten above
}

function checkSquadReady() {
    if (["TOP", "JNG", "MID", "ADC", "SUP"].some(role => squad[role] === null)) { 
        showToast("Lineup incomplete! Fill all 5 starting lane positions.", "error"); 
        return false; 
    } 
    return true;
}

function startTournament(name, cost, r1, r2, baseDiff, rounds) {
    if (name === 'First Stand' && !unlocks.firstStand) { showToast("Complete a Playoff-tier (6+ win) Season Split to unlock First Stand.", "error"); return; }
    if (name === 'MSI' && !unlocks.msi) { showToast("Win First Stand and complete 2 Season Splits to unlock MSI.", "error"); return; }
    if (name === 'Worlds' && !unlocks.worlds) { showToast("Win MSI and complete 3 Season Splits to unlock Worlds.", "error"); return; }
    if (!checkSquadReady()) return;
    if (blueEssence < cost) { showToast("Insufficient BE reserves.", "error"); return; }
    if(simIntervalId) clearTimeout(simIntervalId); 
    
    blueEssence -= cost; isGoldenRoad = false; tourActive = true; tourRound = 0; tacticalBonus = 0; 
    tourData = { name: name, reward1: r1, reward2: r2, maxRounds: rounds };
    generateRealPlayerEnemies(baseDiff, rounds);
    
    document.getElementById("gr-badge").classList.add("hidden"); 
    document.getElementById("gr-accrued-display").classList.add("hidden");
    saveGame(); transitionToArena(name);
}

// Golden Road run cooldown — 30 min between runs (not per-stage), persisted so reloading can't bypass it
function _grCooldownRemainingMs() { return Math.max(0, GR_COOLDOWN_MS - (Date.now() - grLastRunTs)); }

function _grRenderCooldown() {
    const banner = document.getElementById('gr-cooldown-banner');
    const btn = document.getElementById('btn-goldenroad');
    const rem = _grCooldownRemainingMs();
    if (rem > 0) {
        if (banner) banner.classList.remove('hidden');
        if (btn) { btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); }
        const timerEl = document.getElementById('gr-cd-timer');
        if (timerEl) {
            const m = Math.floor(rem / 60000), s = Math.floor((rem % 60000) / 1000);
            timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }
    } else {
        if (banner) banner.classList.add('hidden');
        if (btn && unlocks.goldenRoad) { btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); }
        if (_grCdInterval) { clearInterval(_grCdInterval); _grCdInterval = null; }
    }
}

function _grStartCdTimer() {
    if (_grCdInterval) clearInterval(_grCdInterval);
    _grRenderCooldown();
    if (_grCooldownRemainingMs() > 0) _grCdInterval = setInterval(_grRenderCooldown, 1000);
}

function startGoldenRoad() {
    if (!unlocks.goldenRoad) { showToast("Win the World Championship to unlock the Golden Road.", "error"); return; }
    if (_grCooldownRemainingMs() > 0) {
        const m = Math.ceil(_grCooldownRemainingMs() / 60000);
        showToast(`Golden Road is cooling down — try again in ${m} min.`, "error");
        return;
    }
    if (!checkSquadReady()) return;
    if (blueEssence < 2500) { showToast("Insufficient assets for Golden Road (2,500 BE).", "error"); return; }
    if(simIntervalId) clearTimeout(simIntervalId);

    blueEssence -= 2500; isGoldenRoad = true; tourActive = true; grStageIndex = 0; grAccruedEssence = 0; tacticalBonus = 0; tourRound = 0;
    let stageInfo = grStages[grStageIndex];
    tourData = { name: stageInfo.name, reward1: stageInfo.r1, reward2: stageInfo.r2, maxRounds: stageInfo.rounds };
    generateRealPlayerEnemies(stageInfo.diff, stageInfo.rounds);

    document.getElementById("gr-badge").classList.remove("hidden");
    document.getElementById("gr-accrued-display").classList.remove("hidden");
    document.getElementById("gr-accrued-val").innerText = grAccruedEssence;
    saveGame(); transitionToArena("Golden Road: " + stageInfo.name);
}

function loadGoldenRoadStage() {
    let stageInfo = grStages[grStageIndex];
    tourData = { name: stageInfo.name, reward1: stageInfo.r1, reward2: stageInfo.r2, maxRounds: stageInfo.rounds };
    tourRound = 0; generateRealPlayerEnemies(stageInfo.diff, stageInfo.rounds);
}

function updateTeamCustomization() {
    teamIdentity.name = document.getElementById("custom-team-name").value || "My Team";
    teamIdentity.logo = document.getElementById("custom-team-logo").value || "🛡️";
    const colorEl = document.getElementById("custom-team-color");
    if (colorEl) teamIdentity.color = colorEl.value || "#3b82f6";
    saveGame();
}

function updateClubStatsUI() {
    document.getElementById("stat-wins").innerText = (trackStats.tournamentsWon || 0) + (trackStats.goldenRoads || 0);
    document.getElementById("stat-packs").innerText = trackStats.packs || 0;
    document.getElementById("stat-liquidated").innerText = trackStats.soldBE || 0;
    let mvp = "None"; let highestMatches = 0;
    for (const [playerName, count] of Object.entries(trackStats.matchesPlayed || {})) {
        if (count > highestMatches) { highestMatches = count; mvp = playerName; }
    }
    document.getElementById("stat-mvp").innerText = highestMatches > 0 ? `${mvp} (${highestMatches}m)` : "None";
    // New stat trackers
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setEl("stat-cafe-wins", trackStats.cafeWins || 0);
    setEl("stat-regional-wins", trackStats.regionalSplitWon || 0);
    setEl("stat-firststand-wins", trackStats.firstStandWon || 0);
    setEl("stat-msi-wins", trackStats.msiWon || 0);
    setEl("stat-world-wins", trackStats.worldsWon || 0);
    setEl("stat-losses", trackStats.losses || 0);
    setEl("stat-golden-road-wins", trackStats.goldenRoads || 0);
    setEl("stat-draft-wins", trackStats.draftModesWon || 0);
    setEl("stat-tower-best", trackStats.towerHighestFloor || 0);
    setEl("stat-salary-wins", trackStats.salaryCapWon || 0);
    renderPrestigeTitlePanel();
}

function recalculateRegionalPrice() {
    const tierSelect = document.getElementById("region-tier-select"); const regBtn = document.getElementById("btn-buy-regional"); if(!tierSelect || !regBtn) return;
    let price = 800;
    if(tierSelect.value === "Platinum") price = 1500;
    if(tierSelect.value === "Diamond") price = 2500;
    if(tierSelect.value === "Master") price = 4500;
    regBtn.setAttribute("data-cost", price);
    const premium = getLoanPremium(); regBtn.innerText = `${price + premium} BE`;
}

function getPrestigeTitle() {
    const tw = (trackStats.tournamentsWon || 0) + (trackStats.goldenRoads || 0);
    const gr = trackStats.goldenRoads || 0;
    const sc = trackStats.splitsCompleted || 0;
    const dw = trackStats.draftModesWon || 0;
    if (tw >= 50 && sc >= 20 && gr >= 5 && dw >= 3) return { title: 'Legend', emoji: '👑', color: 'text-yellow-400' };
    if (tw >= 30 && sc >= 10 && gr >= 3) return { title: 'President', emoji: '🏛️', color: 'text-purple-400' };
    if (tw >= 15 && sc >= 5 && gr >= 1) return { title: 'GM', emoji: '⭐', color: 'text-blue-400' };
    if (tw >= 5 || sc >= 2) return { title: 'Director', emoji: '📋', color: 'text-emerald-400' };
    return { title: 'Scout', emoji: '🔍', color: 'text-slate-400' };
}

function updateDisplays() {
    document.getElementById("be-display").innerText = blueEssence;
    document.getElementById("club-count-val").innerText = `${club.length}/${getClubCapacity()}`;
    const titleEl = document.getElementById('prestige-title-display');
    if (titleEl) { const t = getPrestigeTitle(); titleEl.innerHTML = `<span class="${t.color}">${t.emoji} ${t.title}</span>`; }
    const premium = getLoanPremium(); document.getElementById("inflation-premium-display").innerText = `+${premium} BE`;
    if (activeLoans > 0) { document.getElementById("debt-warning").classList.remove("hidden"); document.getElementById("debt-display").innerText = activeLoans * 500; }
    else { document.getElementById("debt-warning").classList.add("hidden"); }
    document.querySelectorAll(".store-pack-btn").forEach(btn => {
        let basePrice = parseInt(btn.getAttribute("data-cost"));
        if (!isNaN(basePrice)) { btn.innerText = `${basePrice + premium} BE`; }
    });
    const starterBtn = document.getElementById("starter-pack-container");
    if (hasBoughtStarter) starterBtn.classList.add("hidden"); else starterBtn.classList.remove("hidden");
    const bootcampBonusEl = document.getElementById("bootcamp-bonus-display");
    if (bootcampBonusEl) bootcampBonusEl.innerText = 5 + (skills.bootcamp || 0) * 2;
    const towerBest = document.getElementById('tower-best-display');
    if (towerBest) towerBest.textContent = `Best: Floor ${trackStats.towerHighestFloor || 0}`;
    // Global Season Split cooldown display
    const globalCd = document.getElementById('global-sm-cd');
    if (globalCd) {
        const smElapsed = Date.now() - (seasonData.lastMatchTs || 0);
        const smRem = _smCooldownMs() - smElapsed;
        if (smRem > 0 && (seasonData.matchResults || []).some(r => r !== null) && !seasonData.splitComplete) {
            globalCd.classList.remove('hidden');
            const timerEl = document.getElementById('global-sm-cd-timer');
            if (timerEl) timerEl.textContent = Math.ceil(smRem / 1000) + 's';
        } else {
            globalCd.classList.add('hidden');
        }
    }
    updateTournamentLocks();
    updateBadges(); updateClubStatsUI(); renderClubGrid(); renderSquadView(); renderQuests(); renderUpgradeLab();
    if(currentCollectionRegion) renderCollection();
}

function buyStarterPack() {
    let db = getDB(); if (!db || hasBoughtStarter) return; hasBoughtStarter = true; trackStats.packs++;
    const roles = ["TOP", "JNG", "MID", "ADC", "SUP"]; let pulled = [];
    roles.forEach(role => {
        let pool = db.filter(p => p.role === role && p.rating <= 84);
        let p = pool[Math.floor(Math.random() * pool.length)];
        let inst = {...p, uniqueId: Date.now() + Math.random().toString(36).substring(2)};
        pulled.push(inst); club.push(inst);
    });
    processNewCards(pulled); saveGame(); showPulls(pulled, "Starter Package Claimed");
}

function buyPack(baseCost, type) {
    let db = getDB(); if(!db) return;
    if (isClubFull()) { showToast(`Club is full (${club.length}/${getClubCapacity()}). Sell or upgrade cards, or level up Club House Capacity.`, "error"); return; }
    let actualCost = baseCost + getLoanPremium(); if (blueEssence < actualCost) { showToast("Insufficient BE reserves.", "error"); return; }
    blueEssence -= actualCost; trackStats.packs++; addXP(50); let pulled = [];
    const _packTypeKey = { Standard: 'standardPacksOpened', Elite: 'elitePacksOpened', Supreme: 'supremePacksOpened', FirstStand: 'firstStandPacksOpened', MSI: 'msiPacksOpened', Champion: 'champPacksOpened', MVP: 'mvpPacksOpened' }[type];
    if (_packTypeKey) trackStats[_packTypeKey] = (trackStats[_packTypeKey] || 0) + 1;
    if (type === 'Champion') {
        // 0.1% Champion · 0.5% each Finalist/MSI/FirstStand · 1.5% GM · 5% Master · ~25% Diamond · ~30% Plat · ~22% Gold · ~15% Silver
        for (let i = 0; i < 5; i++) {
            let rng = (Math.random() * 100) + (skills.scouting * 0.25);
            let pool;
            if      (rng > 99.9) pool = db.filter(p => p.quality === 'Champion');
            else if (rng > 99.4) pool = db.filter(p => p.quality === 'Finalist');
            else if (rng > 98.9) pool = db.filter(p => p.quality === 'MSI');
            else if (rng > 98.4) pool = db.filter(p => p.quality === 'FirstStand');
            else if (rng > 96.9) pool = db.filter(p => p.quality === 'Grandmaster' && !["Champion","Finalist","MSI","FirstStand","MVP"].includes(p.quality));
            else if (rng > 91.9) pool = db.filter(p => p.quality === 'Master' && !["Champion","Finalist","MSI","FirstStand","MVP"].includes(p.quality));
            else if (rng > 66.9) pool = db.filter(p => p.quality === 'Diamond' && !["Champion","Finalist","MSI","FirstStand","MVP"].includes(p.quality));
            else if (rng > 36.9) pool = db.filter(p => p.quality === 'Platinum' && !["Champion","Finalist","MSI","FirstStand","MVP"].includes(p.quality));
            else if (rng > 14.9) pool = db.filter(p => p.quality === 'Gold' && !["Champion","Finalist","MSI","FirstStand","MVP"].includes(p.quality));
            else                  pool = db.filter(p => p.quality === 'Silver');
            if (!pool || pool.length === 0) pool = db.filter(p => p.quality === 'Silver');
            let pCard = pool[Math.floor(Math.random() * pool.length)];
            let inst = {...pCard, uniqueId: Date.now() + "C" + i + Math.random().toString(36).substring(2)};
            pulled.push(inst); club.push(inst);
        }
    } else if (type === 'MVP') {
        // 0.1% MVP · 0.5% Challenger · 1.5% GM · 5% Master · ~25% Diamond · ~30% Platinum · ~22% Gold · ~16% Silver
        for (let i = 0; i < 5; i++) {
            let rng = (Math.random() * 100) + (skills.scouting * 0.25);
            let tier;
            if      (rng > 99.9) tier = 'MVP';
            else if (rng > 99.4) tier = 'Challenger';
            else if (rng > 97.9) tier = 'Grandmaster';
            else if (rng > 92.9) tier = 'Master';
            else if (rng > 67.9) tier = 'Diamond';
            else if (rng > 37.9) tier = 'Platinum';
            else if (rng > 15.9) tier = 'Gold';
            else                  tier = 'Silver';
            let pool = tier === 'MVP'
                ? db.filter(p => p.quality === 'MVP')
                : db.filter(p => p.quality === tier && !["Champion", "Finalist", "MSI", "FirstStand", "MVP"].includes(p.quality));
            if (pool.length === 0) pool = db.filter(p => p.quality === 'Silver');
            let pCard = pool[Math.floor(Math.random() * pool.length)];
            let inst = {...pCard, uniqueId: Date.now() + "M" + i + Math.random().toString(36).substring(2)};
            pulled.push(inst); club.push(inst);
        }
    } else if (type === 'MSI') {
        // 0.5% MSI · no Challenger · 1.5% GM · 5% Master · ~25% Diamond · ~30% Platinum · ~22% Gold · ~16% Silver
        for (let i = 0; i < 5; i++) {
            let rng = (Math.random() * 100) + (skills.scouting * 0.25);
            let tier;
            if      (rng > 99.5) tier = 'MSI';
            else if (rng > 98.0) tier = 'Grandmaster';
            else if (rng > 93.0) tier = 'Master';
            else if (rng > 68.0) tier = 'Diamond';
            else if (rng > 38.0) tier = 'Platinum';
            else if (rng > 16.0) tier = 'Gold';
            else                  tier = 'Silver';
            let pool = tier === 'MSI'
                ? db.filter(p => p.quality === 'MSI')
                : db.filter(p => p.quality === tier && !["Champion", "Finalist", "MSI", "FirstStand", "MVP"].includes(p.quality));
            if (pool.length === 0) pool = db.filter(p => p.quality === 'Silver');
            let pCard = pool[Math.floor(Math.random() * pool.length)];
            let inst = {...pCard, uniqueId: Date.now() + "I" + i + Math.random().toString(36).substring(2)};
            pulled.push(inst); club.push(inst);
        }
    } else if (type === 'FirstStand') {
        // 1% FirstStand · no Challenger · 1.5% GM · 5% Master · ~25% Diamond · ~30% Platinum · ~22% Gold · ~15.5% Silver
        for (let i = 0; i < 5; i++) {
            let rng = (Math.random() * 100) + (skills.scouting * 0.25);
            let tier;
            if      (rng > 99.0) tier = 'FirstStand';
            else if (rng > 97.5) tier = 'Grandmaster';
            else if (rng > 92.5) tier = 'Master';
            else if (rng > 67.5) tier = 'Diamond';
            else if (rng > 37.5) tier = 'Platinum';
            else if (rng > 15.5) tier = 'Gold';
            else                  tier = 'Silver';
            let pool = tier === 'FirstStand'
                ? db.filter(p => p.quality === 'FirstStand')
                : db.filter(p => p.quality === tier && !["Champion", "Finalist", "MSI", "FirstStand", "MVP"].includes(p.quality));
            if (pool.length === 0) pool = db.filter(p => p.quality === 'Silver');
            let pCard = pool[Math.floor(Math.random() * pool.length)];
            let inst = {...pCard, uniqueId: Date.now() + "F" + i + Math.random().toString(36).substring(2)};
            pulled.push(inst); club.push(inst);
        }
    } else {
        for (let i=0; i<5; i++) {
            let rolledTier = rollTier(type); let pool = db.filter(p => p.quality === rolledTier && !["Champion", "Finalist", "MSI", "FirstStand", "MVP"].includes(p.quality));
            if(pool.length === 0) pool = db.filter(p => p.quality === "Silver");
            let p = pool[Math.floor(Math.random() * pool.length)];
            let cardInst = {...p, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
            pulled.push(cardInst); club.push(cardInst);
        }
    }
    // Signature card chance (0.1% per card, Champion/MVP packs only)
    if (type === 'Champion' || type === 'MVP') {
        pulled.forEach(inst => {
            if (Math.random() < 0.001) {
                inst.signature = true;
                if (inst.stats) { Object.keys(inst.stats).forEach(k => { inst.stats[k] = (inst.stats[k] || 0) + 2; }); }
                inst.rating = Math.min(100, (inst.rating || 0) + 2);
                trackStats.signaturesPulled = (trackStats.signaturesPulled || 0) + 1;
            }
        });
    }
    pulled.forEach(c => { if (c.quality === 'Challenger') trackStats.challengerPulled = (trackStats.challengerPulled || 0) + 1; });
    processNewCards(pulled); saveGame(); showPulls(pulled, `${type} Package Opened`);
}

function buyTargetPack(targetType) {
    let db = getDB(); if(!db) return;
    const selectorCost = document.getElementById("btn-buy-regional");
    let baseCost = selectorCost ? parseInt(selectorCost.getAttribute("data-cost")) : 800;
    let actualCost = baseCost + getLoanPremium();
    if (blueEssence < actualCost) { showToast("Insufficient BE reserves.", "error"); return; }
    
    let regionVal = document.getElementById("region-select").value;
    let tierVal = document.getElementById("region-tier-select").value;
    blueEssence -= actualCost; trackStats.packs++; addXP(50); let pulled = [];
    for (let i=0; i<5; i++) {
        let targetTier = "Silver";
        if (tierVal === "Standard") targetTier = Math.random() < 0.75 ? "Silver" : "Gold";
        else if (tierVal === "Platinum") { let rng = Math.random(); targetTier = rng < 0.4 ? "Silver" : (rng < 0.8 ? "Gold" : "Platinum"); }
        else if (tierVal === "Diamond") { let rng = Math.random(); targetTier = rng < 0.3 ? "Gold" : (rng < 0.7 ? "Platinum" : "Diamond"); }
        else if (tierVal === "Master") { let rng = Math.random(); targetTier = rng < 0.2 ? "Platinum" : (rng < 0.6 ? "Diamond" : "Master"); }
        
        let pool = db.filter(p => p.region === regionVal && p.quality === targetTier && !["Champion", "Finalist", "MSI", "FirstStand", "MVP"].includes(p.quality));
        if (pool.length === 0) pool = db.filter(p => p.quality === targetTier && !["Champion", "Finalist", "MSI", "FirstStand", "MVP"].includes(p.quality));
        if (pool.length === 0) pool = db.filter(p => p.quality === "Silver");
        let p = pool[Math.floor(Math.random() * pool.length)];
        let cardInst = {...p, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
        pulled.push(cardInst); club.push(cardInst);
    }
    processNewCards(pulled); saveGame(); showPulls(pulled, `${regionVal} Regional Allocation Pack`);
}

function renderClubGrid() {
    const grid = document.getElementById("club-grid"); if(!grid) return; grid.innerHTML = "";
    let q = document.getElementById("club-search-input").value.toLowerCase();
    let filtered = club.filter(c => c.name.toLowerCase().includes(q));

    filtered.forEach((card) => {
        let wrap = document.createElement("div"); wrap.className = "flex flex-col items-center gap-1.5 transform transition hover:-translate-y-1";
        const cardEl = createCardElement(card, true, null, null);
        const isSelected = compareMode && compareSlots.some(c => c.uniqueId === card.uniqueId);
        if (isSelected) { cardEl.style.outline = "3px solid #a855f7"; cardEl.style.outlineOffset = "2px"; }
        wrap.appendChild(cardEl);

        if (compareMode) {
            let btn = document.createElement("button");
            btn.className = `text-xs px-3 py-1.5 rounded-lg w-full font-bold shadow-md transition ${isSelected ? 'bg-purple-800 text-purple-300 cursor-not-allowed' : 'bg-purple-900/60 text-purple-300 hover:bg-purple-700 cursor-pointer'}`;
            btn.innerText = isSelected ? "✓ Selected" : "⇄ Select";
            if (!isSelected) btn.onclick = () => addToCompare(card);
            else btn.disabled = true;
            wrap.appendChild(btn);
        } else {
            let btn = document.createElement("button"); let price = getSellValue(card.quality);
            if (Object.values(squad).some(s => s && s.uniqueId === card.uniqueId)) {
                btn.className = "text-xs bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg w-full font-bold cursor-not-allowed shadow-md"; btn.innerText = "In Squad"; btn.disabled = true;
            } else {
                btn.className = "text-xs bg-red-950/60 text-red-300 px-3 py-1.5 rounded-lg w-full font-bold cursor-pointer transition hover:bg-red-900 shadow-md"; btn.innerHTML = `Sell (+${price})`;
                btn.onclick = () => { blueEssence += price; trackStats.soldCount++; trackStats.soldBE += price; if (['Grandmaster','Challenger','Champion','Finalist','MSI','FirstStand'].includes(card.quality)) trackStats.gmSoldCount = (trackStats.gmSoldCount||0)+1; club = club.filter(c => c.uniqueId !== card.uniqueId); saveGame(); };
            }
            wrap.appendChild(btn);
        }
        grid.appendChild(wrap);
    });
}

function sortClub(by) {
    if (by === 'rating') club.sort((a,b) => b.rating - a.rating);
    if (by === 'region') club.sort((a,b) => a.region.localeCompare(b.region));
    renderClubGrid();
}

// --- Card Compare ---
function toggleCompareMode() {
    compareMode = !compareMode;
    compareSlots = [];
    const btn = document.getElementById("compare-toggle-btn");
    if (btn) {
        if (compareMode) {
            btn.classList.replace("bg-slate-700", "bg-purple-700");
            btn.classList.replace("text-purple-300", "text-white");
            btn.innerText = "✕ Exit Compare";
        } else {
            btn.classList.replace("bg-purple-700", "bg-slate-700");
            btn.classList.replace("text-white", "text-purple-300");
            btn.innerText = "⇄ Compare";
        }
    }
    showToast(compareMode ? "Select two cards to compare." : "Compare mode off.", "info");
    renderClubGrid();
}

function addToCompare(card) {
    if (compareSlots.some(c => c.uniqueId === card.uniqueId)) { showToast("Card already selected.", "info"); return; }
    if (compareSlots.length >= 2) { showToast("Already comparing 2 cards. Exit and re-enter compare mode to reset.", "info"); return; }
    compareSlots.push(card);
    if (compareSlots.length === 2) showCompareModal(compareSlots[0], compareSlots[1]);
    else showToast("Card 1 selected — pick a second card.", "info");
    renderClubGrid();
}

function showCompareModal(a, b) {
    const modal = document.getElementById("compare-modal"); if (!modal) return;
    const statLabels = { mec: "Mechanics", tmf: "Teamfight", frm: "Fundamentals", cmp: "Composure", map: "Map Awareness", ldr: "Leadership" };
    const qColors = { Silver: "#94a3b8", Gold: "#fbbf24", Platinum: "#34d399", Diamond: "#60a5fa", Master: "#c084fc", Grandmaster: "#f87171", Challenger: "#fde68a", Champion: "#f59e0b", MVP: "#f472b6", Finalist: "#94a3b8", MSI: "#2dd4bf", FirstStand: "#fb923c" };

    const miniCard = card => {
        const qc = qColors[card.quality] || "#94a3b8";
        return `<div class="flex flex-col items-center gap-1 p-3 bg-slate-700 rounded-xl border border-slate-600">
            <div class="font-black text-base" style="color:${qc}">${card.name}</div>
            <div class="text-slate-400 text-xs">${card.role} · ${card.team} · ${card.year}</div>
            <div class="text-xs font-bold" style="color:${qc}">${card.quality}</div>
            <div class="text-white font-black text-3xl">${card.rating}</div>
        </div>`;
    };

    const statsRows = Object.entries(statLabels).map(([key, label]) => {
        const va = a.stats[key] || 0, vb = b.stats[key] || 0;
        const aClass = va > vb ? 'text-emerald-400' : va < vb ? 'text-red-400' : 'text-slate-300';
        const bClass = vb > va ? 'text-emerald-400' : vb < va ? 'text-red-400' : 'text-slate-300';
        return `<div class="grid grid-cols-3 gap-2 items-center py-2 border-b border-slate-700 text-sm">
            <div class="text-right font-black ${aClass}">${va}</div>
            <div class="text-center text-slate-500 text-[11px] uppercase tracking-wider">${label}</div>
            <div class="text-left font-black ${bClass}">${vb}</div>
        </div>`;
    }).join('');

    const ratingAClass = a.rating > b.rating ? 'text-emerald-400' : a.rating < b.rating ? 'text-red-400' : 'text-slate-300';
    const ratingBClass = b.rating > a.rating ? 'text-emerald-400' : b.rating < a.rating ? 'text-red-400' : 'text-slate-300';

    modal.querySelector("#compare-content").innerHTML = `
        <div class="grid grid-cols-3 gap-3 mb-4 items-center">${miniCard(a)}<div class="text-center text-slate-500 font-black text-xl">VS</div>${miniCard(b)}</div>
        <div class="mb-1 grid grid-cols-3 text-[11px] font-black uppercase tracking-wider text-slate-500 px-1"><div class="text-right">${a.name}</div><div></div><div>${b.name}</div></div>
        ${statsRows}
        <div class="grid grid-cols-3 gap-2 items-center pt-2 text-sm">
            <div class="text-right font-black ${ratingAClass}">${a.rating}</div>
            <div class="text-center text-slate-500 text-[11px] uppercase tracking-wider">Overall</div>
            <div class="text-left font-black ${ratingBClass}">${b.rating}</div>
        </div>`;
    modal.classList.remove("hidden");
}

function closeCompareModal() {
    const modal = document.getElementById("compare-modal"); if (modal) modal.classList.add("hidden");
    compareSlots = [];
    renderClubGrid();
}

// --- Season Match System ---
const _SEASON_TEAM_NAMES = [
    "Cloud Serpents","Iron Wolves","Storm Eagles","Neon Dragons","Apex Titans",
    "Void Hunters","Frost Giants","Shadow Blades","Golden Lions","Steel Falcons",
    "Thunder Hawks","Crimson Tide","Arctic Fox","Phantom Kings","Solar Bears",
    "Lunar Wolves","Fire Foxes","Ice Serpents","Jade Tigers","Dark Knights",
    "Swift Ravens","Blood Hawks","Red Vipers","Blue Phoenix","Silver Sharks",
    "Gold Panthers","Sky Wolves","Storm Riders","Emerald Guards","Onyx Blades"
];
const _SEASON_LOGOS = ["🦁","🐺","🦅","🐉","🦊","🐯","🦈","🦋","🐻","🦌","🐝","🦂","🐍","🦉","🦚","🦜","🦩","🦢","⚔️","🏮"];
const _SEASON_STYLES = ["Aggressive","Methodical","Balanced","Defensive","Chaotic"];
const _SEASON_REGIONS = ["LCK","LPL","LEC","LCS","LCP"];

const _SEASON_STYLE_SKEWS = {
    Aggressive: { mec:  5, tmf:  2, frm:  0, cmp: -2, map: -3, ldr: -2 },
    Methodical: { mec: -2, tmf:  0, frm:  3, cmp:  4, map:  3, ldr:  2 },
    Balanced:   { mec:  0, tmf:  0, frm:  0, cmp:  0, map:  0, ldr:  0 },
    Defensive:  { mec: -4, tmf:  2, frm:  2, cmp:  1, map:  5, ldr:  4 },
    Chaotic:    { mec:  6, tmf: -3, frm: -2, cmp: -4, map:  3, ldr:  0 },
};

const _SEASON_PLAYS = [
    { id:'invade',    icon:'⚔️',  label:'Jungle Invade',   desc:'Force early skirmishes in the enemy jungle',      statKey:'mec', myRoles:['JNG']          },
    { id:'pick',      icon:'🎯',  label:'Pick Comp',        desc:'Burst down an isolated target',                   statKey:'mec', myRoles:['JNG','MID']     },
    { id:'teamfight', icon:'⚡',  label:'5v5 Teamfight',   desc:'Commit to a full all-in brawl',                   statKey:'tmf', myRoles:['TOP','MID','ADC','SUP'] },
    { id:'splitpush', icon:'🏰',  label:'Split Push',       desc:'Apply 1v1 side-lane pressure',                   statKey:'frm', myRoles:['TOP']           },
    { id:'poke',      icon:'🏹',  label:'Poke & Siege',     desc:'Whittle down before engaging',                    statKey:'frm', myRoles:['ADC','MID']     },
    { id:'dragon',    icon:'🐉',  label:'Dragon Control',   desc:'Contest elemental drake spawns',                  statKey:'map', myRoles:['JNG','SUP']     },
    { id:'baron',     icon:'🟣',  label:'Baron Siege',      desc:'Force Baron Nashor as a team objective',          statKey:'map', myRoles:['JNG','MID']     },
    { id:'engage',    icon:'🛡️',  label:'Hard Engage',      desc:'Force a decisive initiation',                     statKey:'ldr', myRoles:['SUP','JNG']     },
    { id:'vision',    icon:'👁️',  label:'Vision War',       desc:'Dominate warding and map control',                statKey:'map', myRoles:['SUP','JNG']     },
    { id:'rotate',    icon:'🔄',  label:'Rotation',         desc:'Cross-map coordination to win a lane',            statKey:'cmp', myRoles:['MID','JNG']     },
    { id:'cs',        icon:'💰',  label:'Farm Lead',        desc:'Outfarm the opponent for a gold advantage',       statKey:'frm', myRoles:['ADC','MID']     },
    { id:'coach',     icon:'📋',  label:'Coaching Adjust',  desc:'Tactical in-game adjustment from the sideline',   statKey:'ldr', myRoles:['COACH']         },
];

function _smGenStats(avgRating, style, statCap = 99) {
    const skew = _SEASON_STYLE_SKEWS[style] || _SEASON_STYLE_SKEWS.Balanced;
    const stats = {};
    ['mec','tmf','frm','cmp','map','ldr'].forEach(s => {
        stats[s] = Math.max(52, Math.min(statCap, avgRating + (skew[s] || 0) + Math.round((Math.random() * 10) - 5)));
    });
    return stats;
}

function _smGenRoster() {
    const db = getDB();
    const roles = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const roster = {};
    roles.forEach(role => {
        const pool = db ? db.filter(c => c.role === role) : [];
        roster[role] = pool.length ? pool[Math.floor(Math.random() * pool.length)].name : '???';
    });
    return roster;
}

function _smGenRosterStats(avgRating, style, statCap = 99) {
    const roles = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const rosterStats = {};
    roles.forEach(role => { rosterStats[role] = _smGenStats(avgRating, style, statCap); });
    return rosterStats;
}

function generateSeasonOpponents() {
    const splitBonus = Math.min((seasonData.currentSplit - 1) * 2, 14);
    const used = new Set();
    seasonData.opponents = Array.from({ length: 10 }, (_, i) => {
        const base = 74 + splitBonus + Math.round(i * 1.8);
        const v = Math.round((Math.random() * 8) - 4);
        const avgRating = Math.max(68, Math.min(94, base + v));
        const style = _SEASON_STYLES[Math.floor(Math.random() * _SEASON_STYLES.length)];
        let name;
        do { name = _SEASON_TEAM_NAMES[Math.floor(Math.random() * _SEASON_TEAM_NAMES.length)]; }
        while (used.has(name) && used.size < _SEASON_TEAM_NAMES.length);
        used.add(name);
        return {
            name,
            logo: _SEASON_LOGOS[Math.floor(Math.random() * _SEASON_LOGOS.length)],
            avgRating,
            region: _SEASON_REGIONS[Math.floor(Math.random() * _SEASON_REGIONS.length)],
            style,
            stats: _smGenStats(avgRating, style),
            roster: _smGenRoster(),
            rosterStats: _smGenRosterStats(avgRating, style),
        };
    });
    seasonData.matchResults = new Array(10).fill(null);

    // Elite split — 20% chance through split 4, then rises 2%/split from split 5 onward (capped at 70%), 1–6 teams boosted to 95–110 rated (ultimate difficulty)
    const eliteChance = seasonData.currentSplit > 4
        ? Math.min(0.70, 0.30 + (seasonData.currentSplit - 5) * 0.02)
        : 0.20;
    seasonData.eliteMode = Math.random() < eliteChance;
    seasonData.eliteTeams = [];
    if (seasonData.eliteMode) {
        const eliteCount = 1 + Math.floor(Math.random() * 6);
        const eliteIndices = Array.from({length: 10}, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, eliteCount);
        for (const i of eliteIndices) {
            const r = 95 + Math.floor(Math.random() * 16); // 95–110
            seasonData.opponents[i].avgRating = r;
            seasonData.opponents[i].stats = _smGenStats(r, seasonData.opponents[i].style, 110);
            seasonData.opponents[i].rosterStats = _smGenRosterStats(r, seasonData.opponents[i].style, 110);
            seasonData.opponents[i].isElite = true;
            seasonData.eliteTeams.push(i);
        }
    }

    _smRollMetaSlump();
    seasonData.metaPlaysUsedThisSplit = 0;

    // Simulated league records for the standings chart — higher rating skews toward more wins
    seasonData.opponents.forEach(opp => {
        const simWins = Math.max(0, Math.min(10, Math.round((opp.avgRating - 65) / 3.5) + Math.round((Math.random() * 4) - 2)));
        opp.simWins = Math.max(0, Math.min(10, simWins));
        opp.simLosses = 10 - opp.simWins;
    });
}

// Pick 5–10 real team metas (+8 to +25 buff to a specific stat) and 5–15 real team slumps (-8 to -15 to all stats),
// applied to the USER's player cards from those teams. Re-rollable mid-split (see _finishSeasonGame) to keep splits fresh.
function _smRollMetaSlump() {
    const db = getDB();
    const allTeams = db ? [...new Set(db.map(c => c.team))].filter(Boolean) : [];
    const statKeys = ['mec','tmf','frm','cmp','map','ldr'];
    const shuffledForMeta = [...allTeams].sort(() => Math.random() - 0.5);
    const metaCount = Math.min(5 + Math.floor(Math.random() * 6), allTeams.length); // 5–10
    seasonData.metaTeams = shuffledForMeta.slice(0, metaCount).map(team => ({
        team,
        statKey: statKeys[Math.floor(Math.random() * statKeys.length)],
        buff: 8 + Math.floor(Math.random() * 18), // +8 to +25
    }));

    const metaTeamNames = new Set(seasonData.metaTeams.map(m => m.team));
    const slumpPool = allTeams.filter(t => !metaTeamNames.has(t));
    const slumpCount = Math.min(5 + Math.floor(Math.random() * 11), slumpPool.length);
    const shuffledTeams = [...slumpPool].sort(() => Math.random() - 0.5);
    seasonData.slumpTeams = shuffledTeams.slice(0, slumpCount).map(team => ({
        team,
        debuff: -(8 + Math.floor(Math.random() * 8)),
    }));
}

function startSeasonMatchMode() {
    if (!seasonData.opponents || seasonData.opponents.length === 0) generateSeasonOpponents();
    document.getElementById('tournament-lobby').classList.add('hidden');
    const el = document.getElementById('season-matches-screen');
    if (el) el.classList.remove('hidden');
    renderSeasonMatchesUI();
}

function closeSeasonMatchMode() {
    const el = document.getElementById('season-matches-screen');
    if (el) el.classList.add('hidden');
    document.getElementById('tournament-lobby').classList.remove('hidden');
}

function _smSlumpDebuff(card) {
    if (!card) return 0;
    const s = (seasonData.slumpTeams || []).find(x => x.team === card.team);
    return s ? s.debuff : 0;
}

function _smMetaBuff(card, statKey) {
    if (!card) return 0;
    const m = (seasonData.metaTeams || []).find(x => x.team === card.team && x.statKey === statKey);
    return m ? m.buff : 0;
}

function _smPlayHasMetaBuff(play) {
    return play.myRoles.some(r => _smMetaBuff(squad[r], play.statKey) > 0);
}

function _tacticsBonus() { return (skills.tactics || 0) * 3; }
function _tacticsBadgeHTML() { const b = _tacticsBonus(); return b > 0 ? `<span class="text-[9px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-1.5 py-0.5 rounded ml-1">🎯 Tactics +${b}</span>` : ''; }

function _smStatVal(play) {
    function playerStat(role) {
        const c = squad[role];
        if (!c) return 70;
        const raw = role === 'COACH' ? (c.stats.ldr ?? c.rating) : (c.stats[play.statKey] ?? 70);
        return Math.max(50, raw + _smSlumpDebuff(c) + _smMetaBuff(c, play.statKey));
    }

    const roles = play.myRoles;
    const base = roles.length === 1 ? playerStat(roles[0]) : Math.round(roles.map(r => playerStat(r)).reduce((a, b) => a + b, 0) / roles.length);
    return base + _tacticsBonus();
}

const _SM_COOLDOWN_MS = 60000;
// Returns effective cooldown in ms, reduced by Conditioning skill level
function _smCooldownMs() {
    const steps = [60000, 45000, 30000, 20000, 10000, 0];
    return steps[Math.min(skills.conditioning, 5)];
}
function startSeasonGame(idx) {
    if (['TOP','JNG','MID','ADC','SUP'].some(r => !squad[r])) { showToast("Assign all 5 positions first.", "error"); return; }
    if ((seasonData.matchResults || [])[idx] != null) return;
    if ((seasonData.matchResults || []).some(r => r !== null)) {
        const elapsed = Date.now() - (seasonData.lastMatchTs || 0);
        if (elapsed < _smCooldownMs()) {
            const rem = Math.ceil((_smCooldownMs() - elapsed) / 1000);
            showToast(`Cooldown active — next match in ${rem}s`, 'error');
            return;
        }
    }
    if (!_isSquadLockedForSeason()) {
        showConfirm(
            "Lock In Your Squad?",
            "This is your first match of the Season Split. Your starting lineup will be locked — no swaps allowed — until you finish or advance this split. Proceed?",
            () => _smLaunchGame(idx)
        );
        return;
    }
    _smLaunchGame(idx);
}

function _smLaunchGame(idx) {
    const opp = seasonData.opponents[idx];
    if (!opp.stats) opp.stats = _smGenStats(opp.avgRating, opp.style);
    _smState = { oppIdx: idx, wins: 0, losses: 0, round: 1, maxRounds: 5, log: [], options: [], phase: 'pick' };
    _smPickOptions();
    renderSeasonMatchesUI();
}

function _smPickOptions() {
    const available = _SEASON_PLAYS.filter(p => !(p.id === 'coach' && !squad.COACH));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const picked = [];
    const usedKeys = new Set();
    for (const p of shuffled) {
        if (picked.length >= 3) break;
        if (!usedKeys.has(p.statKey) || picked.length + (3 - usedKeys.size) < 1) {
            picked.push(p);
            usedKeys.add(p.statKey);
        }
    }
    // Fallback: just fill to 3 if dedup left gaps
    if (picked.length < 3) {
        for (const p of shuffled) {
            if (picked.length >= 3) break;
            if (!picked.includes(p)) picked.push(p);
        }
    }
    _smState.options = picked.slice(0, 3);
}

function makeSeasonPlay(playId) {
    if (!_smState || _smState.phase !== 'pick') return;
    const play = _SEASON_PLAYS.find(p => p.id === playId);
    if (!play) return;

    const opp = seasonData.opponents[_smState.oppIdx];
    const myVal = _smStatVal(play);
    const oppVal = opp.stats[play.statKey] ?? opp.avgRating;
    const variance = Math.round((Math.random() * 16) - 8);
    const net = (myVal - oppVal) + variance;
    const roundWon = net > 0;

    if (roundWon) _smState.wins++; else _smState.losses++;

    const rolesLabel = play.myRoles.join('+');
    const statLabel = play.statKey.toUpperCase();
    const netStr = net >= 0 ? `+${net}` : `${net}`;
    const metaBoosted = _smPlayHasMetaBuff(play);
    if (metaBoosted) seasonData.metaPlaysUsedThisSplit = (seasonData.metaPlaysUsedThisSplit || 0) + 1;
    _smState.log.push({
        round: _smState.round,
        icon: play.icon,
        label: play.label,
        detail: `${rolesLabel} ${statLabel} ${myVal} vs ${oppVal} (${netStr})${metaBoosted ? ' ⚡' : ''}`,
        won: roundWon,
    });

    const matchDone = _smState.wins >= 3 || _smState.losses >= 3;
    if (matchDone) {
        _smState.phase = 'done';
        _finishSeasonGame();
    } else {
        _smState.round++;
        _smPickOptions();
    }
    renderSeasonMatchesUI();
}

function _finishSeasonGame() {
    const idx = _smState.oppIdx;
    const win = _smState.wins >= 3;
    seasonData.matchResults[idx] = win ? 'win' : 'loss';
    if (win) seasonData.splitWins++; else seasonData.splitLosses++;
    seasonData.lastMatchTs = Date.now();
    const played = seasonData.matchResults.filter(r => r !== null).length;
    if (played >= seasonData.gamesPerSplit) seasonData.splitComplete = true;
    trackStats.seasonMatchesPlayed = (trackStats.seasonMatchesPlayed || 0) + 1;
    addXP(win ? 150 : 50);

    // Mid-split shake-up: team metas and slumps reroll once after the 5th match, keeping the back half of the split fresh
    if (played === 5) {
        _smRollMetaSlump();
        showToast("⚡ Mid-split shake-up! Team metas and slumps have changed.", "info");
    }

    saveGame();
}

function _smBackToList() {
    _smState = null;
    renderSeasonMatchesUI();
}

function _smSplitTier(wins) {
    if (wins >= 10) return { tier: "🏆 Flawless Split",     reward: 8000 };
    if (wins >= 8)  return { tier: "🥇 Champions Split",    reward: 5000 };
    if (wins >= 6)  return { tier: "🥈 Contenders Split",   reward: 3000 };
    if (wins >= 4)  return { tier: "🥉 Mid-Table Split",    reward: 1500 };
    return              { tier: "📋 Relegation Split",      reward: 500  };
}

function advanceToNextSplit() {
    const wins = seasonData.splitWins, losses = seasonData.splitLosses;
    const { tier, reward } = _smSplitTier(wins);
    blueEssence += reward;
    const completedSplit = seasonData.currentSplit;
    seasonData.trophyCase.unshift({ split: completedSplit, wins, losses, tier, reward, date: new Date().toLocaleDateString(), metaTeamCount: (seasonData.metaTeams || []).length, elite: seasonData.eliteMode });
    if (seasonData.trophyCase.length > 20) seasonData.trophyCase.pop();

    // Quest tracking for split-related achievements (computed before next split's data is generated)
    trackStats.splitsCompleted = (trackStats.splitsCompleted || 0) + 1;
    if (wins === 10 && losses === 0) trackStats.undefeatedSplits = (trackStats.undefeatedSplits || 0) + 1;
    if (wins >= 6) {
        const debuffedCount = Object.values(squad).filter(c => c && _smSlumpDebuff(c) < 0).length;
        if (debuffedCount >= 2) trackStats.splitsWithDebuffedWin = (trackStats.splitsWithDebuffedWin || 0) + 1;
        if ((seasonData.metaPlaysUsedThisSplit || 0) === 0) trackStats.splitsWithoutMeta = (trackStats.splitsWithoutMeta || 0) + 1;
    }
    if (seasonData.eliteMode) trackStats.eliteSplitsCompleted = (trackStats.eliteSplitsCompleted || 0) + 1;

    seasonData.currentSplit++;
    seasonData.splitWins = 0;
    seasonData.splitLosses = 0;
    seasonData.splitComplete = false;
    seasonData.lastMatchTs = 0;
    generateSeasonOpponents();
    checkProgressionUnlocks();
    saveGame();
    updateDisplays();
    if (_smCdInterval) { clearInterval(_smCdInterval); _smCdInterval = null; }
    showToast(`Split ${completedSplit} Complete! ${tier} · +${reward} BE`, 'success');
    renderSeasonMatchesUI();
    const seasonTab = document.getElementById("tab-season");
    if (seasonTab && !seasonTab.classList.contains("hidden")) renderSeasonTab();
}

function renderSeasonMatchesUI() {
    const container = document.getElementById('season-matches-content');
    if (!container) return;
    if (_smState) { _renderSeasonGame(container); return; }
    _renderSeasonMatchList(container);
}

function _smStartCdTimer() {
    if (_smCdInterval) clearInterval(_smCdInterval);
    _smCdInterval = setInterval(() => {
        const el = document.getElementById('sm-cd-timer');
        if (!el) { clearInterval(_smCdInterval); _smCdInterval = null; return; }
        const elapsed = Date.now() - (seasonData.lastMatchTs || 0);
        const rem = Math.ceil((_smCooldownMs() - elapsed) / 1000);
        if (rem <= 0) {
            clearInterval(_smCdInterval);
            _smCdInterval = null;
            renderSeasonMatchesUI();
        } else {
            el.textContent = rem + 's';
        }
    }, 1000);
}

function _smMetaSlumpPanels() {
    const metas = seasonData.metaTeams || [];
    const slumps = seasonData.slumpTeams || [];
    const eliteTeams = seasonData.eliteTeams || [];

    // Elite split panel
    let eliteHTML = '';
    if (seasonData.eliteMode && eliteTeams.length > 0) {
        const eliteRows = eliteTeams.map(i => {
            const opp = (seasonData.opponents || [])[i];
            if (!opp) return '';
            const r = (seasonData.matchResults || [])[i];
            const resultBadge = r === 'win' ? `<span class="text-emerald-400 font-black text-xs ml-auto">W</span>` : r === 'loss' ? `<span class="text-red-300 font-black text-xs ml-auto">L</span>` : `<span class="text-slate-600 text-xs ml-auto">—</span>`;
            return `<div class="flex items-center gap-2 text-xs py-1 border-b border-red-900/30">
                <span class="text-base">${opp.logo}</span>
                <span class="text-slate-200 font-bold flex-1 truncate">${opp.name}</span>
                <span class="text-slate-500">${opp.style}</span>
                <span class="text-red-400 font-black font-mono">${opp.avgRating}</span>
                ${resultBadge}
            </div>`;
        }).join('');
        eliteHTML = `
        <div class="bg-gradient-to-r from-red-950/70 to-orange-950/40 border border-red-600/50 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xl">🔥</span>
                <span class="text-[10px] font-black text-red-400 uppercase tracking-widest">Elite Split — ${eliteTeams.length} world-class team${eliteTeams.length > 1 ? 's' : ''}</span>
                <span class="ml-auto text-[10px] font-black text-orange-400 bg-orange-950/60 border border-orange-700/40 px-2 py-0.5 rounded font-mono">HARD</span>
            </div>
            <p class="text-slate-400 text-xs mb-3 font-mono">This split contains elite opponents rated 95–99. Expect brutal stat checks — field your strongest squad.</p>
            <div class="space-y-0.5">${eliteRows}</div>
        </div>`;
    }

    // Meta panel — team-based buffs, mirrors the slump panel
    let metaHTML = '';
    if (metas.length) {
        const buffedSquad = Object.entries(squad)
            .filter(([, c]) => c && metas.some(m => m.team === c.team))
            .flatMap(([role, c]) => metas.filter(m => m.team === c.team).map(m =>
                `<div class="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-xs">
                    <span class="text-slate-500 font-black w-8 uppercase shrink-0">${role}</span>
                    <span class="text-slate-200 font-bold flex-1 truncate">${c.name}</span>
                    <span class="text-slate-500 shrink-0">${c.team}</span>
                    <span class="text-emerald-400 font-black font-mono shrink-0">+${m.buff} ${m.statKey.toUpperCase()}</span>
                </div>`
            )).join('');

        const teamRows = metas.map(m =>
            `<div class="flex justify-between items-center py-1.5 border-b border-slate-700/30 text-xs">
                <span class="text-slate-300 font-bold">${m.team}</span>
                <span class="text-emerald-400 font-black font-mono">+${m.buff} ${m.statKey.toUpperCase()}</span>
            </div>`
        ).join('');

        metaHTML = `
        <div class="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
                <span class="text-emerald-400 text-base">⚡</span>
                <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Team Metas — ${metas.length} teams in hot form this split</span>
            </div>
            <div class="text-slate-500 text-xs mb-3 font-mono">Cards from these teams get a boosted stat during Season Matches. Field them to capitalize.</div>
            <div class="mb-3 pb-3 border-b border-emerald-900/40">${teamRows}</div>
            ${buffedSquad ? `<div class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">⚡ Your Buffed Players</div><div class="space-y-1.5">${buffedSquad}</div>` : `<div class="text-xs text-slate-500 font-mono">None of your current squad players are on meta teams.</div>`}
        </div>`;
    }

    // Slump panel
    let slumpHTML = '';
    if (slumps.length) {
        // Find which active squad players are on slumped teams
        const affectedRows = Object.entries(squad)
            .filter(([, c]) => c && slumps.some(s => s.team === c.team))
            .map(([role, c]) => {
                const slump = slumps.find(s => s.team === c.team);
                return `<div class="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-xs">
                    <span class="text-slate-500 font-black w-8 uppercase shrink-0">${role}</span>
                    <span class="text-slate-200 font-bold flex-1 truncate">${c.name}</span>
                    <span class="text-slate-500 shrink-0">${c.team}</span>
                    <span class="text-red-400 font-black font-mono shrink-0">${slump.debuff} stats</span>
                </div>`;
            }).join('');

        const teamRows = slumps.map(s =>
            `<div class="flex justify-between items-center py-1.5 border-b border-slate-700/30 text-xs">
                <span class="text-slate-300 font-bold">${s.team}</span>
                <span class="text-red-400 font-black font-mono">${s.debuff} to all stats</span>
            </div>`
        ).join('');

        slumpHTML = `
        <div class="bg-red-950/20 border border-red-800/30 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
                <span class="text-red-400 text-base">📉</span>
                <span class="text-[10px] font-black text-red-500 uppercase tracking-widest">Team Slumps — ${slumps.length} real teams in rough form this split</span>
            </div>
            <div class="text-slate-500 text-xs mb-3 font-mono">Cards from these teams have reduced stats during Season Matches. Swap out affected players to avoid the penalty.</div>
            <div class="mb-3 pb-3 border-b border-red-900/40">${teamRows}</div>
            ${affectedRows ? `<div class="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">⚠️ Your Affected Players</div><div class="space-y-1.5">${affectedRows}</div>` : `<div class="text-xs text-emerald-500 font-mono">✓ None of your current squad players are on slumped teams.</div>`}
        </div>`;
    }

    const metaSlumpRow = metaHTML || slumpHTML
        ? `<div class="grid grid-cols-1 ${metaHTML && slumpHTML ? 'lg:grid-cols-2' : ''} gap-4">${metaHTML}${slumpHTML}</div>`
        : '';
    return eliteHTML || metaSlumpRow ? `<div class="space-y-3 mb-4">${eliteHTML}${metaSlumpRow}</div>` : '';
}

function _renderSeasonMatchList(container) {
    const wins = seasonData.splitWins, losses = seasonData.splitLosses;
    const results = seasonData.matchResults || [];
    const played = results.filter(r => r !== null).length;
    const total = seasonData.gamesPerSplit;
    const metaSlumpHTML = _smMetaSlumpPanels();


    // ── SPLIT COMPLETE SUMMARY ──────────────────────────────────────────────
    if (seasonData.splitComplete) {
        const { tier, reward } = _smSplitTier(wins);
        const tierColor = wins >= 10 ? 'text-yellow-400' : wins >= 8 ? 'text-yellow-300' : wins >= 6 ? 'text-slate-200' : wins >= 4 ? 'text-orange-400' : 'text-slate-500';
        const borderColor = wins >= 10 ? 'border-yellow-600/60' : wins >= 8 ? 'border-yellow-700/40' : wins >= 6 ? 'border-slate-500/40' : wins >= 4 ? 'border-orange-700/40' : 'border-slate-700';
        const matchRows = (seasonData.opponents || []).map((opp, i) => {
            const r = results[i];
            const isWin = r === 'win';
            const rowBg = isWin ? 'bg-emerald-950/25 border-emerald-800/30' : 'bg-red-950/25 border-red-800/30';
            const badge = isWin
                ? `<span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-900/60 text-emerald-300 border border-emerald-700">WIN</span>`
                : `<span class="px-3 py-1 rounded-full text-xs font-black bg-red-900/60 text-red-300 border border-red-700">LOSS</span>`;
            const ratingColor = opp.avgRating >= 95 ? 'text-orange-400' : opp.avgRating >= 90 ? 'text-red-400' : opp.avgRating >= 85 ? 'text-orange-400' : opp.avgRating >= 79 ? 'text-yellow-400' : 'text-slate-300';
            const eliteBadge = opp.isElite ? `<span class="text-[10px] font-black text-orange-400 bg-orange-950/60 border border-orange-700/40 px-1.5 py-0.5 rounded shrink-0">🔥</span>` : '';
            return `<div class="flex items-center gap-3 px-4 py-2.5 rounded-xl border ${rowBg} text-sm">
                <span class="text-slate-600 font-mono text-xs w-4 shrink-0">${i + 1}</span>
                <span class="text-lg shrink-0">${opp.logo}</span>
                <div class="flex-1 min-w-0"><div class="font-bold text-slate-200 truncate">${opp.name}</div><div class="text-slate-500 text-xs">${opp.style}</div></div>
                ${eliteBadge}
                <div class="${ratingColor} font-black text-xs mr-2">${opp.avgRating}</div>
                ${badge}
            </div>`;
        }).join('');

        container.innerHTML = `<div class="space-y-4">
            ${metaSlumpHTML}
            <div class="bg-gradient-to-br from-slate-900 to-indigo-950/40 rounded-2xl border ${borderColor} p-6 text-center shadow-xl">
                <div class="text-5xl mb-3">${wins >= 10 ? '🏆' : wins >= 8 ? '🥇' : wins >= 6 ? '🥈' : wins >= 4 ? '🥉' : '📋'}</div>
                <div class="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Split ${seasonData.currentSplit} Complete</div>
                <div class="text-2xl font-black ${tierColor} mb-1">${tier}</div>
                <div class="text-4xl font-black mb-1"><span class="text-emerald-400">${wins}</span><span class="text-slate-600 mx-3 text-2xl">–</span><span class="text-red-400">${losses}</span></div>
                <div class="text-slate-400 text-sm mb-5">Reward: <span class="text-emerald-300 font-black">+${reward} BE</span> on next split start</div>
                <button onclick="advanceToNextSplit()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-xl cursor-pointer transition text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    Claim Rewards &amp; Start Split ${seasonData.currentSplit + 1} →
                </button>
            </div>
            <div class="space-y-1.5">${matchRows}</div>
        </div>`;
        return;
    }

    // ── NORMAL MATCH LIST ───────────────────────────────────────────────────
    const elapsed = Date.now() - (seasonData.lastMatchTs || 0);
    const onCooldown = results.some(r => r !== null) && elapsed < _smCooldownMs();
    const cdRemaining = onCooldown ? Math.ceil((_smCooldownMs() - elapsed) / 1000) : 0;

    let proj;
    if (wins >= 10)     proj = { label: "🏆 Flawless Split",     color: "text-yellow-400" };
    else if (wins >= 8) proj = { label: "🥇 Championship Split", color: "text-yellow-300" };
    else if (wins >= 6) proj = { label: "🥈 Playoff Split",      color: "text-slate-200" };
    else if (wins >= 4) proj = { label: "🥉 Qualifying Split",   color: "text-orange-400" };
    else                proj = { label: "📋 Development Split",  color: "text-slate-500" };

    const condLv = skills.conditioning || 0;
    const condNote = condLv > 0 ? `<span class="text-rose-400 text-xs font-mono">🏃 Conditioning Lv${condLv} active</span>` : '';
    const cdBanner = onCooldown ? `
        <div class="flex items-center gap-3 bg-orange-950/40 border border-orange-700/40 rounded-xl px-4 py-3 mb-3">
            <span class="text-orange-400 text-lg shrink-0">⏱</span>
            <div class="flex-1 text-sm flex flex-wrap items-center gap-2">
                <span class="text-orange-300 font-black">Match Cooldown</span>
                <span class="text-slate-400">— next match in <span id="sm-cd-timer" class="text-orange-300 font-black">${cdRemaining}s</span></span>
                ${condNote}
            </div>
        </div>` : '';

    const matchesHTML = (seasonData.opponents || []).map((opp, i) => {
        const result = results[i];
        const isPlayed = result != null;
        const isWin = result === 'win';
        const ratingColor = opp.avgRating >= 95 ? 'text-orange-400' : opp.avgRating >= 90 ? 'text-red-400' : opp.avgRating >= 85 ? 'text-orange-400' : opp.avgRating >= 79 ? 'text-yellow-400' : 'text-slate-300';
        const eliteBadge = opp.isElite ? `<span class="text-[10px] font-black text-orange-400 bg-orange-950/60 border border-orange-700/40 px-1.5 py-0.5 rounded shrink-0">🔥</span>` : '';
        const rowBg = isPlayed ? (isWin ? 'bg-emerald-950/25 border-emerald-800/30' : 'bg-red-950/25 border-red-800/30') : opp.isElite ? 'bg-orange-950/15 border-orange-800/30' : 'bg-slate-700/40 border-slate-600';
        const badge = isPlayed
            ? (isWin ? `<span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-900/60 text-emerald-300 border border-emerald-700 shrink-0">WIN</span>`
                     : `<span class="px-3 py-1 rounded-full text-xs font-black bg-red-900/60 text-red-300 border border-red-700 shrink-0">LOSS</span>`)
            : `<span class="px-2 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-500 border border-slate-600 shrink-0">vs</span>`;
        const playBtn = !isPlayed
            ? (onCooldown
                ? `<span class="text-slate-600 text-xs font-black bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shrink-0 uppercase">Locked</span>`
                : `<button onclick="startSeasonGame(${i})" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-5 py-2 rounded-lg cursor-pointer transition shadow-md uppercase tracking-wide shrink-0">Play</button>`)
            : '';
        return `<div class="flex items-center gap-3 px-4 py-3 rounded-xl border ${rowBg} text-sm">
            <span class="text-slate-600 font-mono text-xs w-4 shrink-0">${i + 1}</span>
            <span class="text-xl shrink-0">${opp.logo}</span>
            <div class="flex-1 min-w-0">
                <div class="font-black text-slate-100 truncate">${opp.name}</div>
                <div class="text-slate-500 text-xs">${opp.region} · ${opp.style}</div>
            </div>
            <div class="shrink-0 text-right mr-1"><div class="${ratingColor} font-black">${opp.avgRating}</div><div class="text-slate-600 text-[10px]">avg</div></div>
            ${eliteBadge}${badge}${playBtn}
        </div>`;
    }).join('');

    const progress = Math.min(100, Math.round((played / total) * 100));
    container.innerHTML = `
        ${metaSlumpHTML}
        <div class="bg-gradient-to-br from-indigo-900/30 to-slate-900 p-5 rounded-2xl border border-indigo-700/40 mb-4">
            <div class="flex flex-wrap justify-between items-center gap-3 mb-3">
                <div><h3 class="text-lg font-black text-indigo-300 uppercase tracking-widest">Split ${seasonData.currentSplit}</h3>
                    <div class="text-slate-400 text-xs mt-0.5">${played} / ${total} matches played</div></div>
                <div class="flex gap-6">
                    <div class="text-center"><div class="text-3xl font-black text-emerald-400">${wins}</div><div class="text-slate-500 text-[10px] uppercase font-bold mt-0.5">Wins</div></div>
                    <div class="text-center"><div class="text-3xl font-black text-red-400">${losses}</div><div class="text-slate-500 text-[10px] uppercase font-bold mt-0.5">Losses</div></div>
                </div>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden"><div class="bg-indigo-500 h-2 rounded-full" style="width:${progress}%"></div></div>
            <div class="text-xs text-center"><span class="text-slate-400">Projected: </span><span class="${proj.color} font-bold">${proj.label}</span></div>
        </div>
        ${cdBanner}
        <div class="space-y-2">${matchesHTML}</div>`;

    if (onCooldown) _smStartCdTimer();
}

function _renderSeasonGame(container) {
    const st = _smState;
    const opp = seasonData.opponents[st.oppIdx];
    if (!opp.roster) opp.roster = _smGenRoster();
    if (!opp.rosterStats) opp.rosterStats = _smGenRosterStats(opp.avgRating, opp.style);

    // Score pips
    function pips(count, maxWins, colorClass) {
        return Array.from({ length: maxWins }, (_, i) =>
            `<span class="inline-block w-5 h-5 rounded-full border-2 ${i < count ? colorClass + ' border-transparent' : 'bg-slate-700 border-slate-600'}"></span>`
        ).join('');
    }

    const myPips  = pips(st.wins,   3, 'bg-indigo-400');
    const oppPips = pips(st.losses, 3, 'bg-red-500');

    // My squad stat previews (mini stat row per role)
    const roleRows = ['TOP','JNG','MID','ADC','SUP'].map(r => {
        const c = squad[r];
        if (!c) return '';
        const slump = _smSlumpDebuff(c);
        const slumpBadge = slump < 0 ? `<span class="text-xs font-black text-red-400 bg-red-950/50 border border-red-800/40 px-1 py-0.5 rounded font-mono shrink-0">${slump}</span>` : '';
        return `<div class="flex items-center gap-2 text-sm">
            <span class="text-slate-500 font-black w-8 uppercase shrink-0">${r}</span>
            <span class="${slump < 0 ? 'text-red-300' : 'text-slate-200'} font-bold truncate flex-1">${c.name}</span>
            ${slumpBadge}
            <span class="font-mono text-slate-400">MEC <span class="text-cyan-400 font-black text-base">${c.stats.mec}</span></span>
            <span class="font-mono text-slate-400">TMF <span class="text-purple-400 font-black text-base">${c.stats.tmf}</span></span>
            <span class="font-mono text-slate-400">MAP <span class="text-emerald-400 font-black text-base">${c.stats.map}</span></span>
        </div>`;
    }).join('');

    const coachRow = squad.COACH
        ? `<div class="flex items-center gap-2 text-sm border-t border-slate-700/50 pt-1 mt-1">
            <span class="text-slate-500 font-black w-8 uppercase">HC</span>
            <span class="text-slate-200 font-bold truncate flex-1">${squad.COACH.name}</span>
            <span class="font-mono text-slate-400">LDR <span class="text-yellow-400 font-black text-base">${squad.COACH.stats.ldr}</span></span>
           </div>` : '';

    // Opponent's generated team comp — now shows per-role stats just like the user's own roster
    const oppRosterRows = ['TOP','JNG','MID','ADC','SUP'].map(r => {
        const rs = opp.rosterStats[r];
        return `<div class="flex items-center gap-2 text-sm">
            <span class="text-slate-500 font-black w-8 uppercase shrink-0">${r}</span>
            <span class="text-slate-200 font-bold truncate flex-1">${opp.roster[r]}</span>
            <span class="font-mono text-slate-400">MEC <span class="text-cyan-400 font-black text-base">${rs.mec}</span></span>
            <span class="font-mono text-slate-400">TMF <span class="text-purple-400 font-black text-base">${rs.tmf}</span></span>
            <span class="font-mono text-slate-400">MAP <span class="text-emerald-400 font-black text-base">${rs.map}</span></span>
        </div>`;
    }).join('');

    // Play option cards
    const playCards = st.phase === 'pick' ? st.options.map(play => {
        const roleBuffs = play.myRoles.map(r => _smMetaBuff(squad[r], play.statKey));
        const metaBuffTotal = play.myRoles.length === 1 ? roleBuffs[0] : Math.round(roleBuffs.reduce((a,b)=>a+b,0) / roleBuffs.length);
        const isMeta = metaBuffTotal > 0;
        const myVal = _smStatVal(play);
        const oppVal = opp.stats[play.statKey] ?? opp.avgRating;
        const edge = myVal - oppVal;
        const edgeColor = edge > 3 ? 'text-emerald-400' : edge < -3 ? 'text-red-400' : 'text-yellow-400';
        const edgeStr = edge >= 0 ? `+${edge}` : `${edge}`;
        const rolesLabel = play.myRoles.join('+');
        const cardBorder = isMeta ? `border-emerald-600/60 hover:border-emerald-400` : 'border-slate-600 hover:border-indigo-500';
        const cardBg = isMeta ? `bg-emerald-950/30 hover:bg-emerald-950/50` : 'bg-slate-800 hover:bg-slate-700';
        const metaBadge = isMeta ? `<span class="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-1.5 py-0.5 rounded ml-1">⚡ META +${metaBuffTotal}</span>` : '';
        const baseVal = isMeta ? myVal - metaBuffTotal : null;
        const myValDisplay = isMeta
            ? `<span class="text-slate-400 line-through text-xs mr-1">${baseVal}</span><span class="text-emerald-300 font-black text-base">${myVal}</span>`
            : `<span class="text-slate-200 font-black text-base">${myVal}</span>`;
        return `<button onclick="makeSeasonPlay('${play.id}')" class="flex-1 min-w-[180px] ${cardBg} border ${cardBorder} rounded-xl p-4 text-left cursor-pointer transition group">
            <div class="flex items-start justify-between mb-1 flex-wrap gap-1">
                <span class="text-2xl">${play.icon}</span>${metaBadge}${_tacticsBadgeHTML()}
            </div>
            <div class="font-black text-slate-100 text-sm mb-0.5 group-hover:text-indigo-300">${play.label}</div>
            <div class="text-slate-500 text-xs mb-3 leading-tight">${play.desc}</div>
            <div class="font-mono text-sm space-y-1 border-t border-slate-700 pt-2">
                <div class="flex justify-between items-center"><span class="text-slate-400">${rolesLabel} ${play.statKey.toUpperCase()}</span>${myValDisplay}</div>
                <div class="flex justify-between items-center"><span class="text-slate-500">Opp ${play.statKey.toUpperCase()}</span><span class="text-slate-300 font-bold text-base">${oppVal}</span></div>
                <div class="flex justify-between items-center border-t border-slate-700/50 pt-1 mt-1"><span class="text-slate-400">Edge</span><span class="${edgeColor} font-black text-base">${edgeStr}</span></div>
            </div>
        </button>`;
    }).join('') : '';

    // Match log
    const logHTML = st.log.length ? st.log.map(e =>
        `<div class="flex items-start gap-2 text-sm font-mono ${e.won ? 'text-emerald-400' : 'text-red-400'}">
            <span class="shrink-0">${e.won ? '✅' : '❌'}</span>
            <span><span class="font-black">${e.icon} ${e.label}</span> — ${e.detail}</span>
        </div>`
    ).join('') : `<div class="text-slate-600 text-sm font-mono">No plays made yet.</div>`;

    // Result banner
    let resultBanner = '';
    if (st.phase === 'done') {
        const win = st.wins >= 3;
        resultBanner = `<div class="rounded-2xl p-5 text-center border ${win ? 'bg-indigo-950/60 border-indigo-600' : 'bg-red-950/40 border-red-800'}">
            <div class="text-4xl mb-2">${win ? '🏆' : '💀'}</div>
            <div class="text-xl font-black ${win ? 'text-indigo-300' : 'text-red-400'}">${win ? `Victory!` : `Defeat.`}</div>
            <div class="text-slate-400 text-sm mt-1">${win ? `Defeated ${opp.name} ${st.wins}–${st.losses}` : `Lost to ${opp.name} ${st.wins}–${st.losses}`}</div>
            <button onclick="_smBackToList()" class="mt-4 bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2 rounded-xl font-bold cursor-pointer transition text-sm">Back to Matches</button>
        </div>`;
    }

    container.innerHTML = `
        <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-3 flex-wrap">
                <button onclick="_smBackToList()" class="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition uppercase">← Matches</button>
                <span class="text-xl">${opp.logo}</span>
                <div>
                    <span class="font-black text-slate-100">${opp.name}</span>
                    <span class="text-slate-500 text-sm ml-2">${opp.region} · ${opp.style} · Avg <span class="font-bold text-slate-300">${opp.avgRating}</span></span>
                </div>
                <span class="text-slate-500 text-xs ml-auto font-mono">Match ${st.oppIdx + 1} of 10</span>
                ${(seasonData.metaTeams || []).length ? `<span class="text-xs font-black px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-400">⚡ ${seasonData.metaTeams.length} Team Metas</span>` : ''}
            </div>

            <!-- Score -->
            <div class="flex items-center justify-center gap-8 bg-slate-800/60 py-4 rounded-2xl border border-slate-700">
                <div class="text-center">
                    <div class="text-xs text-indigo-400 font-black uppercase tracking-wider mb-2">You</div>
                    <div class="flex gap-1.5">${myPips}</div>
                </div>
                <div class="text-slate-600 font-black text-lg">vs</div>
                <div class="text-center">
                    <div class="text-xs text-red-400 font-black uppercase tracking-wider mb-2">${opp.name}</div>
                    <div class="flex gap-1.5">${oppPips}</div>
                </div>
            </div>

            ${st.phase === 'done' ? resultBanner : `
            <!-- Round header -->
            <div class="text-center text-sm font-black text-slate-400 uppercase tracking-widest">
                Round ${st.round} — Choose Your Play
            </div>

            <!-- Play options -->
            <div class="flex flex-wrap gap-3">${playCards}</div>`}

            <!-- Three-col layout: your roster + opponent comp + match log -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                    <div class="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Your Roster</div>
                    <div class="space-y-2">${roleRows}${coachRow}</div>
                </div>
                <div class="bg-slate-800/60 rounded-xl border border-red-900/40 p-4">
                    <div class="text-xs font-black uppercase tracking-widest text-red-400 mb-3">${opp.name} Roster</div>
                    <div class="space-y-2">${oppRosterRows}</div>
                </div>
                <div class="bg-slate-950/60 rounded-xl border border-slate-700 p-4 font-mono">
                    <div class="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Match Log</div>
                    <div class="space-y-2">${logHTML}</div>
                </div>
            </div>
        </div>`;
}

function renderSeasonTab() {
    const tab = document.getElementById("tab-season"); if (!tab) return;
    const wins = seasonData.splitWins, losses = seasonData.splitLosses;
    const played = (seasonData.matchResults || []).filter(r => r !== null).length;
    const metas = seasonData.metaTeams || [];
    const slumps = seasonData.slumpTeams || [];
    const eliteTeams = seasonData.eliteTeams || [];

    // Split standings chart — ranks the user's team against simulated CPU records
    const standingsRows = (seasonData.opponents || []).map(opp => ({
        name: opp.name, logo: opp.logo, wins: opp.simWins ?? 0, losses: opp.simLosses ?? 0, isUser: false, isElite: !!opp.isElite,
    }));
    standingsRows.push({ name: teamIdentity.name || 'Your Team', logo: teamIdentity.logo || '🛡️', wins, losses, isUser: true, isElite: false });
    standingsRows.sort((a, b) => b.wins - a.wins || a.losses - b.losses || (a.isUser ? -1 : 1));
    const userRank = standingsRows.findIndex(r => r.isUser) + 1;
    const standingsHTML = standingsRows.map((r, i) => {
        const rank = i + 1;
        const rankColor = rank === 1 ? 'text-yellow-400' : rank <= 3 ? 'text-slate-200' : 'text-slate-500';
        const rowBg = r.isUser ? 'bg-indigo-900/40 border-indigo-600/60' : 'bg-slate-800/40 border-slate-700/40';
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        return `<div class="flex items-center gap-3 px-3 py-2 rounded-lg border ${rowBg} text-sm">
            <span class="${rankColor} font-black w-6 text-center">${rank}</span>
            <span class="text-lg shrink-0">${r.logo}</span>
            <span class="${r.isUser ? 'text-indigo-200' : 'text-slate-300'} font-bold flex-1 truncate">${r.name}${r.isUser ? ' (You)' : ''}</span>
            ${r.isElite ? '<span class="text-[10px]">🔥</span>' : ''}
            <span class="font-mono text-xs"><span class="text-emerald-400 font-black">${r.wins}W</span> <span class="text-red-400 font-black">${r.losses}L</span></span>
            <span class="w-5 text-center">${medal}</span>
        </div>`;
    }).join('');
    const standingsPanel = `<div class="bg-slate-900/60 rounded-xl border border-slate-700 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
            <span class="text-lg">📊</span>
            <span class="text-xs font-black text-slate-300 uppercase tracking-widest">Split Standings</span>
            <span class="ml-auto text-xs font-mono text-slate-500">You are ranked <span class="text-indigo-300 font-black">#${userRank}</span> of ${standingsRows.length}</span>
        </div>
        <div class="p-3 space-y-1.5">${standingsHTML}</div>
    </div>`;

    // Elite split panel for Season tab
    let elitePanel = '';
    if (seasonData.eliteMode && eliteTeams.length > 0) {
        const eliteRows = eliteTeams.map(i => {
            const opp = (seasonData.opponents || [])[i];
            if (!opp) return '';
            const r = (seasonData.matchResults || [])[i];
            const resultBadge = r === 'win' ? `<span class="text-emerald-400 font-black text-xs ml-auto">W</span>` : r === 'loss' ? `<span class="text-red-300 font-black text-xs ml-auto">L</span>` : `<span class="text-slate-600 text-xs ml-auto">—</span>`;
            return `<div class="flex items-center gap-2 py-1.5 border-b border-red-900/30 text-xs">
                <span>${opp.logo}</span>
                <span class="text-slate-200 font-bold flex-1 truncate">${opp.name}</span>
                <span class="text-slate-500">${opp.style}</span>
                <span class="text-orange-400 font-black font-mono">${opp.avgRating}</span>
                ${resultBadge}
            </div>`;
        }).join('');
        elitePanel = `<div class="bg-gradient-to-r from-red-950/70 to-orange-950/40 border border-red-600/50 rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-red-800/40">
                <span class="text-xl">🔥</span>
                <span class="text-[10px] font-black text-red-400 uppercase tracking-widest">Elite Split — ${eliteTeams.length} world-class team${eliteTeams.length > 1 ? 's' : ''}</span>
                <span class="ml-auto text-[10px] font-black text-orange-400 bg-orange-950/60 border border-orange-700/40 px-2 py-0.5 rounded font-mono">HARD</span>
            </div>
            <div class="px-4 py-3">
                <p class="text-slate-400 text-xs mb-3 font-mono">This split contains elite opponents rated 95–99. Expect brutal stat checks.</p>
                ${eliteRows}
            </div>
        </div>`;
    }

    const rewardTiers = [
        { label: "🏆 Flawless (10W)",      wins: 10, reward: 8000 },
        { label: "🥇 Championship (8–9W)",  wins: 8,  reward: 5000 },
        { label: "🥈 Playoff (6–7W)",       wins: 6,  reward: 3000 },
        { label: "🥉 Qualifying (4–5W)",    wins: 4,  reward: 1500 },
        { label: "📋 Development (0–3W)",   wins: 0,  reward: 500  },
    ];

    // Meta panel for Season tab — team-based, mirrors slump panel
    let metaPanel = '';
    if (metas.length) {
        const buffedSquad = Object.entries(squad)
            .filter(([, c]) => c && metas.some(m => m.team === c.team))
            .flatMap(([role, c]) => metas.filter(m => m.team === c.team).map(m =>
                `<div class="flex items-center gap-3 py-1.5 border-b border-emerald-900/30 text-xs">
                    <span class="text-slate-500 font-black w-8 uppercase shrink-0">${role}</span>
                    <span class="text-emerald-200 font-bold flex-1 truncate">${c.name}</span>
                    <span class="text-slate-500 shrink-0">${c.team}</span>
                    <span class="text-emerald-400 font-black font-mono shrink-0">+${m.buff} ${m.statKey.toUpperCase()}</span>
                </div>`
            )).join('');

        const teamRows = metas.map(m =>
            `<div class="flex justify-between items-center py-1.5 border-b border-slate-700/30 text-xs">
                <span class="text-slate-300 font-bold">${m.team}</span>
                <span class="text-emerald-400 font-black font-mono">+${m.buff} ${m.statKey.toUpperCase()}</span>
            </div>`
        ).join('');

        metaPanel = `<div class="bg-emerald-950/20 border border-emerald-800/30 rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-emerald-800/30">
                <span class="text-emerald-400">⚡</span>
                <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Team Metas — ${metas.length} teams in hot form this split</span>
            </div>
            <div class="px-4 py-3 space-y-3">
                <div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Meta Teams</div>
                    ${teamRows}
                </div>
                <div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Buffed Players</div>
                    ${buffedSquad || `<div class="text-xs text-slate-500 font-mono py-1">None of your current squad players are on meta teams.</div>`}
                </div>
            </div>
        </div>`;
    }

    // Slump table for Season tab
    let slumpPanel = '';
    if (slumps.length) {
        // Highlight active squad players on slumped teams
        const affectedSquad = Object.entries(squad)
            .filter(([, c]) => c && slumps.some(s => s.team === c.team))
            .map(([role, c]) => {
                const slump = slumps.find(s => s.team === c.team);
                return `<div class="flex items-center gap-2 py-1.5 border-b border-red-900/30 text-xs">
                    <span class="text-slate-500 font-black w-8 uppercase shrink-0">${role}</span>
                    <span class="text-red-200 font-bold flex-1 truncate">${c.name}</span>
                    <span class="text-slate-500 shrink-0">${c.team}</span>
                    <span class="text-red-400 font-black font-mono shrink-0">${slump.debuff} stats</span>
                </div>`;
            }).join('');

        const teamRows = slumps.map(s =>
            `<div class="flex justify-between items-center py-1.5 border-b border-slate-700/30 text-xs">
                <span class="text-slate-300 font-bold">${s.team}</span>
                <span class="text-red-400 font-black font-mono">${s.debuff} to all stats</span>
            </div>`
        ).join('');

        slumpPanel = `<div class="bg-red-950/20 border border-red-800/30 rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-red-800/30">
                <span class="text-red-400">📉</span>
                <span class="text-[10px] font-black text-red-500 uppercase tracking-widest">Team Slumps — ${slumps.length} real teams in rough form this split</span>
            </div>
            <div class="px-4 py-3 space-y-3">
                <div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Slumped Teams</div>
                    ${teamRows}
                </div>
                <div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Affected Players</div>
                    ${affectedSquad || `<div class="text-xs text-emerald-500 font-mono py-1">✓ None of your current squad players are on slumped teams.</div>`}
                </div>
                <p class="text-[11px] text-slate-500 font-mono">Stat penalties apply during Season Matches only. Swap out affected players to avoid the debuff.</p>
            </div>
        </div>`;
    }

    const trophyHTML = seasonData.trophyCase.length
        ? seasonData.trophyCase.map(t => {
            const metaChip = t.metaTeamCount ? `<span class="ml-1 text-[10px] font-mono text-emerald-500">⚡ ${t.metaTeamCount} metas</span>` : '';
            const eliteChip = t.elite ? `<span class="ml-1 text-[10px] font-black text-orange-400">🔥 ELITE</span>` : '';
            return `<div class="flex items-center justify-between bg-slate-700/60 p-3 rounded-xl border ${t.elite ? 'border-orange-800/40' : 'border-slate-600'}">
                <div>
                    <div class="font-bold text-slate-200 text-sm">Split ${t.split} — ${t.tier}${metaChip}${eliteChip}</div>
                    <div class="text-slate-400 text-xs">${t.wins}W–${t.losses}L · ${t.date}</div>
                </div>
                <div class="text-emerald-400 font-black text-sm">+${t.reward} BE</div>
            </div>`;
        }).join('')
        : `<div class="text-slate-500 text-center py-8 text-sm">No completed splits yet.<br>Play Season Matches in the <strong class="text-indigo-400">Play</strong> tab to get started.</div>`;

    tab.innerHTML = `<div class="space-y-5 pb-10 pt-2">
        <div class="bg-gradient-to-br from-indigo-900/30 to-slate-900 p-5 rounded-2xl border border-indigo-700/40 shadow-xl flex flex-wrap gap-4 items-center justify-between">
            <div>
                <div class="text-xs text-indigo-400 font-black uppercase tracking-widest mb-1">Current Season</div>
                <div class="text-2xl font-black text-indigo-200">Split ${seasonData.currentSplit}</div>
                <div class="text-slate-400 text-sm mt-1">${played === 0 ? 'Not started' : `${played}/10 matches played`}</div>
            </div>
            <div class="flex gap-6">
                <div class="text-center"><div class="text-3xl font-black text-emerald-400">${wins}</div><div class="text-slate-500 text-xs uppercase font-bold mt-0.5">Wins</div></div>
                <div class="text-center"><div class="text-3xl font-black text-red-400">${losses}</div><div class="text-slate-500 text-xs uppercase font-bold mt-0.5">Losses</div></div>
            </div>
            <button onclick="switchTab('tournament'); setTimeout(startSeasonMatchMode, 50);" class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-5 py-2.5 rounded-xl text-sm cursor-pointer transition uppercase tracking-wide">Go to Matches →</button>
        </div>

        <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Reward Tiers</h3>
            <div class="space-y-1">${rewardTiers.map(t => `<div class="flex justify-between text-xs py-1 border-b border-slate-700/50 text-slate-400"><span>${t.label}</span><span>+${t.reward} BE</span></div>`).join('')}</div>
        </div>

        ${standingsPanel}
        ${elitePanel ? elitePanel : ''}
        ${metaPanel || slumpPanel ? `<div class="grid grid-cols-1 ${metaPanel && slumpPanel ? 'lg:grid-cols-2' : ''} gap-4">${metaPanel}${slumpPanel}</div>` : ''}

        <div>
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">🏅 Trophy Case</h3>
            <div class="space-y-2">${trophyHTML}</div>
        </div>
    </div>`;
}

function toggleDarkMode() {
    const isLight = document.documentElement.classList.toggle("light-mode");
    localStorage.setItem("lol_light_mode", isLight ? "1" : "0");
    const btn = document.getElementById("dark-mode-btn");
    if (btn) btn.textContent = isLight ? "🌙" : "☀️";
}

// --- Player Picker Drawer ---
let _pickerFilters = { region: 'ALL', sort: 'rating' };

function populateDropdownFilters() { /* replaced by openPlayerPicker */ }
function renderFilteredPicker() { /* replaced by renderPickerCards */ }

function _isSquadLockedForSeason() {
    return (seasonData.matchResults || []).some(r => r !== null);
}

function selectSlot(role) {
    if (_isSquadLockedForSeason()) {
        openBenchSwap(role);
        return;
    }
    openPlayerPicker(role);
}

// While a Season Split is locked, the only roster change allowed is substituting a benched player
// in for a starter (or vice versa) — no brand-new cards can be pulled in from the Club.
let _benchSwapRole = null;
const _LEGACY_WILDCARD_Q = ["Champion", "MVP", "Finalist", "MSI", "FirstStand"];

function _benchSwapEligible(card, targetSlot) {
    if (!card) return false;
    if (targetSlot === 'COACH') return card.role === 'COACH';
    if (card.role === 'COACH') return false;
    return card.role === targetSlot || _LEGACY_WILDCARD_Q.includes(card.quality);
}

function openBenchSwap(role) {
    const isBenchSlot = role.startsWith('SUB');
    const sourceCard = squad[role];
    let validSwaps; // [{ slot, card }] — card may be null when promoting into an empty starter slot

    if (isBenchSlot) {
        if (!sourceCard) { showToast("This bench slot is empty.", "error"); return; }
        validSwaps = ['TOP','JNG','MID','ADC','SUP','COACH']
            .filter(slot => _benchSwapEligible(sourceCard, slot))
            .map(slot => ({ slot, card: squad[slot] }));
    } else {
        validSwaps = ['SUB1','SUB2','SUB3']
            .filter(slot => squad[slot] && _benchSwapEligible(squad[slot], role))
            .map(slot => ({ slot, card: squad[slot] }));
    }

    if (validSwaps.length === 0) {
        showToast(isBenchSlot
            ? "No eligible starting slot to substitute this benched player into."
            : "No eligible benched player can sub into this role.", "error");
        return;
    }

    _benchSwapRole = role;
    const fromLabel = document.getElementById('bench-swap-from-name');
    if (fromLabel) fromLabel.textContent = sourceCard ? sourceCard.name : role;

    const optionsEl = document.getElementById('bench-swap-options');
    if (optionsEl) {
        optionsEl.innerHTML = '';
        validSwaps.forEach(({ slot, card }) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'flex flex-col items-center gap-2 cursor-pointer group';
            if (card) {
                wrapper.appendChild(createCardElement(card, true));
            } else {
                const empty = document.createElement('div');
                empty.className = 'w-52 min-h-[288px] bg-slate-900 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-sm';
                empty.textContent = 'Empty';
                wrapper.appendChild(empty);
            }
            const label = document.createElement('div');
            label.className = 'text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-300';
            label.textContent = slot;
            wrapper.appendChild(label);
            wrapper.onclick = () => performBenchSwap(slot);
            optionsEl.appendChild(wrapper);
        });
    }

    const modal = document.getElementById('bench-swap-modal');
    if (modal) modal.classList.remove('hidden');
}

function performBenchSwap(targetSlot) {
    const role = _benchSwapRole;
    if (!role) return;
    const temp = squad[role];
    squad[role] = squad[targetSlot];
    squad[targetSlot] = temp;
    closeBenchSwap();
    saveGame();
    renderSquadView();
    showToast("Substitution made!", "success");
}

function closeBenchSwap() {
    const modal = document.getElementById('bench-swap-modal');
    if (modal) modal.classList.add('hidden');
    _benchSwapRole = null;
}

function openPlayerPicker(role) {
    activeSlot = role;
    document.getElementById('picker-slot-label').textContent = role;

    // Populate year dropdown (sorted newest first)
    const years = ['ALL', ...[...new Set(club.map(c => String(c.year)))].sort((a,b) => b-a)];
    document.getElementById('picker-year').innerHTML = years.map(y =>
        `<option value="${y}">${y === 'ALL' ? 'All Years' : y}</option>`).join('');

    // Populate team dropdown (sorted alphabetically)
    const teams = ['ALL', ...[...new Set(club.map(c => c.team))].sort()];
    document.getElementById('picker-team').innerHTML = teams.map(t =>
        `<option value="${t}">${t === 'ALL' ? 'All Teams' : t}</option>`).join('');

    // Reset filter buttons to defaults
    _pickerFilters = { region: 'ALL', sort: 'rating' };
    document.querySelectorAll('.ppf-region').forEach(b => b.classList.remove('ppf-active'));
    document.querySelector('.ppf-region[onclick*="\'ALL\'"]').classList.add('ppf-active');
    document.querySelectorAll('.ppf-sort').forEach(b => b.classList.remove('ppf-active'));
    document.querySelector('.ppf-sort[onclick*="\'rating\'"]').classList.add('ppf-active');

    document.getElementById('player-picker').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderPickerCards();
}

function closePlayerPicker() {
    document.getElementById('player-picker').classList.add('hidden');
    document.body.style.overflow = '';
    renderSquadView();
}

function setPickerFilter(type, val, btn) {
    _pickerFilters[type] = val;
    const cls = type === 'region' ? '.ppf-region' : '.ppf-sort';
    document.querySelectorAll(cls).forEach(b => b.classList.remove('ppf-active'));
    btn.classList.add('ppf-active');
    renderPickerCards();
}

function renderPickerCards() {
    const container = document.getElementById('picker-cards');
    if (!container) return;
    container.innerHTML = '';

    let pool = [...club];

    // Remove players already in other squad slots
    const occupied = Object.entries(squad)
        .filter(([slot, card]) => slot !== activeSlot && card !== null)
        .map(([, card]) => card);
    pool = pool.filter(p => !occupied.some(c => c.uniqueId === p.uniqueId));

    // Auto-filter by role: main slots show only that role + Legacy wildcards (non-coach); COACH slot = coaches only; subs = all
    if (activeSlot === 'COACH') {
        pool = pool.filter(p => p.role === 'COACH');
    } else if (['TOP','JNG','MID','ADC','SUP'].includes(activeSlot)) {
        pool = pool.filter(p => p.role !== 'COACH' && (p.role === activeSlot || ["Champion", "Finalist", "MSI", "FirstStand"].includes(p.quality)));
        // Sort: exact role match first, then Legacy flex-eligible cards, then others — by rating desc within each group
        const _legacyQualities = new Set(["Champion", "MVP", "Finalist", "MSI", "FirstStand"]);
        pool.sort((a, b) => {
            const aGroup = a.role === activeSlot ? 0 : _legacyQualities.has(a.quality) ? 1 : 2;
            const bGroup = b.role === activeSlot ? 0 : _legacyQualities.has(b.quality) ? 1 : 2;
            if (aGroup !== bGroup) return aGroup - bGroup;
            return b.rating - a.rating;
        });
    }

    // Region filter
    if (_pickerFilters.region !== 'ALL') pool = pool.filter(p => p.region === _pickerFilters.region);

    // Year dropdown
    const yearVal = document.getElementById('picker-year').value;
    if (yearVal !== 'ALL') pool = pool.filter(p => String(p.year) === yearVal);

    // Team dropdown
    const teamVal = document.getElementById('picker-team').value;
    if (teamVal !== 'ALL') pool = pool.filter(p => p.team === teamVal);

    // Sort
    if (_pickerFilters.sort === 'rating') pool.sort((a,b) => b.rating - a.rating);
    else if (_pickerFilters.sort === 'mec') pool.sort((a,b) => b.stats.mec - a.stats.mec);
    else if (_pickerFilters.sort === 'tmf') pool.sort((a,b) => b.stats.tmf - a.stats.tmf);
    else if (_pickerFilters.sort === 'map') pool.sort((a,b) => b.stats.map - a.stats.map);

    document.getElementById('picker-result-count').textContent = `${pool.length} players`;

    if (pool.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm font-mono py-12 w-full text-center">No players match the current filters.</p>';
        return;
    }

    const currentCard = squad[activeSlot];
    const addCardEl = (card) => {
        const isCurrentlyAssigned = currentCard && currentCard.uniqueId === card.uniqueId;
        const wrapper = document.createElement('div');
        wrapper.className = 'relative';
        const el = createCardElement(card, false, () => {
            squad[activeSlot] = isCurrentlyAssigned ? null : card;
            closePlayerPicker();
            saveGame();
        }, activeSlot);
        if (isCurrentlyAssigned) {
            el.style.outline = '3px solid #ef4444';
            el.style.outlineOffset = '3px';
            el.title = 'Currently assigned — click to remove';
        }
        wrapper.appendChild(el);

        // Comparison overlay vs currently assigned card
        if (currentCard && !isCurrentlyAssigned && card.stats && currentCard.stats) {
            const rDiff = card.rating - currentCard.rating;
            const diffs = ['mec','tmf','map'].map(s => {
                const d = (card.stats[s] || 0) - (currentCard.stats[s] || 0);
                return d !== 0 ? `<span class="${d > 0 ? 'text-emerald-400' : 'text-red-400'}">${s.toUpperCase()} ${d > 0 ? '+' : ''}${d}</span>` : '';
            }).filter(Boolean).join(' ');
            if (rDiff !== 0 || diffs) {
                const rColor = rDiff > 0 ? 'text-emerald-400' : rDiff < 0 ? 'text-red-400' : 'text-slate-400';
                const badge = document.createElement('div');
                badge.className = 'absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-600 rounded-lg px-2 py-1 text-[9px] font-black font-mono z-30 whitespace-nowrap text-center';
                badge.innerHTML = `<span class="${rColor}">OVR ${rDiff > 0 ? '+' : ''}${rDiff}</span>${diffs ? ' · ' + diffs : ''}`;
                wrapper.appendChild(badge);
            }
        }
        container.appendChild(wrapper);
    };

    if (_pickerFilters.sort === 'role') {
        const roleOrder = ['TOP', 'JNG', 'MID', 'ADC', 'SUP', 'COACH'];
        const grouped = {};
        roleOrder.forEach(r => { grouped[r] = []; });
        pool.forEach(c => { (grouped[c.role] ? grouped[c.role] : grouped['SUP']).push(c); });
        roleOrder.forEach(r => { grouped[r].sort((a, b) => b.rating - a.rating); });

        roleOrder.forEach(r => {
            if (!grouped[r].length) return;
            const header = document.createElement('div');
            header.className = 'w-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 pt-3 pb-1 border-b border-slate-700/40';
            const roleIcon = (window.roleIcons && window.roleIcons[r]) || '';
            header.innerHTML = `${roleIcon} <span>${r}</span> <span class="text-slate-600 font-mono">${grouped[r].length}</span>`;
            container.appendChild(header);
            grouped[r].forEach(addCardEl);
        });
        return;
    }

    pool.forEach(addCardEl);
}

function renderSquadView() {
    const lockBanner = document.getElementById("squad-lock-banner");
    if (lockBanner) lockBanner.classList.toggle("hidden", !_isSquadLockedForSeason());
    const slots = ["COACH", "TOP", "JNG", "MID", "ADC", "SUP", "SUB1", "SUB2", "SUB3"];
    slots.forEach(role => {
        const slot = document.getElementById(`squad-${role}`); if(!slot) return; slot.innerHTML = "";
        if(squad[role]) {
            let cardEl = createCardElement(squad[role], true, () => selectSlot(role), role);
            slot.appendChild(cardEl);
        } else {
            slot.innerHTML = `<div class="text-center text-slate-500 font-bold tracking-widest text-sm flex flex-col items-center justify-center h-full w-full"><span class="mb-3 flex justify-center">${(window.roleIconsLg && window.roleIconsLg[role]) || '<span class="text-4xl opacity-40">+</span>'}</span><span class="uppercase">${role}</span></div>`;
        }
    });
    computeChemistry();
}

function clearSquad() {
    if (_isSquadLockedForSeason()) {
        showToast("Squad is locked for this Season Split — finish or advance the split to make changes.", "error");
        return;
    }
    squad = { COACH: null, TOP: null, JNG: null, MID: null, ADC: null, SUP: null, SUB1: null, SUB2: null, SUB3: null }; saveGame();
}

function autoFillSquad() {
    if (_isSquadLockedForSeason()) {
        showToast("Squad is locked for this Season Split.", "error");
        return;
    }
    const used = new Set();
    const newSquad = { COACH: null, TOP: null, JNG: null, MID: null, ADC: null, SUP: null, SUB1: null, SUB2: null, SUB3: null };

    // Pick best card per role by rating, preferring same-region chemistry
    const regionCounts = {};
    club.filter(c => c.role !== 'COACH').forEach(c => { regionCounts[c.region] = (regionCounts[c.region] || 0) + 1; });
    const bestRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    ['TOP', 'JNG', 'MID', 'ADC', 'SUP'].forEach(role => {
        const candidates = club.filter(c => c.role === role && !used.has(c.uniqueId))
            .sort((a, b) => {
                const aBonus = (bestRegion && a.region === bestRegion) ? 3 : 0;
                const bBonus = (bestRegion && b.region === bestRegion) ? 3 : 0;
                return (b.rating + bBonus) - (a.rating + aBonus);
            });
        if (candidates.length) {
            newSquad[role] = candidates[0];
            used.add(candidates[0].uniqueId);
        }
    });

    // Coach: best available
    const coaches = club.filter(c => c.role === 'COACH' && !used.has(c.uniqueId)).sort((a, b) => b.rating - a.rating);
    if (coaches.length) { newSquad.COACH = coaches[0]; used.add(coaches[0].uniqueId); }

    // Fill bench with next-best per role
    const subSlots = ['SUB1', 'SUB2', 'SUB3'];
    let subIdx = 0;
    ['TOP', 'JNG', 'MID', 'ADC', 'SUP'].forEach(role => {
        if (subIdx >= 3) return;
        const bench = club.filter(c => c.role === role && !used.has(c.uniqueId)).sort((a, b) => b.rating - a.rating);
        if (bench.length) { newSquad[subSlots[subIdx]] = bench[0]; used.add(bench[0].uniqueId); subIdx++; }
    });

    squad = newSquad;
    saveGame();
    renderSquadView();
    showToast("Squad auto-filled with your best available cards!", "success");
}

function getTierFromRating(rating) {
    if (rating >= 98) return "Challenger";
    if (rating >= 96) return "Grandmaster";
    if (rating >= 94) return "Master";
    if (rating >= 90) return "Diamond";
    if (rating >= 85) return "Platinum";
    if (rating >= 80) return "Gold";
    return "Silver";
}

function computeChemistry() {
    let totalRating = 0; let count = 0; let active = []; let sums = { mec:0, tmf:0, map:0 };
    ["TOP", "JNG", "MID", "ADC", "SUP"].forEach(role => {
        if(squad[role]) {
            let p = (squad[role].role !== role) ? 20 : 0;
            let finalR = Math.max(0, squad[role].rating - p);
            totalRating += finalR; count++; active.push(squad[role]);
            sums.mec += squad[role].stats.mec; sums.tmf += squad[role].stats.tmf; sums.map += squad[role].stats.map;
        }
    });

    let avgRating = count > 0 ? Math.round(totalRating / count) : 0;
    document.getElementById("overview-rating").innerText = avgRating;
    document.getElementById("overview-average-tier").innerText = count > 0 ? getTierFromRating(avgRating) : "None";
    document.getElementById("overview-avg-mec").innerText = count > 0 ? Math.round(sums.mec / count) : 0;
    document.getElementById("overview-avg-tmf").innerText = count > 0 ? Math.round(sums.tmf / count) : 0;
    document.getElementById("overview-avg-map").innerText = count > 0 ? Math.round(sums.map / count) : 0;

    let regionChem = 0; let yearChem = 0; let trainBonus = getTrainingBonus();

    // Coach bonus scales with coach rating
    function getCoachBonus(coach) {
        if (!coach) return 0;
        const r = coach.rating;
        if (r >= 98) return 5;
        if (r >= 94) return 4;
        if (r >= 90) return 3;
        if (r >= 85) return 2;
        return 1;
    }
    let coachBonus = getCoachBonus(squad["COACH"]);

    // Legacy pedigree bonus: reward squads with tournament-winning cards
    const ALL_LEGACY_Q = ["Champion", "MVP", "Finalist", "MSI", "FirstStand"];
    let legacyInSquad = active.filter(c => ALL_LEGACY_Q.includes(c.quality)).length;
    let legacyBonus = legacyInSquad >= 4 ? 2 : legacyInSquad >= 2 ? 1 : 0;

    if(count === 5) {
        // Legacy wildcards (Champion/MVP/Finalist/MSI/FirstStand) are excluded from region/year chemistry checks — they adapt to any lineup
        const LEGACY_QUALITIES = ["Champion", "MVP", "Finalist", "MSI", "FirstStand"];
        let nonLegacy = active.filter(c => !LEGACY_QUALITIES.includes(c.quality));
        let legacyCount = active.filter(c => LEGACY_QUALITIES.includes(c.quality)).length;

        if (legacyCount === 5) {
            regionChem = 5; yearChem = 5;
        } else {
            let regs = nonLegacy.map(c => c.region);
            let uReg = new Set(regs).size;
            if(uReg <= 1) regionChem = 5; else if(uReg <= 2) regionChem = 3; else if(uReg <= 3) regionChem = 2; else regionChem = 1;

            // Smooth year chemistry curve: every additional era costs one point
            let yrs = nonLegacy.map(c => c.year);
            let uY = new Set(yrs).size;
            if(uY <= 1) yearChem = 5; else if(uY <= 2) yearChem = 4; else if(uY <= 3) yearChem = 3; else if(uY <= 4) yearChem = 2; else yearChem = 1;

            let nonLegTeams = nonLegacy.map(c => window.teamLineageBridges[c.team] || c.team);
            if(nonLegTeams.length === 0 || new Set(nonLegTeams).size === 1) regionChem += 2;
            regionChem = Math.min(5, regionChem);
        }
    }

    document.getElementById("overview-chem-region").innerText = `${regionChem} / 5`;
    document.getElementById("overview-chem-year").innerText = `${yearChem} / 5`;
    document.getElementById("overview-training-bonus").innerText = `+${trainBonus}`;
    document.getElementById("overview-coach-bonus").innerText = `+${coachBonus}`;
    document.getElementById("overview-legacy-bonus").innerText = `+${legacyBonus}`;

    let totalPower = avgRating + regionChem + yearChem + trainBonus + coachBonus + legacyBonus;
    document.getElementById("overview-chem-total").innerText = totalPower;
    return { totalPower, avgStats: { mec: count>0?sums.mec/count:0, tmf: count>0?sums.tmf/count:0, map: count>0?sums.map/count:0 } };
}

function createCardElement(card, isMini, onClickAction, activeAssignedRole) {
    const cardDiv = document.createElement("div");
    let isOutOfPosition = activeAssignedRole && card.role !== activeAssignedRole && !activeAssignedRole.includes('SUB') && activeAssignedRole !== 'COACH';
    let displayRating = isOutOfPosition && card.role !== "COACH" ? Math.max(0, card.rating - 20) : card.rating;

    let bgClass = `card-bg-${card.quality}`;
    if (card.role === "COACH") {
        const legacyCoachQualities = ['Master', 'Grandmaster', 'Challenger', 'Champion'];
        bgClass = legacyCoachQualities.includes(card.quality) ? "legacy-coach-card-style" : "coach-card-style";
    }

    const darkCardTypes = ["Challenger", "Champion", "MVP", "Finalist", "MSI", "FirstStand", "Diamond"];
    const isDarkCard = darkCardTypes.includes(card.quality) || card.role === "COACH";
    // Master/Grandmaster use dark text — their gradients start very light, white text disappears
    const isMidCard = ["Master", "Grandmaster"].includes(card.quality);
    const textBase = isDarkCard ? "text-white" : isMidCard ? "text-slate-900" : "text-slate-900";
    const textMuted = isDarkCard ? "text-slate-300" : isMidCard ? "text-slate-800 font-black" : "text-slate-700 font-black";
    const textOpacity = isDarkCard ? "text-white/80" : isMidCard ? "text-slate-700 font-black" : "text-slate-800 font-black";
    const dividerColor = isDarkCard ? "border-white/15" : "border-black/20";

    const scaleClass = isMini ? '' : 'hover:scale-105';
    // overflow-hidden on ALL cards: tier badge is now an inside header, no floating badge needed
    cardDiv.className = `${bgClass} rounded-xl w-52 flex flex-col items-center select-none relative transition-transform ${scaleClass} shadow-xl overflow-hidden`;
    if (onClickAction) { cardDiv.onclick = onClickAction; cardDiv.className += " cursor-pointer"; }

    const initials = card.name.slice(0, 2).toUpperCase();

    // Nationality flag: specific override first, then region default
    const flag = (window.playerNationalityOverrides && window.playerNationalityOverrides[card.name])
        || (window.regionDefaultFlags && window.regionDefaultFlags[card.region])
        || '';

    // Official LoL role icon
    const roleIconHtml = (window.roleIcons && window.roleIcons[card.role]) || '';

    // Tier header — always inside the card (no clipping bugs)
    const tierLabel = card.signature ? '✦ SIGNATURE ✦' : (card.role === "COACH" ? "COACH STAFF" : card.quality);
    if (card.signature) cardDiv.classList.add('card-signature');

    cardDiv.innerHTML = `
        <div class="w-full text-center py-1.5 px-3 bg-black/25 border-b ${dividerColor} text-[10px] font-black uppercase tracking-widest ${textBase} rounded-t-xl">${tierLabel}</div>
        <div class="p-4 w-full flex flex-col items-center">
            <div class="w-full flex justify-between text-[11px] font-black uppercase mb-1 items-center">
                <span class="bg-black/20 ${textBase} px-2 py-0.5 rounded-md flex items-center gap-1">${roleIconHtml} ${card.role}</span>
                <span class="${textOpacity} tracking-tight flex items-center gap-1">${flag} ${card.region}</span>
            </div>
            <div class="flex items-center gap-3 w-full mt-2">
                <div class="text-4xl font-black tracking-tighter drop-shadow-md ${textBase}"><span>${displayRating}</span></div>
                <div class="w-16 h-16 rounded-full border-2 border-white/30 shadow mx-auto bg-black/30 flex items-center justify-center text-lg font-black ${textBase} select-none">${initials}</div>
            </div>
            <div class="font-black text-base truncate w-full mt-3 text-center drop-shadow-sm ${textBase}">${card.name}</div>
            <div class="text-xs font-bold truncate w-full mb-2 text-center ${textMuted}">${card.team} [${card.year}]</div>
            <div class="stat-grid border-t ${dividerColor} pt-2 text-xs w-full">
                <div class="${textBase}"><span class="${textMuted} mr-1">MEC</span>${card.stats.mec}</div>
                <div class="${textBase}"><span class="${textMuted} mr-1">TMF</span>${card.stats.tmf}</div>
                <div class="${textBase}"><span class="${textMuted} mr-1">FRM</span>${card.stats.frm}</div>
                <div class="${textBase}"><span class="${textMuted} mr-1">CMP</span>${card.stats.cmp}</div>
                <div class="${textBase}"><span class="${textMuted} mr-1">MAP</span>${card.stats.map}</div>
                <div class="${textBase}"><span class="${textMuted} mr-1">LDR</span>${card.stats.ldr}</div>
            </div>
        </div>
    `;
    if (window._salaryCapMode && draftModeActive && typeof getCardSalary === 'function') {
        const sal = getCardSalary(card);
        const badge = document.createElement('div');
        badge.className = 'absolute top-7 left-0 right-0 bg-emerald-900/95 text-emerald-300 text-center text-[10px] font-black py-0.5 border-b border-emerald-700/50 z-30';
        badge.textContent = `💰 ${sal} salary`;
        cardDiv.appendChild(badge);
    }
    return cardDiv;
}

function generateRealPlayerEnemies(baseDiff, rounds) {
    enemies = []; 
    let db = getDB(); if(!db) return;
    const teams = ["SKT T1 Legacy", "Gen.G Superteam", "BLG Vanguard", "G2 Army", "Team Liquid Elite", "Fnatic Core"];
    const realProNames = [...new Set(db.map(p => p.name))];
    
    for(let i = 0; i < rounds; i++) {
        let diff = baseDiff + (i * 3) + Math.floor(Math.random() * 4);
        let activeDraft = []; let localNames = [...realProNames];
        let localEnemyStats = [];
        
        for (let r = 0; r < 6; r++) { 
            activeDraft.push(localNames.splice(Math.floor(Math.random() * localNames.length), 1)[0]);
            localEnemyStats.push({
                mec: diff + Math.floor(Math.random()*12 - 6),
                tmf: diff + Math.floor(Math.random()*12 - 6),
                frm: diff + Math.floor(Math.random()*12 - 6),
                cmp: diff + Math.floor(Math.random()*12 - 6),
                map: diff + Math.floor(Math.random()*12 - 6),
                ldr: diff + Math.floor(Math.random()*12 - 6)
            });
        }
        enemies.push({ name: teams[Math.floor(Math.random() * teams.length)] + ` [S${i+1}]`, power: diff, rosterNames: activeDraft, generatedStats: localEnemyStats });
    }
}

function transitionToArena(title) {
    document.getElementById("tournament-lobby").classList.add("hidden");
    document.getElementById("tournament-results").classList.add("hidden");
    document.getElementById("tournament-active").classList.remove("hidden");
    document.getElementById("tour-active-title").innerText = title;
    setupBracketUI(); setupNextRoundUI();
    document.getElementById("tournament-active").scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupNextRoundUI() {
    tacticalBonus = 0; let sData = computeChemistry(); let currentEnemy = enemies[tourRound];
    document.getElementById("tour-my-power").innerText = sData.totalPower;
    document.getElementById("enemy-team-name").innerText = currentEnemy.name;
    document.getElementById("tour-enemy-rating").innerText = currentEnemy.power;
    populateLiveArenaVisualizer();
    
    let eMec = 0, eTmf = 0, eMap = 0;
    if(currentEnemy.generatedStats) {
        currentEnemy.generatedStats.forEach(st => { eMec += st.mec; eTmf += st.tmf; eMap += st.map; });
        eMec = Math.round(eMec / 6); eTmf = Math.round(eTmf / 6); eMap = Math.round(eMap / 6);
    } else {
        eMec = currentEnemy.power; eTmf = currentEnemy.power; eMap = currentEnemy.power;
    }
    
    document.getElementById("tour-my-mec").innerText = Math.round(sData.avgStats.mec);
    document.getElementById("tour-enemy-mec").innerText = eMec;
    document.getElementById("tour-my-tmf").innerText = Math.round(sData.avgStats.tmf);
    document.getElementById("tour-enemy-tmf").innerText = eTmf;
    document.getElementById("tour-my-map").innerText = Math.round(sData.avgStats.map);
    document.getElementById("tour-enemy-map").innerText = eMap;
    document.getElementById("pre-match-stats").classList.remove("hidden");

    let diff = sData.totalPower - currentEnemy.power;

    // Dynamically rebuild the original Tactical Draft Buttons block
    const draftPanel = document.getElementById("tactical-draft-panel");
    draftPanel.innerHTML = `
        <h4 class="text-lg font-black text-purple-400 mb-2 uppercase tracking-widest">Tactical Draft Phase</h4>
        <div id="power-diff-display" class="text-sm font-mono mb-4 text-slate-300 font-bold bg-slate-950 p-2 rounded-lg border border-slate-700 inline-block"></div>
        <div class="flex flex-col gap-3">
            <button onclick="lockInDraft('MEC')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Aggression (MEC)</button>
            <button onclick="lockInDraft('TMF')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Teamfight (TMF)</button>
            <button onclick="lockInDraft('MAP')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Objective (MAP)</button>
        </div>
    `;

    let diffEl = document.getElementById("power-diff-display");
    if (diff >= 0) diffEl.innerHTML = `Power Advantage: <span class="text-green-400 text-lg ml-1">+${diff}</span>`;
    else diffEl.innerHTML = `Power Deficit: <span class="text-red-400 text-lg ml-1">${diff}</span>`;

    draftPanel.classList.remove("hidden");
    document.getElementById("btn-play-match").classList.add("hidden");
    document.getElementById("btn-next-round").classList.add("hidden");
    document.getElementById("btn-gr-next").classList.add("hidden");
}

function lockInDraft(statFocus) {
    let sData = computeChemistry(); 
    let currentEnemy = enemies[tourRound];

    // Compute specifically selected stat average for user
    let myStat = Math.round(sData.avgStats[statFocus.toLowerCase()] || 0);

    // Compute specifically selected stat average for enemy based on their random card rolls
    let eStat = 0;
    if(currentEnemy.generatedStats) {
        currentEnemy.generatedStats.forEach(st => { eStat += st[statFocus.toLowerCase()]; });
        eStat = Math.round(eStat / 6);
    } else {
        eStat = currentEnemy.power;
    }

    let statDiff = myStat - eStat;

    // +1 Power per every 2 points advantage, -1 Power per every 2 points disadvantage
    let h2hModifier = Math.floor(statDiff / 2);

    // Manager Tactical Acumen Skill provides +3 guaranteed power per level to offset negatives or stack positives
    let managerBonus = skills.tactics * 3; 

    // Final mathematical tactical modification applied to power output
    tacticalBonus = h2hModifier + managerBonus;

    document.getElementById("tour-my-power").innerText = sData.totalPower + tacticalBonus;

    let h2hColor = h2hModifier > 0 ? "text-green-400" : (h2hModifier < 0 ? "text-red-400" : "text-slate-400");
    let h2hSign = h2hModifier > 0 ? "+" : "";

    let totalColor = tacticalBonus >= 0 ? "text-green-400" : "text-red-400";
    let totalSign = tacticalBonus >= 0 ? "+" : "";

    // Repaint the draft panel strictly displaying the computed draft math receipts
    const panel = document.getElementById("tactical-draft-panel");
    panel.innerHTML = `
        <h4 class="text-lg font-black text-purple-400 mb-2 uppercase tracking-widest">Draft Execution</h4>
        <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-sm font-mono text-left inline-block w-full shadow-inner">
            <div class="flex justify-between items-center mb-2">
                <span class="text-slate-400">Head-to-Head (${statFocus})</span>
                <span class="font-black ${h2hColor}">${h2hSign}${h2hModifier} Pwr</span>
            </div>
            <div class="flex justify-between items-center mb-3 border-b border-slate-700/50 pb-3">
                <span class="text-slate-400">Manager Skill (Lvl ${skills.tactics})</span>
                <span class="font-black text-emerald-400">+${managerBonus} Pwr</span>
            </div>
            <div class="flex justify-between items-center font-black text-base">
                <span>NET MODIFIER</span>
                <span class="${totalColor} text-xl">${totalSign}${tacticalBonus}</span>
            </div>
        </div>
    `;

    appendLog(`[DRAFT PHASE] Focus: ${statFocus}. H2H Mod: ${h2hSign}${h2hModifier}, Skill Mod: +${managerBonus}. Total: ${totalSign}${tacticalBonus} Power.`, "text-purple-400 font-bold");
    const playBtn = document.getElementById("btn-play-match"); playBtn.classList.remove("hidden"); playBtn.disabled = false;
    playBtn.classList.replace("bg-slate-600", "bg-blue-600"); playBtn.innerText = "Execute Match ⏩";
}

function playMatchStep() {
    let sData = computeChemistry(); let myPower = sData.totalPower + tacticalBonus; let currentEnemy = enemies[tourRound];
    const playBtn = document.getElementById("btn-play-match"); playBtn.disabled = true; playBtn.classList.replace("bg-blue-600", "bg-slate-600"); playBtn.innerText = "Simulating...";
    appendLog(`Series launched against [ ${currentEnemy.rosterNames.slice(0,5).join(", ")} ].`, "text-slate-400");
    
    ["TOP", "JNG", "MID", "ADC", "SUP", "COACH"].forEach(r => { if(squad[r]) { let name = squad[r].name; trackStats.matchesPlayed[name] = (trackStats.matchesPlayed[name] || 0) + 1; } });

    simIntervalId = setTimeout(() => {
        appendLog(`Skirmish Phase. Tactical execution boost yields: ${tacticalBonus >= 0 ? '+' : ''}${tacticalBonus}.`, "text-slate-300");
        simIntervalId = setTimeout(() => {
            let finalCalculation = myPower + ((Math.random() * 14) - 7);
            appendLog("Late Phase Macro contesting around the Baron Nashor pit...", "text-slate-400");
            simIntervalId = setTimeout(() => {
                if (finalCalculation >= currentEnemy.power) {
                    appendLog(`🏆 Series Secured! Nexus mainframe collapsed!`, "text-green-400 font-bold");
                    if (tourRound >= tourData.maxRounds - 1) handleTournamentWin();
                    else { playBtn.classList.add("hidden"); document.getElementById("btn-next-round").classList.remove("hidden"); }
                } else {
                    appendLog(`💀 Defeat. Strategic macro lines compromised.`, "text-red-400 font-bold");
                    handleTournamentLoss();
                }
            }, 600);
        }, 800);
    }, 700);
}

function handleTournamentWin() {
    blueEssence += tourData.reward1; addXP(200);

    // Track stage-specific wins for quests — applies to both standalone and Golden Road
    const stageName = tourData.name;
    if (stageName === 'Gaming Cafe Tournament') trackStats.cafeWins = (trackStats.cafeWins || 0) + 1;
    else if (stageName.includes('Regional Split')) trackStats.regionalSplitWon = (trackStats.regionalSplitWon || 0) + 1;
    else if (stageName === 'First Stand') trackStats.firstStandWon = (trackStats.firstStandWon || 0) + 1;
    else if (stageName === 'MSI Arena' || stageName === 'MSI') trackStats.msiWon = (trackStats.msiWon || 0) + 1;
    else if (stageName === 'World Championship' || stageName === 'Worlds') trackStats.worldsWon = (trackStats.worldsWon || 0) + 1;
    checkProgressionUnlocks();

    // Notify any newly claimable milestone quests
    quests.filter(q => !q.repeatable && !q.claimed).forEach(q => {
        if ((trackStats[q.type] || 0) >= q.target) {
            showToast(`Quest Ready: "${q.desc}" — Claim ${q.reward} BE in Quests!`, 'success');
        }
    });
    renderQuests();
    updateBadges();

    if (isGoldenRoad) {
        grAccruedEssence += tourData.reward1; document.getElementById("gr-accrued-val").innerText = grAccruedEssence;
        appendLog(`[STAGE CLEARED] Credited +${tourData.reward1} BE. Run Total: ${grAccruedEssence} BE`, "text-yellow-400 font-black");
        if (grStageIndex === grStages.length - 1) { blueEssence += 5000; trackStats.goldenRoads++; saveGame(); endTournament(true, true); }
        else { saveGame(); document.getElementById("btn-play-match").classList.add("hidden"); document.getElementById("btn-gr-next").classList.remove("hidden"); }
    } else { trackStats.tournamentsWon++; saveGame(); endTournament(true, false); }
}

function handleTournamentLoss() {
    trackStats.losses = (trackStats.losses || 0) + 1;
    let reachedFinals = (tourRound === tourData.maxRounds - 1);
    if (reachedFinals) { blueEssence += tourData.reward2; if(isGoldenRoad) grAccruedEssence += tourData.reward2; }
    saveGame(); endTournament(false, false, reachedFinals);
}

function endTournament(isWin, isGRCompletion = false, reachedFinals = false) {
    tourActive = false; if(simIntervalId) clearTimeout(simIntervalId);
    document.getElementById("pre-match-stats").classList.add("hidden");
    document.getElementById("tournament-active").classList.add("hidden");
    const outcomeDiv = document.getElementById("tournament-results"); outcomeDiv.classList.remove("hidden");
    const title = document.getElementById("result-title"); const desc = document.getElementById("result-desc"); const icon = document.getElementById("result-icon");
    if (isGRCompletion) {
        title.innerText = "GOLDEN ROAD ACHIEVED!"; title.className = "text-3xl font-black mb-2 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,1)]";
        icon.innerText = "🏆"; desc.innerText = `Sensational perfection! Stage prizes banked, plus the grand +5,000 BE bonus yield! Run total extraction: ${grAccruedEssence + 5000} BE.`;
    } else if (isWin) {
        title.innerText = "Tournament Champions!"; title.className = "text-3xl font-bold mb-2 text-emerald-400";
        icon.innerText = "👑"; desc.innerText = `Run complete. Main collection account credited with ${tourData.reward1} BE payout metrics.`;
    } else {
        title.innerText = "Bracket Knockout"; title.className = "text-3xl font-bold mb-2 text-red-500";
        icon.innerText = "💀"; desc.innerText = reachedFinals ? `Knocked out in the Grand Finals stage. Consolidated runner-up payout of ${tourData.reward2} BE successfully cleared.` : `Roster path severed mid-bracket. Performance yields cancelled.`;
    }
    if (isGoldenRoad) {
        grLastRunTs = Date.now();
        localStorage.setItem("lol_gr_last_run_ts", grLastRunTs);
        _grStartCdTimer();
    }
    isGoldenRoad = false;
}

function setupNextRound() { if (tourRound < tourData.maxRounds - 1) { tourRound++; setupBracketUI(); setupNextRoundUI(); } }
function advanceGoldenRoadStage() { grStageIndex++; loadGoldenRoadStage(); document.getElementById("tour-active-title").innerText = "Golden Road Run: " + tourData.name; setupBracketUI(); setupNextRoundUI(); }
function emergencyResetSim() {
    if(simIntervalId) clearTimeout(simIntervalId);
    document.getElementById("pre-match-stats").classList.add("hidden");
    tourActive = false; isGoldenRoad = false; draftModeActive = false; window._salaryCapMode = false;
    draftPickRoles = { TOP: null, JNG: null, MID: null, ADC: null, SUP: null, COACH: null };
    draftActivePickRole = null; draftCpuTeam = {}; draftHybridScore1 = null; draft1v1Cards = { my: null, cpu: null };
    _scState = null;
    document.querySelectorAll('.sc-floating-panel').forEach(el => el.remove());
    ['tournament-active','tournament-results','draft-screen','draft-combat','tower-screen','salary-combat-screen'].forEach(id => {
        const el = document.getElementById(id); if(el) el.classList.add('hidden');
    });
    document.getElementById("tournament-lobby").classList.remove("hidden");
    towerState = null;
}
function finishTournamentUI() { window._salaryCapMode = false; document.getElementById("tournament-results").classList.add("hidden"); document.getElementById("tournament-lobby").classList.remove("hidden"); updateDisplays(); }
function setupBracketUI() {
    const container = document.getElementById("bracket-container"); container.innerHTML = "";
    for(let i=0; i<tourData.maxRounds; i++) {
        const badge = document.createElement("div"); badge.className = `bracket-step bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 ${i === tourRound ? 'bracket-active text-blue-400 bg-slate-800' : ''} ${i < tourRound ? 'bracket-won' : ''}`;
        badge.innerText = getRoundLabel(i, tourData.maxRounds); container.appendChild(badge);
    }
}
function appendLog(msg, colorClass = "text-slate-300") {
    const logBox = document.getElementById("match-log"); logBox.innerHTML += `<div class="py-1 ${colorClass}"><span class="opacity-40 text-[10px] mr-2">${new Date().toLocaleTimeString()}</span>${msg}</div>`; logBox.scrollTop = logBox.scrollHeight;
}

function triggerWipe() {
    showConfirm("Wipe All Data?", "Permanently delete Club, Essences, and Levels.", () => {
        localStorage.clear();
        location.reload();
    });
}

function triggerForfeit() { showConfirm("Forfeit Tournament?", "Lose your bracket positioning and stake.", () => emergencyResetSim()); }
function sellAllLowTier(tier) {
    let sold = 0; let val = 0; let activeIds = Object.values(squad).filter(s=>s).map(s=>s.uniqueId);
    let toSell = club.filter(c => c.quality === tier && !activeIds.includes(c.uniqueId));
    toSell.forEach(c => { sold++; val += getSellValue(c.quality); club = club.filter(cl => cl.uniqueId !== c.uniqueId); });
    if(sold > 0) { blueEssence += val; trackStats.soldCount += sold; trackStats.soldBE += val; if (['Grandmaster','Challenger','Champion','Finalist','MSI','FirstStand'].includes(tier)) trackStats.gmSoldCount = (trackStats.gmSoldCount||0)+sold; showToast(`Purged ${sold} ${tier}s for ${val} BE!`, "success"); saveGame(); }
    else showToast(`No unassigned ${tier}s found.`, "info");
}
function purgeUnderTier(keepTier) {
    const TIER_ORDER = ['Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
    const keepIdx = TIER_ORDER.indexOf(keepTier);
    if (keepIdx <= 0) { showToast('Nothing to purge below Silver.', 'info'); return; }
    const toPurge = TIER_ORDER.slice(0, keepIdx);
    let sold = 0, val = 0, gmSold = 0;
    let activeIds = Object.values(squad).filter(s => s).map(s => s.uniqueId);
    let toSell = club.filter(c => toPurge.includes(c.quality) && !activeIds.includes(c.uniqueId));
    toSell.forEach(c => { sold++; val += getSellValue(c.quality); if (['Grandmaster','Challenger'].includes(c.quality)) gmSold++; });
    club = club.filter(c => !toSell.some(s => s.uniqueId === c.uniqueId));
    if (sold > 0) {
        blueEssence += val; trackStats.soldCount += sold; trackStats.soldBE += val;
        if (gmSold > 0) trackStats.gmSoldCount = (trackStats.gmSoldCount||0) + gmSold;
        showToast(`Purged ${sold} cards below ${keepTier} for ${val} BE!`, 'success');
        saveGame(); renderClubGrid();
    } else showToast(`No cards below ${keepTier} found.`, 'info');
}

function purgeCoachesUnder(ratingThreshold) {
    const activeIds = Object.values(squad).filter(s => s).map(s => s.uniqueId);
    const toSell = club.filter(c => c.role === 'COACH' && c.rating < ratingThreshold && !activeIds.includes(c.uniqueId));
    if (toSell.length === 0) { showToast(`No coaches under ${ratingThreshold} rating to purge.`, 'info'); return; }
    let val = 0;
    toSell.forEach(c => { val += getSellValue(c.quality); });
    showConfirm(`Purge ${toSell.length} Coaches?`, `Sell all ${toSell.length} coaches rated below ${ratingThreshold} for ${val} BE total.`, () => {
        club = club.filter(c => !toSell.some(s => s.uniqueId === c.uniqueId));
        blueEssence += val; trackStats.soldCount += toSell.length; trackStats.soldBE += val;
        saveGame(); renderClubGrid(); updateDisplays();
        showToast(`Purged ${toSell.length} coaches under ${ratingThreshold} for ${val} BE!`, 'success');
    });
}

// ─── DRAFT MODE ────────────────────────────────────────────────────────────────

// Stat avg helper — handles role-keyed object, applies -10 flex penalty (Legacy cards are exempt — true flex players)
function draftAvgStat(team, stat) {
    const entries = Object.entries(team).filter(([, c]) => c);
    if (!entries.length) return 0;
    const total = entries.reduce((sum, [slot, card]) => {
        const natural = card.role === slot || (card.role === 'COACH' && slot === 'COACH') || card.region === 'Legacy';
        return sum + Math.max(0, (card.stats[stat] || 0) + (natural ? 0 : -10));
    }, 0);
    return Math.round(total / entries.length);
}

function draftTeamAvgRating(team) {
    const entries = Object.entries(team).filter(([, c]) => c);
    if (!entries.length) return 0;
    const total = entries.reduce((sum, [slot, card]) => {
        const natural = card.role === slot || (card.role === 'COACH' && slot === 'COACH') || card.region === 'Legacy';
        return sum + Math.max(0, card.rating + (natural ? 0 : -10));
    }, 0);
    return Math.round(total / entries.length);
}

function startDraftMode() {
    if (!unlocks.draftMode) { showToast("Win a Regional Split and complete a Playoff-tier Season Split to unlock Draft Mode.", "error"); return; }
    if (club.length < 15) {
        showToast(`Draft Mode requires at least 15 cards in your club. You have ${club.length}.`, 'error');
        return;
    }
    if (blueEssence < 1000) { showToast("Draft Mode requires 1000 BE.", "error"); return; }
    blueEssence -= 1000;
    draftModeActive = true;
    draftMatchRound = 0;
    draftMatchWins = 0;
    draftMatchLosses = 0;
    saveGame();
    setupDraftPools();
}

function setupDraftPools() {
    const shuffledClub = [...club].sort(() => Math.random() - 0.5);
    draftUserPool = shuffledClub.slice(0, 15);

    // Difficulty scaling: mostly near user avg, with some spread for variety
    const userAvg = Math.round(draftUserPool.reduce((s, c) => s + c.rating, 0) / draftUserPool.length);
    const cpuTarget = userAvg + 2;
    const db = getDB().filter(p => p.role !== 'COACH');
    const shuffled = [...db].sort(() => Math.random() - 0.5);
    const near = shuffled.filter(p => Math.abs(p.rating - cpuTarget) <= 5);
    const spread = shuffled.filter(p => Math.abs(p.rating - cpuTarget) > 5 && Math.abs(p.rating - cpuTarget) <= 12);
    const outer = shuffled.filter(p => Math.abs(p.rating - cpuTarget) > 12);
    const pool = [...near.slice(0, 9), ...spread.slice(0, 4), ...outer.slice(0, 2)];
    if (pool.length < 15) {
        const inPool = new Set(pool.map(p => p.name));
        pool.push(...shuffled.filter(p => !inPool.has(p.name)).slice(0, 15 - pool.length));
    }
    draftCpuPool = pool.slice(0, 15).map((p, i) => ({ ...p, uniqueId: 'dcpu_' + i + '_' + Date.now() }));

    draftUserBanIds = [];
    draftCpuBanIds = [];
    draftPickRoles = { TOP: null, JNG: null, MID: null, ADC: null, SUP: null, COACH: null };
    draftActivePickRole = null;
    draftCpuTeam = {};
    draftHybridScore1 = null;

    showDraftScreen('ban');
    renderDraftBanPhase();
}

function showDraftScreen(phase) {
    ['tournament-lobby','tournament-results','tournament-active','draft-combat'].forEach(id => {
        const el = document.getElementById(id); if (el) el.classList.add('hidden');
    });
    const screen = document.getElementById('draft-screen');
    screen.classList.remove('hidden');
    screen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('draft-ban-panel').classList.toggle('hidden', phase !== 'ban');
    document.getElementById('draft-pick-panel').classList.toggle('hidden', phase !== 'pick');
}

function renderDraftBanPhase() {
    document.getElementById('draft-phase-title').innerText = "Ban Phase";
    document.getElementById('draft-phase-subtitle').innerText = "Click cards in the CPU pool to ban them (max 5). Your pool is shown below for reference.";
    document.getElementById('draft-ban-counter').innerText = `Your bans: ${draftUserBanIds.length} / 5`;
    document.getElementById('draft-confirm-bans-btn').disabled = false;
    document.getElementById('draft-proceed-pick-btn').classList.add('hidden');

    renderDraftCardPool('draft-cpu-pool-grid', draftCpuPool, 'ban-cpu');
    renderDraftCardPool('draft-user-pool-ban-view', draftUserPool, 'ban-view');
}

function renderDraftCardPool(containerId, cards, mode) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    cards.forEach(card => {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative flex-shrink-0';
        let clickFn = null;
        let overlayHTML = '';

        if (mode === 'ban-cpu') {
            const banned = draftUserBanIds.includes(card.uniqueId);
            if (!banned) {
                clickFn = () => toggleCpuBan(card.uniqueId);
            } else {
                overlayHTML = `<div class="absolute inset-0 rounded-xl z-20 pointer-events-none flex flex-col items-center justify-center bg-red-950/90"><span class="text-5xl font-black text-red-400">✕</span><span class="text-[11px] font-black text-red-300 uppercase tracking-widest mt-1">Banned</span></div>`;
            }
        } else if (mode === 'ban-view') {
            const cpuBanned = draftCpuBanIds.includes(card.uniqueId);
            if (cpuBanned) {
                overlayHTML = `<div class="absolute inset-0 rounded-xl z-20 pointer-events-none flex flex-col items-center justify-center bg-orange-950/90"><span class="text-5xl font-black text-orange-400">✕</span><span class="text-[11px] font-black text-orange-300 uppercase tracking-widest mt-1">CPU Ban</span></div>`;
            }
        } else if (mode === 'pick') {
            const cpuBanned = draftCpuBanIds.includes(card.uniqueId);
            const assignedRole = Object.entries(draftPickRoles).find(([, c]) => c && c.uniqueId === card.uniqueId)?.[0];
            if (cpuBanned) {
                overlayHTML = `<div class="absolute inset-0 rounded-xl z-20 pointer-events-none flex flex-col items-center justify-center bg-orange-950/90"><span class="text-5xl font-black text-orange-400">✕</span><span class="text-[11px] font-black text-orange-300 uppercase tracking-widest mt-1">Banned</span></div>`;
            } else if (assignedRole) {
                overlayHTML = `<div class="absolute inset-0 rounded-xl z-20 pointer-events-none flex flex-col items-center justify-center bg-green-900/80 border-2 border-green-400"><span class="text-4xl font-black text-green-200">✓</span><span class="text-[11px] font-black text-green-200 uppercase tracking-widest mt-1">${assignedRole}</span></div>`;
                clickFn = () => assignCardToRole(card.uniqueId);
            } else {
                clickFn = () => assignCardToRole(card.uniqueId);
            }
        }

        // Gray out unaffordable cards in salary cap mode
        if (mode === 'pick' && window._salaryCapMode && !Object.values(draftPickRoles).some(c => c && c.uniqueId === card.uniqueId)) {
            const refund = (draftActivePickRole && draftPickRoles[draftActivePickRole]) ? getCardSalary(draftPickRoles[draftActivePickRole]) : 0;
            if (getCardSalary(card) > window._salaryRemaining + refund) {
                wrapper.className += ' opacity-30 grayscale pointer-events-none';
            }
        }

        const cardEl = createCardElement(card, false, clickFn, null);
        wrapper.appendChild(cardEl);
        if (overlayHTML) wrapper.insertAdjacentHTML('beforeend', overlayHTML);
        container.appendChild(wrapper);
    });
}

function toggleCpuBan(uniqueId) {
    const idx = draftUserBanIds.indexOf(uniqueId);
    if (idx >= 0) {
        draftUserBanIds.splice(idx, 1);
    } else {
        if (draftUserBanIds.length >= 5) { showToast('Maximum 5 bans.', 'info'); return; }
        draftUserBanIds.push(uniqueId);
    }
    document.getElementById('draft-ban-counter').innerText = `Your bans: ${draftUserBanIds.length} / 5`;
    renderDraftCardPool('draft-cpu-pool-grid', draftCpuPool, 'ban-cpu');
}

function confirmDraftBans() {
    if (draftUserBanIds.length === 0) { showToast("Ban at least 1 CPU card first.", "info"); return; }
    const available = draftUserPool.filter(c => !draftUserBanIds.includes(c.uniqueId));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    draftCpuBanIds = shuffled.slice(0, Math.min(5, shuffled.length)).map(c => c.uniqueId);
    renderDraftCardPool('draft-user-pool-ban-view', draftUserPool, 'ban-view');
    document.getElementById('draft-ban-counter').innerText = `Your bans: ${draftUserBanIds.length} / 5 · CPU banned ${draftCpuBanIds.length} of your cards`;
    document.getElementById('draft-confirm-bans-btn').disabled = true;
    document.getElementById('draft-proceed-pick-btn').classList.remove('hidden');
    showToast("CPU bans placed. Review, then proceed to team selection.", 'info');
}

function proceedToPick() {
    showDraftScreen('pick');
    renderDraftPickPhase();
}

function selectPickRole(role) {
    draftActivePickRole = role;
    updateDraftPickUI();
}

function assignCardToRole(uniqueId) {
    if (!draftActivePickRole) { showToast('Select a role slot first (TOP · JNG · MID · ADC · SUP · COACH).', 'info'); return; }
    if (draftCpuBanIds.includes(uniqueId)) return;
    const card = draftUserPool.find(c => c.uniqueId === uniqueId);
    if (!card) return;
    // Salary cap budget check
    if (window._salaryCapMode && getCardSalary(card) > window._salaryRemaining + (draftPickRoles[draftActivePickRole] ? getCardSalary(draftPickRoles[draftActivePickRole]) : 0)) { showToast("Over budget!", "error"); return; }
    // Remove card from any existing slot assignment
    Object.keys(draftPickRoles).forEach(r => {
        if (draftPickRoles[r] && draftPickRoles[r].uniqueId === uniqueId) draftPickRoles[r] = null;
    });
    draftPickRoles[draftActivePickRole] = card;
    if (window._salaryCapMode) updateSalaryDisplay();
    updateDraftPickUI();
}

function updateDraftPickUI() {
    const ALL_ROLES = ['TOP', 'JNG', 'MID', 'ADC', 'SUP', 'COACH'];
    ALL_ROLES.forEach(role => {
        const slot = document.getElementById(`draft-role-slot-${role}`);
        if (!slot) return;
        const card = draftPickRoles[role];
        const isActive = draftActivePickRole === role;
        slot.className = `flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition text-center min-w-[70px] ${
            isActive ? 'ring-2 ring-green-400 bg-green-900/30 border-green-500' :
            card ? 'bg-emerald-950/30 border-emerald-700/60' :
            role === 'COACH' ? 'bg-slate-800/50 border-slate-600/40 opacity-70' : 'bg-slate-800 border-slate-600 hover:border-blue-500'
        }`;
        if (card) {
            const offRole = card.role !== role && !(card.role === 'COACH' && role === 'COACH');
            const isLegacy = card.region === 'Legacy';
            const flexBadge = offRole ? (isLegacy ? '<span class="text-[9px] text-cyan-400 font-bold">FLEX ✓</span>' : '<span class="text-[9px] text-amber-400 font-bold">FLEX -10</span>') : '';
            slot.innerHTML = `<span class="text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-green-300' : 'text-emerald-400'}">${role}</span><span class="text-[10px] text-slate-200 truncate max-w-[65px] mt-0.5">${card.name}</span>${flexBadge}`;
        } else {
            slot.innerHTML = `<span class="text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-green-300' : role === 'COACH' ? 'text-slate-500' : 'text-slate-400'}">${role}</span><span class="text-[10px] ${role === 'COACH' ? 'text-slate-600' : 'text-slate-600'} mt-0.5">${role === 'COACH' ? 'Optional' : 'Empty'}</span>`;
        }
    });
    const filledCount = ['TOP','JNG','MID','ADC','SUP'].filter(r => draftPickRoles[r]).length;
    const counterEl = document.getElementById('draft-pick-counter');
    if (window._salaryCapMode) {
        let spent = 0;
        ['TOP','JNG','MID','ADC','SUP'].forEach(r => { if (draftPickRoles[r]) spent += getCardSalary(draftPickRoles[r]); });
        window._salaryRemaining = SALARY_CAP - spent;
        counterEl.innerText = `Budget: ${window._salaryRemaining} / ${SALARY_CAP} · Roles: ${filledCount}/5`;
    } else {
        counterEl.innerText = `Roles Filled: ${filledCount} / 5`;
    }
    document.getElementById('draft-confirm-team-btn').disabled = filledCount < 5;
    // Auto-sort: selected role first, then others by rating
    let sortedPool = [...draftUserPool];
    if (draftActivePickRole) {
        sortedPool.sort((a, b) => {
            const aMatch = (a.role === draftActivePickRole || (draftActivePickRole === 'COACH' && a.role === 'COACH')) ? 0 : 1;
            const bMatch = (b.role === draftActivePickRole || (draftActivePickRole === 'COACH' && b.role === 'COACH')) ? 0 : 1;
            if (aMatch !== bMatch) return aMatch - bMatch;
            return b.rating - a.rating;
        });
    }
    renderDraftCardPool('draft-user-pick-grid', sortedPool, 'pick');
}

function renderDraftPickPhase() {
    document.getElementById('draft-phase-title').innerText = "Assign Your Roles";
    document.getElementById('draft-phase-subtitle').innerText = "Click a role slot to activate it, then click a card to assign. Fill all 5 roles to confirm. COACH is optional (+flex at −10 rating).";
    draftPickRoles = { TOP: null, JNG: null, MID: null, ADC: null, SUP: null, COACH: null };
    draftActivePickRole = null;
    updateDraftPickUI();
    const cpuRemaining = draftCpuPool.filter(c => !draftUserBanIds.includes(c.uniqueId));
    renderDraftCardPool('draft-cpu-remaining-grid', cpuRemaining, 'cpu-remaining');
}

function confirmDraftTeam() {
    if (window._salaryCapMode) {
        // Salary Cap: CPU already picked in startSalaryCapDraft(), skip re-pick, enter season-style combat
        showToast("Teams locked in! Starting the match...", 'success');
        setTimeout(() => _scStartCombat(), 700);
        return;
    }
    // CPU picks best-rated card per role from its remaining pool (prefer natural role)
    const cpuAvail = draftCpuPool.filter(c => !draftUserBanIds.includes(c.uniqueId));
    const cpuRoles = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const usedIds = new Set();
    cpuRoles.forEach(role => {
        const byRole = cpuAvail.filter(c => c.role === role && !usedIds.has(c.uniqueId)).sort((a, b) => b.rating - a.rating);
        const fallback = cpuAvail.filter(c => !usedIds.has(c.uniqueId)).sort((a, b) => b.rating - a.rating);
        const pick = byRole[0] || fallback[0];
        if (pick) { draftCpuTeam[role] = pick; usedIds.add(pick.uniqueId); }
    });
    // CPU optionally picks a coach (60% chance)
    if (Math.random() > 0.4) {
        const allCoaches = getDB().filter(p => p.role === 'COACH');
        if (allCoaches.length > 0) {
            const coach = allCoaches[Math.floor(Math.random() * allCoaches.length)];
            draftCpuTeam['COACH'] = { ...coach, uniqueId: 'dcpu_coach_' + Date.now() };
        }
    }
    showToast("Teams locked in! Starting the match...", 'success');
    setTimeout(() => showDraftCombat(), 700);
}

function showDraftCombat() {
    // Reuse the Season-style play combat system (same as Salary Cap Draft)
    document.getElementById('draft-screen').classList.add('hidden');
    if (!window._salaryCapMode) _salaryCapReward = 2500;
    _scStartCombat();
    return;
}

function _oldShowDraftCombat() {
    document.getElementById('draft-screen').classList.add('hidden');
    const dc = document.getElementById('draft-combat');
    dc.classList.remove('hidden');
    dc.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Render user team with role labels and flex badge
    const myTeamEl = document.getElementById('dc-my-team');
    myTeamEl.innerHTML = '';
    ['TOP','JNG','MID','ADC','SUP','COACH'].forEach(role => {
        const card = draftPickRoles[role];
        if (!card) return;
        const offRole = card.role !== role && !(card.role === 'COACH' && role === 'COACH');
        const isLegacy = card.region === 'Legacy';
        const badgeClass = !offRole ? 'bg-slate-900/80 text-slate-400' : isLegacy ? 'bg-cyan-900/90 text-cyan-300' : 'bg-amber-900/90 text-amber-300';
        const badgeText = !offRole ? '' : isLegacy ? ' FLEX✓' : ' FLEX';
        const wrapper = document.createElement('div');
        wrapper.className = 'relative flex-shrink-0';
        wrapper.appendChild(createCardElement(card, false, null, null));
        wrapper.insertAdjacentHTML('beforeend', `<div class="absolute top-0 left-0 ${badgeClass} text-[9px] font-black px-1.5 py-0.5 rounded-tl-xl rounded-br-xl z-30">${role}${badgeText}</div>`);
        myTeamEl.appendChild(wrapper);
    });

    // Render CPU team (including coach if picked)
    const cpuTeamEl = document.getElementById('dc-cpu-team');
    cpuTeamEl.innerHTML = '';
    ['TOP','JNG','MID','ADC','SUP','COACH'].forEach(role => {
        const card = draftCpuTeam[role];
        if (!card) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'relative flex-shrink-0';
        wrapper.appendChild(createCardElement(card, false, null, null));
        wrapper.insertAdjacentHTML('beforeend', `<div class="absolute top-0 left-0 bg-slate-900/80 text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded-tl-xl rounded-br-xl z-30">${role}</div>`);
        cpuTeamEl.appendChild(wrapper);
    });

    // Power display: avg rating in team headers, diff in center
    const myPwr = draftTeamAvgRating(draftPickRoles);
    const cpuPwr = draftTeamAvgRating(draftCpuTeam);
    const diff = myPwr - cpuPwr;
    const myHdr = document.getElementById('dc-my-team-header');
    if (myHdr) myHdr.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Your Draft Team <span class="ml-2 text-blue-200 font-mono text-base font-black bg-blue-900/50 px-2 py-0.5 rounded-lg border border-blue-700/50">${myPwr}</span>`;
    const cpuHdr = document.getElementById('dc-cpu-team-header');
    if (cpuHdr) cpuHdr.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span> CPU Draft Team <span class="ml-2 text-red-200 font-mono text-base font-black bg-red-900/50 px-2 py-0.5 rounded-lg border border-red-700/50">${cpuPwr}</span>`;
    const pwrEl = document.getElementById('dc-power-diff');
    if (pwrEl) pwrEl.innerHTML = `<span class="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Power Advantage</span><span class="font-black text-3xl ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}">${diff > 0 ? '+' : ''}${diff}</span>`;

    setupDraftRound(0);
}

function setupDraftRound(roundIdx) {
    draftMatchRound = roundIdx;
    document.getElementById('dc-round').innerText = roundIdx + 1;
    document.getElementById('dc-wins').innerText = draftMatchWins;
    document.getElementById('dc-losses').innerText = draftMatchLosses;
    document.getElementById('dc-log').innerHTML = '';
    draftHybridScore1 = null;
    draft1v1Cards = { my: null, cpu: null };

    const S = (team, s) => draftAvgStat(team, s);
    const myT = draftPickRoles, cpuT = draftCpuTeam;

    if (roundIdx === 0) {
        // Round 1: Tactical — MEC / TMF / MAP
        const myMEC = S(myT,'mec'), myTMF = S(myT,'tmf'), myMAP = S(myT,'map');
        const cpuMEC = S(cpuT,'mec'), cpuTMF = S(cpuT,'tmf'), cpuMAP = S(cpuT,'map');
        document.getElementById('dc-round-panel').innerHTML = `
            <div class="bg-slate-800 p-6 rounded-2xl border border-purple-500/50 shadow-xl">
                <h4 class="text-lg font-black text-purple-400 mb-1 uppercase tracking-widest text-center">Round 1 — Tactical Phase</h4>
                <p class="text-xs text-slate-400 text-center mb-4">Choose your strategic focus. Pick the stat where you have the biggest edge.</p>
                <div class="grid grid-cols-3 gap-3 mb-5 text-center font-mono">
                    <div class="bg-slate-900 p-3 rounded-xl border border-slate-700"><div class="text-slate-400 text-[11px] uppercase mb-2">MEC</div><div class="flex justify-between items-center px-1"><span class="text-blue-400 font-black text-xl">${myMEC}</span><span class="text-slate-600 text-xs">vs</span><span class="text-red-400 font-black text-xl">${cpuMEC}</span></div></div>
                    <div class="bg-slate-900 p-3 rounded-xl border border-slate-700"><div class="text-slate-400 text-[11px] uppercase mb-2">TMF</div><div class="flex justify-between items-center px-1"><span class="text-blue-400 font-black text-xl">${myTMF}</span><span class="text-slate-600 text-xs">vs</span><span class="text-red-400 font-black text-xl">${cpuTMF}</span></div></div>
                    <div class="bg-slate-900 p-3 rounded-xl border border-slate-700"><div class="text-slate-400 text-[11px] uppercase mb-2">MAP</div><div class="flex justify-between items-center px-1"><span class="text-blue-400 font-black text-xl">${myMAP}</span><span class="text-slate-600 text-xs">vs</span><span class="text-red-400 font-black text-xl">${cpuMAP}</span></div></div>
                </div>
                <div class="flex flex-col gap-2.5">
                    <button onclick="resolveDraftTactical('mec')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Aggression Focus (MEC)</button>
                    <button onclick="resolveDraftTactical('tmf')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Teamfight Focus (TMF)</button>
                    <button onclick="resolveDraftTactical('map')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Objective Focus (MAP)</button>
                </div>
            </div>`;
    } else if (roundIdx === 1) {
        // Round 2: Fundamentals — FRM / CMP / LDR
        const myFRM = S(myT,'frm'), myCMP = S(myT,'cmp'), myLDR = S(myT,'ldr');
        const cpuFRM = S(cpuT,'frm'), cpuCMP = S(cpuT,'cmp'), cpuLDR = S(cpuT,'ldr');
        document.getElementById('dc-round-panel').innerHTML = `
            <div class="bg-slate-800 p-6 rounded-2xl border border-blue-500/50 shadow-xl">
                <h4 class="text-lg font-black text-blue-400 mb-1 uppercase tracking-widest text-center">Round 2 — Fundamentals Phase</h4>
                <p class="text-xs text-slate-400 text-center mb-4">Assess your team's core fundamentals. Pick the stat where you have the edge.</p>
                <div class="grid grid-cols-3 gap-3 mb-5 text-center font-mono">
                    <div class="bg-slate-900 p-3 rounded-xl border border-slate-700"><div class="text-slate-400 text-[11px] uppercase mb-2">FRM</div><div class="flex justify-between items-center px-1"><span class="text-blue-400 font-black text-xl">${myFRM}</span><span class="text-slate-600 text-xs">vs</span><span class="text-red-400 font-black text-xl">${cpuFRM}</span></div></div>
                    <div class="bg-slate-900 p-3 rounded-xl border border-slate-700"><div class="text-slate-400 text-[11px] uppercase mb-2">CMP</div><div class="flex justify-between items-center px-1"><span class="text-blue-400 font-black text-xl">${myCMP}</span><span class="text-slate-600 text-xs">vs</span><span class="text-red-400 font-black text-xl">${cpuCMP}</span></div></div>
                    <div class="bg-slate-900 p-3 rounded-xl border border-slate-700"><div class="text-slate-400 text-[11px] uppercase mb-2">LDR</div><div class="flex justify-between items-center px-1"><span class="text-blue-400 font-black text-xl">${myLDR}</span><span class="text-slate-600 text-xs">vs</span><span class="text-red-400 font-black text-xl">${cpuLDR}</span></div></div>
                </div>
                <div class="flex flex-col gap-2.5">
                    <button onclick="resolveDraftTactical('frm')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Form Focus (FRM)</button>
                    <button onclick="resolveDraftTactical('cmp')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Composure Focus (CMP)</button>
                    <button onclick="resolveDraftTactical('ldr')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Leadership Focus (LDR)</button>
                </div>
            </div>`;
    } else {
        // Round 3: Winning Play Moment — 1v1 individual card duel
        setup1v1Round();
    }
}

function appendDraftLog(msg, cls) {
    const log = document.getElementById('dc-log');
    if (!log) return;
    log.innerHTML += `<div class="py-1 ${cls || 'text-slate-300'}"><span class="opacity-40 text-[10px] mr-2">${new Date().toLocaleTimeString()}</span>${msg}</div>`;
    log.scrollTop = log.scrollHeight;
}

function setup1v1Round() {
    // Pick a random non-coach card from each team
    const myCards = Object.entries(draftPickRoles).filter(([r, c]) => c && r !== 'COACH').map(([, c]) => c);
    const cpuCards = Object.entries(draftCpuTeam).filter(([r, c]) => c && r !== 'COACH').map(([, c]) => c);
    draft1v1Cards.my = myCards[Math.floor(Math.random() * myCards.length)];
    draft1v1Cards.cpu = cpuCards[Math.floor(Math.random() * cpuCards.length)];
    const mc = draft1v1Cards.my, cc = draft1v1Cards.cpu;
    if (!mc || !cc) return;
    document.getElementById('dc-round-panel').innerHTML = `
        <div class="bg-slate-800 p-6 rounded-2xl border border-amber-500/50 shadow-xl">
            <h4 class="text-lg font-black text-amber-400 mb-1 uppercase tracking-widest text-center">Round 3 — Winning Play Moment</h4>
            <p class="text-xs text-slate-400 text-center mb-5">1v1 showdown! Pick your player's best stat — MEC, FRM, or CMP — to outperform the CPU's card.</p>
            <div class="flex items-center justify-center gap-6 mb-5">
                <div class="text-center">
                    <p class="text-blue-300 font-black text-sm mb-1">${mc.name}</p>
                    <p class="text-slate-400 text-xs">MEC <strong class="text-blue-300">${mc.stats.mec}</strong> · FRM <strong class="text-blue-300">${mc.stats.frm}</strong> · CMP <strong class="text-blue-300">${mc.stats.cmp}</strong></p>
                </div>
                <div class="text-3xl font-black italic text-slate-600">vs</div>
                <div class="text-center">
                    <p class="text-red-300 font-black text-sm mb-1">${cc.name}</p>
                    <p class="text-slate-400 text-xs">MEC <strong class="text-red-300">${cc.stats.mec}</strong> · FRM <strong class="text-red-300">${cc.stats.frm}</strong> · CMP <strong class="text-red-300">${cc.stats.cmp}</strong></p>
                </div>
            </div>
            <div class="flex flex-col gap-2.5">
                <button onclick="resolveDraft1v1('mec')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Mechanical Skill (MEC) — ${mc.stats.mec} vs ${cc.stats.mec}</button>
                <button onclick="resolveDraft1v1('frm')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Form (FRM) — ${mc.stats.frm} vs ${cc.stats.frm}</button>
                <button onclick="resolveDraft1v1('cmp')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 py-3 rounded-lg font-bold transition text-sm cursor-pointer shadow uppercase tracking-wider">Composure (CMP) — ${mc.stats.cmp} vs ${cc.stats.cmp}</button>
            </div>
        </div>`;
}

function resolveDraft1v1(stat) {
    const mc = draft1v1Cards.my, cc = draft1v1Cards.cpu;
    if (!mc || !cc) return;
    const myVal = mc.stats[stat] || 0;
    const cpuVal = cc.stats[stat] || 0;
    const variance = (Math.random() * 14) - 7;
    const myFinal = myVal + variance;
    document.querySelectorAll('#dc-round-panel button').forEach(b => b.disabled = true);
    appendDraftLog(`[1v1] ${mc.name} vs ${cc.name} · ${stat.toUpperCase()}: You ${myVal} | CPU ${cpuVal} | Variance: ${variance >= 0 ? '+' : ''}${variance.toFixed(1)}`, 'text-amber-400 font-bold');
    setTimeout(() => {
        const won = myFinal >= cpuVal;
        appendDraftLog(won
            ? `✅ ${mc.name} makes the winning play! (${myFinal.toFixed(0)} vs ${cpuVal})`
            : `❌ ${cc.name} outplays and takes the round. (${myFinal.toFixed(0)} vs ${cpuVal})`,
            won ? 'text-green-400 font-black' : 'text-red-400 font-black');
        setTimeout(() => processDraftRoundResult(won), 700);
    }, 700);
}

function resolveDraftTactical(stat) {
    const myVal = draftAvgStat(draftPickRoles, stat);
    const cpuVal = draftAvgStat(draftCpuTeam, stat);
    const variance = (Math.random() * 14) - 7;
    const myFinal = myVal + variance;

    document.querySelectorAll('#dc-round-panel button').forEach(b => b.disabled = true);
    appendDraftLog(`[TACTICAL] ${stat.toUpperCase()} focus — You: ${myVal} | CPU: ${cpuVal} | Variance: ${variance >= 0 ? '+' : ''}${variance.toFixed(1)}`, 'text-purple-400 font-bold');

    setTimeout(() => {
        const won = myFinal >= cpuVal;
        appendDraftLog(won
            ? `✅ Tactical advantage secured! (${myFinal.toFixed(0)} vs ${cpuVal})`
            : `❌ CPU holds the tactical edge. (${myFinal.toFixed(0)} vs ${cpuVal})`,
            won ? 'text-green-400 font-black' : 'text-red-400 font-black');
        setTimeout(() => processDraftRoundResult(won), 700);
    }, 700);
}


function processDraftRoundResult(won) {
    if (won) draftMatchWins++; else draftMatchLosses++;
    document.getElementById('dc-wins').innerText = draftMatchWins;
    document.getElementById('dc-losses').innerText = draftMatchLosses;

    const matchOver = draftMatchWins >= 2 || draftMatchLosses >= 2 || draftMatchRound >= 2;
    if (matchOver) {
        setTimeout(() => endDraftMode(), 1000);
    } else {
        const nextRound = draftMatchRound + 1;
        const btn = document.createElement('button');
        btn.className = 'mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-black cursor-pointer transition text-sm uppercase tracking-wider';
        btn.innerText = `Next Round (${draftMatchWins}W - ${draftMatchLosses}L) →`;
        btn.onclick = () => { btn.remove(); setupDraftRound(nextRound); };
        document.getElementById('dc-round-panel').appendChild(btn);
    }
    saveGame();
}

function endDraftMode() {
    const won = draftMatchWins >= 2;
    const isSalaryCap = !!window._salaryCapMode;
    const reward = won ? (isSalaryCap ? 4000 : 2500) : 0;
    blueEssence += reward;
    trackStats.draftModesPlayed = (trackStats.draftModesPlayed || 0) + 1;
    if (won) trackStats.draftModesWon = (trackStats.draftModesWon || 0) + 1;
    else trackStats.losses = (trackStats.losses || 0) + 1;
    draftModeActive = false;
    window._salaryCapMode = false;

    document.getElementById('draft-combat').classList.add('hidden');
    const outcomeDiv = document.getElementById('tournament-results');
    outcomeDiv.classList.remove('hidden');

    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');
    const icon = document.getElementById('result-icon');

    if (won) {
        title.innerText = 'Draft Champion!'; title.className = 'text-3xl font-black mb-2 text-emerald-400';
        icon.innerText = '🏆'; desc.innerText = `Dominant draft performance! Final score ${draftMatchWins} - ${draftMatchLosses}. Awarded ${reward.toLocaleString()} BE.`;
    } else if (draftMatchWins >= 1) {
        title.innerText = 'Draft Defeated'; title.className = 'text-3xl font-bold mb-2 text-red-500';
        icon.innerText = '💀'; desc.innerText = `Close series, but a loss is a loss — final score ${draftMatchWins} - ${draftMatchLosses}. No payout. Only the winner takes the prize.`;
    } else {
        title.innerText = 'Draft Eliminated'; title.className = 'text-3xl font-bold mb-2 text-red-500';
        icon.innerText = '💀'; desc.innerText = `Swept ${draftMatchWins} - ${draftMatchLosses}. No payout. Review your picks and bans.`;
    }

    addXP(won ? 150 : 50);
    saveGame(); updateDisplays();
}

// === SALARY CAP DRAFT MODE ===
function getCardSalary(card) { return Math.floor((card.rating - 60) * 2.5); }
let SALARY_CAP = 350;

let _salaryCapReward = 2500;

function startSalaryCapDraft() {
    if (club.length < 15) { showToast("Need at least 15 cards in your Club.", "error"); return; }
    if (blueEssence < 1500) { showToast("Need 1,500 BE to enter Salary Cap Draft.", "error"); return; }
    const modal = document.getElementById('confirm-modal');
    const box = document.getElementById('confirm-modal-box');
    document.getElementById('confirm-title').innerText = 'Choose Difficulty';
    document.getElementById('confirm-desc').innerText = 'Higher difficulty = tighter budget but bigger reward.';
    modal.classList.remove('hidden');
    requestAnimationFrame(() => { modal.classList.remove('opacity-0'); box.classList.remove('scale-95'); box.classList.add('scale-100'); });
    const btnContainer = box.querySelector('.flex.gap-3');
    btnContainer.innerHTML = `
        <button onclick="document.getElementById('confirm-modal').classList.add('hidden');_launchSalaryCap(400,2000)" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold cursor-pointer transition text-sm">Easy (400)</button>
        <button onclick="document.getElementById('confirm-modal').classList.add('hidden');_launchSalaryCap(350,2500)" class="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg font-bold cursor-pointer transition text-sm">Medium (350)</button>
        <button onclick="document.getElementById('confirm-modal').classList.add('hidden');_launchSalaryCap(300,3500)" class="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg font-bold cursor-pointer transition text-sm">Hard (300)</button>`;
}

function _launchSalaryCap(budget, reward) {
    SALARY_CAP = budget;
    _salaryCapReward = reward || 2500;
    if (club.length < 15) { showToast("Need at least 15 cards in your Club.", "error"); return; }
    if (blueEssence < 1500) { showToast("Need 1,500 BE to enter Salary Cap Draft.", "error"); return; }
    blueEssence -= 1500;

    // Reuse existing draft infrastructure but with salary constraint
    draftModeActive = true;
    draftMatchRound = 0;
    draftMatchWins = 0;
    draftMatchLosses = 0;

    // Set up pools same as normal draft
    const shuffledClub = [...club].sort(() => Math.random() - 0.5);
    draftUserPool = shuffledClub.slice(0, 15);
    const userAvg = Math.round(draftUserPool.reduce((s, c) => s + c.rating, 0) / draftUserPool.length);
    const cpuTarget = userAvg + 2;
    const db = getDB().filter(p => p.role !== 'COACH');
    const cpuPool = [];
    ['TOP','JNG','MID','ADC','SUP'].forEach(role => {
        const pool = db.filter(p => p.role === role);
        const sorted = pool.sort((a,b) => Math.abs(a.rating - cpuTarget) - Math.abs(b.rating - cpuTarget));
        cpuPool.push(...sorted.slice(0, 3));
    });
    draftCpuPool = cpuPool.sort(() => Math.random() - 0.5);

    // No ban phase in salary cap — go straight to pick with salary UI
    draftUserBanIds = [];
    draftCpuBanIds = [];
    draftPickRoles = { TOP: null, JNG: null, MID: null, ADC: null, SUP: null, COACH: null };
    draftActivePickRole = null;

    // CPU picks team under salary cap — guarantees all 5 roles are filled
    draftCpuTeam = {};
    let cpuBudget = SALARY_CAP;
    const cpuRolesLeft = ['TOP','JNG','MID','ADC','SUP'];
    const allDb = getDB().filter(p => p.role !== 'COACH');
    cpuRolesLeft.forEach((role, idx) => {
        const rolesRemaining = cpuRolesLeft.length - idx;
        const reservePerSlot = rolesRemaining > 1 ? Math.floor((cpuBudget - 37) / (rolesRemaining - 1)) : 0;
        const maxSpend = Math.max(37, cpuBudget - Math.max(0, (rolesRemaining - 1) * 37));
        // Try CPU pool first, then full DB as fallback
        let candidates = draftCpuPool.filter(c => c.role === role && getCardSalary(c) <= maxSpend);
        if (!candidates.length) candidates = draftCpuPool.filter(c => c.role === role);
        if (!candidates.length) candidates = allDb.filter(c => c.role === role);
        candidates.sort((a, b) => getCardSalary(a) - getCardSalary(b));
        // Pick a random affordable one, or cheapest if none affordable
        const affordable = candidates.filter(c => getCardSalary(c) <= cpuBudget);
        const pick = affordable.length ? affordable[Math.floor(Math.random() * Math.min(affordable.length, 3))] : candidates[0];
        if (pick) {
            draftCpuTeam[role] = { ...pick, uniqueId: 'scpu_' + role + '_' + Date.now() };
            cpuBudget -= getCardSalary(pick);
        }
    });

    // Show salary pick UI (reuse draft-screen with modifications)
    document.getElementById('tournament-lobby').classList.add('hidden');
    document.getElementById('draft-screen').classList.remove('hidden');
    document.getElementById('draft-ban-panel').classList.add('hidden');
    document.getElementById('draft-pick-panel').classList.remove('hidden');

    // Override subtitle to show salary info
    document.getElementById('draft-phase-subtitle').innerText = `SALARY CAP MODE: Budget ${SALARY_CAP}. Each card costs (rating-60)×2.5. Fill 5 roles under budget.`;

    // Track salary state on window for the pick phase
    window._salaryCapMode = true;
    window._salaryRemaining = SALARY_CAP;

    saveGame();
    renderDraftPickPhase();
    updateSalaryDisplay();
}

function updateSalaryDisplay() {
    if (!window._salaryCapMode) return;
    let spent = 0;
    ['TOP','JNG','MID','ADC','SUP'].forEach(r => {
        if (draftPickRoles[r]) spent += getCardSalary(draftPickRoles[r]);
    });
    window._salaryRemaining = SALARY_CAP - spent;
    const counter = document.getElementById('draft-pick-counter');
    if (counter) counter.innerText = `Budget: ${window._salaryRemaining} / ${SALARY_CAP}`;
}

// === SALARY CAP COMBAT (Season-Match-style Bo3) ===
let _scState = null; // { wins, losses, round, log, options, phase }

function _scStartCombat() {
    document.getElementById('draft-screen').classList.add('hidden');
    document.getElementById('salary-combat-screen').classList.remove('hidden');
    _scState = { wins: 0, losses: 0, round: 1, log: [], options: [], phase: 'pick' };
    _scPickOptions();
    renderSalaryCombat();
}

function _scPickOptions() {
    const available = _SEASON_PLAYS.filter(p => !(p.id === 'coach' && !draftPickRoles.COACH));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    _scState.options = shuffled.slice(0, 3);
}

function _scStatVal(play) {
    const roles = play.myRoles;
    const vals = roles.map(r => {
        const c = draftPickRoles[r];
        if (!c) return 70;
        return r === 'COACH' ? (c.stats.ldr || c.rating) : (c.stats[play.statKey] || 70);
    });
    const base = vals.length === 1 ? vals[0] : Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    return base + _tacticsBonus();
}

function _scOppStatVal(play) {
    const c = draftCpuTeam;
    const roles = play.myRoles;
    const vals = roles.map(r => {
        const card = c[r];
        if (!card) return 70;
        return r === 'COACH' ? (card.stats.ldr || card.rating) : (card.stats[play.statKey] || 70);
    });
    return vals.length === 1 ? vals[0] : Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function makeSalaryPlay(playId) {
    if (!_scState || _scState.phase !== 'pick') return;
    const play = _SEASON_PLAYS.find(p => p.id === playId);
    if (!play) return;

    const myVal = _scStatVal(play);
    const oppVal = _scOppStatVal(play);
    const variance = Math.round((Math.random() * 16) - 8);
    const net = (myVal - oppVal) + variance;
    const won = net > 0;

    if (won) _scState.wins++; else _scState.losses++;
    _scState.log.push({ round: _scState.round, icon: play.icon, label: play.label, detail: `${play.myRoles.join('+')} ${play.statKey.toUpperCase()} ${myVal} vs ${oppVal} (${net >= 0 ? '+' : ''}${net})`, won });

    const matchDone = _scState.wins >= 3 || _scState.losses >= 3;
    if (matchDone) {
        _scState.phase = 'done';
        const isWin = _scState.wins >= 3;
        const isSC = !!window._salaryCapMode;
        const modeLabel = isSC ? 'Salary Cap Draft' : 'Draft Mode';
        if (isWin) { blueEssence += _salaryCapReward; addXP(200); showToast(`${modeLabel} Won! +${_salaryCapReward} BE`, "success"); }
        else { showToast(`${modeLabel} lost. No payout.`, "error"); }
        if (isSC) { if (!trackStats.salaryCapWon) trackStats.salaryCapWon = 0; if (isWin) trackStats.salaryCapWon++; }
        else { trackStats.draftModesWon = (trackStats.draftModesWon || 0) + (isWin ? 1 : 0); trackStats.draftModesPlayed = (trackStats.draftModesPlayed || 0) + 1; }
        draftModeActive = false;
        window._salaryCapMode = false;
        saveGame();
    } else {
        _scState.round++;
        _scPickOptions();
    }
    renderSalaryCombat();
}

function closeSalaryCombat() {
    document.querySelectorAll('.sc-floating-panel').forEach(el => el.remove());
    document.getElementById('salary-combat-screen').classList.add('hidden');
    document.getElementById('tournament-lobby').classList.remove('hidden');
    _scState = null;
    draftModeActive = false;
    window._salaryCapMode = false;
}

function renderSalaryCombat() {
    const container = document.getElementById('salary-combat-content');
    if (!container || !_scState) return;

    function pips(count, max, colorClass) {
        return Array.from({ length: max }, (_, i) =>
            `<span class="inline-block w-5 h-5 rounded-full border-2 ${i < count ? colorClass + ' border-transparent' : 'bg-slate-700 border-slate-600'}"></span>`
        ).join('');
    }

    // Play option cards
    const playCards = _scState.phase === 'pick' ? _scState.options.map(play => {
        const myVal = _scStatVal(play);
        const oppVal = _scOppStatVal(play);
        const edge = myVal - oppVal;
        const edgeColor = edge > 3 ? 'text-emerald-400' : edge < -3 ? 'text-red-400' : 'text-yellow-400';
        return `<button onclick="makeSalaryPlay('${play.id}')" class="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500 rounded-xl p-2.5 text-left cursor-pointer transition">
            <div class="flex items-center gap-1 mb-1"><span class="text-xl">${play.icon}</span>${_tacticsBadgeHTML()}</div>
            <div class="font-black text-slate-100 text-xs mb-0.5">${play.label}</div>
            <div class="text-slate-500 text-[10px] mb-2">${play.desc}</div>
            <div class="font-mono text-xs space-y-0.5 border-t border-slate-700 pt-1">
                <div class="flex justify-between"><span class="text-slate-400">${play.myRoles.join('+')} ${play.statKey.toUpperCase()}</span><span class="text-slate-200 font-black">${myVal}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Opp</span><span class="text-slate-300 font-bold">${oppVal}</span></div>
                <div class="flex justify-between border-t border-slate-700/50 pt-0.5"><span class="text-slate-400">Edge</span><span class="${edgeColor} font-black">${edge >= 0 ? '+' : ''}${edge}</span></div>
            </div>
        </button>`;
    }).join('') : '';

    // Match log
    const logHTML = _scState.log.length ? _scState.log.map(e =>
        `<div class="flex items-start gap-2 text-xs font-mono ${e.won ? 'text-emerald-400' : 'text-red-400'}">
            <span>${e.won ? '✅' : '❌'}</span><span><span class="font-black">${e.icon} ${e.label}</span> — ${e.detail}</span>
        </div>`
    ).join('') : '';

    // Result banner
    let resultBanner = '';
    if (_scState.phase === 'done') {
        const win = _scState.wins >= 3;
        resultBanner = `<div class="rounded-2xl p-5 text-center border ${win ? 'bg-emerald-950/60 border-emerald-600' : 'bg-red-950/40 border-red-800'} mb-4">
            <div class="text-4xl mb-2">${win ? '🏆' : '💀'}</div>
            <div class="text-xl font-black ${win ? 'text-emerald-300' : 'text-red-400'}">${win ? `Victory! +${_salaryCapReward} BE` : 'Defeat.'}</div>
            <button onclick="closeSalaryCombat()" class="mt-4 bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2 rounded-xl font-bold cursor-pointer transition text-sm">Back to Lobby</button>
        </div>`;
    }

    // Remove any previous floating card panels
    document.querySelectorAll('.sc-floating-panel').forEach(el => el.remove());

    // Create floating card panels pinned to left and right edges of the viewport
    function buildFloatingPanel(side, label, labelColor, cards) {
        const panel = document.createElement('div');
        panel.className = `sc-floating-panel fixed top-16 ${side === 'left' ? 'left-0' : 'right-0'} z-30 pointer-events-none`;
        panel.style.cssText = `transform: scale(0.55); transform-origin: top ${side};`;
        panel.innerHTML = `<div class="text-[10px] font-black uppercase tracking-widest ${labelColor} mb-1 text-center pointer-events-auto">${label}</div>`;
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-1 pointer-events-auto';
        cards.forEach(c => { if (c) grid.appendChild(createCardElement(c, true)); });
        panel.appendChild(grid);
        document.body.appendChild(panel);
    }

    const myCards = ['TOP','JNG','MID','ADC','SUP'].map(r => draftPickRoles[r]).filter(Boolean);
    const oppCards = ['TOP','JNG','MID','ADC','SUP'].map(r => draftCpuTeam[r]).filter(Boolean);
    buildFloatingPanel('left', 'Your Team', 'text-emerald-400', myCards);
    buildFloatingPanel('right', 'CPU Team', 'text-red-400', oppCards);

    container.innerHTML = `<div class="mx-auto" style="max-width:min(700px, calc(100vw - 420px))">
        <div class="flex items-center justify-center gap-8 bg-slate-800/60 py-3 rounded-2xl border border-slate-700 mb-4">
            <div class="text-center"><div class="text-xs text-emerald-400 font-black uppercase mb-1">You</div><div class="flex gap-1.5">${pips(_scState.wins, 3, 'bg-emerald-400')}</div></div>
            <div class="text-slate-600 font-black text-lg">vs</div>
            <div class="text-center"><div class="text-xs text-red-400 font-black uppercase mb-1">CPU</div><div class="flex gap-1.5">${pips(_scState.losses, 3, 'bg-red-500')}</div></div>
        </div>
        ${resultBanner}
        ${_scState.phase === 'pick' ? `<div class="text-center text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Round ${_scState.round} — Choose Your Play</div>
        <div class="flex flex-wrap gap-2 justify-center mb-4">${playCards}</div>` : ''}
        <div class="bg-slate-950/60 rounded-xl border border-slate-700 p-4">
            <div class="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Match Log</div>
            <div class="space-y-1.5">${logHTML}</div>
        </div>
    </div>`;
}

// === INFINITE TOWER MODE ===
let towerState = null;

function startInfiniteTower() {
    if (['TOP','JNG','MID','ADC','SUP'].some(r => !squad[r])) { showToast("Assign all 5 positions first.", "error"); return; }

    const saved = localStorage.getItem("lol_tower_v1");
    if (saved) {
        _towerResume();
    } else {
        _towerFresh();
    }
}

function _towerResume() {
    const saved = localStorage.getItem("lol_tower_v1");
    if (saved) towerState = JSON.parse(saved);
    else { _towerFresh(); return; }
    _towerEnter();
}

function _towerFresh() {
    localStorage.removeItem("lol_tower_v1");
    towerState = { floor: 1, buffs: [], checkpoint: 0, phase: 'match', matchState: null };
    _towerEnter();
}

function _towerEnter() {
    document.getElementById('tournament-lobby').classList.add('hidden');
    document.getElementById('tower-screen').classList.remove('hidden');
    _towerStartMatch();
}

function closeTower() {
    if (towerState && towerState.phase !== 'defeat') {
        localStorage.setItem("lol_tower_v1", JSON.stringify(towerState));
    }
    document.getElementById('tower-screen').classList.add('hidden');
    document.getElementById('tournament-lobby').classList.remove('hidden');
    towerState = null;
}

function _towerGenOpponent(floor) {
    const baseRating = 70 + Math.floor(floor * 2.5);
    const style = _SEASON_STYLES[Math.floor(Math.random() * _SEASON_STYLES.length)];
    const name = _SEASON_TEAM_NAMES[Math.floor(Math.random() * _SEASON_TEAM_NAMES.length)];
    const logo = _SEASON_LOGOS[Math.floor(Math.random() * _SEASON_LOGOS.length)];
    return { name, logo, avgRating: baseRating, style, stats: _smGenStats(baseRating, style, baseRating) };
}

function _towerApplyBuffs(baseVal, statKey, role) {
    let val = baseVal;
    for (const buff of (towerState.buffs || [])) {
        if (buff.type === 'flatStat' && buff.stat === statKey) val += buff.value;
        if (buff.type === 'pctStat' && buff.stat === statKey) val += Math.round(baseVal * buff.value / 100);
        if (buff.type === 'allStats') val += buff.value;
        if (buff.type === 'roleBonus' && buff.role === role) val += buff.value;
    }
    return val;
}

function _towerStatVal(play) {
    const roles = play.myRoles;
    const vals = roles.map(r => {
        const c = squad[r];
        if (!c) return 70;
        const raw = r === 'COACH' ? (c.stats.ldr || c.rating) : (c.stats[play.statKey] || 70);
        return _towerApplyBuffs(raw, play.statKey, r);
    });
    const base = vals.length === 1 ? vals[0] : Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
    return base + _tacticsBonus();
}

function _towerStartMatch() {
    const opp = _towerGenOpponent(towerState.floor);
    towerState.phase = 'match';
    towerState.matchState = { opp, wins: 0, losses: 0, round: 1, log: [], options: [] };
    _towerPickOptions();
    renderTowerUI();
}

function _towerPickOptions() {
    const available = _SEASON_PLAYS.filter(p => !(p.id === 'coach' && !squad.COACH));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const picked = [];
    for (const p of shuffled) { if (picked.length >= 3) break; picked.push(p); }
    towerState.matchState.options = picked.slice(0, 3);
}

function makeTowerPlay(playId) {
    if (!towerState || towerState.phase !== 'match') return;
    const ms = towerState.matchState;
    const play = _SEASON_PLAYS.find(p => p.id === playId);
    if (!play) return;

    const myVal = _towerStatVal(play);
    const oppVal = ms.opp.stats[play.statKey] || ms.opp.avgRating;
    const variance = Math.round((Math.random() * 16) - 8);
    const net = (myVal - oppVal) + variance;
    const won = net > 0;

    if (won) ms.wins++; else ms.losses++;
    ms.log.push({ round: ms.round, icon: play.icon, label: play.label, detail: `${play.myRoles.join('+')} ${play.statKey.toUpperCase()} ${myVal} vs ${oppVal} (${net >= 0 ? '+' : ''}${net})`, won });

    const matchDone = ms.wins >= 2 || ms.losses >= 2;
    if (matchDone) {
        if (ms.wins >= 2) {
            towerState.floor++;
            // Checkpoint every 10 floors
            if (towerState.floor % 10 === 1 && towerState.floor > 1) {
                const checkpointNum = Math.ceil((towerState.floor - 1) / 10);
                const reward = Math.floor(300 * Math.pow(2, checkpointNum - 1));
                blueEssence += reward;
                towerState.checkpoint = towerState.floor - 1;
                localStorage.setItem("lol_tower_v1", JSON.stringify(towerState));
                saveGame();
                showToast(`Checkpoint Floor ${towerState.floor - 1}! +${reward} BE`, "success");
            }
            // Track best
            if (!trackStats.towerHighestFloor || towerState.floor > trackStats.towerHighestFloor) {
                trackStats.towerHighestFloor = towerState.floor;
            }
            towerState.phase = 'buff';
            _towerGenBuffOptions();
            localStorage.setItem("lol_tower_v1", JSON.stringify(towerState));
            saveGame();
        } else {
            towerState.phase = 'defeat';
            localStorage.removeItem("lol_tower_v1");
            if (!trackStats.towerRuns) trackStats.towerRuns = 0;
            trackStats.towerRuns++;
            saveGame();
        }
    } else {
        ms.round++;
        _towerPickOptions();
    }
    renderTowerUI();
}

function _towerGenBuffOptions() {
    const statKeys = ['mec','tmf','frm','cmp','map','ldr'];
    const roles = ['TOP','JNG','MID','ADC','SUP'];
    const buffPool = [
        ...statKeys.map(s => ({ type: 'flatStat', stat: s, value: 5, label: `+5 ${s.toUpperCase()}`, desc: `+5 to ${s.toUpperCase()} for all your players` })),
        ...statKeys.map(s => ({ type: 'pctStat', stat: s, value: 15, label: `+15% ${s.toUpperCase()}`, desc: `+15% multiplicative boost to ${s.toUpperCase()}` })),
        ...roles.map(r => ({ type: 'roleBonus', role: r, value: 8, label: `${r} Power +8`, desc: `+8 to all stats when ${r} is involved in a play` })),
        { type: 'allStats', value: 3, label: '+3 All Stats', desc: '+3 to every stat for all your players' },
        { type: 'allStats', value: 2, label: '+2 All Stats', desc: '+2 to every stat for all your players' },
    ];
    // 1% chance to generate a rare mega buff option
    const megaPool = [
        ...statKeys.map(s => ({ type: 'flatStat', stat: s, value: 20, label: `+20 ${s.toUpperCase()} ★`, desc: `MEGA: +20 to ${s.toUpperCase()} for all players!` })),
        { type: 'allStats', value: 12, label: '+12 All Stats ★', desc: 'MEGA: +12 to every stat for all your players!' },
        ...roles.map(r => ({ type: 'roleBonus', role: r, value: 25, label: `${r} Power +25 ★`, desc: `MEGA: +25 to all stats when ${r} is involved!` })),
        ...statKeys.map(s => ({ type: 'pctStat', stat: s, value: 50, label: `+50% ${s.toUpperCase()} ★`, desc: `MEGA: +50% multiplicative boost to ${s.toUpperCase()}!` })),
    ];
    const options = [];
    for (let slot = 0; slot < 3; slot++) {
        if (Math.random() < 0.01) {
            const mega = megaPool[Math.floor(Math.random() * megaPool.length)];
            options.push(mega);
        } else {
            const pick = buffPool[Math.floor(Math.random() * buffPool.length)];
            options.push(pick);
        }
    }
    towerState.buffOptions = options;
}

function selectTowerBuff(idx) {
    if (!towerState || towerState.phase !== 'buff') return;
    const chosen = towerState.buffOptions[idx];
    towerState.buffs.push(chosen);
    towerState.buffOptions = null;
    localStorage.setItem("lol_tower_v1", JSON.stringify(towerState));
    _towerStartMatch();
}

function renderTowerUI() {
    const container = document.getElementById('tower-content');
    if (!container || !towerState) return;
    const floorLabel = document.getElementById('tower-floor-label');
    if (floorLabel) floorLabel.textContent = `Floor ${towerState.floor}`;

    // Active buffs summary
    const buffsHTML = towerState.buffs.length
        ? `<div class="flex flex-wrap gap-2 mb-4">${towerState.buffs.map(b => `<span class="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-700/40 text-amber-300">${b.label}</span>`).join('')}</div>`
        : '';

    if (towerState.phase === 'defeat') {
        container.innerHTML = `${buffsHTML}
            <div class="bg-red-950/40 p-8 rounded-2xl border border-red-800 text-center">
                <div class="text-5xl mb-3">💀</div>
                <h3 class="text-2xl font-black text-red-400 mb-2">Tower Collapsed</h3>
                <p class="text-slate-400 mb-1">You reached <span class="text-amber-400 font-black">Floor ${towerState.floor}</span> with <span class="text-emerald-400 font-black">${towerState.buffs.length}</span> buffs.</p>
                <p class="text-slate-500 text-sm mb-5">Best: Floor ${trackStats.towerHighestFloor || 1}</p>
                <button onclick="closeTower()" class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-8 py-3 rounded-xl font-bold cursor-pointer transition">Return to Lobby</button>
            </div>`;
        const bestEl = document.getElementById('tower-best-display');
        if (bestEl) bestEl.textContent = `Best: Floor ${trackStats.towerHighestFloor || 0}`;
        return;
    }

    if (towerState.phase === 'buff') {
        const opts = towerState.buffOptions || [];
        const buffCardsHTML = opts.map((b, i) => {
            const isMega = b.label.includes('★');
            const cls = isMega ? 'bg-purple-950/60 hover:bg-purple-900/60 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-slate-800 hover:bg-slate-700 border border-amber-700/50 hover:border-amber-400';
            const icon = isMega ? '💎' : '⚡';
            return `<button onclick="selectTowerBuff(${i})" class="${cls} rounded-xl p-5 cursor-pointer transition text-center min-w-[180px] flex flex-col items-center gap-2">
                <span class="text-2xl">${icon}</span>
                <span class="${isMega ? 'text-purple-300' : 'text-amber-300'} font-black text-sm">${b.label}</span>
                <span class="text-slate-400 text-xs">${b.desc}</span>
            </button>`;
        }).join('');
        container.innerHTML = `${buffsHTML}
            <div class="bg-emerald-950/30 p-6 rounded-2xl border border-emerald-700/50 text-center">
                <h3 class="text-xl font-black text-emerald-300 mb-2 uppercase tracking-widest">Choose a Buff</h3>
                <p class="text-slate-400 text-sm mb-5">Floor ${towerState.floor - 1} cleared! Pick one upgrade to carry forward.</p>
                <div class="flex flex-wrap gap-4 justify-center">${buffCardsHTML}</div>
            </div>`;
        return;
    }

    // Match phase
    const ms = towerState.matchState;
    const opp = ms.opp;

    function pips(count, max, colorClass) {
        return Array.from({ length: max }, (_, i) =>
            `<span class="inline-block w-4 h-4 rounded-full border-2 ${i < count ? colorClass + ' border-transparent' : 'bg-slate-700 border-slate-600'}"></span>`
        ).join('');
    }

    const playCards = ms.options.map(play => {
        const myVal = _towerStatVal(play);
        const oppVal = opp.stats[play.statKey] || opp.avgRating;
        const edge = myVal - oppVal;
        const edgeColor = edge > 3 ? 'text-emerald-400' : edge < -3 ? 'text-red-400' : 'text-yellow-400';
        return `<button onclick="makeTowerPlay('${play.id}')" class="flex-1 min-w-[180px] bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-red-500 rounded-xl p-4 text-left cursor-pointer transition">
            <div class="flex items-center gap-1 mb-1"><span class="text-2xl">${play.icon}</span>${_tacticsBadgeHTML()}</div>
            <div class="font-black text-slate-100 text-sm mb-0.5">${play.label}</div>
            <div class="text-slate-500 text-xs mb-3">${play.desc}</div>
            <div class="font-mono text-sm space-y-1 border-t border-slate-700 pt-2">
                <div class="flex justify-between"><span class="text-slate-400">${play.myRoles.join('+')} ${play.statKey.toUpperCase()}</span><span class="text-slate-200 font-black text-base">${myVal}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Opp ${play.statKey.toUpperCase()}</span><span class="text-slate-300 font-bold text-base">${oppVal}</span></div>
                <div class="flex justify-between border-t border-slate-700/50 pt-1"><span class="text-slate-400">Edge</span><span class="${edgeColor} font-black text-base">${edge >= 0 ? '+' : ''}${edge}</span></div>
            </div>
        </button>`;
    }).join('');

    const logHTML = ms.log.length ? ms.log.map(e =>
        `<div class="flex items-start gap-2 text-sm font-mono ${e.won ? 'text-emerald-400' : 'text-red-400'}">
            <span>${e.won ? '✅' : '❌'}</span><span><span class="font-black">${e.icon} ${e.label}</span> — ${e.detail}</span>
        </div>`
    ).join('') : `<div class="text-slate-600 text-sm font-mono">No plays yet.</div>`;

    // Your roster with buffed stats
    const myRosterHTML = ['TOP','JNG','MID','ADC','SUP'].map(r => {
        const c = squad[r];
        if (!c) return '';
        const statKeys = ['mec','tmf','frm','cmp','map','ldr'];
        const buffedStats = statKeys.map(s => {
            const base = c.stats[s] || 0;
            const buffed = _towerApplyBuffs(base, s, r);
            const diff = buffed - base;
            return `<span class="font-mono text-slate-400 text-[10px]">${s.toUpperCase()} <span class="text-cyan-400 font-black">${buffed}</span>${diff > 0 ? `<span class="text-emerald-400 text-[9px]">+${diff}</span>` : ''}</span>`;
        }).join(' ');
        return `<div class="flex items-center gap-2 text-sm py-1 border-b border-slate-700/30">
            <span class="text-slate-500 font-black w-7 uppercase shrink-0 text-[10px]">${r}</span>
            <span class="text-slate-200 font-bold truncate w-20">${c.name}</span>
            <div class="flex flex-wrap gap-x-2 gap-y-0.5">${buffedStats}</div>
        </div>`;
    }).join('');

    // Opponent stats
    const oppStatsHTML = ['mec','tmf','frm','cmp','map','ldr'].map(s =>
        `<div class="flex justify-between text-sm py-1 border-b border-slate-700/30">
            <span class="text-slate-500 uppercase font-black text-[10px]">${s}</span>
            <span class="text-red-400 font-black">${opp.stats[s]}</span>
        </div>`
    ).join('');

    container.innerHTML = `${buffsHTML}
        <div class="flex items-center gap-3 flex-wrap mb-4">
            <span class="text-xl">${opp.logo}</span>
            <span class="font-black text-slate-100">${opp.name}</span>
            <span class="text-slate-500 text-sm">${opp.style} · Avg <span class="font-bold text-slate-300">${opp.avgRating}</span></span>
        </div>
        <div class="flex items-center justify-center gap-8 bg-slate-800/60 py-3 rounded-2xl border border-slate-700 mb-4">
            <div class="text-center"><div class="text-xs text-blue-400 font-black uppercase mb-1">You</div><div class="flex gap-1">${pips(ms.wins, 2, 'bg-blue-400')}</div></div>
            <div class="text-slate-600 font-black">vs</div>
            <div class="text-center"><div class="text-xs text-red-400 font-black uppercase mb-1">Tower</div><div class="flex gap-1">${pips(ms.losses, 2, 'bg-red-500')}</div></div>
        </div>
        <div class="text-center text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Round ${ms.round} — Choose Your Play</div>
        <div class="flex flex-wrap gap-3 mb-4">${playCards}</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                <div class="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Your Roster (Buffed)</div>
                <div class="space-y-0.5">${myRosterHTML}</div>
            </div>
            <div class="bg-slate-800/60 rounded-xl border border-red-900/40 p-4">
                <div class="text-xs font-black uppercase tracking-widest text-red-400 mb-2">${opp.name} Stats</div>
                <div class="space-y-0.5">${oppStatsHTML}</div>
            </div>
            <div class="bg-slate-950/60 rounded-xl border border-slate-700 p-4">
                <div class="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Match Log</div>
                <div class="space-y-1.5">${logHTML}</div>
            </div>
        </div>`;
}

// ──────────────────────────────────────────────────────────────────────────────

// ─── UPGRADE SYSTEM ─────────────────────────────────────────────────────────────

const UPGRADE_TIER_ORDER = ['Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
const UPGRADE_COSTS = { Silver: 50, Gold: 100, Platinum: 150, Diamond: 200, Master: 250, Grandmaster: 300 };
const UPGRADE_RATING_RANGES = { Gold: [80,84], Platinum: [85,89], Diamond: [90,93], Master: [94,95], Grandmaster: [96,97], Challenger: [98,100] };
// Master->Grandmaster and Grandmaster->Challenger only need 5 cards — those tiers are already rare.
const UPGRADE_CARD_COUNTS = { Silver: 10, Gold: 10, Platinum: 10, Diamond: 10, Master: 5, Grandmaster: 5 };

function hasAvailableUpgrade() {
    const activeIds = Object.values(squad).filter(s => s).map(s => s.uniqueId);
    const ROLES = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    return UPGRADE_TIER_ORDER.slice(0, -1).some(fromTier => {
        const cost = UPGRADE_COSTS[fromTier];
        const needed = UPGRADE_CARD_COUNTS[fromTier];
        return ROLES.some(role => {
            const count = club.filter(c => c.role === role && c.quality === fromTier && !activeIds.includes(c.uniqueId)).length;
            return count >= needed && blueEssence >= cost;
        });
    });
}

function upgradeCards(role, fromTier) {
    const fromIdx = UPGRADE_TIER_ORDER.indexOf(fromTier);
    if (fromIdx < 0 || fromIdx >= UPGRADE_TIER_ORDER.length - 1) {
        showToast('Cannot upgrade past Challenger.', 'error'); return;
    }
    const toTier = UPGRADE_TIER_ORDER[fromIdx + 1];
    const cost = UPGRADE_COSTS[fromTier];
    const needed = UPGRADE_CARD_COUNTS[fromTier];
    const activeIds = Object.values(squad).filter(s => s).map(s => s.uniqueId);
    const eligible = club.filter(c => c.role === role && c.quality === fromTier && !activeIds.includes(c.uniqueId));
    if (eligible.length < needed) {
        showToast(`Need ${needed} ${fromTier} ${role} cards. You have ${eligible.length}.`, 'error'); return;
    }
    if (blueEssence < cost) {
        showToast(`Need ${cost} BE for this upgrade.`, 'error'); return;
    }
    showConfirm(
        `Upgrade ${fromTier} → ${toTier}?`,
        `Sacrifice ${needed} ${fromTier} ${role} cards + ${cost} BE to forge 1 ${toTier} ${role} card.`,
        () => {
            const toRemove = [...eligible].sort((a, b) => b.rating - a.rating).slice(0, needed);
            club = club.filter(c => !toRemove.some(r => r.uniqueId === c.uniqueId));
            blueEssence -= cost;
            const base = toRemove[0];
            const [minR, maxR] = UPGRADE_RATING_RANGES[toTier];
            const newRating = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
            const boost = newRating - base.rating;
            const newCard = {
                ...base,
                quality: toTier,
                rating: newRating,
                stats: {
                    mec: Math.min(99, (base.stats.mec || 70) + boost),
                    tmf: Math.min(99, (base.stats.tmf || 70) + boost),
                    map: Math.min(99, (base.stats.map || 70) + boost),
                    frm: Math.min(99, (base.stats.frm || 70) + boost),
                    cmp: Math.min(99, (base.stats.cmp || 70) + boost),
                    ldr: Math.min(99, (base.stats.ldr || 70) + boost)
                },
                uniqueId: 'upg_' + Date.now() + '_' + Math.random().toString(36).substr(2,6)
            };
            club.push(newCard);
            trackStats.upgradesPerformed = (trackStats.upgradesPerformed || 0) + 1;
            showToast(`✨ ${base.name} forged into ${toTier} tier!`, 'success');
            saveGame(); updateDisplays(); renderUpgradeLab();
        }
    );
}

const ROLE_ICONS = { TOP: 'icons/Top_icon.png', JNG: 'icons/Jungle_icon.png', MID: 'icons/Middle_icon.png', ADC: 'icons/Bottom_icon.png', SUP: 'icons/Support_icon.png' };
const TIER_COLORS = { Silver: 'text-slate-300', Gold: 'text-amber-400', Platinum: 'text-emerald-400', Diamond: 'text-blue-400', Master: 'text-purple-400', Grandmaster: 'text-red-400', Challenger: 'text-yellow-300' };

function renderUpgradeLab() {
    const container = document.getElementById('upgrade-lab-grid');
    if (!container) return;
    const activeIds = Object.values(squad).filter(s => s).map(s => s.uniqueId);
    const ROLES = ['TOP', 'JNG', 'MID', 'ADC', 'SUP'];
    const TIERS = UPGRADE_TIER_ORDER.slice(0, -1);
    container.innerHTML = '';
    let hasAny = false;
    TIERS.forEach(fromTier => {
        const toTier = UPGRADE_TIER_ORDER[UPGRADE_TIER_ORDER.indexOf(fromTier) + 1];
        const cost = UPGRADE_COSTS[fromTier];
        const needed = UPGRADE_CARD_COUNTS[fromTier];
        ROLES.forEach(role => {
            const count = club.filter(c => c.role === role && c.quality === fromTier && !activeIds.includes(c.uniqueId)).length;
            if (count === 0) return;
            hasAny = true;
            const canUpgrade = count >= needed && blueEssence >= cost;
            const notEnoughCards = count < needed;
            const notEnoughBE = count >= needed && blueEssence < cost;
            const btnLabel = canUpgrade ? 'Upgrade ⚡' : notEnoughCards ? `Need ${needed - count} more` : `Need ${cost - blueEssence} BE`;
            const row = document.createElement('div');
            row.className = `flex items-center justify-between gap-4 p-5 rounded-2xl border transition ${canUpgrade ? 'border-green-700/60 bg-green-950/20 shadow-lg shadow-green-950/20' : 'border-slate-700/50 bg-slate-900/30'}`;
            row.innerHTML = `
                <div class="flex items-center gap-4">
                    ${ROLE_ICONS[role] ? `<img src="${ROLE_ICONS[role]}" alt="${role}" class="w-10 h-10 object-contain opacity-90">` : '<span class="text-4xl">🃏</span>'}
                    <div>
                        <div class="text-xl font-black text-slate-100 uppercase tracking-wide">${role}</div>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm font-bold ${TIER_COLORS[fromTier] || 'text-slate-400'}">${fromTier}</span>
                            <span class="text-slate-600 font-black">→</span>
                            <span class="text-sm font-black ${TIER_COLORS[toTier] || 'text-yellow-400'}">${toTier}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-6 flex-wrap justify-end">
                    <div class="text-center min-w-[56px]">
                        <div class="text-3xl font-black font-mono ${count >= needed ? 'text-green-400' : 'text-slate-400'}">${count}<span class="text-slate-600 text-xl">/${needed}</span></div>
                        <div class="text-[10px] text-slate-500 uppercase font-bold">cards</div>
                    </div>
                    <div class="text-center min-w-[60px]">
                        <div class="text-2xl font-black text-amber-400">${cost}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-bold">BE cost</div>
                    </div>
                    <button onclick="upgradeCards('${role}','${fromTier}')" ${canUpgrade ? '' : 'disabled'} class="${canUpgrade ? 'bg-green-600 hover:bg-green-500 cursor-pointer text-white shadow-lg shadow-green-900/30' : 'bg-slate-700 cursor-not-allowed text-slate-500'} px-6 py-3 rounded-xl font-black text-sm transition uppercase tracking-wide min-w-[130px] text-center">${btnLabel}</button>
                </div>`;
            container.appendChild(row);
        });
    });
    if (!hasAny) {
        container.innerHTML = `<div class="text-center py-14"><div class="text-5xl mb-4">⚗️</div><p class="text-slate-500 text-base">No upgrade candidates yet.</p><p class="text-slate-600 text-sm mt-2">Collect 10 unassigned cards of the same role &amp; tier to unlock an upgrade.</p></div>`;
    }
}

function quickSellDuplicates() {
    let sold = 0; let val = 0; let seen = new Set(); let activeIds = Object.values(squad).filter(s=>s).map(s=>s.uniqueId);
    let toKeep = [];
    let gmSold = 0;
    club.forEach(c => {
        let isAct = activeIds.includes(c.uniqueId);
        if(!isAct && seen.has(c.id)) { sold++; val += getSellValue(c.quality); if (['Grandmaster','Challenger'].includes(c.quality)) gmSold++; }
        else { seen.add(c.id); toKeep.push(c); }
    });
    if(sold > 0) { club = toKeep; blueEssence += val; trackStats.soldCount += sold; trackStats.soldBE += val; if (gmSold > 0) trackStats.gmSoldCount = (trackStats.gmSoldCount||0)+gmSold; showToast(`Purged ${sold} Duplicates for ${val} BE!`, "success"); saveGame(); }
    else showToast("No duplicates found.", "info");
}