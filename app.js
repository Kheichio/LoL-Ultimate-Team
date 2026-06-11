// app.js

function getDB() {
    return typeof playerDatabase !== 'undefined' ? playerDatabase : window.playerDatabase;
}

function getSellValue(quality) {
    const vals = { Silver: 5, Gold: 15, Platinum: 30, Diamond: 50, Master: 90, Grandmaster: 150, MVP: 175, Challenger: 300, Champion: 250, Coach: 20 };
    return vals[quality] || 5;
}

const collectionRewards = { Silver: 10, Gold: 20, Platinum: 40, Diamond: 80, Master: 150, Grandmaster: 300, Challenger: 500, Champion: 500, MVP: 500 };

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

let trackStats = { 
    packs: 0, tournamentsWon: 0, goldenRoads: 0, soldCount: 0, soldBE: 0, matchesPlayed: {} 
};

let quests = [
    { id: 'q1', desc: 'Open 5 Card Packs', target: 5, type: 'packs', reward: 800, claimed: false },
    { id: 'q5', desc: 'Open 25 Card Packs', target: 25, type: 'packs', reward: 2500, claimed: false },
    { id: 'q2', desc: 'Liquidate 10 Players', target: 10, type: 'soldCount', reward: 500, claimed: false },
    { id: 'q6', desc: 'Liquidate 50 Players', target: 50, type: 'soldCount', reward: 2000, claimed: false },
    { id: 'q3', desc: 'Win 2 Tournaments', target: 2, type: 'tournamentsWon', reward: 1200, claimed: false },
    { id: 'q7', desc: 'Win 10 Tournaments', target: 10, type: 'tournamentsWon', reward: 5000, claimed: false },
    { id: 'q4', desc: 'Complete the Golden Road', target: 1, type: 'goldenRoads', reward: 5000, claimed: false },
    { id: 'q8', desc: 'Complete 3 Golden Roads', target: 3, type: 'goldenRoads', reward: 15000, claimed: false }
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
let activeSlot = "TOP";

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    const target = document.getElementById('tab-' + tabId);
    if(target) target.classList.remove('hidden');
    
    // Smooth scrolling window layout adjustments on tab swap
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
    let rng = (Math.random() * 100) + (skills.scouting * 2);
    if (type === 'Standard') return rng > 80 ? 'Gold' : 'Silver';
    if (type === 'Elite') {
        if (rng > 95) return 'Master';
        if (rng > 80) return 'Diamond';
        if (rng > 50) return 'Platinum';
        return 'Gold';
    } else if (type === 'Supreme') {
        if (rng > 98) return 'Challenger';
        if (rng > 85) return 'Grandmaster';
        if (rng > 60) return 'Master';
        if (rng > 30) return 'Diamond';
        return 'Platinum';
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
    
    document.getElementById("live-team-name").innerText = teamIdentity.name;
    document.getElementById("live-team-logo").innerText = teamIdentity.logo;
}

function renderQuests() {
    const container = document.getElementById("quests-container");
    if (!container) return;
    container.innerHTML = "";
    
    quests.forEach(q => {
        let progress = trackStats[q.type] || 0;
        let isDone = progress >= q.target;
        let pct = Math.min(100, (progress / q.target) * 100);
        
        let btnHTML = "";
        if (q.claimed) {
            btnHTML = `<button disabled class="bg-slate-800 text-slate-600 px-5 py-2.5 rounded-lg font-bold cursor-not-allowed">Claimed</button>`;
        } else if (isDone) {
            btnHTML = `<button onclick="claimQuest('${q.id}')" class="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-5 py-2.5 rounded-lg font-black shadow-[0_0_10px_rgba(234,179,8,0.5)] cursor-pointer transition uppercase tracking-wider">Claim ${q.reward} BE</button>`;
        } else {
            btnHTML = `<button disabled class="bg-slate-700 text-slate-400 px-5 py-2.5 rounded-lg font-bold cursor-not-allowed">${progress} / ${q.target}</button>`;
        }
        
        container.innerHTML += `
            <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex justify-between items-center shadow-md">
                <div class="w-2/3 pr-4">
                    <h4 class="font-bold text-slate-200 text-lg mb-2">${q.desc}</h4>
                    <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
                        <div class="bg-yellow-500 h-full transition-all duration-500" style="width: ${pct}%"></div>
                    </div>
                </div>
                <div>${btnHTML}</div>
            </div>
        `;
    });
}

function claimQuest(id) {
    let q = quests.find(x => x.id === id);
    if (q && !q.claimed && (trackStats[q.type] || 0) >= q.target) {
        q.claimed = true;
        blueEssence += q.reward;
        showToast(`Quest completed! +${q.reward} BE`, "success");
        saveGame();
        renderQuests();
    }
}

// --- CORE UTILITY DISPLAY LOGIC ---
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

    if(!trackStats.soldCount) trackStats.soldCount = 0;
    if(!trackStats.soldBE) trackStats.soldBE = 0;
    if(!trackStats.matchesPlayed) trackStats.matchesPlayed = {};

    const savedQuests = localStorage.getItem("lol_quests_v7_pro");
    if (savedQuests) quests = JSON.parse(savedQuests);

    populateDropdownFilters();
    recalculateRegionalPrice();
    updateDisplays();
    checkAndRecoverTrainingTimer();
    startTradeMarketTimer();
};

function saveGame() {
    localStorage.setItem("lol_be_v7_pro", blueEssence);
    localStorage.setItem("lol_loans_v7_pro", activeLoans);
    localStorage.setItem("lol_club_v7_pro", JSON.stringify(club));
    localStorage.setItem("lol_squad_v7_pro", JSON.stringify(squad));
    localStorage.setItem("lol_starter_v7_pro", hasBoughtStarter);
    localStorage.setItem("lol_identity_v7_pro", JSON.stringify(teamIdentity));
    localStorage.setItem("lol_stats_v7_pro", JSON.stringify(trackStats));
    localStorage.setItem("lol_quests_v7_pro", JSON.stringify(quests));
    localStorage.setItem("lol_prog_v7_pro", JSON.stringify({managerXP, managerLevel, skillPoints, skills}));
    localStorage.setItem("lol_new_items_v7_pro", hasNewClubItems);
    localStorage.setItem("lol_collection_v7_pro", JSON.stringify(collectionRegistry));
    localStorage.setItem("lol_trade_v7_pro", JSON.stringify(tradeMarket));
    updateDisplays();
}

function updateBadges() {
    const clubBadge = document.getElementById("badge-club");
    const skillsBadge = document.getElementById("badge-skills");
    const questsBadge = document.getElementById("badge-quests");
    const collBadge = document.getElementById("badge-collection");
    
    if (hasNewClubItems && clubBadge) clubBadge.classList.remove("hidden");
    else if(clubBadge) clubBadge.classList.add("hidden");

    if (skillPoints > 0 && skillsBadge) skillsBadge.classList.remove("hidden");
    else if(skillsBadge) skillsBadge.classList.add("hidden");

    let hasClaimableQuest = quests.some(q => (trackStats[q.type] || 0) >= q.target && !q.claimed);
    if (hasClaimableQuest && questsBadge) questsBadge.classList.remove("hidden");
    else if(questsBadge) questsBadge.classList.add("hidden");

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
    let elitePool = db.filter(p => ["Master", "Grandmaster", "Challenger", "Champion", "MVP"].includes(p.quality));
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
        } else if (rewardCard.quality === "MVP" || rewardCard.quality === "Champion") {
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

let currentCollectionRegion = 'LCK';
let currentCollectionSort = 'team';

function setCollectionRegion(reg) { currentCollectionRegion = reg; renderCollection(); }
function setCollectionSort(sort) { currentCollectionSort = sort; renderCollection(); }

function renderCollection() {
    let db = getDB();
    if(!db) return;
    ["LCK", "LPL", "LEC", "LCS", "Legacy"].forEach(r => {
        let btn = document.getElementById(`col-reg-${r}`); if(!btn) return;
        if (r === currentCollectionRegion) {
            btn.className = "flex-1 py-2 px-4 rounded-lg font-black text-sm transition bg-blue-600/20 border border-blue-500/50 text-blue-300 shadow-inner cursor-pointer";
        } else {
            let extra = r === 'Legacy' ? 'border border-amber-900/50 text-slate-400' : 'border border-transparent text-slate-400';
            btn.className = `flex-1 py-2 px-4 rounded-lg font-bold text-sm transition bg-slate-800 hover:text-slate-200 hover:bg-slate-700 cursor-pointer ${extra}`;
        }
    });

    ["team", "completion", "latest"].forEach(s => {
        let btn = document.getElementById(`col-sort-${s}`); if(!btn) return;
        if (s === currentCollectionSort) {
            btn.className = "flex-1 py-1.5 px-4 rounded-lg font-black text-xs transition bg-slate-600 border border-slate-500 text-slate-100 uppercase tracking-widest shadow-inner cursor-pointer";
        } else {
            btn.className = "flex-1 py-1.5 px-4 rounded-lg font-bold text-xs transition text-slate-400 hover:text-slate-200 uppercase tracking-widest bg-slate-800 border border-transparent cursor-pointer";
        }
    });

    const grid = document.getElementById("collection-grid"); if(!grid) return; grid.innerHTML = "";
    let dbCards = db.filter(c => c.region === currentCollectionRegion);
    let claimableBE = 0;
    dbCards.forEach(c => {
        let rec = collectionRegistry[c.id];
        if (rec && !rec.claimed) claimableBE += (collectionRewards[c.quality] || 10);
    });
    
    let claimBtn = document.getElementById("btn-claim-collection");
    if(claimBtn) {
        if (claimableBE > 0) { claimBtn.innerText = `Claim Region Rewards (${claimableBE} BE)`; claimBtn.disabled = false; }
        else { claimBtn.innerText = `Claim Region Rewards (0 BE)`; claimBtn.disabled = true; }
    }

    if (currentCollectionSort === 'latest') {
        let ownedCards = dbCards.filter(c => collectionRegistry[c.id]).sort((a, b) => (collectionRegistry[b.id].acquiredAt || 0) - (collectionRegistry[a.id].acquiredAt || 0));
        if(ownedCards.length === 0) { grid.innerHTML = `<p class="text-slate-500 text-center py-10 font-mono">No cards archived yet in this region.</p>`; return; }
        let section = document.createElement("div"); section.className = "bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50";
        section.innerHTML = `<h3 class="text-xl font-black text-slate-300 mb-4 border-b border-slate-700/50 pb-2">Recently Acquired</h3>`;
        let cardContainer = document.createElement("div"); cardContainer.className = "flex flex-wrap gap-4 justify-center";

        ownedCards.forEach(c => {
            let wrapper = document.createElement("div"); wrapper.className = `shrink-0 transition duration-500 relative`;
            if (!collectionRegistry[c.id].claimed) {
                let dot = document.createElement("div"); dot.className = "absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20 animate-pulse";
                wrapper.appendChild(dot);
            }
            wrapper.appendChild(createCardElement(c, false, null, null));
            cardContainer.appendChild(wrapper);
        });
        section.appendChild(cardContainer); grid.appendChild(section); return;
    }

    let grouped = {};
    dbCards.forEach(c => {
        let tName = window.teamLineageBridges[c.team] || c.team; let key = `${tName}`;
        if(!grouped[key]) grouped[key] = { team: tName, cards: [], owned: 0, total: 0 };
        grouped[key].cards.push(c); grouped[key].total++;
        if(collectionRegistry[c.id]) grouped[key].owned++;
    });

    let groupArray = Object.values(grouped);
    if (currentCollectionSort === 'completion') groupArray.sort((a, b) => (b.total - b.owned) - (a.total - a.owned));
    else groupArray.sort((a, b) => a.team.localeCompare(b.team));

    groupArray.forEach(group => {
        const roleOrder = { "TOP":1, "JNG":2, "MID":3, "ADC":4, "SUP":5, "COACH":6 };
        group.cards.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
        });
        let section = document.createElement("div"); section.className = "bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-3 shadow";
        let completionText = `<span class="text-xs font-mono float-right ${group.owned === group.total ? 'text-emerald-400 font-bold' : 'text-slate-500'}">${group.owned} / ${group.total}</span>`;
        section.innerHTML = `<h3 class="text-sm font-black text-slate-300 mb-3 border-b border-slate-700/50 pb-1.5 flex items-center justify-between"><span>${group.team} Lineages</span>${completionText}</h3>`;
        let cardContainer = document.createElement("div"); cardContainer.className = "flex overflow-x-auto gap-3 pb-2 snap-x";
        
        group.cards.forEach(c => {
            let isOwned = !!collectionRegistry[c.id];
            let wrapper = document.createElement("div"); wrapper.className = `snap-start shrink-0 transition duration-500 ${isOwned ? 'relative' : 'grayscale opacity-25 scale-95 hover:opacity-40'}`;
            if (isOwned && !collectionRegistry[c.id].claimed) {
                let dot = document.createElement("div"); dot.className = "absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-yellow-400 rounded-full border border-slate-900 shadow z-20 animate-pulse";
                wrapper.appendChild(dot);
            }
            wrapper.appendChild(createCardElement(c, false, null, null));
            cardContainer.appendChild(wrapper);
        });
        section.appendChild(cardContainer); grid.appendChild(section);
    });
}

function claimCollectionRewards() {
    let db = getDB(); if(!db) return;
    let dbRegionFilt = db.filter(c => c.region === currentCollectionRegion);
    let claimedAmount = 0;
    dbRegionFilt.forEach(c => {
        let rec = collectionRegistry[c.id];
        if (rec && !rec.claimed) { claimedAmount += (collectionRewards[c.quality] || 10); rec.claimed = true; }
    });
    if (claimedAmount > 0) { blueEssence += claimedAmount; showToast(`Extracted ${claimedAmount} BE from Region Archives!`, "success"); saveGame(); renderCollection(); updateBadges(); }
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
        { key: "tactics", name: "Tactical Acumen", desc: "Grants a guaranteed flat power bonus (+2 per level) to your squad during the Tactical Draft phase.", color: "emerald" }
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
// --- REPAY CREDIT ENGINE ---
function payLoan() {
    if (blueEssence < 500) { showToast("Insufficient liquidity.", "error"); return; }
    if (activeLoans <= 0) { showToast("No active debt.", "error"); return; }
    activeLoans--; blueEssence -= 500; saveGame(); showToast("Loan amortized!", "success");
}

// --- OPTIONAL COACH UPDATE SYSTEM ---
function checkSquadReady() {
    // Coach is now optional: Check only the primary lane positions to enter match brackets
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
    
    blueEssence -= 1000; isGoldenRoad = true; tourActive = true; grStageIndex = 0; grAccruedEssence = 0; tacticalBonus = 0;
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
        let legPool = db.filter(p => p.quality === "Champion");
        let legCard = legPool[Math.floor(Math.random() * legPool.length)];
        let p1 = {...legCard, uniqueId: Date.now() + "L1" + Math.random().toString(36).substring(2)};
        pulled.push(p1); club.push(p1);
        for (let i = 0; i < 4; i++) {
            let fillerTier = Math.random() < 0.85 ? "Silver" : "Gold";
            let filPool = db.filter(p => p.quality === fillerTier);
            if(filPool.length === 0) filPool = db.filter(p => p.quality === "Silver");
            let pF = filPool[Math.floor(Math.random() * filPool.length)];
            let cardF = {...pF, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
            pulled.push(cardF); club.push(cardF);
        }
    } else if (type === 'MVP') {
        for (let i = 0; i < 5; i++) {
            let pCard; let mvpChance = 0.20 + (skills.scouting * 0.02);
            if (Math.random() < mvpChance) {
                let mvpPool = db.filter(p => p.quality === "MVP"); pCard = mvpPool[Math.floor(Math.random() * mvpPool.length)];
            } else {
                let roll = (Math.random() * 100) + (skills.scouting * 2); let fillerTier = "Platinum";
                if (roll > 50) fillerTier = "Diamond"; if (roll > 80) fillerTier = "Master"; if (roll > 95) fillerTier = "Grandmaster";
                let fillPool = db.filter(p => p.quality === fillerTier); pCard = fillPool[Math.floor(Math.random() * fillPool.length)];
            }
            let inst = {...pCard, uniqueId: Date.now() + "M" + i + Math.random().toString(36).substring(2)};
            pulled.push(inst); club.push(inst);
        }
    } else {
        for (let i=0; i<5; i++) {
            let rolledTier = rollTier(type); let pool = db.filter(p => p.quality === rolledTier && p.quality !== "Champion" && p.quality !== "MVP");
            if(pool.length === 0) pool = db.filter(p => p.quality === "Silver");
            let p = pool[Math.floor(Math.random() * pool.length)];
            let cardInst = {...p, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
            pulled.push(cardInst); club.push(cardInst);
        }
    }
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
        
        let pool = db.filter(p => p.region === regionVal && p.quality === targetTier && p.quality !== "Champion" && p.quality !== "MVP");
        if (pool.length === 0) pool = db.filter(p => p.quality === targetTier && p.quality !== "Champion" && p.quality !== "MVP");
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
            btn.onclick = () => { blueEssence += price; trackStats.soldCount++; trackStats.soldBE += price; club = club.filter(c => c.uniqueId !== card.uniqueId); saveGame(); };
        }
        wrap.appendChild(btn); grid.appendChild(wrap);
    });
}

function sortClub(by) {
    if (by === 'rating') club.sort((a,b) => b.rating - a.rating);
    if (by === 'region') club.sort((a,b) => a.region.localeCompare(b.region));
    renderClubGrid();
}

function populateDropdownFilters() {
    let db = getDB(); if(!db) return;
    const teams = ["ALL", ...new Set(db.map(p => p.team))];
    const regions = ["ALL", ...new Set(db.map(p => p.region))];
    const years = ["ALL", ...new Set(db.map(p => p.year))];
    document.getElementById("filter-team-dropdown").innerHTML = teams.map(t => `<option value="${t}">${t}</option>`).join("");
    document.getElementById("filter-region-dropdown").innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join("");
    document.getElementById("filter-year-dropdown").innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
}

function renderFilteredPicker() {
    const grid = document.getElementById("picker-grid"); if(!grid) return; grid.innerHTML = "";
    const targetT = document.getElementById("filter-team-dropdown").value;
    const targetR = document.getElementById("filter-region-dropdown").value;
    const targetY = document.getElementById("filter-year-dropdown").value;
    const targetRole = document.getElementById("filter-role-dropdown").value;
    const rankSort = document.getElementById("filter-sort-dropdown").value;

    let pool = [...club];
    const activeSquadMembers = Object.entries(squad).filter(([slot, card]) => slot !== activeSlot && card !== null).map(([, card]) => card);
    pool = pool.filter(p => !activeSquadMembers.map(c=>c.uniqueId).includes(p.uniqueId) && !activeSquadMembers.map(c=>c.name).includes(p.name));

    if (activeSlot === "COACH") pool = pool.filter(p => p.role === "COACH");
    else if (targetRole !== "ALL") pool = pool.filter(p => p.role === targetRole);
    else if (["TOP", "JNG", "MID", "ADC", "SUP"].includes(activeSlot)) pool = pool.filter(p => p.role !== "COACH");

    if (targetT !== "ALL") pool = pool.filter(p => p.team === targetT);
    if (targetR !== "ALL") pool = pool.filter(p => p.region === targetR);
    if (targetY !== "ALL") pool = pool.filter(p => p.year == targetY);

    if (rankSort === "highest") pool.sort((a,b) => b.rating - a.rating);
    else if (rankSort === "lowest") pool.sort((a,b) => a.rating - b.rating);
    else if (rankSort === "highest_mec") pool.sort((a,b) => b.stats.mec - a.stats.mec);
    else if (rankSort === "highest_tmf") pool.sort((a,b) => b.stats.tmf - a.stats.tmf);
    else if (rankSort === "highest_map") pool.sort((a,b) => b.stats.map - a.stats.map);

    if(pool.length === 0) { grid.innerHTML = `<p class="col-span-full text-center text-sm text-slate-500 py-8 font-mono">No reserves match metrics.</p>`; return; }
    
    pool.forEach(card => {
        let wrap = document.createElement("div"); 
        wrap.className = "flex flex-col items-center gap-2 transform transition hover:-translate-y-1";
        
        // Removed redundant separate assign button, clicking card executes slot loading directly
        let cardVisual = createCardElement(card, false, () => {
            squad[activeSlot] = card; 
            document.getElementById("squad-picker-area").classList.add("hidden"); 
            saveGame();
            
            // Smooth auto-scrolling back to top structure on item placement
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, null);
        
        wrap.appendChild(cardVisual);
        grid.appendChild(wrap);
    });
}

function selectSlot(role) {
    activeSlot = role; document.getElementById("picker-role").innerText = role;
    const roleDropdown = document.getElementById("filter-role-dropdown");
    if (["COACH", "TOP", "JNG", "MID", "ADC", "SUP"].includes(role)) roleDropdown.value = role; else roleDropdown.value = "ALL";
    document.getElementById("squad-picker-area").classList.remove("hidden"); renderFilteredPicker();
    
    // Smooth auto-scrolling layout down to picker viewport
    document.getElementById("squad-picker-area").scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSquadView() {
    const slots = ["COACH", "TOP", "JNG", "MID", "ADC", "SUP", "SUB1", "SUB2", "SUB3"];
    slots.forEach(role => {
        const slot = document.getElementById(`squad-${role}`); if(!slot) return; slot.innerHTML = "";
        if(squad[role]) {
            let cardEl = createCardElement(squad[role], true, () => selectSlot(role), role);
            
            // X button moved cleanly to top edge to fix overlapping region badge constraints
            let del = document.createElement("button"); 
            del.className = "absolute -top-2 left-1/2 -translate-x-1/2 bg-red-700 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-black cursor-pointer border-2 border-slate-900 shadow-xl z-30 transition hover:scale-110"; 
            del.innerText = "✕";
            del.onclick = (e) => { e.stopPropagation(); squad[role] = null; saveGame(); };
            
            cardEl.appendChild(del); slot.appendChild(cardEl);
        } else {
            slot.innerHTML = `<div class="text-center text-slate-500 font-bold tracking-widest text-sm flex flex-col items-center justify-center h-full w-full"><span class="text-4xl opacity-40 mb-3">${window.roleIcons[role] || '+'}</span><span class="uppercase">${role}</span></div>`;
        }
    });
    computeChemistry();
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
        let regs = active.map(c => c.region); let uReg = new Set(regs).size;
        if(uReg === 1) regionChem = 5; else if(uReg <= 2) regionChem = 3; else if(uReg <= 3) regionChem = 2; else regionChem = 1;
        let yrs = active.map(c => c.year); let uY = new Set(yrs).size;
        if(uY === 1) yearChem = 5; else if(uY <= 2) yearChem = 3; else yearChem = 1;
        if(new Set(active.map(c => window.teamLineageBridges[c.team] || c.team)).size === 1) regionChem += 2;
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

    // Apply distinct coach layout background matrix styles if applicable
    let bgClass = `card-bg-${card.quality}`;
    if (card.role === "COACH") bgClass = "coach-card-style";

    cardDiv.className = `${bgClass} rounded-xl p-4 w-52 flex flex-col items-center select-none relative transition-transform ${isMini ? 'scale-[0.85]' : 'hover:scale-105'} shadow-xl`;
    if (onClickAction) { cardDiv.onclick = onClickAction; cardDiv.className += " cursor-pointer"; }

    const cleanName = card.name.replace(/[^a-zA-Z0-9]/g, '');
    const wikiImg = `https://lol.fandom.com/wiki/Special:FilePath/${cleanName}Square.png`;
    const fallback = `https://ui-avatars.com/api/?name=${cleanName}&background=0f172a&color=cbd5e1&size=128&bold=true`;
    
    // Text Color Logic: Use white text for dark styles, default to crisp black prose elsewhere
    const isDarkCard = ["Master", "Grandmaster", "Challenger", "Champion", "MVP"].includes(card.quality) || card.role === "COACH";
    const textBase = isDarkCard ? "text-white" : "text-black";
    const textMuted = isDarkCard ? "text-slate-300" : "text-black/80 font-black";
    const textOpacity = isDarkCard ? "text-white/80" : "text-black/90 font-black";

    cardDiv.innerHTML = `
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 text-white px-3 py-1 rounded-full text-[10px] font-black border border-slate-600 z-10 shadow-lg uppercase tracking-widest whitespace-nowrap">${card.role === "COACH" ? "COACH STAFF" : card.quality}</div>
        <div class="w-full flex justify-between text-[11px] font-black uppercase mb-1 items-center mt-2">
            <span class="bg-black/20 ${textBase} px-2 py-0.5 rounded flex gap-1">${window.roleIcons[card.role] || ''} ${card.role}</span>
            <span class="${textOpacity} tracking-tight">${window.regionLogos[card.region] ? card.region : card.region}</span>
        </div>
        <div class="flex items-center gap-3 w-full mt-2">
            <div class="text-4xl font-black tracking-tighter drop-shadow-md flex flex-col items-center ${textBase}"><span>${displayRating}</span></div>
            <img src="${wikiImg}" onerror="this.onerror=null;this.src='${fallback}';" class="w-14 h-14 rounded-full border-2 border-white/30 shadow mx-auto object-cover bg-slate-800">
        </div>
        <div class="font-black text-base truncate w-full mt-3 text-center drop-shadow-sm ${textBase}">${card.name}</div>
        <div class="text-xs font-bold truncate w-full mb-2 text-center ${textMuted}">${card.team} [${card.year}]</div>
        
        <div class="stat-grid mt-2 border-t border-black/10 pt-2 text-xs">
            <div class="${textBase}"><span class="${textMuted} mr-1">MEC</span>${card.stats.mec}</div>
            <div class="${textBase}"><span class="${textMuted} mr-1">TMF</span>${card.stats.tmf}</div>
            <div class="${textBase}"><span class="${textMuted} mr-1">FRM</span>${card.stats.frm}</div>
            <div class="${textBase}"><span class="${textMuted} mr-1">CMP</span>${card.stats.cmp}</div>
            <div class="${textBase}"><span class="${textMuted} mr-1">MAP</span>${card.stats.map}</div>
            <div class="${textBase}"><span class="${textMuted} mr-1">LDR</span>${card.stats.ldr}</div>
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
    
    // Smooth scroll auto-adjust window positioning down to simulation console directly
    document.getElementById("tournament-active").scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupNextRoundUI() {
    tacticalBonus = 0; let sData = computeChemistry(); let currentEnemy = enemies[tourRound];
    document.getElementById("tour-my-power").innerText = sData.totalPower;
    document.getElementById("enemy-team-name").innerText = currentEnemy.name;
    document.getElementById("tour-enemy-rating").innerText = currentEnemy.power;
    populateLiveArenaVisualizer();
    
    // Calculate Enemy Team Averages based on generated stats profiles
    let eMec = 0, eTmf = 0, eMap = 0;
    if(currentEnemy.generatedStats) {
        currentEnemy.generatedStats.forEach(st => { eMec += st.mec; eTmf += st.tmf; eMap += st.map; });
        eMec = Math.round(eMec / 6); eTmf = Math.round(eTmf / 6); eMap = Math.round(eMap / 6);
    } else {
        eMec = currentEnemy.power; eTmf = currentEnemy.power; eMap = currentEnemy.power;
    }
    
    // Update pre-match VS stats nodes
    document.getElementById("tour-my-mec").innerText = Math.round(sData.avgStats.mec);
    document.getElementById("tour-enemy-mec").innerText = eMec;
    document.getElementById("tour-my-tmf").innerText = Math.round(sData.avgStats.tmf);
    document.getElementById("tour-enemy-tmf").innerText = eTmf;
    document.getElementById("tour-my-map").innerText = Math.round(sData.avgStats.map);
    document.getElementById("tour-enemy-map").innerText = eMap;
    document.getElementById("pre-match-stats").classList.remove("hidden");

    let diff = sData.totalPower - currentEnemy.power;
    let diffEl = document.getElementById("power-diff-display");
    if (diff >= 0) diffEl.innerHTML = `Power Advantage: <span class="text-green-400 text-lg ml-1">+${diff}</span>`;
    else diffEl.innerHTML = `Power Deficit: <span class="text-red-400 text-lg ml-1">${diff}</span>`;
    
    document.getElementById("tactical-draft-panel").classList.remove("hidden");
    document.getElementById("btn-play-match").classList.add("hidden");
    document.getElementById("btn-next-round").classList.add("hidden");
    document.getElementById("btn-gr-next").classList.add("hidden");
}

function lockInDraft(statFocus) {
    document.getElementById("tactical-draft-panel").classList.add("hidden");
    let sData = computeChemistry(); 
    let baseStat = sData.avgStats[statFocus.toLowerCase()] || 70;
    tacticalBonus = Math.floor(baseStat / 15) + (skills.tactics * 2);
    
    document.getElementById("tour-my-power").innerText = sData.totalPower + tacticalBonus;
    appendLog(`[DRAFT PHASE] Strategic focus locked on ${statFocus}. Attributes generated: +${tacticalBonus} Combat Power Boost!`, "text-purple-400 font-bold");
    const playBtn = document.getElementById("btn-play-match"); playBtn.classList.remove("hidden"); playBtn.disabled = false;
    playBtn.classList.replace("bg-slate-600", "bg-blue-600"); playBtn.innerText = "Execute Match ⏩";
}

function playMatchStep() {
    let sData = computeChemistry(); let myPower = sData.totalPower + tacticalBonus; let currentEnemy = enemies[tourRound];
    const playBtn = document.getElementById("btn-play-match"); playBtn.disabled = true; playBtn.classList.replace("bg-blue-600", "bg-slate-600"); playBtn.innerText = "Simulating...";
    appendLog(`Series launched against [ ${currentEnemy.rosterNames.slice(0,5).join(", ")} ].`, "text-slate-400");
    
    ["TOP", "JNG", "MID", "ADC", "SUP", "COACH"].forEach(r => { if(squad[r]) { let name = squad[r].name; trackStats.matchesPlayed[name] = (trackStats.matchesPlayed[name] || 0) + 1; } });

    simIntervalId = setTimeout(() => {
        appendLog(`Skirmish Phase. Tactical execution boost yields: +${tacticalBonus}.`, "text-slate-300");
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
function sellAllLowTier(tier) {
    let sold = 0; let val = 0; let activeIds = Object.values(squad).filter(s=>s).map(s=>s.uniqueId);
    let toSell = club.filter(c => c.quality === tier && !activeIds.includes(c.uniqueId));
    toSell.forEach(c => { sold++; val += getSellValue(c.quality); club = club.filter(cl => cl.uniqueId !== c.uniqueId); });
    if(sold > 0) { blueEssence += val; trackStats.soldCount += sold; trackStats.soldBE += val; showToast(`Purged ${sold} ${tier}s for ${val} BE!`, "success"); saveGame(); }
    else showToast(`No unassigned ${tier}s found.`, "info");
}
function quickSellDuplicates() {
    let sold = 0; let val = 0; let seen = new Set(); let activeIds = Object.values(squad).filter(s=>s).map(s=>s.uniqueId);
    let toKeep = [];
    club.forEach(c => {
        let isAct = activeIds.includes(c.uniqueId);
        if(!isAct && seen.has(c.id)) { sold++; val += getSellValue(c.quality); }
        else { seen.add(c.id); toKeep.push(c); }
    });
    if(sold > 0) { club = toKeep; blueEssence += val; trackStats.soldCount += sold; trackStats.soldBE += val; showToast(`Purged ${sold} Duplicates for ${val} BE!`, "success"); saveGame(); }
    else showToast("No duplicates found.", "info");
}