// app.js

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

// --- CUSTOM UI ALERTS & MODALS ---
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

// --- CORE LIFECYCLE ---
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

    let hasClaimableCollection = false;
    if(window.playerDatabase) {
        let dbRegionFilt = window.playerDatabase.filter(c => c.region === currentCollectionRegion);
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

// --- TRADE MARKET LOGIC ---
function startTradeMarketTimer() {
    if (marketTimerInterval) clearInterval(marketTimerInterval);
    checkTradeMarket(); 
    marketTimerInterval = setInterval(checkTradeMarket, 1000);
}

function checkTradeMarket() {
    if (!window.playerDatabase) return;
    
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
    let elitePool = window.playerDatabase.filter(p => ["Master", "Grandmaster", "Challenger", "Champion", "MVP"].includes(p.quality));
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
        
        offers.push({
            id: Date.now() + i,
            rewardBaseId: rewardCard.id,
            reqQuality: reqQuality,
            reqCount: reqCount,
            completed: false
        });
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
    
    tradeMarket.offers.forEach(offer => {
        let rewardCardDef = window.playerDatabase.find(p => p.id === offer.rewardBaseId);
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
    if (availableFodder.length < offer.reqCount) {
        showToast("Not enough unlocked assets to trade.", "error");
        return;
    }
    
    for(let i=0; i<offer.reqCount; i++) {
        let burnId = availableFodder[i].uniqueId;
        club = club.filter(c => c.uniqueId !== burnId);
    }
    
    let rewardDef = window.playerDatabase.find(p => p.id === offer.rewardBaseId);
    let newCard = { ...rewardDef, uniqueId: Date.now() + "T" + Math.random().toString(36).substring(2) };
    club.push(newCard);
    processNewCards([newCard]);
    
    offer.completed = true;
    hasNewClubItems = true;
    saveGame();
    renderTradeMarket();
    showToast(`${rewardDef.name} securely extracted to Club!`, "success");
}

// --- COLLECTION ARCHIVE LOGIC ---
let currentCollectionRegion = 'LCK';
let currentCollectionSort = 'team';

function setCollectionRegion(reg) {
    currentCollectionRegion = reg;
    renderCollection();
}

// Fixed function signature layout mapping duplicate triggers
function setCollectionSort(sort) {
    currentCollectionSort = sort;
    renderCollection();
}

function renderCollection() {
    if(!window.playerDatabase) return;
    
    // Update Region Tabs Nav
    ["LCK", "LPL", "LEC", "LCS", "Legacy"].forEach(r => {
        let btn = document.getElementById(`col-reg-${r}`);
        if(!btn) return;
        if (r === currentCollectionRegion) {
            btn.className = "flex-1 py-2 px-4 rounded-lg font-black text-sm transition bg-blue-600/20 border border-blue-500/50 text-blue-300 shadow-inner";
        } else {
            let extra = r === 'Legacy' ? 'border border-amber-900/50 text-slate-400' : 'border border-transparent text-slate-400';
            btn.className = `flex-1 py-2 px-4 rounded-lg font-bold text-sm transition bg-slate-800 hover:text-slate-200 hover:bg-slate-700 ${extra}`;
        }
    });

    // Update Sort Tabs Nav
    ["team", "completion", "latest"].forEach(s => {
        let btn = document.getElementById(`col-sort-${s}`);
        if(!btn) return;
        if (s === currentCollectionSort) {
            btn.className = "flex-1 py-1.5 px-4 rounded-lg font-black text-xs transition bg-slate-600 border border-slate-500 text-slate-100 uppercase tracking-widest shadow-inner";
        } else {
            btn.className = "flex-1 py-1.5 px-4 rounded-lg font-bold text-xs transition text-slate-400 hover:text-slate-200 uppercase tracking-widest bg-slate-800 border border-transparent";
        }
    });

    const grid = document.getElementById("collection-grid");
    if(!grid) return;
    grid.innerHTML = "";
    
    // Filter database for currently viewed region tab
    let dbCards = window.playerDatabase.filter(c => c.region === currentCollectionRegion);

    // Calculate claimable BE purely for this region
    let claimableBE = 0;
    dbCards.forEach(c => {
        let rec = collectionRegistry[c.id];
        if (rec && !rec.claimed) claimableBE += (collectionRewards[c.quality] || 10);
    });
    
    let claimBtn = document.getElementById("btn-claim-collection");
    if(claimBtn) {
        if (claimableBE > 0) {
            claimBtn.innerText = `Claim Region Rewards (${claimableBE} BE)`;
            claimBtn.disabled = false;
        } else {
            claimBtn.innerText = `Claim Region Rewards (0 BE)`;
            claimBtn.disabled = true;
        }
    }

    // Sort: Latest Addition rendering (Flat layout)
    if (currentCollectionSort === 'latest') {
        let ownedCards = dbCards.filter(c => collectionRegistry[c.id]).sort((a, b) => {
            return (collectionRegistry[b.id].acquiredAt || 0) - (collectionRegistry[a.id].acquiredAt || 0);
        });

        if(ownedCards.length === 0) {
            grid.innerHTML = `<p class="text-slate-500 text-center py-10 font-mono">No cards archived yet in this region.</p>`;
            return;
        }

        let section = document.createElement("div");
        section.className = "bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50";
        section.innerHTML = `<h3 class="text-xl font-black text-slate-300 mb-4 border-b border-slate-700/50 pb-2">Recently Acquired</h3>`;
        
        let cardContainer = document.createElement("div");
        cardContainer.className = "flex flex-wrap gap-4 justify-center";

        ownedCards.forEach(c => {
            let wrapper = document.createElement("div");
            wrapper.className = `shrink-0 transition duration-500 relative`;
            if (!collectionRegistry[c.id].claimed) {
                let dot = document.createElement("div");
                dot.className = "absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20 animate-pulse";
                wrapper.appendChild(dot);
            }
            wrapper.appendChild(createCardElement(c, false, null, null));
            cardContainer.appendChild(wrapper);
        });
        section.appendChild(cardContainer);
        grid.appendChild(section);
        return;
    }

    // Sort: Team & Completion Rendering (Grouped Layout)
    let grouped = {};
    dbCards.forEach(c => {
        let tName = window.teamLineageBridges[c.team] || c.team;
        let key = `${tName}`;
        if(!grouped[key]) grouped[key] = { team: tName, cards: [], owned: 0, total: 0 };
        grouped[key].cards.push(c);
        grouped[key].total++;
        if(collectionRegistry[c.id]) grouped[key].owned++;
    });

    let groupArray = Object.values(grouped);

    if (currentCollectionSort === 'completion') {
        // Most to Collect (Highest deficit first)
        groupArray.sort((a, b) => (b.total - b.owned) - (a.total - a.owned));
    } else {
        // Default Team Sort
        groupArray.sort((a, b) => a.team.localeCompare(b.team));
    }

    groupArray.forEach(group => {
        const roleOrder = { "TOP":1, "JNG":2, "MID":3, "ADC":4, "SUP":5, "COACH":6 };
        group.cards.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year; // newest year first
            return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99); // role strict order
        });

        let section = document.createElement("div");
        section.className = "bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50";
        
        let completionText = `<span class="text-sm font-mono float-right ${group.owned === group.total ? 'text-emerald-400' : 'text-slate-500'}">${group.owned} / ${group.total}</span>`;
        section.innerHTML = `<h3 class="text-xl font-black text-slate-300 mb-4 border-b border-slate-700/50 pb-2 flex items-center justify-between">
            <span>${group.team} Lineages</span>
            ${completionText}
        </h3>`;
        
        let cardContainer = document.createElement("div");
        cardContainer.className = "flex overflow-x-auto gap-4 pb-4 snap-x";
        
        group.cards.forEach(c => {
            let isOwned = !!collectionRegistry[c.id];
            let wrapper = document.createElement("div");
            wrapper.className = `snap-start shrink-0 transition duration-500 ${isOwned ? 'relative' : 'grayscale opacity-30 scale-95 hover:opacity-50'}`;
            
            if (isOwned && !collectionRegistry[c.id].claimed) {
                let dot = document.createElement("div");
                dot.className = "absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20 animate-pulse";
                wrapper.appendChild(dot);
            }
            
            let visual = createCardElement(c, false, null, null);
            wrapper.appendChild(visual);
            cardContainer.appendChild(wrapper);
        });
        
        section.appendChild(cardContainer);
        grid.appendChild(section);
    });
}

function claimCollectionRewards() {
    if(!window.playerDatabase) return;
    let dbRegionFilt = window.playerDatabase.filter(c => c.region === currentCollectionRegion);
    
    let claimedAmount = 0;
    dbRegionFilt.forEach(c => {
        let rec = collectionRegistry[c.id];
        if (rec && !rec.claimed) {
            claimedAmount += (collectionRewards[c.quality] || 10);
            rec.claimed = true;
        }
    });
    
    if (claimedAmount > 0) {
        blueEssence += claimedAmount;
        showToast(`Extracted ${claimedAmount} BE from Region Archives!`, "success");
        saveGame();
        renderCollection(); 
        updateBadges();
    }
}

// --- XP & PROGRESSION LOGIC ---
function addXP(amount) {
    managerXP += amount;
    // Massive EXP Curve increase per instruction
    let needed = managerLevel * 250; 
    let leveledUp = false;
    
    while(managerXP >= needed) {
        managerXP -= needed;
        managerLevel++;
        skillPoints++;
        needed = managerLevel * 250;
        leveledUp = true;
    }
    
    if (leveledUp) {
        showToast(`LEVEL UP! You are now Level ${managerLevel}. +1 Skill Point!`, "success");
    }
    saveGame();
}

function upgradeSkill(skillName) {
    let currentLvl = skills[skillName];
    let cost = currentLvl + 1; // 1 SP for Lvl 1, 2 SP for Lvl 2, etc.

    if (skillPoints >= cost && currentLvl < 5) {
        skillPoints -= cost;
        skills[skillName]++;
        saveGame();
        renderSkillsUI();
        updateBadges();
    }
}

function renderSkillsUI() {
    document.getElementById("ui-manager-level").innerText = managerLevel;
    document.getElementById("ui-manager-xp").innerText = managerXP;
    document.getElementById("ui-manager-xp-needed").innerText = managerLevel * 250;
    document.getElementById("ui-skill-points").innerText = skillPoints;
    
    let pct = (managerXP / (managerLevel * 250)) * 100;
    document.getElementById("ui-xp-bar").style.width = `${pct}%`;

    const container = document.getElementById("skills-container");
    if (!container) return;

    const skillDefs = [
        { key: "scouting", name: "Scouting Network", desc: "Permanently boosts RNG values during pack openings, increasing the chance of pulling higher-tier drops.", color: "blue" },
        { key: "negotiation", name: "Corporate Negotiation", desc: "Reduces the baseline markup penalty on loan inflations by 20 BE per level.", color: "amber" },
        { key: "tactics", name: "Tactical Acumen", desc: "Grants a guaranteed flat power bonus (+2 per level) to your squad during the Tactical Draft phase.", color: "emerald" }
    ];

    container.innerHTML = "";
    skillDefs.forEach(def => {
        let currentLvl = skills[def.key];
        let maxed = currentLvl >= 5;
        let cost = currentLvl + 1;
        let canUpgrade = skillPoints >= cost && !maxed;
        
        let dotsHTML = "";
        for(let i=1; i<=5; i++) {
            let active = i <= currentLvl ? `bg-${def.color}-400 border-${def.color}-500 shadow-[0_0_8px_theme(colors.${def.color}.400)]` : "bg-slate-800 border-slate-700";
            dotsHTML += `<div class="w-4 h-4 rounded-full border ${active}"></div>`;
        }

        let btnHTML = maxed 
            ? `<button disabled class="w-full bg-slate-800 text-slate-500 py-2 rounded-lg font-bold text-xs cursor-not-allowed">MAX LEVEL</button>`
            : `<button onclick="upgradeSkill('${def.key}')" class="w-full ${canUpgrade ? `bg-${def.color}-600 hover:bg-${def.color}-500 text-white cursor-pointer` : `bg-slate-700 text-slate-400 cursor-not-allowed`} py-2 rounded-lg font-bold transition text-xs shadow-md" ${!canUpgrade ? 'disabled' : ''}>UPGRADE (${cost} SP)</button>`;

        container.innerHTML += `
            <div class="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-bold text-${def.color}-400 mb-2">${def.name}</h3>
                    <p class="text-xs text-slate-400 mb-4 h-12">${def.desc}</p>
                    <div class="flex gap-2 mb-4 justify-center">
                        ${dotsHTML}
                    </div>
                </div>
                ${btnHTML}
            </div>
        `;
    });
}

function executeTeamTraining() {
    if (blueEssence < 50) { showToast("Insufficient assets.", "error"); return; }
    blueEssence -= 50;
    trainingActiveUntil = Date.now() + 60000;
    localStorage.setItem("lol_training_expiry", trainingActiveUntil);
    saveGame();
    startTrainingVisualCountdown();
}

function checkAndRecoverTrainingTimer() {
    const savedExpiry = localStorage.getItem("lol_training_expiry");
    if (savedExpiry) {
        trainingActiveUntil = parseInt(savedExpiry, 10);
        if (trainingActiveUntil > Date.now()) startTrainingVisualCountdown();
    }
}

function startTrainingVisualCountdown() {
    if(trainingTimerInterval) clearInterval(trainingTimerInterval);
    const display = document.getElementById("training-timer-display");
    const btn = document.getElementById("btn-run-training");
    if(!display || !btn) return;

    btn.disabled = true; btn.classList.replace("bg-orange-600/80", "bg-slate-700"); btn.classList.add("cursor-not-allowed");

    trainingTimerInterval = setInterval(() => {
        let remaining = Math.round((trainingActiveUntil - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(trainingTimerInterval);
            display.innerText = "Facility Idle"; display.className = "font-mono font-bold text-slate-500 text-sm";
            btn.disabled = false; btn.classList.replace("bg-slate-700", "bg-orange-600/80"); btn.classList.remove("cursor-not-allowed");
            computeChemistry();
        } else {
            display.innerText = `Live: ${remaining}s left`; display.className = "font-mono font-bold text-orange-400 animate-pulse text-sm";
            computeChemistry();
        }
    }, 1000);
}

function getTrainingBonus() { return (Date.now() < trainingActiveUntil) ? 5 : 0; }

function getLoanPremium() { 
    let basePremium = 150 - (skills.negotiation * 20); 
    return activeLoans * Math.max(0, basePremium); 
}

function takeLoan() { activeLoans++; blueEssence += 500; saveGame(); showToast("Credit allocated!", "success"); }
function payLoan() {
    if (blueEssence < 500) { showToast("Insufficient liquidity.", "error"); return; }
    if (activeLoans <= 0) { showToast("No active debt.", "error"); return; }
    activeLoans--; blueEssence -= 500; saveGame(); showToast("Loan amortized!", "success");
}

// --- PVE BRACKET SIMULATION FIXED INITIALIZATION ---
function checkSquadReady() {
    if (["TOP", "JNG", "MID", "ADC", "SUP"].some(role => squad[role] === null)) { 
        showToast("Matrix incomplete. Fill all 5 starting lane allocations.", "error"); 
        return false; 
    } 
    return true;
}

function startTournament(name, cost, r1, r2, baseDiff, rounds) {
    if (!checkSquadReady()) return; 
    if (blueEssence < cost) { showToast("Insufficient BE reserves.", "error"); return; }
    if(simIntervalId) clearTimeout(simIntervalId); 
    
    blueEssence -= cost; 
    isGoldenRoad = false; 
    tourActive = true; 
    tourRound = 0; 
    tacticalBonus = 0; 
    
    // Explicit sequence order allows tourData object mapping before transitions handle DOM values
    tourData = { name: name, reward1: r1, reward2: r2, maxRounds: rounds };
    generateRealPlayerEnemies(baseDiff, rounds);
    
    document.getElementById("gr-badge").classList.add("hidden"); 
    document.getElementById("gr-accrued-display").classList.add("hidden");
    
    saveGame();
    transitionToArena(name);
}

function startGoldenRoad() {
    if (!checkSquadReady()) return; 
    if (blueEssence < 1000) { showToast("Insufficient assets for Golden Road.", "error"); return; }
    if(simIntervalId) clearTimeout(simIntervalId); 
    
    blueEssence -= 1000; 
    isGoldenRoad = true; 
    tourActive = true; 
    grStageIndex = 0; 
    grAccruedEssence = 0; 
    tacticalBonus = 0;
    
    // Setup first step baseline structural requirements
    let stageInfo = grStages[grStageIndex];
    tourData = { name: stageInfo.name, reward1: stageInfo.r1, reward2: stageInfo.r2, maxRounds: stageInfo.rounds };
    generateRealPlayerEnemies(stageInfo.diff, stageInfo.rounds);
    
    document.getElementById("gr-badge").classList.remove("hidden"); 
    document.getElementById("gr-accrued-display").classList.remove("hidden");
    document.getElementById("gr-accrued-val").innerText = grAccruedEssence;
    
    saveGame();
    transitionToArena("Golden Road: " + stageInfo.name);
}

function loadGoldenRoadStage() {
    let stageInfo = grStages[grStageIndex];
    tourData = { name: stageInfo.name, reward1: stageInfo.r1, reward2: stageInfo.r2, maxRounds: stageInfo.rounds };
    tourRound = 0; 
    generateRealPlayerEnemies(stageInfo.diff, stageInfo.rounds);
}

function updateTeamCustomization() {
    teamIdentity.name = document.getElementById("custom-team-name").value || "My Team";
    teamIdentity.logo = document.getElementById("custom-team-logo").value || "🛡️";
    saveGame();
}

function triggerWipe() {
    showConfirm("Wipe All Data?", "This will permanently delete your Club, Essences, and Progress.", () => {
        localStorage.clear(); location.reload();
    });
}

// Trigger explicit forfeit mod hooks
function triggerForfeit() {
    showConfirm("Forfeit Tournament?", "You will lose your current bracket progress and buy-in.", () => {
        emergencyResetSim();
    });
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
    const tierSelect = document.getElementById("region-tier-select");
    const regBtn = document.getElementById("btn-buy-regional");
    if(!tierSelect || !regBtn) return;
    
    let price = 800;
    if(tierSelect.value === "Platinum") price = 1500;
    if(tierSelect.value === "Diamond") price = 2500;
    if(tierSelect.value === "Master") price = 4500;
    
    regBtn.setAttribute("data-cost", price);
    const premium = getLoanPremium();
    regBtn.innerText = `${price + premium} BE`;
}

function updateDisplays() {
    document.getElementById("be-display").innerText = blueEssence;
    document.getElementById("club-count").innerText = club.length;
    
    const premium = getLoanPremium();
    document.getElementById("inflation-premium-display").innerText = `+${premium} BE`;
    
    if (activeLoans > 0) {
        document.getElementById("debt-warning").classList.remove("hidden");
        document.getElementById("debt-display").innerText = activeLoans * 500;
    } else { 
        document.getElementById("debt-warning").classList.add("hidden"); 
    }

    document.querySelectorAll(".store-pack-btn").forEach(btn => {
        let basePrice = parseInt(btn.getAttribute("data-cost"));
        if (!isNaN(basePrice)) {
            btn.innerText = `${basePrice + premium} BE`;
        }
    });

    const starterBtn = document.getElementById("starter-pack-container");
    if (hasBoughtStarter) starterBtn.classList.add("hidden");
    else starterBtn.classList.remove("hidden");

    updateBadges();
    updateClubStatsUI(); 
    renderClubGrid(); 
    renderSquadView(); 
    renderQuests();
    if(currentCollectionRegion) renderCollection();
}

function rollTier(packType) {
    const roll = (Math.random() * 100) + (skills.scouting * 2);
    
    if (packType === 'Starter') { 
        if (roll < 80) return "Silver"; 
        return "Gold"; 
    }
    if (packType === 'Standard') { 
        if (roll < 75) return "Silver"; 
        return "Gold"; 
    }
    if (packType === 'Elite') { 
        if (roll < 50) return "Gold"; 
        if (roll < 80) return "Platinum"; 
        if (roll < 96) return "Diamond"; 
        return "Master"; 
    }
    if (packType === 'Supreme') { 
        if (roll < 40) return "Platinum"; 
        if (roll < 70) return "Diamond"; 
        if (roll < 88) return "Master"; 
        if (roll < 97) return "Grandmaster"; 
        return "Challenger"; 
    }
    return "Silver";
}

function buyPack(baseCost, type) {
    let actualCost = baseCost + getLoanPremium();
    if (blueEssence < actualCost) { showToast("Insufficient BE reserves.", "error"); return; }
    blueEssence -= actualCost; trackStats.packs++;
    
    addXP(25);
    let pulled = [];
    
    if (type === 'Champion') {
        let legPool = window.playerDatabase.filter(p => p.quality === "Champion");
        let legCard = legPool[Math.floor(Math.random() * legPool.length)];
        let p1 = {...legCard, uniqueId: Date.now() + "L1" + Math.random().toString(36).substring(2)};
        pulled.push(p1); club.push(p1);
        
        for (let i = 0; i < 4; i++) {
            let fillerTier = Math.random() < 0.85 ? "Silver" : "Gold";
            let filPool = window.playerDatabase.filter(p => p.quality === fillerTier);
            if(filPool.length === 0) filPool = window.playerDatabase.filter(p => p.quality === "Silver");
            let pF = filPool[Math.floor(Math.random() * filPool.length)];
            let cardF = {...pF, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
            pulled.push(cardF); club.push(cardF);
        }
    } else if (type === 'MVP') {
        for (let i = 0; i < 5; i++) {
            let pCard;
            let mvpChance = 0.20 + (skills.scouting * 0.02);
            if (Math.random() < mvpChance) {
                let mvpPool = window.playerDatabase.filter(p => p.quality === "MVP");
                pCard = mvpPool[Math.floor(Math.random() * mvpPool.length)];
            } else {
                let roll = (Math.random() * 100) + (skills.scouting * 2);
                let fillerTier = "Platinum";
                if (roll > 50) fillerTier = "Diamond";
                if (roll > 80) fillerTier = "Master";
                if (roll > 95) fillerTier = "Grandmaster";
                
                let fillPool = window.playerDatabase.filter(p => p.quality === fillerTier);
                pCard = fillPool[Math.floor(Math.random() * fillPool.length)];
            }
            let inst = {...pCard, uniqueId: Date.now() + "M" + i + Math.random().toString(36).substring(2)};
            pulled.push(inst); club.push(inst);
        }
    } else {
        for (let i=0; i<5; i++) {
            let rolledTier = rollTier(type);
            let pool = window.playerDatabase.filter(p => p.quality === rolledTier && p.quality !== "Champion" && p.quality !== "MVP");
            if(pool.length === 0) pool = window.playerDatabase.filter(p => p.quality === "Silver");
            let p = pool[Math.floor(Math.random() * pool.length)];
            let cardInst = {...p, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
            pulled.push(cardInst); club.push(cardInst);
        }
    }
    
    processNewCards(pulled);
    saveGame(); showPulls(pulled, `${type} Package Opened`);
}

function buyTargetPack(targetType) {
    const selectorCost = document.getElementById("btn-buy-regional");
    let baseCost = selectorCost ? parseInt(selectorCost.getAttribute("data-cost")) : 800;
    let actualCost = baseCost + getLoanPremium();
    
    if (blueEssence < actualCost) { showToast("Insufficient BE reserves.", "error"); return; }
    
    let regionVal = document.getElementById("region-select").value;
    let tierVal = document.getElementById("region-tier-select").value;
    
    blueEssence -= actualCost; trackStats.packs++;
    addXP(25);
    
    let pulled = [];
    for (let i=0; i<5; i++) {
        let targetTier = "Silver";
        if (tierVal === "Standard") targetTier = Math.random() < 0.75 ? "Silver" : "Gold";
        else if (tierVal === "Platinum") {
            let rng = Math.random();
            targetTier = rng < 0.4 ? "Silver" : (rng < 0.8 ? "Gold" : "Platinum");
        } else if (tierVal === "Diamond") {
            let rng = Math.random();
            targetTier = rng < 0.3 ? "Gold" : (rng < 0.7 ? "Platinum" : "Diamond");
        } else if (tierVal === "Master") {
            let rng = Math.random();
            targetTier = rng < 0.2 ? "Platinum" : (rng < 0.6 ? "Diamond" : "Master");
        }
        
        let pool = window.playerDatabase.filter(p => p.region === regionVal && p.quality === targetTier && p.quality !== "Champion" && p.quality !== "MVP");
        if (pool.length === 0) pool = window.playerDatabase.filter(p => p.quality === targetTier && p.quality !== "Champion" && p.quality !== "MVP");
        if (pool.length === 0) pool = window.playerDatabase.filter(p => p.quality === "Silver");
        
        let p = pool[Math.floor(Math.random() * pool.length)];
        let cardInst = {...p, uniqueId: Date.now() + i + Math.random().toString(36).substring(2)};
        pulled.push(cardInst); club.push(cardInst);
    }
    processNewCards(pulled);
    saveGame(); showPulls(pulled, `${regionVal} ${tierVal} Allocation Pack`);
}

function handleTournamentWin() {
    blueEssence += tourData.reward1;
    addXP(100); 
    if (isGoldenRoad) {
        grAccruedEssence += tourData.reward1; document.getElementById("gr-accrued-val").innerText = grAccruedEssence;
        appendLog(`[STAGE CLEARED] Credited +${tourData.reward1} BE. Run Total: ${grAccruedEssence} BE`, "text-amber-400 font-bold");
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
    document.getElementById("tournament-active").classList.add("hidden");
    const outcomeDiv = document.getElementById("tournament-results"); outcomeDiv.classList.remove("hidden");
    const title = document.getElementById("result-title"); const desc = document.getElementById("result-desc"); const icon = document.getElementById("result-icon");
    if (isGRCompletion) {
        title.innerText = "GOLDEN ROAD ACHIEVED!"; title.className = "text-2xl font-black mb-1 text-amber-400 drop-shadow-md";
        icon.innerText = "🏆"; desc.innerText = `Sensational perfection! Stage prizes banked, plus the grand +5,000 BE bonus yield! Run total extraction: ${grAccruedEssence + 5000} BE.`;
    } else if (isWin) {
        title.innerText = "Tournament Champions!"; title.className = "text-xl font-bold mb-1 text-emerald-400";
        icon.innerText = "👑"; desc.innerText = `Run complete. Main collection account credited with ${tourData.reward1} BE payout metrics.`;
    } else {
        title.innerText = "Bracket Knockout"; title.className = "text-xl font-bold mb-1 text-red-500";
        icon.innerText = "💀"; desc.innerText = reachedFinals ? `Knocked out in the Grand Finals stage. Consolidated runner-up payout of ${tourData.reward2} BE cleared.` : `Roster path severed mid-bracket. Performance yields cancelled.`;
    }
    isGoldenRoad = false;
}

function setupNextRound() { if (tourRound < tourData.maxRounds - 1) { tourRound++; setupBracketUI(); setupNextRoundUI(); } }
function advanceGoldenRoadStage() { grStageIndex++; loadGoldenRoadStage(); document.getElementById("tour-active-title").innerText = "Golden Road Run: " + tourData.name; setupBracketUI(); setupNextRoundUI(); }
function emergencyResetSim() { if(simIntervalId) clearTimeout(simIntervalId); tourActive = false; isGoldenRoad = false; document.getElementById("tournament-active").classList.add("hidden"); document.getElementById("tournament-results").classList.add("hidden"); document.getElementById("tournament-lobby").classList.remove("hidden"); }
function finishTournamentUI() { document.getElementById("tournament-results").classList.add("hidden"); document.getElementById("tournament-lobby").classList.remove("hidden"); updateDisplays(); }