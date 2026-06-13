// app.js

function getDB() {
    return typeof playerDatabase !== 'undefined' ? playerDatabase : window.playerDatabase;
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
let skills = { scouting: 0, negotiation: 0, tactics: 0 };

// New Systems State
let collectionRegistry = {};
let tradeMarket = { expires: 0, offers: [] };
let teamCompletionRewards = {};

let trackStats = { 
    packs: 0, tournamentsWon: 0, goldenRoads: 0, soldCount: 0, soldBE: 0, matchesPlayed: {} 
};

let quests = [
    // One-time milestones
    { id: 'q1', desc: 'Open 5 Card Packs', target: 5, type: 'packs', reward: 800, claimed: false },
    { id: 'q5', desc: 'Open 25 Card Packs', target: 25, type: 'packs', reward: 2500, claimed: false },
    { id: 'q2', desc: 'Liquidate 10 Players', target: 10, type: 'soldCount', reward: 500, claimed: false },
    { id: 'q6', desc: 'Liquidate 50 Players', target: 50, type: 'soldCount', reward: 2000, claimed: false },
    { id: 'q3', desc: 'Win 2 Tournaments', target: 2, type: 'tournamentsWon', reward: 1200, claimed: false },
    { id: 'q7', desc: 'Win 10 Tournaments', target: 10, type: 'tournamentsWon', reward: 5000, claimed: false },
    { id: 'q4', desc: 'Complete the Golden Road', target: 1, type: 'goldenRoads', reward: 5000, claimed: false },
    { id: 'q8', desc: 'Complete 3 Golden Roads', target: 3, type: 'goldenRoads', reward: 15000, claimed: false },
    { id: 'q9', desc: 'Win a Regional Split', target: 1, type: 'regionalSplitWon', reward: 3000, claimed: false },
    { id: 'q10', desc: 'Win First Stand', target: 1, type: 'firstStandWon', reward: 2000, claimed: false },
    { id: 'q11', desc: 'Win MSI', target: 1, type: 'msiWon', reward: 4000, claimed: false },
    { id: 'q12', desc: 'Win the World Championship', target: 1, type: 'worldsWon', reward: 8000, claimed: false },
    // Repeatable contracts (unique objectives, infinite, lower reward, baseline resets on each claim)
    { id: 'rq1', desc: 'Pull a Challenger card', target: 1, type: 'challengerPulled', reward: 400, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    { id: 'rq2', desc: 'Open 3 Champion Packs', target: 3, type: 'champPacksOpened', reward: 500, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    { id: 'rq3', desc: 'Liquidate 5 Grandmaster+ cards', target: 5, type: 'gmSoldCount', reward: 350, repeatable: true, claimed: false, baselineAtReset: 0, timesCompleted: 0 },
    // Timed challenges (must accept first; repeatable after claiming or expiry)
    { id: 'tq1', desc: 'Win 3 Tournaments', target: 3, type: 'tournamentsWon', reward: 1500, timed: true, timerMins: 5, accepted: false, acceptedAt: 0, baselineAtAccept: 0, timesCompleted: 0 },
    { id: 'tq2', desc: 'Open 10 Card Packs', target: 10, type: 'packs', reward: 1000, timed: true, timerMins: 5, accepted: false, acceptedAt: 0, baselineAtAccept: 0, timesCompleted: 0 },
    { id: 'tq3', desc: 'Liquidate 15 Players', target: 15, type: 'soldCount', reward: 800, timed: true, timerMins: 5, accepted: false, acceptedAt: 0, baselineAtAccept: 0, timesCompleted: 0 }
];

let isGoldenRoad = false;
let grStageIndex = 0;
let grAccruedEssence = 0;
const grStages = [
    { name: "Regional Split 1", diff: 75, rounds: 3, r1: 300, r2: 50 },
    { name: "First Stand", diff: 81, rounds: 3, r1: 500, r2: 100 },
    { name: "Regional Split 2", diff: 85, rounds: 3, r1: 600, r2: 150 },
    { name: "MSI Arena", diff: 90, rounds: 3, r1: 1100, r2: 300 },
    { name: "Regional Split 3", diff: 93, rounds: 3, r1: 1300, r2: 400 },
    { name: "World Championship", diff: 96, rounds: 4, r1: 2500, r2: 800 }
];

let tourActive = false;
let tourData = null; 
let tourRound = 0; 
let enemies = []; 
let simIntervalId = null;
let tacticalBonus = 0;

let trainingActiveUntil = 0;
let trainingTimerInterval = null;
let marketTimerInterval = null;
let timedQuestInterval = null;
let activeSlot = "TOP";

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    const target = document.getElementById('tab-' + tabId);
    if(target) target.classList.remove('hidden');

    // Clear notification badges when visiting their tabs
    if (tabId === 'club') {
        hasNewClubItems = false;
        saveGame();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPulls(cards, title) {
    const area = document.getElementById("pack-opening-area");
    const container = document.getElementById("pulled-cards");
    const titleEl = document.getElementById("pack-opening-title");
    
    if(!area || !container || !titleEl) return;
    
    titleEl.innerText = title || "Pack Opened!";
    container.innerHTML = "";
    
    cards.forEach(card => {
        container.appendChild(createCardElement(card, false, null, null));
    });
    
    area.classList.remove("hidden");
    area.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function rollTier(type) {
    // Scouting skill provides up to +10 RNG bonus at max level 5
    let bonus = skills.scouting * 2;
    let rng = (Math.random() * 100) + bonus;

    if (type === 'Standard') {
        // Silver most common, Gold possible. Max: Gold
        if (rng > 92) return 'Gold';
        return 'Silver';
    }

    if (type === 'Elite') {
        // Silver still most common base, Gold common, Platinum uncommon, Diamond rare. NO Master.
        if (rng > 96) return 'Diamond';
        if (rng > 80) return 'Platinum';
        if (rng > 45) return 'Gold';
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

function formatTimeRemaining(ms) {
    if (ms <= 0) return "EXPIRED";
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
}

function checkTimedQuests() {
    let anyChanged = false;
    quests.forEach(q => {
        if (q.timed && q.accepted) {
            const timerMs = (q.timerMins || (q.timerHours || 0) * 60) * 60000;
            if (Date.now() > q.acceptedAt + timerMs) {
                q.accepted = false;
                q.acceptedAt = 0;
                q.baselineAtAccept = 0;
                anyChanged = true;
            }
        }
    });
    return anyChanged;
}

function acceptTimedQuest(id) {
    const q = quests.find(x => x.id === id);
    if (!q || !q.timed || q.accepted) return;
    q.accepted = true;
    q.acceptedAt = Date.now();
    q.baselineAtAccept = trackStats[q.type] || 0;
    saveGame();
    renderQuests();
    showToast(`Timed quest accepted — ${q.timerMins || ((q.timerHours || 0) * 60)}m to complete!`, "info");
}

function startTimedQuestTimer() {
    if (timedQuestInterval) clearInterval(timedQuestInterval);
    timedQuestInterval = setInterval(() => {
        if (checkTimedQuests()) {
            showToast("A timed quest expired!", "error");
            saveGame();
            updateBadges();
        }
        const questsTab = document.getElementById("tab-quests");
        if (questsTab && !questsTab.classList.contains("hidden")) renderQuests();
    }, 1000);
}

function renderQuests() {
    const container = document.getElementById("quests-container");
    if (!container) return;

    const milestones = quests.filter(q => !q.repeatable && !q.timed);
    const repeatables = quests.filter(q => q.repeatable);
    const timedList = quests.filter(q => q.timed);

    function bar(pct, color) {
        return `<div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700 mt-2">
            <div class="${color} h-full transition-all duration-500" style="width:${pct}%"></div></div>`;
    }

    function questCard(content, border = 'border-slate-700') {
        return `<div class="bg-slate-800/70 p-4 rounded-xl border ${border} shadow-md">${content}</div>`;
    }

    const milestoneHTML = milestones.map(q => {
        const progress = trackStats[q.type] || 0;
        const isDone = progress >= q.target;
        const pct = Math.min(100, (progress / q.target) * 100);
        const btn = q.claimed
            ? `<button disabled class="w-full mt-2 bg-slate-700 text-slate-500 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed text-xs">Claimed</button>`
            : isDone
                ? `<button onclick="claimQuest('${q.id}')" class="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-lg font-black shadow-[0_0_8px_rgba(234,179,8,0.5)] cursor-pointer transition uppercase tracking-wider text-xs">Claim ${q.reward} BE</button>`
                : `<button disabled class="w-full mt-2 bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed text-xs">${progress} / ${q.target}</button>`;
        return questCard(`<h4 class="font-bold text-slate-200 text-sm">${q.desc}</h4>${bar(pct, 'bg-yellow-500')}${btn}`);
    }).join("");

    const repeatableHTML = repeatables.map(q => {
        const progress = Math.max(0, (trackStats[q.type] || 0) - (q.baselineAtReset || 0));
        const isDone = progress >= q.target;
        const pct = Math.min(100, (progress / q.target) * 100);
        const badge = q.timesCompleted > 0 ? ` <span class="text-[10px] text-cyan-500 font-bold">×${q.timesCompleted}</span>` : "";
        const btn = isDone
            ? `<button onclick="claimQuest('${q.id}')" class="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1.5 rounded-lg font-black shadow-[0_0_8px_rgba(6,182,212,0.5)] cursor-pointer transition uppercase tracking-wider text-xs">Claim ${q.reward} BE</button>`
            : `<button disabled class="w-full mt-2 bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed text-xs">${progress} / ${q.target}</button>`;
        return questCard(`<h4 class="font-bold text-cyan-200 text-sm">${q.desc}${badge}</h4><p class="text-[10px] text-slate-500 mt-0.5">Repeatable · ${q.reward} BE</p>${bar(pct, 'bg-cyan-500')}${btn}`, 'border-cyan-900/40');
    }).join("");

    const timedHTML = timedList.map(q => {
        const now = Date.now();
        const timerMs = (q.timerMins || (q.timerHours || 0) * 60) * 60000;
        const msLeft = q.accepted ? (q.acceptedAt + timerMs) - now : 0;
        const expired = q.accepted && msLeft <= 0;
        const progress = q.accepted ? Math.max(0, (trackStats[q.type] || 0) - q.baselineAtAccept) : 0;
        const isDone = progress >= q.target;
        const pct = Math.min(100, (progress / q.target) * 100);

        let btn, timerBadge = "";
        if (!q.accepted) {
            btn = `<button onclick="acceptTimedQuest('${q.id}')" class="w-full mt-2 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg font-black cursor-pointer transition uppercase tracking-wider text-xs">Accept</button>`;
        } else if (isDone) {
            btn = `<button onclick="claimQuest('${q.id}')" class="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-lg font-black shadow-[0_0_8px_rgba(234,179,8,0.5)] cursor-pointer transition uppercase tracking-wider text-xs">Claim ${q.reward} BE</button>`;
            timerBadge = `<span class="text-[10px] text-emerald-400 font-bold ml-1">DONE!</span>`;
        } else {
            btn = `<button disabled class="w-full mt-2 bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg font-bold cursor-not-allowed text-xs">${progress} / ${q.target}</button>`;
            timerBadge = `<span class="text-[10px] font-mono font-bold ml-1 ${expired ? 'text-red-400' : 'text-orange-300'}">${formatTimeRemaining(msLeft)}</span>`;
        }
        const borderColor = !q.accepted ? 'border-slate-700' : isDone ? 'border-emerald-700/60' : expired ? 'border-red-800/50' : 'border-orange-800/40';
        const barColor = isDone ? 'bg-emerald-500' : expired ? 'bg-red-700' : 'bg-orange-500';
        const completedBadge = q.timesCompleted > 0 ? ` <span class="text-[10px] text-orange-500 font-bold">×${q.timesCompleted}</span>` : "";
        const progressBar = q.accepted ? bar(pct, barColor) : `<div class="w-full bg-slate-900 h-2 rounded-full border border-slate-700 mt-2"><div class="bg-slate-700 h-full" style="width:100%"></div></div>`;
        return questCard(`<div class="flex items-center flex-wrap gap-1"><h4 class="font-bold text-orange-200 text-sm">${q.desc}${completedBadge}</h4>${timerBadge}</div><p class="text-[10px] text-slate-500 mt-0.5">${q.timerMins || ((q.timerHours || 0) * 60)}m · ${q.reward} BE · Repeatable</p>${progressBar}${btn}`, borderColor);
    }).join("");

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            <div>
                <h3 class="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-2">🔄 Repeatable Contracts</h3>
                <p class="text-[10px] text-slate-500 mb-3">Infinite · progress resets after each claim</p>
                <div class="space-y-3">${repeatableHTML}</div>
            </div>
            <div>
                <h3 class="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">🏆 Milestone Achievements</h3>
                <p class="text-[10px] text-slate-500 mb-3">One-time · claimed forever once complete</p>
                <div class="space-y-3">${milestoneHTML}</div>
            </div>
            <div>
                <h3 class="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">⏱ Timed Challenges</h3>
                <p class="text-[10px] text-slate-500 mb-3">Accept to start · complete before time runs out</p>
                <div class="space-y-3">${timedHTML}</div>
            </div>
        </div>`;
}

function claimQuest(id) {
    const q = quests.find(x => x.id === id);
    if (!q) return;

    let progress;
    if (q.timed) {
        if (!q.accepted) return;
        progress = Math.max(0, (trackStats[q.type] || 0) - q.baselineAtAccept);
    } else if (q.repeatable) {
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
    } else if (q.timed) {
        q.accepted = false;
        q.acceptedAt = 0;
        q.baselineAtAccept = 0;
        q.timesCompleted = (q.timesCompleted || 0) + 1;
    } else {
        q.claimed = true;
    }

    saveGame();
    renderQuests();
}

function closePatchModal(dontShowAgain) {
    if (dontShowAgain) localStorage.setItem('lol_patch_seen_v0_2_3', '1');
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
        skills = p.skills || { scouting: 0, negotiation: 0, tactics: 0 };
    }
    
    const savedCol = localStorage.getItem("lol_collection_v7_pro");
    if (savedCol) collectionRegistry = JSON.parse(savedCol);
    const savedTrade = localStorage.getItem("lol_trade_v7_pro");
    if (savedTrade) tradeMarket = JSON.parse(savedTrade);
    const savedTeamComplete = localStorage.getItem("lol_team_complete_v8");
    if (savedTeamComplete) teamCompletionRewards = JSON.parse(savedTeamComplete);

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

    const patchKey = 'lol_patch_seen_v0_2_3';
    if (!localStorage.getItem(patchKey)) {
        const modal = document.getElementById('patch-modal');
        if (modal) modal.classList.remove('hidden');
    }

    const savedQuests = localStorage.getItem("lol_quests_v8_pro");
    if (savedQuests) {
        const saved = JSON.parse(savedQuests);
        const savedMap = {};
        saved.forEach(q => { savedMap[q.id] = q; });
        quests = quests.map(q => savedMap[q.id] ? { ...q, ...savedMap[q.id] } : q);
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
    if (checkTimedQuests()) saveGame();

    populateDropdownFilters();
    recalculateRegionalPrice();
    updateDisplays();
    checkAndRecoverTrainingTimer();
    startTradeMarketTimer();
    startTimedQuestTimer();
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
    localStorage.setItem("lol_prog_v7_pro", JSON.stringify({managerXP, managerLevel, skillPoints, skills}));
    localStorage.setItem("lol_new_items_v7_pro", hasNewClubItems);
    localStorage.setItem("lol_collection_v7_pro", JSON.stringify(collectionRegistry));
    localStorage.setItem("lol_trade_v7_pro", JSON.stringify(tradeMarket));
    localStorage.setItem("lol_team_complete_v8", JSON.stringify(teamCompletionRewards));
    updateDisplays();
}

function updateBadges() {
    const clubBadge = document.getElementById("badge-club");
    const skillsBadge = document.getElementById("badge-skills");
    const questsBadge = document.getElementById("badge-quests");
    const collBadge = document.getElementById("badge-collection");
    
    if (hasNewClubItems && clubBadge) clubBadge.classList.remove("hidden");
    else if(clubBadge) clubBadge.classList.add("hidden");

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
        if (q.timed) {
            if (!q.accepted) return false;
            const progress = Math.max(0, (trackStats[q.type] || 0) - q.baselineAtAccept);
            const timerMs = (q.timerMins || (q.timerHours || 0) * 60) * 60000;
            const expired = Date.now() > q.acceptedAt + timerMs;
            return progress >= q.target && !expired;
        }
        if (q.repeatable) {
            return Math.max(0, (trackStats[q.type] || 0) - (q.baselineAtReset || 0)) >= q.target;
        }
        return (trackStats[q.type] || 0) >= q.target && !q.claimed;
    });
    if (hasClaimableQuest && questsBadge) questsBadge.classList.remove("hidden");
    else if(questsBadge) questsBadge.classList.add("hidden");

    let hasClaimableCollection = false;
    let db = getDB();
    if(db) {
        let dbRegionFilt = db.filter(c => c.region === currentCollectionRegion);
        hasClaimableCollection = dbRegionFilt.some(c => collectionRegistry[c.id] && !collectionRegistry[c.id].claimed);
    }
    
    if (hasClaimableCollection && collBadge) collBadge.classList.remove("hidden");
    else if(collBadge) collBadge.classList.add("hidden");
}

function secretMoneyCheat() {
    blueEssence += 10000;
    saveGame();
    showToast("Cheat Activated: +10,000 BE!", "success");
}

function processNewCards(cards) {
    cards.forEach(c => {
        if (!collectionRegistry[c.id]) {
            collectionRegistry[c.id] = { claimed: false, acquiredAt: Date.now() };
        }
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
    let offers = [];
    for(let i=0; i<3; i++) {
        if(elitePool.length === 0) break;
        let cIdx = Math.floor(Math.random() * elitePool.length);
        let rewardCard = elitePool[cIdx];
        elitePool.splice(cIdx, 1); 
        
        let reqQuality = "Platinum";
        let reqCount = 3;
        if (rewardCard.quality === "Master") {
            reqQuality = Math.random() > 0.5 ? "Platinum" : "Diamond";
            reqCount = reqQuality === "Platinum" ? 5 : 2;
        } else if (rewardCard.quality === "Grandmaster") {
            reqQuality = Math.random() > 0.5 ? "Diamond" : "Master";
            reqCount = reqQuality === "Diamond" ? 4 : 2;
        } else if (rewardCard.quality === "Challenger") {
            reqQuality = Math.random() > 0.5 ? "Diamond" : "Master";
            reqCount = reqQuality === "Diamond" ? 7 : 3;
        } else if (["MVP", "Champion", "Finalist", "MSI", "FirstStand"].includes(rewardCard.quality)) {
            reqQuality = Math.random() > 0.5 ? "Master" : "Grandmaster";
            reqCount = reqQuality === "Master" ? 4 : 2;
        }
        offers.push({ id: Date.now() + i, rewardBaseId: rewardCard.id, reqQuality: reqQuality, reqCount: reqCount, completed: false });
    }
    tradeMarket = { expires: Date.now() + (15 * 60 * 1000), offers: offers };
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

function renderTradeMarket() {
    const container = document.getElementById("trade-offers-container");
    if(!container) return;
    container.innerHTML = "";
    let db = getDB();
    tradeMarket.offers.forEach(offer => {
        let rewardCardDef = db.find(p => p.id === offer.rewardBaseId);
        if(!rewardCardDef) return;
        let availableFodder = club.filter(c => c.quality === offer.reqQuality && !Object.values(squad).some(s => s && s.uniqueId === c.uniqueId));
        let hasEnough = availableFodder.length >= offer.reqCount;
        
        const wrapper = document.createElement("div");
        wrapper.className = `bg-slate-800/80 p-5 rounded-2xl border ${offer.completed ? 'border-emerald-900/50 opacity-50' : 'border-orange-900/40'} flex flex-col items-center shadow-lg relative overflow-hidden`;
        
        let cardObj = { ...rewardCardDef, uniqueId: "preview" };
        let visual = createCardElement(cardObj, false, null, null);
        wrapper.appendChild(visual);
        
        let reqBlock = document.createElement("div");
        reqBlock.className = "mt-4 w-full text-center bg-slate-900/60 rounded-xl p-3 border border-slate-700/50";
        if (offer.completed) {
            reqBlock.innerHTML = `<span class="text-emerald-400 font-black tracking-widest uppercase">Acquired</span>`;
        } else {
            let colorClass = hasEnough ? 'text-emerald-400' : 'text-red-400';
            reqBlock.innerHTML = `
                <p class="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Cost / Exchange</p>
                <p class="font-mono text-sm font-bold text-slate-300">Requires <span class="text-${offer.reqQuality === 'Diamond' ? 'blue' : 'emerald'}-400">${offer.reqQuality}</span> assets</p>
                <p class="text-xs mt-1 ${colorClass} font-bold">Have: ${availableFodder.length} / ${offer.reqCount}</p>
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

function setArchiveCategory(cat) { currentArchiveCategory = cat; renderCollection(); }
function setCollectionRegion(reg) { currentCollectionRegion = reg; renderCollection(); }
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

function renderCollection() {
    let db = getDB(); if (!db) return;

    // Category button styles
    const catDefs = [
        { id: 'arch-cat-regular',    cat: 'regular',    active: 'bg-blue-600/20 border-blue-500/50 text-blue-300' },
        { id: 'arch-cat-firststand', cat: 'firststand', active: 'bg-orange-600/20 border-orange-500/50 text-orange-300' },
        { id: 'arch-cat-msi',        cat: 'msi',        active: 'bg-teal-600/20 border-teal-500/50 text-teal-300' },
        { id: 'arch-cat-finalists',  cat: 'finalists',  active: 'bg-slate-500/30 border-slate-400/60 text-slate-200' },
        { id: 'arch-cat-champion',   cat: 'champion',   active: 'bg-amber-600/20 border-amber-500/50 text-amber-300' },
        { id: 'arch-cat-mvp',        cat: 'mvp',        active: 'bg-pink-600/20 border-pink-500/50 text-pink-300' },
    ];
    catDefs.forEach(({ id, cat, active }) => {
        let btn = document.getElementById(id); if (!btn) return;
        btn.className = cat === currentArchiveCategory
            ? `flex-1 py-2 px-3 rounded-lg font-black text-sm cursor-pointer border shadow-inner ${active}`
            : 'flex-1 py-2 px-3 rounded-lg font-bold text-sm cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-transparent';
    });

    // Show/hide region bar
    const regionBar = document.getElementById('arch-region-bar');
    if (regionBar) regionBar.style.display = currentArchiveCategory === 'regular' ? '' : 'none';

    // Region button styles
    if (currentArchiveCategory === 'regular') {
        ['LCK', 'LPL', 'LEC', 'LCS'].forEach(r => {
            let btn = document.getElementById(`col-reg-${r}`); if (!btn) return;
            let hasClaimable = db.filter(c => c.region === r).some(c => collectionRegistry[c.id] && !collectionRegistry[c.id].claimed);
            btn.className = r === currentCollectionRegion
                ? 'flex-1 py-2 px-4 rounded-lg font-black text-sm transition bg-blue-600/20 border border-blue-500/50 text-blue-300 shadow-inner cursor-pointer relative'
                : 'flex-1 py-2 px-4 rounded-lg font-bold text-sm transition bg-slate-800 hover:text-slate-200 hover:bg-slate-700 cursor-pointer relative text-slate-400 border border-transparent';
            let dot = btn.querySelector('.region-notify-dot');
            if (hasClaimable) {
                if (!dot) { dot = document.createElement('span'); dot.className = 'region-notify-dot absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-slate-900 animate-pulse z-10 pointer-events-none'; btn.appendChild(dot); }
            } else { if (dot) dot.remove(); }
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
            wrapper.appendChild(createCardElement(c, false, null, null)); cardContainer.appendChild(wrapper);
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
            wrapper.appendChild(createCardElement(c, false, null, null)); cardContainer.appendChild(wrapper);
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
    managerXP += amount; let needed = managerLevel * 250; let leveledUp = false;
    while(managerXP >= needed) { managerXP -= needed; managerLevel++; skillPoints++; needed = managerLevel * 250; leveledUp = true; }
    if (leveledUp) showToast(`LEVEL UP! You are now Level ${managerLevel}. +1 Skill Point!`, "success");
    saveGame();
}

function upgradeSkill(skillName) {
    let currentLvl = skills[skillName]; let cost = currentLvl + 1;
    if (skillPoints >= cost && currentLvl < 5) { skillPoints -= cost; skills[skillName]++; saveGame(); renderSkillsUI(); updateBadges(); }
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
        { key: "scouting", name: "Scouting Network", desc: "Permanently boosts RNG values during pack openings, increasing the chance of pulling higher-tier drops.", color: "blue" },
        { key: "negotiation", name: "Corporate Negotiation", desc: "Reduces the baseline markup penalty on loan inflations by 20 BE per level.", color: "amber" },
        { key: "tactics", name: "Tactical Acumen", desc: "Grants a guaranteed flat power bonus (+3 per level) to your squad during the Tactical Draft phase.", color: "emerald" }
    ];
    container.innerHTML = "";
    skillDefs.forEach(def => {
        let currentLvl = skills[def.key]; let maxed = currentLvl >= 5; let cost = currentLvl + 1; let canUpgrade = skillPoints >= cost && !maxed;
        let dotsHTML = "";
        for(let i=1; i<=5; i++) {
            let active = i <= currentLvl ? `bg-${def.color}-400 border-${def.color}-500 shadow-[0_0_8px_theme(colors.${def.color}.400)]` : "bg-slate-800 border-slate-700";
            dotsHTML += `<div class="w-3 h-3 rounded-full border ${active}"></div>`;
        }
        let btnHTML = maxed 
            ? `<button disabled class="w-full bg-slate-800 text-slate-500 py-1.5 rounded-lg font-bold text-xs cursor-not-allowed">MAX LEVEL</button>`
            : `<button onclick="upgradeSkill('${def.key}')" class="w-full ${canUpgrade ? `bg-${def.color}-600 hover:bg-${def.color}-500 text-white cursor-pointer shadow` : `bg-slate-700 text-slate-400 cursor-not-allowed`} py-1.5 rounded-lg font-bold transition text-xs" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${cost} SP)</button>`;

        container.innerHTML += `<div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between"><div><h3 class="text-sm font-black text-${def.color}-400 mb-1">${def.name}</h3><p class="text-[11px] text-slate-400 mb-3 h-10">${def.desc}</p><div class="flex gap-1.5 mb-3 justify-center">${dotsHTML}</div></div>${btnHTML}</div>`;
    });
}

function executeTeamTraining() {
    if (blueEssence < 50) { showToast("Insufficient assets.", "error"); return; }
    blueEssence -= 50; trainingActiveUntil = Date.now() + 60000;
    localStorage.setItem("lol_training_expiry", trainingActiveUntil); saveGame(); startTrainingVisualCountdown();
}

function checkAndRecoverTrainingTimer() {
    const savedExpiry = localStorage.getItem("lol_training_expiry");
    if (savedExpiry) { trainingActiveUntil = parseInt(savedExpiry, 10); if (trainingActiveUntil > Date.now()) startTrainingVisualCountdown(); }
}

function startTrainingVisualCountdown() {
    if(trainingTimerInterval) clearInterval(trainingTimerInterval);
    const display = document.getElementById("training-timer-display"); const btn = document.getElementById("btn-run-training"); if(!display || !btn) return;
    btn.disabled = true; btn.classList.replace("bg-orange-500", "bg-slate-700"); btn.classList.add("cursor-not-allowed");
    trainingTimerInterval = setInterval(() => {
        let remaining = Math.round((trainingActiveUntil - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(trainingTimerInterval);
            display.innerText = "Facility Idle"; display.className = "font-mono font-bold text-slate-500 text-xs";
            btn.disabled = false; btn.classList.replace("bg-slate-700", "bg-orange-500"); btn.classList.remove("cursor-not-allowed"); computeChemistry();
        } else { display.innerText = `Live: ${remaining}s left`; display.className = "font-mono font-bold text-orange-400 animate-pulse text-xs"; computeChemistry(); }
    }, 1000);
}

function getTrainingBonus() { return (Date.now() < trainingActiveUntil) ? 5 : 0; }
function getLoanPremium() { let basePremium = 150 - (skills.negotiation * 20); return activeLoans * Math.max(0, basePremium); }
function takeLoan() { activeLoans++; blueEssence += 500; saveGame(); showToast("Credit allocated!", "success"); }
function payLoan() {
    if (blueEssence < 500) { showToast("Insufficient liquidity.", "error"); return; }
    if (activeLoans <= 0) { showToast("No active debt.", "error"); return; }
    activeLoans--; blueEssence -= 500; saveGame(); showToast("Loan amortized!", "success");
}

function checkSquadReady() {
    if (["TOP", "JNG", "MID", "ADC", "SUP"].some(role => squad[role] === null)) { 
        showToast("Lineup incomplete! Fill all 5 starting lane positions.", "error"); 
        return false; 
    } 
    return true;
}

function startTournament(name, cost, r1, r2, baseDiff, rounds) {
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

function startGoldenRoad() {
    if (!checkSquadReady()) return; 
    if (blueEssence < 1000) { showToast("Insufficient assets for Golden Road.", "error"); return; }
    if(simIntervalId) clearTimeout(simIntervalId); 
    
    blueEssence -= 1000; isGoldenRoad = true; tourActive = true; grStageIndex = 0; grAccruedEssence = 0; tacticalBonus = 0; tourRound = 0;
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
    for (const [playerName, count] of Object.entries(trackStats.matchesPlayed)) {
        if (count > highestMatches) { highestMatches = count; mvp = playerName; }
    }
    document.getElementById("stat-mvp").innerText = highestMatches > 0 ? `${mvp} (${highestMatches}m)` : "None";
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

function updateDisplays() {
    document.getElementById("be-display").innerText = blueEssence;
    document.getElementById("club-count-val").innerText = club.length;
    const premium = getLoanPremium(); document.getElementById("inflation-premium-display").innerText = `+${premium} BE`;
    if (activeLoans > 0) { document.getElementById("debt-warning").classList.remove("hidden"); document.getElementById("debt-display").innerText = activeLoans * 500; }
    else { document.getElementById("debt-warning").classList.add("hidden"); }
    document.querySelectorAll(".store-pack-btn").forEach(btn => {
        let basePrice = parseInt(btn.getAttribute("data-cost"));
        if (!isNaN(basePrice)) { btn.innerText = `${basePrice + premium} BE`; }
    });
    const starterBtn = document.getElementById("starter-pack-container");
    if (hasBoughtStarter) starterBtn.classList.add("hidden"); else starterBtn.classList.remove("hidden");
    updateBadges(); updateClubStatsUI(); renderClubGrid(); renderSquadView(); renderQuests();
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
    let actualCost = baseCost + getLoanPremium(); if (blueEssence < actualCost) { showToast("Insufficient BE reserves.", "error"); return; }
    blueEssence -= actualCost; trackStats.packs++; addXP(25); let pulled = [];
    if (type === 'Champion') {
        // Guaranteed 1 Legacy Wildcard (Champion/Finalist/MSI/FirstStand) + 4 fillers scaling Silver→Grandmaster (NO Challenger)
        trackStats.champPacksOpened = (trackStats.champPacksOpened || 0) + 1;
        let legPool = db.filter(p => ["Champion", "Finalist", "MSI", "FirstStand"].includes(p.quality));
        let legCard = legPool[Math.floor(Math.random() * legPool.length)];
        let p1 = {...legCard, uniqueId: Date.now() + "L1" + Math.random().toString(36).substring(2)};
        pulled.push(p1); club.push(p1);
        for (let i = 0; i < 4; i++) {
            let rng = (Math.random() * 100) + (skills.scouting * 2);
            let fillerTier = 'Silver';
            // Fillers capped at Diamond — Champion pack value is the wildcard itself
            if (rng > 85) fillerTier = 'Diamond';
            else if (rng > 60) fillerTier = 'Platinum';
            else if (rng > 35) fillerTier = 'Gold';
            let filPool = db.filter(p => p.quality === fillerTier && !["Champion", "Finalist", "MSI", "FirstStand", "Challenger"].includes(p.quality));
            if(filPool.length === 0) filPool = db.filter(p => p.quality === "Silver");
            let pF = filPool[Math.floor(Math.random() * filPool.length)];
            let cardF = {...pF, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
            pulled.push(cardF); club.push(cardF);
        }
    } else if (type === 'MVP') {
        // 0.1% MVP · 0.5% Challenger · 1.5% GM · 5% Master · ~25% Diamond · ~30% Platinum · ~22% Gold · ~16% Silver
        for (let i = 0; i < 5; i++) {
            let rng = (Math.random() * 100) + (skills.scouting * 2);
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
            let rng = (Math.random() * 100) + (skills.scouting * 2);
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
            let rng = (Math.random() * 100) + (skills.scouting * 2);
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
    blueEssence -= actualCost; trackStats.packs++; addXP(25); let pulled = [];
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
        wrap.appendChild(createCardElement(card, true, null, null));
        let btn = document.createElement("button"); let price = getSellValue(card.quality);
        if (Object.values(squad).some(s => s && s.uniqueId === card.uniqueId)) {
            btn.className = "text-xs bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg w-full font-bold cursor-not-allowed shadow-md"; btn.innerText = "In Squad"; btn.disabled = true;
        } else {
            btn.className = "text-xs bg-red-950/60 text-red-300 px-3 py-1.5 rounded-lg w-full font-bold cursor-pointer transition hover:bg-red-900 shadow-md"; btn.innerHTML = `Sell (+${price})`;
            btn.onclick = () => { blueEssence += price; trackStats.soldCount++; trackStats.soldBE += price; if (['Grandmaster','Challenger','Champion','Finalist','MSI','FirstStand'].includes(card.quality)) trackStats.gmSoldCount = (trackStats.gmSoldCount||0)+1; club = club.filter(c => c.uniqueId !== card.uniqueId); saveGame(); };
        }
        wrap.appendChild(btn); grid.appendChild(wrap);
    });
}

function sortClub(by) {
    if (by === 'rating') club.sort((a,b) => b.rating - a.rating);
    if (by === 'region') club.sort((a,b) => a.region.localeCompare(b.region));
    renderClubGrid();
}

// --- Player Picker Drawer ---
let _pickerFilters = { region: 'ALL', sort: 'rating' };

function populateDropdownFilters() { /* replaced by openPlayerPicker */ }
function renderFilteredPicker() { /* replaced by renderPickerCards */ }

function selectSlot(role) { openPlayerPicker(role); }

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

    // Auto-filter by role: main slots show only that role + Champion wildcards; COACH slot = coaches only; subs = all
    if (activeSlot === 'COACH') {
        pool = pool.filter(p => p.role === 'COACH');
    } else if (['TOP','JNG','MID','ADC','SUP'].includes(activeSlot)) {
        pool = pool.filter(p => p.role === activeSlot || ["Champion", "Finalist", "MSI", "FirstStand"].includes(p.quality));
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

    const addCardEl = (card) => {
        const isCurrentlyAssigned = squad[activeSlot] && squad[activeSlot].uniqueId === card.uniqueId;
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
        container.appendChild(el);
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

function clearSquad() { squad = { COACH: null, TOP: null, JNG: null, MID: null, ADC: null, SUP: null, SUB1: null, SUB2: null, SUB3: null }; saveGame(); }

function getTierFromRating(rating) {
    if (rating >= 97) return "Challenger"; if (rating >= 95) return "Grandmaster"; if (rating >= 92) return "Master";
    if (rating >= 89) return "Diamond"; if (rating >= 85) return "Platinum"; if (rating >= 80) return "Gold"; return "Silver";
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
    let coachBonus = squad["COACH"] ? 5 : 0; 
    
    if(count === 5) {
        // Legacy wildcards (Champion/Finalist/MSI/FirstStand) are excluded from region/year chemistry checks — they adapt to any lineup
        const LEGACY_QUALITIES = ["Champion", "Finalist", "MSI", "FirstStand"];
        let nonLegacy = active.filter(c => !LEGACY_QUALITIES.includes(c.quality));
        let legacyCount = active.filter(c => LEGACY_QUALITIES.includes(c.quality)).length;

        if (legacyCount === 5) {
            // All-Legacy team: full chemistry
            regionChem = 5; yearChem = 5;
        } else {
            // Region chemistry: only check non-legacy cards; legacy cards count as "matching" any region
            let regs = nonLegacy.map(c => c.region);
            let uReg = new Set(regs).size;
            if(uReg <= 1) regionChem = 5; else if(uReg <= 2) regionChem = 3; else if(uReg <= 3) regionChem = 2; else regionChem = 1;

            // Year chemistry: same — legacy wildcards bridge all eras
            let yrs = nonLegacy.map(c => c.year);
            let uY = new Set(yrs).size;
            if(uY <= 1) yearChem = 5; else if(uY <= 2) yearChem = 3; else yearChem = 1;

            // Team lineage bonus: legacy cards count as part of any team lineage
            let nonLegTeams = nonLegacy.map(c => window.teamLineageBridges[c.team] || c.team);
            if(nonLegTeams.length === 0 || new Set(nonLegTeams).size === 1) regionChem += 2;
            regionChem = Math.min(5, regionChem); // never exceed 5/5
        }
    }

    document.getElementById("overview-chem-region").innerText = `${regionChem} / 5`;
    document.getElementById("overview-chem-year").innerText = `${yearChem} / 5`;
    document.getElementById("overview-training-bonus").innerText = `+${trainBonus}`;
    document.getElementById("overview-coach-bonus").innerText = `+${coachBonus}`;
    
    let totalPower = avgRating + regionChem + yearChem + trainBonus + coachBonus;
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

    const darkCardTypes = ["Challenger", "Champion", "MVP", "Finalist", "MSI", "FirstStand"];
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

    const cleanName = card.name.replace(/[^a-zA-Z0-9]/g, '');
    const wikiImg = `https://lol.fandom.com/wiki/Special:FilePath/${cleanName}Square.png`;
    const fallback = `https://ui-avatars.com/api/?name=${cleanName}&background=0f172a&color=cbd5e1&size=128&bold=true`;

    // Nationality flag: specific override first, then region default
    const flag = (window.playerNationalityOverrides && window.playerNationalityOverrides[card.name])
        || (window.regionDefaultFlags && window.regionDefaultFlags[card.region])
        || '';

    // Official LoL role icon
    const roleIconHtml = (window.roleIcons && window.roleIcons[card.role]) || '';

    // Tier header — always inside the card (no clipping bugs)
    const tierLabel = card.role === "COACH" ? "COACH STAFF" : card.quality;

    cardDiv.innerHTML = `
        <div class="w-full text-center py-1.5 px-3 bg-black/25 border-b ${dividerColor} text-[10px] font-black uppercase tracking-widest ${textBase} rounded-t-xl">${tierLabel}</div>
        <div class="p-4 w-full flex flex-col items-center">
            <div class="w-full flex justify-between text-[11px] font-black uppercase mb-1 items-center">
                <span class="bg-black/20 ${textBase} px-2 py-0.5 rounded-md flex items-center gap-1">${roleIconHtml} ${card.role}</span>
                <span class="${textOpacity} tracking-tight flex items-center gap-1">${flag} ${card.region}</span>
            </div>
            <div class="flex items-center gap-3 w-full mt-2">
                <div class="text-4xl font-black tracking-tighter drop-shadow-md ${textBase}"><span>${displayRating}</span></div>
                <img src="${wikiImg}" onerror="this.onerror=null;this.src='${fallback}';" class="w-16 h-16 rounded-full border-2 border-white/30 shadow mx-auto object-cover bg-slate-800">
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
    blueEssence += tourData.reward1; addXP(100);
    if (isGoldenRoad) {
        grAccruedEssence += tourData.reward1; document.getElementById("gr-accrued-val").innerText = grAccruedEssence;
        appendLog(`[STAGE CLEARED] Credited +${tourData.reward1} BE. Run Total: ${grAccruedEssence} BE`, "text-yellow-400 font-black");
        const stageName = tourData.name;
        if (stageName.includes('Regional Split')) trackStats.regionalSplitWon = (trackStats.regionalSplitWon || 0) + 1;
        else if (stageName === 'First Stand') trackStats.firstStandWon = (trackStats.firstStandWon || 0) + 1;
        else if (stageName === 'MSI Arena') trackStats.msiWon = (trackStats.msiWon || 0) + 1;
        else if (stageName === 'World Championship') trackStats.worldsWon = (trackStats.worldsWon || 0) + 1;
        if (grStageIndex === grStages.length - 1) { blueEssence += 5000; trackStats.goldenRoads++; saveGame(); endTournament(true, true); }
        else { saveGame(); document.getElementById("btn-play-match").classList.add("hidden"); document.getElementById("btn-gr-next").classList.remove("hidden"); }
    } else { trackStats.tournamentsWon++; saveGame(); endTournament(true, false); }
}

function handleTournamentLoss() {
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
    isGoldenRoad = false;
}

function setupNextRound() { if (tourRound < tourData.maxRounds - 1) { tourRound++; setupBracketUI(); setupNextRoundUI(); } }
function advanceGoldenRoadStage() { grStageIndex++; loadGoldenRoadStage(); document.getElementById("tour-active-title").innerText = "Golden Road Run: " + tourData.name; setupBracketUI(); setupNextRoundUI(); }
function emergencyResetSim() { if(simIntervalId) clearTimeout(simIntervalId); document.getElementById("pre-match-stats").classList.add("hidden"); tourActive = false; isGoldenRoad = false; document.getElementById("tournament-active").classList.add("hidden"); document.getElementById("tournament-results").classList.add("hidden"); document.getElementById("tournament-lobby").classList.remove("hidden"); }
function finishTournamentUI() { document.getElementById("tournament-results").classList.add("hidden"); document.getElementById("tournament-lobby").classList.remove("hidden"); updateDisplays(); }
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