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

function switchTab(tabId) {
    if (tourActive && tabId !== 'tournament') {
        showConfirm("Dropping out forfeits current bracket position.", "Do you want to abandon the current run?", () => {
            emergencyResetSim();
            executeTabSwitch(tabId);
        });
        return;
    }
    executeTabSwitch(tabId);
}

function executeTabSwitch(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.getElementById(`tab-${tabId}`).classList.remove("hidden");
    
    if (tabId === 'club') { 
        hasNewClubItems = false; 
        saveGame(); 
        updateBadges(); 
    }
}

function populateDropdownFilters() {
    if(!window.playerDatabase) return;
    
    const teams = ["ALL", ...new Set(window.playerDatabase.map(p => p.team))];
    const regions = ["ALL", ...new Set(window.playerDatabase.map(p => p.region))];
    const years = ["ALL", ...new Set(window.playerDatabase.map(p => p.year))];

    document.getElementById("filter-team-dropdown").innerHTML = teams.map(t => `<option value="${t}">${t}</option>`).join("");
    document.getElementById("filter-region-dropdown").innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join("");
    document.getElementById("filter-year-dropdown").innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
}

function renderQuests() {
    const container = document.getElementById("quests-container"); if (!container) return; container.innerHTML = "";
    quests.forEach(q => {
        let progress = trackStats[q.type] || 0; let isComplete = progress >= q.target;
        const qDiv = document.createElement("div");
        qDiv.className = `p-4 rounded-xl border flex justify-between items-center transition ${q.claimed ? 'bg-slate-900 border-slate-800 opacity-50' : 'bg-slate-800/80 border-slate-700 shadow-sm'}`;
        let btnHtml = q.claimed ? `<button disabled class="bg-slate-700 text-slate-500 px-4 py-2 rounded font-bold text-xs">Claimed</button>` : isComplete ? `<button onclick="claimQuest('${q.id}')" class="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-4 py-2 rounded font-bold text-xs cursor-pointer transition">Claim ${q.reward}</button>` : `<div class="text-slate-400 font-mono text-xs">${Math.min(progress, q.target)} / ${q.target}</div>`;
        qDiv.innerHTML = `<div><h4 class="font-bold text-sm text-slate-300">${q.desc}</h4><p class="text-xs text-amber-400/90 font-mono mt-0.5">+${q.reward} BE</p></div><div>${btnHtml}</div>`;
        container.appendChild(qDiv);
    });
}

function claimQuest(id) { 
    let q = quests.find(x => x.id === id); 
    if(q && !q.claimed) { 
        q.claimed = true; 
        blueEssence += q.reward; 
        saveGame(); 
        updateBadges(); 
    } 
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

function buyStarterPack() {
    if (hasBoughtStarter) return; hasBoughtStarter = true; trackStats.packs++;
    const roles = ["TOP", "JNG", "MID", "ADC", "SUP"]; let pulled = [];
    roles.forEach(role => {
        let rolledTier = rollTier('Starter');
        let pool = window.playerDatabase.filter(p => p.role === role && p.quality === rolledTier);
        if(pool.length === 0) pool = window.playerDatabase.filter(p => p.role === role && (p.quality === "Silver" || p.quality === "Gold"));
        let p = pool[Math.floor(Math.random() * pool.length)];
        let cardInst = {...p, uniqueId: Date.now() + Math.random().toString(36).substring(2)};
        pulled.push(cardInst); club.push(cardInst);
    });
    addXP(10);
    processNewCards(pulled);
    saveGame(); showPulls(pulled, "Starter Package Configured!");
}

function showPulls(pulledCards, titleText) {
    const area = document.getElementById("pack-opening-area"); area.classList.remove("hidden");
    document.getElementById("pack-opening-title").innerText = titleText;
    const container = document.getElementById("pulled-cards"); container.innerHTML = "";
    pulledCards.forEach(card => {
        const wrapper = document.createElement("div"); wrapper.className = "flex flex-col items-center gap-2";
        wrapper.appendChild(createCardElement(card, false, null, null)); 
        container.appendChild(wrapper);
    });
    hasNewClubItems = true;
    updateBadges();
    saveGame();
    area.scrollIntoView({ behavior: "smooth" });
}

function sellAllLowTier(tierName) {
    let before = club.length;
    club = club.filter(card => {
        if (Object.values(squad).some(s => s && s.uniqueId === card.uniqueId)) return true;
        if (card.quality === tierName) { 
            let val = getSellValue(card.quality);
            blueEssence += val; trackStats.soldCount++; trackStats.soldBE += val; 
            return false; 
        }
        return true;
    });
    if(club.length !== before) {
        showToast(`Bulk liquidation processed.`, "success");
        saveGame();
    }
}

function quickSellDuplicates() {
    let counts = {}; let before = club.length;
    club = club.filter(card => {
        if (Object.values(squad).some(s => s && s.uniqueId === card.uniqueId)) return true;
        let key = `${card.name}_${card.year}_${card.team}`;
        if (counts[key]) { 
            let val = getSellValue(card.quality);
            blueEssence += val; trackStats.soldCount++; trackStats.soldBE += val; 
            return false; 
        }
        counts[key] = true; return true;
    });
    if(club.length !== before) {
        showToast("Duplicates purged!", "success");
        saveGame();
    }
}

function createCardElement(card, isMini, onClickAction, activeAssignedRole) {
    const cardDiv = document.createElement("div");
    let calculatedRating = card.rating;
    let isOutOfPosition = activeAssignedRole && card.role !== activeAssignedRole && !activeAssignedRole.includes('SUB') && activeAssignedRole !== 'COACH';
    if (isOutOfPosition && card.role !== "COACH") { calculatedRating = Math.max(0, card.rating - 20); }

    let baseClass = `card-bg-${card.quality}`;
    if (card.role === 'COACH') { baseClass = 'coach-card-style'; }

    const isDarkCard = ['Challenger', 'Champion', 'MVP'].includes(card.quality) || card.role === 'COACH';
    const textStyleClass = isDarkCard ? 'text-white card-light-text' : 'text-black card-dark-text';
    const badgeBgClass = isDarkCard ? 'bg-white/10 text-slate-200 border-white/10' : 'bg-black/10 text-slate-900 border-black/10';

    cardDiv.className = `${baseClass} ${textStyleClass} rounded-xl p-3 w-52 flex flex-col items-center select-none relative transition-all shadow-lg shrink-0 overflow-hidden ${!onClickAction ? 'opacity-95' : 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer'}`;
    if (onClickAction) { cardDiv.onclick = onClickAction; }

    const cleanName = card.name.replace(/[^a-zA-Z0-9]/g, '');
    const wikiImg = `https://lol.fandom.com/wiki/Special:FilePath/${cleanName}Square.png`;
    const avatarFallback = `https://ui-avatars.com/api/?name=${cleanName}&background=0f172a&color=cbd5e1&size=128&bold=true`;
    
    let headerHTML = "";
    if (card.role === 'COACH') {
        headerHTML = `
            <div class="w-full flex justify-between text-[11px] font-bold uppercase mb-1 drop-shadow opacity-90 text-emerald-200">
                <span class="flex gap-0.5">📋 COACH</span>
                <span class="tracking-tight">${window.regionLogos[card.region] ? card.region : card.region}</span>
            </div>
        `;
    } else {
        headerHTML = `
            <div class="w-full flex justify-between text-[11px] font-black uppercase mb-1 drop-shadow items-center">
                <span class="bg-black/20 px-1.5 py-0.5 rounded flex gap-0.5">${window.roleIcons[card.role] || ''} ${card.role}</span>
                <span class="opacity-90 tracking-tight">${window.regionLogos[card.region] ? card.region : card.region}</span>
            </div>
        `;
    }
    
    cardDiv.innerHTML = `
        ${headerHTML}
        <div class="flex items-center gap-1 w-full mt-1">
            <div class="text-3xl font-black tracking-tighter drop-shadow-md flex flex-col items-center w-1/3">
                <span>${calculatedRating}</span>
            </div>
            <img src="${wikiImg}" onerror="this.onerror=null;this.src='${avatarFallback}';" alt="" class="w-14 h-14 rounded-full border-2 border-white/20 shadow mx-auto object-cover bg-slate-900/40">
        </div>
        <div class="font-black text-base truncate w-full mt-2 tracking-tight drop-shadow-sm text-center">${card.name}</div>
        <div class="text-[11px] font-bold opacity-80 truncate w-full text-center mb-0.5">${card.team} [${card.year}]</div>
        
        <div class="text-[10px] font-black tracking-widest uppercase border px-2 py-0.5 rounded-full ${badgeBgClass} mt-1.5 mb-1.5 shadow-sm font-mono text-center w-max mx-auto">
            ${card.role === 'COACH' ? 'COACH PLATFORM' : `${card.quality === 'Champion' ? 'WORLD CHAMP' : `${card.quality === 'MVP' ? 'MVP AWARD' : `${card.quality} TIER`}`}`}
        </div>

        <div class="stat-grid mt-1">
            <div class="flex flex-col gap-0.5">
                <div><span class="opacity-70">MEC</span> ${card.stats.mec}</div>
                <div><span class="opacity-70">TMF</span> ${card.stats.tmf}</div>
                <div><span class="opacity-70">MAP</span> ${card.stats.map}</div>
            </div>
            <div class="flex flex-col gap-0.5 text-right pl-2 border-l" style="border-color: inherit;">
                <div><span class="opacity-70">FRM</span> ${card.stats.frm}</div>
                <div><span class="opacity-70">CMP</span> ${card.stats.cmp}</div>
                <div><span class="opacity-70">LDR</span> ${card.stats.ldr}</div>
            </div>
        </div>
    `;
    return cardDiv;
}

function renderClubGrid() {
    const grid = document.getElementById("club-grid"); if (!grid) return; grid.innerHTML = "";
    const qStr = document.getElementById("club-search-input").value.toLowerCase();
    let filteredClub = club.filter(c => c.name.toLowerCase().includes(qStr));

    if (filteredClub.length === 0) { grid.innerHTML = `<p class="col-span-full text-slate-500 py-6 text-center font-mono text-sm">No matching club assets logged.</p>`; return; }

    filteredClub.forEach((card, idx) => {
        const wrapper = document.createElement("div"); wrapper.className = "flex flex-col items-center gap-2";
        wrapper.appendChild(createCardElement(card, false, null, null));
        const btnSell = document.createElement("button"); const sellPrice = getSellValue(card.quality);
        
        if (Object.values(squad).some(s => s && s.uniqueId === card.uniqueId)) {
            btnSell.className = "text-xs bg-slate-800 text-slate-500 px-2 py-1.5 rounded w-52 font-bold cursor-not-allowed border border-slate-700";
            btnSell.innerText = `Locked (In Squad)`; btnSell.disabled = true;
        } else {
            btnSell.className = "text-xs bg-red-900/30 hover:bg-red-800/60 border border-red-900/50 text-red-300 px-2 py-1.5 rounded transition w-52 font-bold cursor-pointer shadow-sm";
            btnSell.innerHTML = `Liquidate (+${sellPrice})`;
            btnSell.onclick = () => { 
                blueEssence += sellPrice; 
                trackStats.soldCount++; trackStats.soldBE += sellPrice;
                club = club.filter(c => c.uniqueId !== card.uniqueId); 
                saveGame(); 
            };
        }
        wrapper.appendChild(btnSell); grid.appendChild(wrapper);
    });
}

function sortClub(by) {
    if (by === 'rating') club.sort((a,b) => b.rating - a.rating);
    if (by === 'region') club.sort((a,b) => a.region.localeCompare(b.region));
    renderClubGrid();
}

let activeSlot = null; let pickerSortBy = 'highest';

function renderFilteredPicker() {
    const grid = document.getElementById("picker-grid"); grid.innerHTML = "";
    const targetT = document.getElementById("filter-team-dropdown").value;
    const targetR = document.getElementById("filter-region-dropdown").value;
    const targetY = document.getElementById("filter-year-dropdown").value;
    const targetRole = document.getElementById("filter-role-dropdown").value;
    const rankSort = document.getElementById("filter-sort-dropdown").value;

    let pool = [...club];
    const otherCardsInSquad = Object.entries(squad).filter(([slot, card]) => slot !== activeSlot && card !== null).map(([slot, card]) => card);
    const usedUniqueIds = otherCardsInSquad.map(c => c.uniqueId);
    const usedPlayerNames = otherCardsInSquad.map(c => c.name);

    pool = pool.filter(p => !usedUniqueIds.includes(p.uniqueId) && !usedPlayerNames.includes(p.name));

    if (activeSlot === "COACH") {
        pool = pool.filter(p => p.role === "COACH");
    } else {
        pool = pool.filter(p => p.role !== "COACH");
        if (targetRole !== "ALL") pool = pool.filter(p => p.role === targetRole);
    }

    if (targetT !== "ALL") pool = pool.filter(p => p.team === targetT);
    if (targetR !== "ALL") pool = pool.filter(p => p.region === targetR);
    if (targetY !== "ALL") pool = pool.filter(p => p.year == targetY);

    pool.sort((a, b) => {
        if (rankSort === "highest") return b.rating - a.rating;
        if (rankSort === "lowest") return a.rating - b.rating;
        if (rankSort === "highest_mec") return b.stats.mec - a.stats.mec;
        if (rankSort === "highest_tmf") return b.stats.tmf - a.stats.tmf;
        if (rankSort === "highest_map") return b.stats.map - a.stats.map;
        return b.rating - a.rating;
    });

    if(pool.length === 0) { grid.innerHTML = `<p class="col-span-full text-center text-sm text-slate-500 py-8 font-mono">No matching club assets available.</p>`; return; }

    pool.forEach(card => {
        const wrapper = document.createElement("div");
        wrapper.className = "flex flex-col items-center gap-2 p-2 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all shadow-sm";
        
        const cardEl = createCardElement(card, false, () => {
            squad[activeSlot] = card;
            saveGame();
            document.getElementById(`squad-${activeSlot}`).scrollIntoView({ behavior: "smooth", block: "center" });
        }, activeSlot);
        
        wrapper.appendChild(cardEl); grid.appendChild(wrapper);
    });
}

function selectSlot(role) {
    activeSlot = role; document.getElementById("picker-role").innerText = role;
    const roleDropdown = document.getElementById("filter-role-dropdown");
    if (["COACH", "TOP", "JNG", "MID", "ADC", "SUP"].includes(role)) roleDropdown.value = role; else roleDropdown.value = "ALL";
    document.getElementById("squad-picker-area").classList.remove("hidden");
    renderFilteredPicker();
    document.getElementById("squad-picker-area").scrollIntoView({ behavior: "smooth" });
}

function renderSquadView() {
    const slots = ["COACH", "TOP", "JNG", "MID", "ADC", "SUP", "SUB1", "SUB2", "SUB3"];
    slots.forEach(role => {
        const slot = document.getElementById(`squad-${role}`); if(!slot) return; slot.innerHTML = "";
        if (squad[role]) {
            const cardEl = createCardElement(squad[role], false, () => selectSlot(role), role);
            const del = document.createElement("button");
            del.className = "absolute -top-2 -right-2 bg-red-800 hover:bg-red-600 rounded-full w-6 h-6 text-xs font-black flex items-center justify-center cursor-pointer border border-slate-900 shadow-lg text-white z-30 transition";
            del.innerText = "✕"; del.onclick = (e) => { e.stopPropagation(); squad[role] = null; saveGame(); };
            cardEl.appendChild(del); slot.appendChild(cardEl);
        } else {
            slot.innerHTML = `<div class="text-center text-slate-500 font-bold tracking-widest text-xs flex flex-col items-center justify-center h-full w-full opacity-60"><span class="text-3xl block mb-2">${window.roleIcons[role] || '+'}</span><span>${role}</span></div>`;
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
    let totalRating = 0; let count = 0; let active = [];
    
    ["TOP", "JNG", "MID", "ADC", "SUP"].forEach(role => {
        if (squad[role]) {
            let penalty = (squad[role].role !== role) ? 20 : 0;
            totalRating += Math.max(0, squad[role].rating - penalty); 
            count++; 
            active.push(squad[role]);
        }
    });

    let avgRating = count > 0 ? Math.round(totalRating / count) : 0;
    document.getElementById("overview-rating").innerText = avgRating;
    document.getElementById("overview-average-tier").innerText = count > 0 ? getTierFromRating(avgRating) : "None";

    let regionChem = 0; let yearChem = 0;
    let coachBonus = squad["COACH"] ? 5 : 0; let trainBonus = getTrainingBonus();

    if (count === 5) {
        let nonLegacyRegions = active.filter(c => c.quality !== "Champion").map(c => c.region);
        let uReg = new Set(nonLegacyRegions).size;
        if (uReg <= 1) regionChem = 5; else if (uReg === 2) regionChem = 3; else if (uReg === 3) regionChem = 2; else regionChem = 1;

        let nonLegacyYears = active.filter(c => c.quality !== "Champion").map(c => c.year);
        let uYear = new Set(nonLegacyYears).size;
        if (uYear <= 1) yearChem = 5; else if (uYear === 2) yearChem = 3; else yearChem = 1;

        let nonLegacyTeams = active.filter(c => c.quality !== "Champion").map(c => window.teamLineageBridges[c.team] || c.team);
        let uniqueTeams = new Set(nonLegacyTeams).size;
        
        if (uniqueTeams <= 1) regionChem += 2; 

        regionChem = Math.min(5, regionChem);
    }

    document.getElementById("overview-chem-region").innerText = `${regionChem} / 5`;
    document.getElementById("overview-chem-year").innerText = `${yearChem} / 5`;
    document.getElementById("overview-coach-bonus").innerText = `+${coachBonus}`;
    document.getElementById("overview-training-bonus").innerText = `+${trainBonus}`;
    
    let totalPower = avgRating + regionChem + yearChem + coachBonus + trainBonus;
    document.getElementById("overview-chem-total").innerText = totalPower;

    let avgStats = { mec: 0, tmf: 0, map: 0 };
    if (count > 0) {
        avgStats.mec = active.reduce((acc, c) => acc + c.stats.mec, 0) / count;
        avgStats.tmf = active.reduce((acc, c) => acc + c.stats.tmf, 0) / count;
        avgStats.map = active.reduce((acc, c) => acc + c.stats.map, 0) / count;
    }

    if (document.getElementById("overview-avg-mec")) {
        document.getElementById("overview-avg-mec").innerText = Math.round(avgStats.mec);
        document.getElementById("overview-avg-tmf").innerText = Math.round(avgStats.tmf);
        document.getElementById("overview-avg-map").innerText = Math.round(avgStats.map);
    }

    return { rating: avgRating, chem: (regionChem + yearChem), coach: coachBonus, training: trainBonus, totalPower: totalPower, rawStats: avgStats };
}

// --- PVE COMBAT BRACKET ---
function generateRealPlayerEnemies(baseDiff, rounds) {
    enemies = []; const nomenclaturePool = ["SKT T1 Legacy", "Gen.G Superteam", "BLG Vanguard", "G2 Army", "Team Liquid Elite", "Fnatic Core"];
    if (!window.playerDatabase) return;

    const realProNames = [...new Set(window.playerDatabase.filter(p => p.role !== "COACH").map(p => p.name))];
    for(let i = 0; i < rounds; i++) {
        let diffCurve = baseDiff + (i * 3) + Math.floor(Math.random() * 4);
        let chosenTeamName = nomenclaturePool[Math.floor(Math.random() * nomenclaturePool.length)] + ` [S${i+1}]`;
        let activeDraft = []; let localNames = [...realProNames];
        for (let r = 0; r < 5; r++) { activeDraft.push(localNames.splice(Math.floor(Math.random() * localNames.length), 1)[0]); }
        
        let enemyStats = {
            mec: Math.max(50, diffCurve + Math.floor(Math.random() * 20 - 10)),
            tmf: Math.max(50, diffCurve + Math.floor(Math.random() * 20 - 10)),
            map: Math.max(50, diffCurve + Math.floor(Math.random() * 20 - 10))
        };
        
        enemies.push({ name: chosenTeamName, power: diffCurve, rosterNames: activeDraft, stats: enemyStats });
    }
}

function populateLiveArenaVisualizer() {
    const myRosterBox = document.getElementById("live-arena-my-roster"); const enemyRosterBox = document.getElementById("live-arena-enemy-roster");
    myRosterBox.innerHTML = ""; enemyRosterBox.innerHTML = "";
    ["TOP", "JNG", "MID", "ADC", "SUP"].forEach(role => { if (squad[role]) myRosterBox.appendChild(createCardElement(squad[role], false, null, role)); });
    let enemyPowerRef = enemies[tourRound].power; let currentEnemyRoster = enemies[tourRound].rosterNames;
    ["TOP", "JNG", "MID", "ADC", "SUP"].forEach((role, idx) => {
        let dummyCard = {
            name: currentEnemyRoster[idx] || `Pro ${role}`, role: role, rating: Math.floor(enemyPowerRef - 3 + idx),
            quality: getTierFromRating(enemyPowerRef), region: "GLOBAL", team: "NPC", year: 2024, stats: { mec: 80, tmf: 80, frm: 80, cmp: 80, map: 80, ldr: 80 }
        };
        enemyRosterBox.appendChild(createCardElement(dummyCard, false, null, role));
    });
}

function transitionToArena(title) {
    document.getElementById("tournament-lobby").classList.add("hidden"); document.getElementById("tournament-results").classList.add("hidden");
    document.getElementById("tournament-active").classList.remove("hidden"); document.getElementById("tour-active-title").innerText = title;
    setupBracketUI(); setupNextRoundUI();
}

function setupNextRoundUI() {
    tacticalBonus = 0; let sData = computeChemistry(); let currentEnemy = enemies[tourRound];
    document.getElementById("tour-my-power").innerText = sData.totalPower;
    document.getElementById("enemy-team-name").innerText = currentEnemy.name;
    document.getElementById("tour-enemy-rating").innerText = currentEnemy.power;
    populateLiveArenaVisualizer();
    
    let managerBuff = (skills.tactics * 2);
    let managerUI = managerBuff > 0 
        ? `<div class="text-center mt-2 mb-4"><span class="text-emerald-400 text-xs font-bold border border-emerald-800/50 bg-emerald-900/30 px-3 py-1 rounded-full shadow-sm">Manager Tactics Skill Active: +${managerBuff} Power</span></div>`
        : '';

    const draftPanel = document.getElementById("tactical-draft-panel");
    draftPanel.classList.remove("hidden");
    draftPanel.innerHTML = `
        <h4 class="text-base font-bold text-blue-300 mb-1 uppercase tracking-widest border-b border-slate-700/50 pb-2">Tactical Draft Phase</h4>
        <p class="text-xs text-slate-400 mb-4 mt-2">Compare your lineup's stats against the opponent. Exploiting their weaknesses grants massive power multipliers, while drafting into their strengths penalizes you.</p>
        
        ${managerUI}

        <div class="flex justify-center gap-6 mb-5 text-sm font-mono bg-slate-900/50 p-3 rounded border border-slate-700/50 shadow-inner">
            <div class="text-center"><span class="text-slate-500 block text-[10px]">Avg MEC</span> <span class="text-slate-200">${Math.round(sData.rawStats.mec)}</span> <span class="text-slate-600 text-[10px]">vs</span> <span class="text-red-400/90">${currentEnemy.stats.mec}</span></div>
            <div class="text-center"><span class="text-slate-500 block text-[10px]">Avg TMF</span> <span class="text-slate-200">${Math.round(sData.rawStats.tmf)}</span> <span class="text-slate-600 text-[10px]">vs</span> <span class="text-red-400/90">${currentEnemy.stats.tmf}</span></div>
            <div class="text-center"><span class="text-slate-500 block text-[10px]">Avg MAP</span> <span class="text-slate-200">${Math.round(sData.rawStats.map)}</span> <span class="text-slate-600 text-[10px]">vs</span> <span class="text-red-400/90">${currentEnemy.stats.map}</span></div>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
            <button onclick="lockInDraft('MEC')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 px-5 py-2.5 rounded font-bold transition text-xs text-slate-200 cursor-pointer shadow-md">Early Aggression (MEC)</button>
            <button onclick="lockInDraft('TMF')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 px-5 py-2.5 rounded font-bold transition text-xs text-slate-200 cursor-pointer shadow-md">Front-to-Back (TMF)</button>
            <button onclick="lockInDraft('MAP')" class="bg-slate-700 hover:bg-slate-600 border border-slate-500 px-5 py-2.5 rounded font-bold transition text-xs text-slate-200 cursor-pointer shadow-md">Objective Control (MAP)</button>
        </div>
    `;

    document.getElementById("btn-play-match").classList.add("hidden");
    document.getElementById("btn-next-round").classList.add("hidden");
    document.getElementById("btn-gr-next").classList.add("hidden");
    let stagePrefix = isGoldenRoad ? `[STAGE ${grStageIndex+1}/6] ` : ``;
    document.getElementById("match-log").innerHTML = `<div class="text-blue-400 font-bold border-b border-slate-800 pb-1 mb-2">${stagePrefix}Entering Rift Canvas for ${getRoundLabel(tourRound, tourData.maxRounds)}. Awaiting Tactical Focus.</div>`;
}

function lockInDraft(statFocus) {
    document.getElementById("tactical-draft-panel").classList.add("hidden");
    let sData = computeChemistry(); let currentEnemy = enemies[tourRound];
    
    let myStat = sData.rawStats[statFocus.toLowerCase()];
    let enemyStat = currentEnemy.stats[statFocus.toLowerCase()];
    
    let diff = myStat - enemyStat;
    let baseBonus = Math.round(diff / 1.5);
    let managerBuff = (skills.tactics * 2);
    
    tacticalBonus = baseBonus + managerBuff; 
    
    document.getElementById("tour-my-power").innerText = sData.totalPower + tacticalBonus;
    
    let sign = tacticalBonus >= 0 ? '+' : '';
    let colorClass = tacticalBonus > 0 ? 'text-emerald-400' : (tacticalBonus < 0 ? 'text-red-400' : 'text-slate-300');
    
    appendLog(`[DRAFT PHASE] Strategic focus: ${statFocus}. Our ${statFocus}: ${Math.round(myStat)} vs Enemy ${statFocus}: ${enemyStat}.`, "text-slate-300 font-bold");
    
    if (managerBuff > 0) {
        appendLog(`Manager Tactics Skill Bonus: +${managerBuff} Power.`, "text-emerald-300 font-bold italic");
    }

    appendLog(`Modifier Calculation: Applied ${sign}${tacticalBonus} Power to Squad Rating.`, `${colorClass} font-bold`);

    const playBtn = document.getElementById("btn-play-match"); playBtn.classList.remove("hidden"); playBtn.disabled = false;
    playBtn.classList.replace("bg-slate-600", "bg-blue-700"); playBtn.innerText = "Execute Simulation ⏩";
}

function getRoundLabel(idx, total) { if (idx === total - 1) return "Grand Finals"; if (idx === total - 2) return "Semifinals"; if (idx === total - 3) return "Quarterfinals"; return `Round of ${Math.pow(2, total - idx)}`; }

function setupBracketUI() {
    const container = document.getElementById("bracket-container"); container.innerHTML = "";
    for(let i=0; i<tourData.maxRounds; i++) {
        const badge = document.createElement("div");
        badge.className = `bracket-step bg-slate-800 px-3 py-1.5 rounded border border-slate-700 ${i === tourRound ? 'bracket-active text-blue-300 bg-slate-800/80' : ''} ${i < tourRound ? 'bracket-won' : ''}`;
        badge.innerText = getRoundLabel(i, tourData.maxRounds); container.appendChild(badge);
    }
}

function appendLog(msg, colorClass = "text-slate-400") {
    const logBox = document.getElementById("match-log");
    logBox.innerHTML += `<div class="py-0.5 ${colorClass}"><span class="opacity-30 text-[10px] mr-2">${new Date().toLocaleTimeString()}</span>${msg}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
}

function recordMatchStats() {
    ["TOP", "JNG", "MID", "ADC", "SUP", "COACH"].forEach(role => {
        if (squad[role]) {
            let n = squad[role].name;
            trackStats.matchesPlayed[n] = (trackStats.matchesPlayed[n] || 0) + 1;
        }
    });
}

function playMatchStep() {
    let sData = computeChemistry(); let myPower = sData.totalPower + tacticalBonus; let currentEnemy = enemies[tourRound];
    const playBtn = document.getElementById("btn-play-match"); playBtn.disabled = true; playBtn.classList.replace("bg-blue-700", "bg-slate-700"); playBtn.innerText = "Crunching Telemetry...";
    appendLog(`Drafting phase concluded. Opponent core: [${currentEnemy.rosterNames.join(", ")}] active.`, "text-slate-500");
    simIntervalId = setTimeout(() => {
        appendLog(`Skirmish Phase active. Cross-map macro checks engaged.`, "text-slate-300");
        simIntervalId = setTimeout(() => {
            let finalCalculation = myPower + ((Math.random() * 14) - 7);
            appendLog("Late Phase: Contesting around the Baron Nashor pit...", "text-slate-400");
            simIntervalId = setTimeout(() => {
                recordMatchStats(); 
                
                if (finalCalculation >= currentEnemy.power) {
                    appendLog(`🏆 Series Secured! Enemy team Nexus structures collapsed!`, "text-emerald-400 font-bold");
                    if (tourRound >= tourData.maxRounds - 1) handleTournamentWin();
                    else { playBtn.classList.add("hidden"); document.getElementById("btn-next-round").classList.remove("hidden"); }
                } else {
                    appendLog(`💀 Defeat. Squad power failed to match opposing push lines.`, "text-red-400/90 font-bold");
                    handleTournamentLoss();
                }
            }, 600);
        }, 800);
    }, 700);
}

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
    blueEssence -= cost; saveGame();
    isGoldenRoad = false; tourActive = true; tourData = { name, reward1: r1, reward2: r2, maxRounds: rounds };
    tourRound = 0; tacticalBonus = 0; generateRealPlayerEnemies(baseDiff, rounds);
    document.getElementById("gr-badge").classList.add("hidden"); document.getElementById("gr-accrued-display").classList.add("hidden");
    transitionToArena(name);
}

function startGoldenRoad() {
    if (!checkSquadReady()) return; 
    if (blueEssence < 1000) { showToast("Insufficient assets for Golden Road.", "error"); return; }
    if(simIntervalId) clearTimeout(simIntervalId); 
    blueEssence -= 1000; saveGame();
    isGoldenRoad = true; tourActive = true; grStageIndex = 0; grAccruedEssence = 0; tacticalBonus = 0;
    loadGoldenRoadStage();
    document.getElementById("gr-badge").classList.remove("hidden"); document.getElementById("gr-accrued-display").classList.remove("hidden");
    document.getElementById("gr-accrued-val").innerText = grAccruedEssence;
    transitionToArena("Golden Road Run: " + tourData.name);
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