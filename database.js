// database.js

window.roleIcons = { TOP: "┪", JNG: "⚔️", MID: "✦", ADC: "🏹", SUP: "🛡️", COACH: "📋" };
window.regionLogos = { LCK: "🇰🇷 LCK", LPL: "🇨🇳 LPL", LEC: "🇪🇺 LEC", LCS: "🇺🇸 LCS", Champion: "👑 ICON" };
window.teamLineageBridges = { 
    "SKT": "T1", "SKT T1": "T1", "SSG": "Gen.G", "SSW": "Gen.G", "Samsung Galaxy": "Gen.G", 
    "FNC": "Fnatic", "ROX": "HLE", "DK": "Dplus KIA", "IG": "Invictus Gaming", "FPX": "FunPlus Phoenix", 
    "DRX": "DragonX", "EDG": "EDward Gaming", "RNG": "Royal Never Give Up", "KC": "Karmine Corp", 
    "MKOI": "Movistar KOI", "GX": "GIANTX", "VIT": "Team Vitality", "TH": "Team Heretics", 
    "SK": "SK Gaming", "NAVI": "Natus Vincere", "KCB": "Karmine Corp Blue", "LR": "Los Ratones",
    "NS": "Nongshim RedForce", "DNS": "DN SOOPers", "BRO": "BRION", "BFX": "BNK FEARX", 
    "AL": "Anyone's Legend", "BLG": "Bilibili Gaming", "JDG": "JD Gaming", "TES": "Top Esports", 
    "WBG": "Weibo Gaming", "WE": "Team WE", "TT": "ThunderTalk Gaming", "LGD": "LGD Gaming", "OMG": "Oh My God", "UP": "Ultra Prime"
};

function genStats(rating) {
    const v = () => Math.floor(Math.random() * 8) - 4; 
    return { mec: Math.min(99, rating + v()), frm: Math.min(99, rating + v()), map: Math.min(99, rating + v()), tmf: Math.min(99, rating + v()), cmp: Math.min(99, rating + v()), ldr: Math.min(99, rating + v()) };
}

const baseDatabase = [
    // ==========================================
    // --- 1. 2026 SEASON ROSTERS (PLAYERS & COACHES) ---
    // ==========================================
    
    // --- 2026 COACHES ---
    { id: 8001, name: "kkOma", role: "COACH", team: "T1", year: 2026, rating: 97, quality: "Master", region: "LCK", stats: { mec: 22, tmf: 94, frm: 14, cmp: 97, map: 98, ldr: 99 } },
    { id: 8002, name: "Ryu", role: "COACH", team: "Gen.G", year: 2026, rating: 94, quality: "Diamond", region: "LCK", stats: { mec: 30, tmf: 92, frm: 18, cmp: 90, map: 94, ldr: 92 } },
    { id: 8003, name: "Homme", role: "COACH", team: "HLE", year: 2026, rating: 97, quality: "Master", region: "LCK", stats: { mec: 25, tmf: 97, frm: 10, cmp: 96, map: 97, ldr: 96 } },
    { id: 8004, name: "cvMax", role: "COACH", team: "DK", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 35, tmf: 89, frm: 15, cmp: 88, map: 90, ldr: 91 } },
    { id: 8005, name: "Score", role: "COACH", team: "KT", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 25, tmf: 91, frm: 15, cmp: 93, map: 94, ldr: 92 } },
    { id: 8006, name: "Edo", role: "COACH", team: "BFX", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 20, tmf: 85, frm: 12, cmp: 84, map: 86, ldr: 85 } },
    { id: 8007, name: "DanDy", role: "COACH", team: "NS", year: 2026, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 40, tmf: 88, frm: 25, cmp: 86, map: 92, ldr: 87 } },
    { id: 8008, name: "Joker", role: "COACH", team: "DRX", year: 2026, rating: 84, quality: "Gold", region: "LCK", stats: { mec: 22, tmf: 84, frm: 15, cmp: 83, map: 85, ldr: 84 } },
    { id: 8009, name: "SSONG", role: "COACH", team: "BRO", year: 2026, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 28, tmf: 83, frm: 16, cmp: 82, map: 84, ldr: 85 } },
    { id: 8010, name: "oDin", role: "COACH", team: "DNS", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 24, tmf: 86, frm: 14, cmp: 85, map: 88, ldr: 87 } },
    { id: 8011, name: "Helper", role: "COACH", team: "AL", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 24, tmf: 86, frm: 15, cmp: 85, map: 88, ldr: 89 } },
    { id: 8012, name: "Daeny", role: "COACH", team: "BLG", year: 2026, rating: 96, quality: "Master", region: "LPL", stats: { mec: 32, tmf: 96, frm: 18, cmp: 95, map: 98, ldr: 97 } },
    { id: 8013, name: "Mafa", role: "COACH", team: "iG", year: 2026, rating: 90, quality: "Platinum", region: "LPL", stats: { mec: 24, tmf: 89, frm: 15, cmp: 91, map: 92, ldr: 92 } },
    { id: 8014, name: "Tabe", role: "COACH", team: "JDG", year: 2026, rating: 92, quality: "Diamond", region: "LPL", stats: { mec: 22, tmf: 91, frm: 11, cmp: 93, map: 94, ldr: 94 } },
    { id: 8015, name: "Poppy", role: "COACH", team: "TES", year: 2026, rating: 88, quality: "Gold", region: "LPL", stats: { mec: 23, tmf: 86, frm: 12, cmp: 87, map: 89, ldr: 89 } },
    { id: 8016, name: "Shine", role: "COACH", team: "WBG", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 24, tmf: 88, frm: 14, cmp: 89, map: 90, ldr: 91 } },
    { id: 8017, name: "Mni", role: "COACH", team: "EDG", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 22, tmf: 82, frm: 13, cmp: 82, map: 85, ldr: 85 } },
    { id: 8018, name: "Maizijian", role: "COACH", team: "NIP", year: 2026, rating: 86, quality: "Gold", region: "LPL", stats: { mec: 25, tmf: 84, frm: 14, cmp: 85, map: 86, ldr: 87 } },
    { id: 8019, name: "JinJin", role: "COACH", team: "WE", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 20, tmf: 81, frm: 12, cmp: 81, map: 83, ldr: 84 } },
    { id: 8020, name: "NONAME", role: "COACH", team: "TT", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 21, tmf: 80, frm: 11, cmp: 80, map: 82, ldr: 83 } },
    { id: 8021, name: "1874", role: "COACH", team: "LGD", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 19, tmf: 79, frm: 10, cmp: 78, map: 81, ldr: 82 } },
    { id: 8022, name: "Edgar", role: "COACH", team: "LNG", year: 2026, rating: 94, quality: "Master", region: "LPL", stats: { mec: 21, tmf: 93, frm: 11, cmp: 93, map: 95, ldr: 96 } },
    { id: 8023, name: "chengz", role: "COACH", team: "OMG", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 18, tmf: 78, frm: 12, cmp: 77, map: 80, ldr: 80 } },
    { id: 8024, name: "Yuzhang", role: "COACH", team: "UP", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 17, tmf: 77, frm: 10, cmp: 76, map: 79, ldr: 78 } },
    { id: 8025, name: "Dylan Falco", role: "COACH", team: "G2", year: 2026, rating: 93, quality: "Diamond", region: "LEC", stats: { mec: 18, tmf: 93, frm: 15, cmp: 92, map: 96, ldr: 95 } },
    { id: 8026, name: "Melzhet", role: "COACH", team: "MKOI", year: 2026, rating: 88, quality: "Gold", region: "LEC", stats: { mec: 20, tmf: 86, frm: 11, cmp: 89, map: 91, ldr: 91 } },
    { id: 8027, name: "GrabbZ", role: "COACH", team: "FNC", year: 2026, rating: 90, quality: "Platinum", region: "LEC", stats: { mec: 24, tmf: 88, frm: 14, cmp: 91, map: 92, ldr: 93 } },
    { id: 8028, name: "Reapered", role: "COACH", team: "KC", year: 2026, rating: 92, quality: "Diamond", region: "LEC", stats: { mec: 28, tmf: 91, frm: 15, cmp: 94, map: 93, ldr: 95 } },
    { id: 8029, name: "Guilhoto", role: "COACH", team: "GX", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 22, tmf: 84, frm: 12, cmp: 85, map: 88, ldr: 88 } },
    { id: 8030, name: "Pad", role: "COACH", team: "VIT", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 20, tmf: 84, frm: 11, cmp: 83, map: 87, ldr: 87 } },
    { id: 8031, name: "Striker", role: "COACH", team: "Shifters", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 23, tmf: 82, frm: 14, cmp: 82, map: 85, ldr: 86 } },
    { id: 8032, name: "Hidon", role: "COACH", team: "TH", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 21, tmf: 81, frm: 12, cmp: 83, map: 84, ldr: 84 } },
    { id: 8033, name: "OWN3R", role: "COACH", team: "SK", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 25, tmf: 83, frm: 15, cmp: 82, map: 85, ldr: 85 } },
    { id: 8034, name: "TheRock", role: "COACH", team: "NAVI", year: 2026, rating: 80, quality: "Silver", region: "LEC", stats: { mec: 20, tmf: 78, frm: 12, cmp: 79, map: 82, ldr: 83 } },
    { id: 8035, name: "Blidzy", role: "COACH", team: "KCB", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 22, tmf: 80, frm: 14, cmp: 81, map: 82, ldr: 83 } },
    { id: 8036, name: "YamatoCannon", role: "COACH", team: "LR", year: 2026, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 20, tmf: 86, frm: 12, cmp: 88, map: 90, ldr: 93 } },
    { id: 8037, name: "Inero", role: "COACH", team: "C9", year: 2026, rating: 89, quality: "Diamond", region: "LCS", stats: { mec: 28, tmf: 88, frm: 12, cmp: 89, map: 91, ldr: 90 } },

    // --- 2026 LCK ROSTERS ---
    { id: 1101, name: "Doran", role: "TOP", team: "T1", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 92, tmf: 89, frm: 91, cmp: 86, map: 85, ldr: 88 } },
    { id: 1102, name: "Oner", role: "JNG", team: "T1", year: 2026, rating: 93, quality: "Master", region: "LCK", stats: { mec: 95, tmf: 92, frm: 90, cmp: 91, map: 92, ldr: 89 } },
    { id: 1103, name: "Faker", role: "MID", team: "T1", year: 2026, rating: 97, quality: "Challenger", region: "LCK", stats: { mec: 92, tmf: 98, frm: 92, cmp: 99, map: 99, ldr: 99 } },
    { id: 1104, name: "Peyz", role: "ADC", team: "T1", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 96, tmf: 95, frm: 95, cmp: 90, map: 86, ldr: 85 } },
    { id: 1105, name: "Keria", role: "SUP", team: "T1", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 84, tmf: 94, frm: 22, cmp: 96, map: 97, ldr: 92 } },

    { id: 1111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2026, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 93, tmf: 96, frm: 96, cmp: 94, map: 89, ldr: 91 } },
    { id: 1112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2026, rating: 97, quality: "Challenger", region: "LCK", stats: { mec: 97, tmf: 96, frm: 98, cmp: 95, map: 98, ldr: 92 } },
    { id: 1113, name: "Chovy", role: "MID", team: "Gen.G", year: 2026, rating: 99, quality: "Challenger", region: "LCK", stats: { mec: 99, tmf: 98, frm: 99, cmp: 97, map: 95, ldr: 90 } },
    { id: 1114, name: "Ruler", role: "ADC", team: "Gen.G", year: 2026, rating: 96, quality: "Grandmaster", region: "LCK", stats: { mec: 97, tmf: 98, frm: 96, cmp: 95, map: 88, ldr: 91 } },
    { id: 1115, name: "Duro", role: "SUP", team: "Gen.G", year: 2026, rating: 88, quality: "Platinum", region: "LCK", stats: { mec: 78, tmf: 89, frm: 18, cmp: 85, map: 90, ldr: 86 } },

    { id: 1221, name: "Zeus", role: "TOP", team: "HLE", year: 2026, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 98, tmf: 94, frm: 96, cmp: 92, map: 87, ldr: 85 } },
    { id: 1222, name: "Kanavi", role: "JNG", team: "HLE", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 94, tmf: 93, frm: 95, cmp: 91, map: 92, ldr: 89 } },
    { id: 1223, name: "Zeka", role: "MID", team: "HLE", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 98, tmf: 93, frm: 94, cmp: 90, map: 88, ldr: 85 } },
    { id: 1224, name: "Gumayusi", role: "ADC", team: "HLE", year: 2026, rating: 93, quality: "Master", region: "LCK", stats: { mec: 95, tmf: 95, frm: 96, cmp: 99, map: 85, ldr: 88 } },
    { id: 1225, name: "Delight", role: "SUP", team: "HLE", year: 2026, rating: 92, quality: "Master", region: "LCK", stats: { mec: 84, tmf: 94, frm: 22, cmp: 90, map: 93, ldr: 89 } },

    { id: 1331, name: "Siwoo", role: "TOP", team: "DK", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 86, tmf: 84, frm: 85, cmp: 80, map: 81, ldr: 78 } },
    { id: 1332, name: "Lucid", role: "JNG", team: "DK", year: 2026, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 91, tmf: 88, frm: 89, cmp: 86, map: 88, ldr: 85 } },
    { id: 1333, name: "ShowMaker", role: "MID", team: "DK", year: 2026, rating: 92, quality: "Master", region: "LCK", stats: { mec: 94, tmf: 92, frm: 92, cmp: 94, map: 92, ldr: 93 } },
    { id: 1334, name: "Smash", role: "ADC", team: "DK", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 85, frm: 87, cmp: 82, map: 80, ldr: 79 } },
    { id: 1335, name: "Career", role: "SUP", team: "DK", year: 2026, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 78, tmf: 84, frm: 15, cmp: 81, map: 83, ldr: 80 } },

    { id: 1551, name: "PerfecT", role: "TOP", team: "KT", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 84, frm: 86, cmp: 82, map: 83, ldr: 80 } },
    { id: 1552, name: "Cuzz", role: "JNG", team: "KT", year: 2026, rating: 88, quality: "Platinum", region: "LCK", stats: { mec: 85, tmf: 89, frm: 86, cmp: 87, map: 90, ldr: 88 } },
    { id: 1553, name: "Bdd", role: "MID", team: "KT", year: 2026, rating: 90, quality: "Diamond", region: "LCK", stats: { mec: 89, tmf: 91, frm: 92, cmp: 90, map: 89, ldr: 88 } },
    { id: 1554, name: "Aiming", role: "ADC", team: "KT", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 89, frm: 92, cmp: 88, map: 85, ldr: 84 } },
    { id: 1555, name: "Ghost", role: "SUP", team: "KT", year: 2026, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 80, tmf: 88, frm: 20, cmp: 93, map: 92, ldr: 94 } },

    { id: 1441, name: "Clear", role: "TOP", team: "BFX", year: 2026, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 83, tmf: 80, frm: 82, cmp: 79, map: 76, ldr: 75 } },
    { id: 1442, name: "Raptor", role: "JNG", team: "BFX", year: 2026, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 81, frm: 80, cmp: 78, map: 83, ldr: 78 } },
    { id: 1443, name: "VicLa", role: "MID", team: "BFX", year: 2026, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 85, tmf: 82, frm: 83, cmp: 80, map: 79, ldr: 78 } },
    { id: 1444, name: "Diable", role: "ADC", team: "BFX", year: 2026, rating: 82, quality: "Gold", region: "LCK", stats: { mec: 84, tmf: 81, frm: 83, cmp: 80, map: 77, ldr: 76 } },
    { id: 1445, name: "Kellin", role: "SUP", team: "BFX", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 78, tmf: 85, frm: 21, cmp: 84, map: 87, ldr: 84 } },

    { id: 3051, name: "Kingen", role: "TOP", team: "NS", year: 2026, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 90, tmf: 91, frm: 89, cmp: 88, map: 84, ldr: 87 } },
    { id: 3052, name: "Sponge", role: "JNG", team: "NS", year: 2026, rating: 82, quality: "Gold", region: "LCK", stats: { mec: 83, tmf: 81, frm: 82, cmp: 80, map: 84, ldr: 80 } },
    { id: 3053, name: "Scout", role: "MID", team: "NS", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 95, tmf: 94, frm: 93, cmp: 96, map: 92, ldr: 94 } },
    { id: 3054, name: "Taeyoon", role: "ADC", team: "NS", year: 2026, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 83, tmf: 80, frm: 82, cmp: 77, map: 75, ldr: 74 } },
    { id: 3055, name: "Lehends", role: "SUP", team: "NS", year: 2026, rating: 93, quality: "Master", region: "LCK", stats: { mec: 83, tmf: 94, frm: 22, cmp: 95, map: 96, ldr: 96 } },

    { id: 3056, name: "DuDu", role: "TOP", team: "DNS", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 84, frm: 86, cmp: 82, map: 83, ldr: 80 } },
    { id: 3057, name: "Pyosik", role: "JNG", team: "DNS", year: 2026, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 86, frm: 87, cmp: 85, map: 86, ldr: 84 } },
    { id: 3058, name: "Clozer", role: "MID", team: "DNS", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 90, tmf: 84, frm: 86, cmp: 83, map: 81, ldr: 80 } },
    { id: 3059, name: "deokdam", role: "ADC", team: "DNS", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 87, frm: 88, cmp: 84, map: 81, ldr: 83 } },
    { id: 3060, name: "Peter", role: "SUP", team: "DNS", year: 2026, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 76, tmf: 84, frm: 19, cmp: 80, map: 85, ldr: 82 } },

    { id: 3061, name: "Casting", role: "TOP", team: "BRO", year: 2026, rating: 79, quality: "Silver", region: "LCK", stats: { mec: 80, tmf: 77, frm: 81, cmp: 75, map: 73, ldr: 72 } },
    { id: 3062, name: "GIDEON", role: "JNG", team: "BRO", year: 2026, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 80, frm: 81, cmp: 78, map: 82, ldr: 77 } },
    { id: 3063, name: "Fisher", role: "MID", team: "BRO", year: 2026, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 84, tmf: 80, frm: 82, cmp: 78, map: 76, ldr: 75 } },
    { id: 3064, name: "Teddy", role: "ADC", team: "BRO", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 86, frm: 89, cmp: 91, map: 80, ldr: 84 } },
    { id: 3065, name: "Namgung", role: "SUP", team: "BRO", year: 2026, rating: 78, quality: "Silver", region: "LCK", stats: { mec: 70, tmf: 79, frm: 16, cmp: 74, map: 80, ldr: 76 } },

    { id: 4441, name: "Rich", role: "TOP", team: "DRX", year: 2026, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 84, tmf: 82, frm: 85, cmp: 81, map: 78, ldr: 79 } },
    { id: 4442, name: "Vincenzo", role: "JNG", team: "DRX", year: 2026, rating: 79, quality: "Silver", region: "LCK", stats: { mec: 81, tmf: 77, frm: 79, cmp: 75, map: 81, ldr: 74 } },
    { id: 4443, name: "ucal", role: "MID", team: "DRX", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 85, frm: 86, cmp: 84, map: 81, ldr: 82 } },
    { id: 4444, name: "Jiwoo", role: "ADC", team: "DRX", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 89, tmf: 85, frm: 87, cmp: 83, map: 80, ldr: 78 } },
    { id: 4445, name: "Andil", role: "SUP", team: "DRX", year: 2026, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 73, tmf: 81, frm: 18, cmp: 78, map: 82, ldr: 81 } },

    // --- 2026 LPL ROSTERS ---
    { id: 1201, name: "Bin", role: "TOP", team: "BLG", year: 2026, rating: 98, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 97, frm: 97, cmp: 96, map: 91, ldr: 90 } },
    { id: 1202, name: "Xun", role: "JNG", team: "BLG", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 88, frm: 90, cmp: 87, map: 88, ldr: 86 } },
    { id: 1203, name: "Knight", role: "MID", team: "BLG", year: 2026, rating: 98, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 98, frm: 97, cmp: 96, map: 95, ldr: 92 } },
    { id: 1204, name: "Viper", role: "ADC", team: "BLG", year: 2026, rating: 96, quality: "Grandmaster", region: "LPL", stats: { mec: 98, tmf: 96, frm: 97, cmp: 95, map: 90, ldr: 88 } },
    { id: 1205, name: "ON", role: "SUP", team: "BLG", year: 2026, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 85, tmf: 88, frm: 20, cmp: 89, map: 90, ldr: 88 } },

    { id: 3086, name: "Xiaoxu", role: "TOP", team: "JDG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 89, tmf: 85, frm: 87, cmp: 82, map: 83, ldr: 81 } },
    { id: 3087, name: "JunJia", role: "JNG", team: "JDG", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 88, frm: 85, cmp: 87, map: 89, ldr: 85 } },
    { id: 3088, name: "HongQ", role: "MID", team: "JDG", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 83, frm: 85, cmp: 80, map: 81, ldr: 79 } },
    { id: 3089, name: "GALA", role: "ADC", team: "JDG", year: 2026, rating: 93, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 94, frm: 94, cmp: 93, map: 88, ldr: 89 } },
    { id: 3090, name: "Vampire", role: "SUP", team: "JDG", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 75, tmf: 83, frm: 18, cmp: 80, map: 84, ldr: 82 } },

    { id: 3091, name: "369", role: "TOP", team: "TES", year: 2026, rating: 92, quality: "Master", region: "LPL", stats: { mec: 90, tmf: 94, frm: 92, cmp: 91, map: 93, ldr: 89 } },
    { id: 3092, name: "naiyou", role: "JNG", team: "TES", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 82, frm: 81, cmp: 80, map: 83, ldr: 81 } },
    { id: 3093, name: "Creme", role: "MID", team: "TES", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 92, tmf: 88, frm: 90, cmp: 86, map: 85, ldr: 84 } },
    { id: 3094, name: "JackeyLove", role: "ADC", team: "TES", year: 2026, rating: 93, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 93, frm: 94, cmp: 91, map: 89, ldr: 92 } },
    { id: 3095, name: "fengyue", role: "SUP", team: "TES", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 74, tmf: 82, frm: 19, cmp: 78, map: 82, ldr: 80 } },

    { id: 3076, name: "Flandre", role: "TOP", team: "AL", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 85, tmf: 88, frm: 87, cmp: 89, map: 83, ldr: 86 } },
    { id: 3077, name: "Tarzan", role: "JNG", team: "AL", year: 2026, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 90, tmf: 92, frm: 89, cmp: 91, map: 93, ldr: 89 } },
    { id: 3078, name: "Shanks", role: "MID", team: "AL", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 85, frm: 86, cmp: 84, map: 83, ldr: 81 } },
    { id: 3079, name: "Hope", role: "ADC", team: "AL", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 87, tmf: 86, frm: 88, cmp: 83, map: 81, ldr: 80 } },
    { id: 3080, name: "Kael", role: "SUP", team: "AL", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 78, tmf: 85, frm: 21, cmp: 83, map: 87, ldr: 85 } },

    { id: 3081, name: "Zika", role: "TOP", team: "WBG", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 91, tmf: 88, frm: 90, cmp: 87, map: 84, ldr: 83 } },
    { id: 3082, name: "Jiejie", role: "JNG", team: "WBG", year: 2026, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 92, frm: 88, cmp: 90, map: 92, ldr: 91 } },
    { id: 3083, name: "Xiaohu", role: "MID", team: "WBG", year: 2026, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 91, frm: 90, cmp: 91, map: 90, ldr: 93 } },
    { id: 3084, name: "Elk", role: "ADC", team: "WBG", year: 2026, rating: 94, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 94, frm: 95, cmp: 91, map: 89, ldr: 87 } },
    { id: 3085, name: "Erha", role: "SUP", team: "WBG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 75, tmf: 83, frm: 20, cmp: 80, map: 84, ldr: 81 } },

    { id: 3096, name: "Soboro", role: "TOP", team: "iG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 79, frm: 83, cmp: 78, map: 76, ldr: 74 } },
    { id: 3097, name: "Wei", role: "JNG", team: "iG", year: 2026, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 92, frm: 85, cmp: 91, map: 93, ldr: 94 } },
    { id: 3098, name: "Rookie", role: "MID", team: "iG", year: 2026, rating: 92, quality: "Master", region: "LPL", stats: { mec: 94, tmf: 91, frm: 92, cmp: 93, map: 90, ldr: 91 } },
    { id: 3099, name: "Photic", role: "ADC", team: "iG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 85, frm: 87, cmp: 84, map: 82, ldr: 81 } },
    { id: 3100, name: "Jwei", role: "SUP", team: "iG", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 76, tmf: 83, frm: 21, cmp: 80, map: 84, ldr: 82 } },

    { id: 3101, name: "HOYA", role: "TOP", team: "NIP", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 81, frm: 84, cmp: 80, map: 79, ldr: 77 } },
    { id: 3102, name: "Guwon", role: "JNG", team: "NIP", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 81, frm: 80, cmp: 80, map: 83, ldr: 79 } },
    { id: 3103, name: "Care", role: "MID", team: "NIP", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 83, frm: 85, cmp: 82, map: 81, ldr: 80 } },
    { id: 3104, name: "Assum", role: "ADC", team: "NIP", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 86, tmf: 83, frm: 85, cmp: 81, map: 78, ldr: 79 } },
    { id: 3105, name: "Zhuo", role: "SUP", team: "NIP", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 76, tmf: 84, frm: 21, cmp: 81, map: 85, ldr: 83 } },

    { id: 3106, name: "Cube", role: "TOP", team: "WE", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 80, frm: 84, cmp: 79, map: 77, ldr: 76 } },
    { id: 3107, name: "Monki", role: "JNG", team: "WE", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 81, tmf: 82, frm: 79, cmp: 78, map: 81, ldr: 79 } },
    { id: 3108, name: "Karis", role: "MID", team: "WE", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 81, frm: 83, cmp: 79, map: 78, ldr: 76 } },
    { id: 3109, name: "About", role: "ADC", team: "WE", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 81, tmf: 77, frm: 80, cmp: 75, map: 74, ldr: 72 } },
    { id: 3110, name: "yaoyao", role: "SUP", team: "WE", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 73, tmf: 81, frm: 20, cmp: 78, map: 82, ldr: 81 } },

    { id: 3111, name: "Zdz", role: "TOP", team: "EDG", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 82, frm: 84, cmp: 80, map: 78, ldr: 77 } },
    { id: 3112, name: "Xiaohao", role: "JNG", team: "EDG", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 83, frm: 82, cmp: 81, map: 84, ldr: 82 } },
    { id: 3113, name: "Angel", role: "MID", team: "EDG", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 84, frm: 86, cmp: 85, map: 84, ldr: 83 } },
    { id: 3114, name: "Leave", role: "ADC", team: "EDG", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 87, tmf: 83, frm: 85, cmp: 80, map: 79, ldr: 77 } },
    { id: 3115, name: "Parukia", role: "SUP", team: "EDG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 73, tmf: 81, frm: 19, cmp: 78, map: 82, ldr: 80 } },

    { id: 3116, name: "Keshi", role: "TOP", team: "TT", year: 2026, rating: 77, quality: "Silver", region: "LPL", stats: { mec: 78, tmf: 75, frm: 79, cmp: 73, map: 71, ldr: 70 } },
    { id: 3117, name: "Junhao", role: "JNG", team: "TT", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 79, tmf: 76, frm: 78, cmp: 74, map: 79, ldr: 75 } },
    { id: 3118, name: "Heru", role: "MID", team: "TT", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 81, tmf: 77, frm: 80, cmp: 75, map: 75, ldr: 72 } },
    { id: 3119, name: "Ryan3", role: "ADC", team: "TT", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 80, tmf: 76, frm: 79, cmp: 75, map: 73, ldr: 71 } },
    { id: 3120, name: "Feather", role: "SUP", team: "TT", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 72, tmf: 79, frm: 17, cmp: 76, map: 81, ldr: 80 } },

    { id: 3121, name: "sheer", role: "TOP", team: "LNG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 84, frm: 86, cmp: 83, map: 80, ldr: 79 } },
    { id: 3122, name: "Croco", role: "JNG", team: "LNG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 86, frm: 84, cmp: 84, map: 87, ldr: 85 } },
    { id: 3123, name: "BuLLDoG", role: "MID", team: "LNG", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 82, frm: 84, cmp: 80, map: 79, ldr: 77 } },
    { id: 3124, name: "1xn", role: "ADC", team: "LNG", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 81, frm: 84, cmp: 79, map: 76, ldr: 75 } },
    { id: 3125, name: "MISSING", role: "SUP", team: "LNG", year: 2026, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 83, tmf: 92, frm: 24, cmp: 91, map: 93, ldr: 91 } },

    { id: 3126, name: "Hery", role: "TOP", team: "OMG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 79, frm: 83, cmp: 78, map: 76, ldr: 75 } },
    { id: 3127, name: "Juhan", role: "JNG", team: "OMG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 81, frm: 82, cmp: 80, map: 83, ldr: 80 } },
    { id: 3128, name: "haichao", role: "MID", team: "OMG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 81, frm: 82, cmp: 79, map: 78, ldr: 77 } },
    { id: 3129, name: "Starry", role: "ADC", team: "OMG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 81, frm: 83, cmp: 80, map: 77, ldr: 76 } },
    { id: 3130, name: "Moham", role: "SUP", team: "OMG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 74, tmf: 82, frm: 19, cmp: 79, map: 83, ldr: 81 } },

    { id: 3131, name: "sasi", role: "TOP", team: "LGD", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 80, tmf: 77, frm: 81, cmp: 76, map: 73, ldr: 72 } },
    { id: 3132, name: "Heng", role: "JNG", team: "LGD", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 81, frm: 82, cmp: 79, map: 83, ldr: 81 } },
    { id: 3133, name: "Tangyuan", role: "MID", team: "LGD", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 77, ldr: 75 } },
    { id: 3134, name: "Shaoye", role: "ADC", team: "LGD", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 78, frm: 81, cmp: 77, map: 76, ldr: 74 } },
    { id: 3135, name: "Ycx", role: "SUP", team: "LGD", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 71, tmf: 78, frm: 16, cmp: 75, map: 80, ldr: 78 } },

    { id: 3136, name: "Liangchen", role: "TOP", team: "UP", year: 2026, rating: 76, quality: "Silver", region: "LPL", stats: { mec: 77, tmf: 74, frm: 78, cmp: 73, map: 71, ldr: 70 } },
    { id: 3137, name: "Grizzly", role: "JNG", team: "UP", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 81, tmf: 79, frm: 78, cmp: 78, map: 81, ldr: 77 } },
    { id: 3138, name: "Saber", role: "MID", team: "UP", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 80, tmf: 76, frm: 79, cmp: 75, map: 74, ldr: 72 } },
    { id: 3139, name: "Hena", role: "ADC", team: "UP", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 79, frm: 81, cmp: 77, map: 75, ldr: 74 } },
    { id: 3140, name: "Xiaoxia", role: "SUP", team: "UP", year: 2026, rating: 77, quality: "Silver", region: "LPL", stats: { mec: 68, tmf: 77, frm: 15, cmp: 75, map: 79, ldr: 76 } },

    // --- 2026 LEC ROSTERS ---
    { id: 1301, name: "BrokenBlade", role: "TOP", team: "G2", year: 2026, rating: 89, quality: "Diamond", region: "LEC", stats: { mec: 87, tmf: 91, frm: 88, cmp: 90, map: 86, ldr: 90 } },
    { id: 1302, name: "SkewMond", role: "JNG", team: "G2", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 86, tmf: 85, frm: 84, cmp: 82, map: 85, ldr: 80 } },
    { id: 1303, name: "Caps", role: "MID", team: "G2", year: 2026, rating: 96, quality: "Grandmaster", region: "LEC", stats: { mec: 96, tmf: 97, frm: 95, cmp: 98, map: 96, ldr: 97 } },
    { id: 1304, name: "Hans Sama", role: "ADC", team: "G2", year: 2026, rating: 89, quality: "Diamond", region: "LEC", stats: { mec: 90, tmf: 88, frm: 90, cmp: 87, map: 84, ldr: 83 } },
    { id: 1305, name: "Labrov", role: "SUP", team: "G2", year: 2026, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 82, tmf: 89, frm: 18, cmp: 88, map: 90, ldr: 86 } },

    { id: 3001, name: "Canna", role: "TOP", team: "KC", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 80, frm: 84, cmp: 78, map: 79, ldr: 76 } },
    { id: 3002, name: "Yike", role: "JNG", team: "KC", year: 2026, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 89, tmf: 87, frm: 84, cmp: 86, map: 86, ldr: 84 } },
    { id: 3003, name: "Kyeahoo", role: "MID", team: "KC", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 81, frm: 82, cmp: 80, map: 79, ldr: 77 } },
    { id: 3004, name: "Caliste", role: "ADC", team: "KC", year: 2026, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 91, tmf: 87, frm: 89, cmp: 84, map: 80, ldr: 79 } },
    { id: 3005, name: "Busio", role: "SUP", team: "KC", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 75, tmf: 83, frm: 20, cmp: 81, map: 86, ldr: 84 } },

    { id: 3006, name: "Sparda", role: "TOP", team: "NAVI", year: 2026, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 76, tmf: 75, frm: 78, cmp: 74, map: 73, ldr: 71 } },
    { id: 3007, name: "Rabble", role: "JNG", team: "NAVI", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 77, tmf: 76, frm: 77, cmp: 75, map: 74, ldr: 73 } },
    { id: 3008, name: "Poby", role: "MID", team: "NAVI", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 81, tmf: 77, frm: 79, cmp: 76, map: 76, ldr: 73 } },
    { id: 3009, name: "Hans SamD", role: "ADC", team: "NAVI", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 81, frm: 84, cmp: 79, map: 78, ldr: 76 } },
    { id: 3010, name: "Parus", role: "SUP", team: "NAVI", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 74, tmf: 78, frm: 19, cmp: 75, map: 80, ldr: 77 } },

    { id: 3011, name: "Naak Nako", role: "TOP", team: "VIT", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 76, ldr: 74 } },
    { id: 3012, name: "Lyncas", role: "JNG", team: "VIT", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 82, frm: 80, cmp: 81, map: 84, ldr: 81 } },
    { id: 3013, name: "Humanoid", role: "MID", team: "VIT", year: 2026, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 89, tmf: 87, frm: 88, cmp: 86, map: 84, ldr: 86 } },
    { id: 3014, name: "Carzzy", role: "ADC", team: "VIT", year: 2026, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 86, frm: 86, cmp: 88, map: 82, ldr: 84 } },
    { id: 3015, name: "Fleshy", role: "SUP", team: "VIT", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 74, tmf: 81, frm: 18, cmp: 79, map: 83, ldr: 82 } },

    { id: 3016, name: "Tracyn", role: "TOP", team: "TH", year: 2026, rating: 77, quality: "Silver", region: "LEC", stats: { mec: 79, tmf: 75, frm: 78, cmp: 74, map: 71, ldr: 70 } },
    { id: 3017, name: "Sheo", role: "JNG", team: "TH", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 85, frm: 82, cmp: 82, map: 84, ldr: 81 } },
    { id: 3018, name: "Serin", role: "MID", team: "TH", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 80, frm: 82, cmp: 78, map: 77, ldr: 76 } },
    { id: 3019, name: "Ice", role: "ADC", team: "TH", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 84, frm: 86, cmp: 81, map: 79, ldr: 78 } },
    { id: 3020, name: "Stend", role: "SUP", team: "TH", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 72, tmf: 79, frm: 22, cmp: 78, map: 81, ldr: 80 } },

    { id: 3021, name: "Lot", role: "TOP", team: "GX", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 79, frm: 82, cmp: 77, map: 75, ldr: 74 } },
    { id: 3022, name: "ISMA", role: "JNG", team: "GX", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 82, frm: 81, cmp: 80, map: 83, ldr: 81 } },
    { id: 3023, name: "Jackies", role: "MID", team: "GX", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 83, frm: 84, cmp: 82, map: 79, ldr: 78 } },
    { id: 3024, name: "Noah", role: "ADC", team: "GX", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 85, frm: 87, cmp: 83, map: 81, ldr: 80 } },
    { id: 3025, name: "Jun", role: "SUP", team: "GX", year: 2026, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 76, tmf: 86, frm: 22, cmp: 85, map: 89, ldr: 86 } },

    { id: 3026, name: "Myrwn", role: "TOP", team: "MKOI", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 84, frm: 83, cmp: 82, map: 80, ldr: 79 } },
    { id: 3027, name: "Elyoya", role: "JNG", team: "MKOI", year: 2026, rating: 91, quality: "Diamond", region: "LEC", stats: { mec: 88, tmf: 91, frm: 82, cmp: 93, map: 92, ldr: 95 } },
    { id: 3028, name: "Jojopyun", role: "MID", team: "MKOI", year: 2026, rating: 89, quality: "Diamond", region: "LEC", stats: { mec: 91, tmf: 87, frm: 89, cmp: 84, map: 85, ldr: 86 } },
    { id: 3029, name: "Supa", role: "ADC", team: "MKOI", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 85, frm: 85, cmp: 81, map: 76, ldr: 78 } },
    { id: 3030, name: "Alvaro", role: "SUP", team: "MKOI", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 74, tmf: 85, frm: 21, cmp: 86, map: 88, ldr: 87 } },

    { id: 3036, name: "Baus", role: "TOP", team: "LR", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 74, frm: 92, cmp: 78, map: 70, ldr: 83 } },
    { id: 3037, name: "Velja", role: "JNG", team: "LR", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 81, cmp: 78, map: 82, ldr: 79 } },
    { id: 3038, name: "Nemesis", role: "MID", team: "LR", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 85, frm: 89, cmp: 87, map: 83, ldr: 84 } },
    { id: 3039, name: "Crownie", role: "ADC", team: "LR", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 84, frm: 86, cmp: 82, map: 79, ldr: 81 } },
    { id: 3040, name: "Rekkles", role: "SUP", team: "LR", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 78, tmf: 85, frm: 28, cmp: 89, map: 88, ldr: 90 } },

    { id: 3041, name: "Rooster", role: "TOP", team: "Shifters", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 79, frm: 83, cmp: 76, map: 74, ldr: 72 } },
    { id: 3042, name: "Boukada", role: "JNG", team: "Shifters", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 80, tmf: 78, frm: 77, cmp: 76, map: 80, ldr: 77 } },
    { id: 3043, name: "nuc", role: "MID", team: "Shifters", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 82, frm: 84, cmp: 80, map: 79, ldr: 78 } },
    { id: 3044, name: "Paduck", role: "ADC", team: "Shifters", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 76, ldr: 75 } },
    { id: 3045, name: "Trymbi", role: "SUP", team: "Shifters", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 75, tmf: 84, frm: 20, cmp: 85, map: 88, ldr: 89 } },

    { id: 3046, name: "Wunder", role: "TOP", team: "SK", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 82, tmf: 86, frm: 85, cmp: 89, map: 84, ldr: 88 } },
    { id: 3047, name: "Skeanz", role: "JNG", team: "SK", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 81, cmp: 79, map: 82, ldr: 79 } },
    { id: 3048, name: "LIDER", role: "MID", team: "SK", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 88, tmf: 82, frm: 80, cmp: 81, map: 75, ldr: 77 } },
    { id: 3049, name: "Jopa", role: "ADC", team: "SK", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 81, frm: 83, cmp: 79, map: 76, ldr: 75 } },
    { id: 3050, name: "Mikyx", role: "SUP", team: "SK", year: 2026, rating: 91, quality: "Diamond", region: "LEC", stats: { mec: 85, tmf: 92, frm: 24, cmp: 91, map: 93, ldr: 94 } },

    { id: 3051, name: "Tao", role: "TOP", team: "KCB", year: 2026, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 80, tmf: 76, frm: 79, cmp: 74, map: 73, ldr: 71 } },
    { id: 3052, name: "Yukino", role: "JNG", team: "KCB", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 81, tmf: 78, frm: 77, cmp: 75, map: 80, ldr: 76 } },
    { id: 3053, name: "Kamiloo", role: "MID", team: "KCB", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 82, tmf: 77, frm: 80, cmp: 76, map: 75, ldr: 73 } },
    { id: 3054, name: "Hazel", role: "ADC", team: "KCB", year: 2026, rating: 77, quality: "Silver", region: "LEC", stats: { mec: 79, tmf: 76, frm: 78, cmp: 74, map: 73, ldr: 71 } },
    { id: 3055, name: "Prime", role: "SUP", team: "KCB", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 74, tmf: 82, frm: 19, cmp: 79, map: 83, ldr: 82 } },

    // --- 2026 LCS ROSTERS ---
    { id: 1431, name: "Thanatos", role: "TOP", team: "C9", year: 2026, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 88, tmf: 85, frm: 87, cmp: 83, map: 82, ldr: 80 } },
    { id: 1432, name: "Blaber", role: "JNG", team: "C9", year: 2026, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 89, tmf: 87, frm: 88, cmp: 86, map: 89, ldr: 90 } },
    { id: 1433, name: "APA", role: "MID", team: "C9", year: 2026, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 84, tmf: 82, frm: 85, cmp: 80, map: 81, ldr: 82 } },
    { id: 1434, name: "Zven", role: "ADC", team: "C9", year: 2026, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 84, tmf: 86, frm: 87, cmp: 88, map: 83, ldr: 85 } },
    { id: 1435, name: "Vulcan", role: "SUP", team: "C9", year: 2026, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 80, tmf: 85, frm: 15, cmp: 83, map: 86, ldr: 86 } },

    { id: 1401, name: "Morgan", role: "TOP", team: "TL", year: 2026, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 83, tmf: 88, frm: 86, cmp: 85, map: 84, ldr: 83 } },
    { id: 1402, name: "Josedeodo", role: "JNG", team: "TL", year: 2026, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 85, tmf: 84, frm: 83, cmp: 82, map: 85, ldr: 84 } },
    { id: 1403, name: "Quid", role: "MID", team: "TL", year: 2026, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 87, tmf: 85, frm: 88, cmp: 83, map: 84, ldr: 82 } },
    { id: 1404, name: "Yeon", role: "ADC", team: "TL", year: 2026, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 86, tmf: 84, frm: 87, cmp: 82, map: 80, ldr: 78 } },
    { id: 1405, name: "CoreJJ", role: "SUP", team: "TL", year: 2026, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 78, tmf: 89, frm: 16, cmp: 92, map: 94, ldr: 96 } },

    // ==========================================
    // --- 2. 2024 SEASON ROSTERS (PLAYERS & COACH) ---
    // ==========================================
    { id: 801, name: "kkOma", role: "COACH", team: "T1", year: 2024, rating: 98, quality: "Master", region: "LCK", stats: { mec: 20, tmf: 95, frm: 15, cmp: 98, map: 99, ldr: 99 } },
    { id: 101, name: "Faker", role: "MID", team: "T1", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 95, tmf: 99, frm: 94, cmp: 99, map: 98, ldr: 99 } },
    { id: 102, name: "Zeus", role: "TOP", team: "T1", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 95, cmp: 91, map: 85, ldr: 82 } },
    { id: 103, name: "Oner", role: "JNG", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 88, cmp: 89, map: 91, ldr: 87 } },
    { id: 104, name: "Gumayusi", role: "ADC", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 98, map: 82, ldr: 84 } },
    { id: 105, name: "Keria", role: "SUP", team: "T1", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 85, tmf: 92, frm: 25, cmp: 95, map: 96, ldr: 90 } },
    
    { id: 111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 88, ldr: 89 } },
    { id: 112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2024, rating: 96, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 95, frm: 98, cmp: 94, map: 97, ldr: 90 } },
    { id: 113, name: "Chovy", role: "MID", team: "Gen.G", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 99, tmf: 96, frm: 99, cmp: 96, map: 92, ldr: 88 } },
    { id: 114, name: "Peyz", role: "ADC", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 97, frm: 94, cmp: 92, map: 85, ldr: 82 } },
    { id: 115, name: "Lehends", role: "SUP", team: "Gen.G", year: 2024, rating: 92, quality: "Master", region: "LCK", stats: { mec: 82, tmf: 93, frm: 25, cmp: 94, map: 95, ldr: 93 } },
    
    { id: 121, name: "Doran", role: "TOP", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 90, tmf: 88, frm: 90, cmp: 84, map: 82, ldr: 85 } },
    { id: 122, name: "Peanut", role: "JNG", team: "HLE", year: 2024, rating: 92, quality: "Master", region: "LCK", stats: { mec: 86, tmf: 94, frm: 88, cmp: 93, map: 96, ldr: 95 } },
    { id: 123, name: "Zeka", role: "MID", team: "HLE", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 93, cmp: 88, map: 86, ldr: 83 } },
    { id: 124, name: "Viper", role: "ADC", team: "HLE", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 96, tmf: 95, frm: 94, cmp: 91, map: 88, ldr: 86 } },
    { id: 125, name: "Delight", role: "SUP", team: "HLE", year: 2024, rating: 90, quality: "Diamond", region: "LCK", stats: { mec: 82, tmf: 93, frm: 25, cmp: 88, map: 91, ldr: 86 } },
    
    { id: 131, name: "Kingen", role: "TOP", team: "DK", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 86, tmf: 89, frm: 87, cmp: 85, map: 81, ldr: 84 } },
    { id: 132, name: "Lucid", role: "JNG", team: "DK", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 85, frm: 86, cmp: 83, map: 85, ldr: 81 } },
    { id: 133, name: "ShowMaker", role: "MID", team: "DK", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 91, cmp: 92, map: 90, ldr: 91 } },
    { id: 134, name: "Aiming", role: "ADC", team: "DK", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 91, tmf: 88, frm: 90, cmp: 87, map: 82, ldr: 81 } },
    { id: 135, name: "Kellin", role: "SUP", team: "DK", year: 2024, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 82, tmf: 84, frm: 20, cmp: 85, map: 86, ldr: 82 } },
    
    { id: 141, name: "Clear", role: "TOP", team: "FOX", year: 2024, rating: 77, quality: "Silver", region: "LCK", stats: { mec: 78, tmf: 76, frm: 79, cmp: 74, map: 72, ldr: 70 } },
    { id: 142, name: "Willer", role: "JNG", team: "FOX", year: 2024, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 80, frm: 81, cmp: 78, map: 82, ldr: 77 } },
    { id: 143, name: "Clozer", role: "MID", team: "FOX", year: 2024, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 86, tmf: 81, frm: 83, cmp: 80, map: 77, ldr: 75 } },
    { id: 144, name: "Hena", role: "ADC", team: "FOX", year: 2024, rating: 78, quality: "Silver", region: "LCK", stats: { mec: 79, tmf: 78, frm: 80, cmp: 76, map: 73, ldr: 72 } },
    { id: 145, name: "Execute", role: "SUP", team: "FOX", year: 2024, rating: 76, quality: "Silver", region: "LCK", stats: { mec: 72, tmf: 75, frm: 18, cmp: 74, map: 76, ldr: 73 } },
    
    { id: 151, name: "PerfecT", role: "TOP", team: "KT", year: 2024, rating: 82, quality: "Gold", region: "LCK", stats: { mec: 84, tmf: 80, frm: 83, cmp: 79, map: 80, ldr: 75 } },
    { id: 152, name: "Pyosik", role: "JNG", team: "KT", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 85, frm: 86, cmp: 84, map: 87, ldr: 83 } },
    { id: 153, name: "Bdd", role: "MID", team: "KT", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 88, tmf: 90, frm: 91, cmp: 89, map: 88, ldr: 87 } },
    { id: 154, name: "Deft", role: "ADC", team: "KT", year: 2024, rating: 88, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 90, frm: 89, cmp: 88, map: 86, ldr: 91 } },
    { id: 155, name: "BeryL", role: "SUP", team: "KT", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 80, tmf: 88, frm: 20, cmp: 92, map: 93, ldr: 94 } },
    
    { id: 161, name: "DuDu", role: "TOP", team: "KDF", year: 2024, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 85, tmf: 81, frm: 84, cmp: 80, map: 81, ldr: 79 } },
    { id: 162, name: "Cuzz", role: "JNG", team: "KDF", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 84, tmf: 87, frm: 85, cmp: 85, map: 88, ldr: 86 } },
    { id: 163, name: "BullDog", role: "MID", team: "KDF", year: 2024, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 79, frm: 81, cmp: 78, map: 79, ldr: 76 } },
    { id: 164, name: "Bull", role: "ADC", team: "KDF", year: 2024, rating: 74, quality: "Silver", region: "LCK", stats: { mec: 76, tmf: 73, frm: 75, cmp: 72, map: 71, ldr: 70 } },
    { id: 165, name: "Andil", role: "SUP", team: "KDF", year: 2024, rating: 75, quality: "Silver", region: "LCK", stats: { mec: 75, tmf: 74, frm: 60, cmp: 73, map: 76, ldr: 72 } },
    
    { id: 201, name: "Bin", role: "TOP", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 95, frm: 96, cmp: 94, map: 89, ldr: 88 } },
    { id: 202, name: "Xun", role: "JNG", team: "BLG", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 91, tmf: 89, frm: 92, cmp: 88, map: 89, ldr: 87 } },
    { id: 203, name: "Knight", role: "MID", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL", stats: { mec: 98, tmf: 97, frm: 96, cmp: 95, map: 94, ldr: 90 } },
    { id: 204, name: "Elk", role: "ADC", team: "BLG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL", stats: { mec: 96, tmf: 95, frm: 95, cmp: 92, map: 88, ldr: 85 } },
    { id: 205, name: "ON", role: "SUP", team: "BLG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 90, frm: 28, cmp: 90, map: 91, ldr: 86 } },
    
    { id: 211, name: "Flandre", role: "TOP", team: "JDG", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 89, frm: 88, cmp: 90, map: 85, ldr: 88 } },
    { id: 212, name: "Kanavi", role: "JNG", team: "JDG", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 93, frm: 96, cmp: 92, map: 94, ldr: 89 } },
    { id: 213, name: "Yagao", role: "MID", team: "JDG", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 92, frm: 90, cmp: 89, map: 91, ldr: 90 } },
    { id: 214, name: "Ruler", role: "ADC", team: "JDG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 89, ldr: 90 } },
    { id: 215, name: "MISSING", role: "SUP", team: "JDG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 85, tmf: 92, frm: 22, cmp: 90, map: 93, ldr: 90 } },
    
    { id: 221, name: "369", role: "TOP", team: "TES", year: 2024, rating: 93, quality: "Master", region: "LPL", stats: { mec: 91, tmf: 95, frm: 93, cmp: 92, map: 94, ldr: 90 } },
    { id: 222, name: "Tian", role: "JNG", team: "TES", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 91, frm: 89, cmp: 90, map: 92, ldr: 91 } },
    { id: 223, name: "Creme", role: "MID", team: "TES", year: 2024, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 92, tmf: 88, frm: 90, cmp: 86, map: 85, ldr: 82 } },
    { id: 224, name: "JackeyLove", role: "ADC", team: "TES", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 96, tmf: 94, frm: 95, cmp: 92, map: 90, ldr: 93 } },
    { id: 225, name: "Meiko", role: "SUP", team: "TES", year: 2024, rating: 92, quality: "Master", region: "LPL", stats: { mec: 88, tmf: 93, frm: 80, cmp: 92, map: 95, ldr: 96 } },
    
    { id: 231, name: "shanji", role: "TOP", team: "NIP", year: 2024, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 83, frm: 84, cmp: 82, map: 81, ldr: 80 } },
    { id: 232, name: "AKi", role: "JNG", team: "NIP", year: 2024, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 81, tmf: 83, frm: 82, cmp: 80, map: 83, ldr: 81 } },
    { id: 233, name: "Rookie", role: "MID", team: "NIP", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 90, tmf: 87, frm: 88, cmp: 89, map: 86, ldr: 90 } },
    { id: 234, name: "Photic", role: "ADC", team: "NIP", year: 2024, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 84, frm: 85, cmp: 83, map: 82, ldr: 80 } },
    { id: 235, name: "Zhuo", role: "SUP", team: "NIP", year: 2024, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 80, tmf: 81, frm: 65, cmp: 79, map: 81, ldr: 78 } },
   
    { id: 241, name: "Breathe", role: "TOP", team: "WBG", year: 2024, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 87, tmf: 85, frm: 88, cmp: 85, map: 84, ldr: 82 } },
    { id: 242, name: "Tarzan", role: "JNG", team: "WBG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 92, frm: 90, cmp: 91, map: 93, ldr: 89 } },
    { id: 243, name: "Xiaohu", role: "MID", team: "WBG", year: 2024, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 87, tmf: 90, frm: 89, cmp: 91, map: 90, ldr: 92 } },
    { id: 244, name: "Light", role: "ADC", team: "WBG", year: 2024, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 87, frm: 89, cmp: 85, map: 84, ldr: 83 } },
    { id: 245, name: "Crisp", role: "SUP", team: "WBG", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 89, frm: 75, cmp: 88, map: 90, ldr: 89 } },
   
    { id: 301, name: "BrokenBlade", role: "TOP", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 85, tmf: 89, frm: 86, cmp: 88, map: 84, ldr: 88 } },
    { id: 302, name: "Yike", role: "JNG", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 86, frm: 87, cmp: 85, map: 86, ldr: 82 } },
    { id: 303, name: "Caps", role: "MID", team: "G2", year: 2024, rating: 95, quality: "Grandmaster", region: "LEC", stats: { mec: 95, tmf: 96, frm: 94, cmp: 97, map: 95, ldr: 96 } },
    { id: 304, name: "Hans Sama", role: "ADC", team: "G2", year: 2024, rating: 90, quality: "Diamond", region: "LEC", stats: { mec: 91, tmf: 89, frm: 91, cmp: 88, map: 85, ldr: 84 } },
    { id: 305, name: "Mikyx", role: "SUP", team: "G2", year: 2024, rating: 92, quality: "Master", region: "LEC", stats: { mec: 86, tmf: 93, frm: 25, cmp: 94, map: 94, ldr: 92 } },
   
    { id: 311, name: "Oscarinin", role: "TOP", team: "FNC", year: 2024, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 83, frm: 85, cmp: 82, map: 81, ldr: 79 } },
    { id: 312, name: "Razork", role: "JNG", team: "FNC", year: 2024, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 89, frm: 86, cmp: 87, map: 88, ldr: 90 } },
    { id: 313, name: "Humanoid", role: "MID", team: "FNC", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 86, frm: 88, cmp: 86, map: 85, ldr: 84 } },
    { id: 314, name: "Noah", role: "ADC", team: "FNC", year: 2024, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 84, frm: 86, cmp: 83, map: 82, ldr: 80 } },
    { id: 315, name: "Jun", role: "SUP", team: "FNC", year: 2024, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 85, frm: 74, cmp: 86, map: 85, ldr: 83 } },
    
    { id: 321, name: "Myrwn", role: "TOP", team: "MAD", year: 2024, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 82, cmp: 85, map: 79, ldr: 78 } },
    { id: 322, name: "Elyoya", role: "JNG", team: "MAD", year: 2024, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 85, tmf: 87, frm: 85, cmp: 86, map: 88, ldr: 91 } },
    { id: 323, name: "Fresskowy", role: "MID", team: "MAD", year: 2024, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 80, tmf: 77, frm: 79, cmp: 76, map: 77, ldr: 75 } },
    { id: 324, name: "Supa", role: "ADC", team: "MAD", year: 2024, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 80 } },
    { id: 325, name: "Alvaro", role: "SUP", team: "MAD", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 84, frm: 70, cmp: 82, map: 83, ldr: 81 } },
    
    { id: 331, name: "Photon", role: "TOP", team: "VIT", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 82, frm: 84, cmp: 81, map: 80, ldr: 78 } },
    { id: 332, name: "Lyncas", role: "JNG", team: "VIT", year: 2024, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 80, tmf: 78, frm: 79, cmp: 77, map: 80, ldr: 76 } },
    { id: 333, name: "Vetheo", role: "MID", team: "VIT", year: 2024, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 77 } },
    { id: 334, name: "Carzzy", role: "ADC", team: "VIT", year: 2024, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 86, tmf: 85, frm: 86, cmp: 83, map: 82, ldr: 84 } },
    { id: 335, name: "Hylissang", role: "SUP", team: "VIT", year: 2024, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 82, frm: 65, cmp: 80, map: 83, ldr: 85 } },
    
    { id: 341, name: "Wunder", role: "TOP", team: "TH", year: 2024, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 83, frm: 84, cmp: 85, map: 83, ldr: 84 } },
    { id: 342, name: "Jankos", role: "JNG", team: "TH", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 85, frm: 82, cmp: 84, map: 88, ldr: 89 } },
    { id: 343, name: "Zwyroo", role: "MID", team: "TH", year: 2024, rating: 75, quality: "Silver", region: "LEC", stats: { mec: 79, tmf: 78, frm: 80, cmp: 76, map: 77, ldr: 75 } },
    { id: 344, name: "Flakked", role: "ADC", team: "TH", year: 2024, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 83, tmf: 81, frm: 84, cmp: 80, map: 78, ldr: 77 } },
    { id: 345, name: "Trymbi", role: "SUP", team: "TH", year: 2024, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 77, tmf: 84, frm: 21, cmp: 82, map: 86, ldr: 85 } },
    
    { id: 401, name: "Impact", role: "TOP", team: "TL", year: 2024, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 82, tmf: 89, frm: 86, cmp: 88, map: 86, ldr: 94 } },
    { id: 402, name: "UmTi", role: "JNG", team: "TL", year: 2024, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 83, tmf: 86, frm: 84, cmp: 85, map: 88, ldr: 87 } },
    { id: 403, name: "Apa", role: "MID", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 79, frm: 80, cmp: 76, map: 75, ldr: 74 } },
    { id: 404, name: "Yeon", role: "ADC", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 81, tmf: 78, frm: 81, cmp: 77, map: 74, ldr: 72 } },
    { id: 405, name: "CoreJJ", role: "SUP", team: "TL", year: 2024, rating: 89, quality: "Diamond", region: "LCS", stats: { mec: 80, tmf: 90, frm: 22, cmp: 91, map: 93, ldr: 96 } },
   
    { id: 411, name: "Bwipo", role: "TOP", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 85, frm: 84, cmp: 88, map: 83, ldr: 86 } },
    { id: 412, name: "Inspired", role: "JNG", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 87, tmf: 88, frm: 89, cmp: 87, map: 90, ldr: 89 } },
    { id: 413, name: "Quad", role: "MID", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 86, tmf: 83, frm: 85, cmp: 82, map: 82, ldr: 80 } },
    { id: 414, name: "Massu", role: "ADC", team: "FLY", year: 2024, rating: 82, quality: "Gold", region: "LCS", stats: { mec: 84, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 78 } },
    { id: 415, name: "Busio", role: "SUP", team: "FLY", year: 2024, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 84, frm: 65, cmp: 82, map: 83, ldr: 81 } },
    
    { id: 421, name: "Dhokla", role: "TOP", team: "NRG", year: 2024, rating: 76, quality: "Silver", region: "LCS", stats: { mec: 77, tmf: 76, frm: 77, cmp: 75, map: 74, ldr: 75 } },
    { id: 422, name: "Contractz", role: "JNG", team: "NRG", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 79, frm: 78, cmp: 77, map: 81, ldr: 82 } },
    { id: 423, name: "Palafox", role: "MID", team: "NRG", year: 2024, rating: 78, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 78, frm: 79, cmp: 76, map: 77, ldr: 76 } },
    { id: 424, name: "FBI", role: "ADC", team: "NRG", year: 2024, rating: 81, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 81, frm: 82, cmp: 79, map: 80, ldr: 81 } },
    { id: 425, name: "huhi", role: "SUP", team: "NRG", year: 2024, rating: 80, quality: "Gold", region: "LCS", stats: { mec: 78, tmf: 81, frm: 65, cmp: 80, map: 82, ldr: 84 } },
   
    { id: 431, name: "Fudge", role: "TOP", team: "C9", year: 2024, rating: 82, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 81, frm: 84, cmp: 80, map: 80, ldr: 79 } },
    { id: 432, name: "Blaber", role: "JNG", team: "C9", year: 2024, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 87, tmf: 85, frm: 86, cmp: 85, map: 87, ldr: 88 } },
    { id: 433, name: "Jojopyun", role: "MID", team: "C9", year: 2024, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 88, tmf: 84, frm: 85, cmp: 83, map: 82, ldr: 83 } },
    { id: 434, name: "Berserker", role: "ADC", team: "C9", year: 2024, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 91, tmf: 88, frm: 90, cmp: 85, map: 84, ldr: 82 } },
    { id: 435, name: "Vulcan", role: "SUP", team: "C9", year: 2024, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 84, frm: 65, cmp: 82, map: 84, ldr: 84 } },
   
    { id: 441, name: "Sniper", role: "TOP", team: "100T", year: 2024, rating: 76, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 74, frm: 77, cmp: 73, map: 72, ldr: 70 } },
    { id: 442, name: "River", role: "JNG", team: "100T", year: 2024, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 83, frm: 82, cmp: 84, map: 85, ldr: 82 } },
    { id: 443, name: "Quid", role: "MID", team: "100T", year: 2024, rating: 81, quality: "Gold", region: "LCS", stats: { mec: 84, tmf: 80, frm: 82, cmp: 79, map: 78, ldr: 77 } },
    { id: 444, name: "Meech", role: "ADC", team: "100T", year: 2024, rating: 72, quality: "Silver", region: "LCS", stats: { mec: 74, tmf: 71, frm: 74, cmp: 70, map: 69, ldr: 68 } },
    { id: 445, name: "Eyla", role: "SUP", team: "100T", year: 2024, rating: 74, quality: "Silver", region: "LCS", stats: { mec: 73, tmf: 75, frm: 60, cmp: 74, map: 76, ldr: 72 } },
    
    { id: 451, name: "Rich", role: "TOP", team: "DIG", year: 2024, rating: 77, quality: "Silver", region: "LCS", stats: { mec: 79, tmf: 76, frm: 78, cmp: 75, map: 74, ldr: 73 } },
    { id: 452, name: "Spica", role: "JNG", team: "DIG", year: 2024, rating: 81, quality: "Gold", region: "LCS", stats: { mec: 82, tmf: 81, frm: 82, cmp: 80, map: 83, ldr: 82 } },
    { id: 453, name: "Dove", role: "MID", team: "DIG", year: 2024, rating: 76, quality: "Silver", region: "LCS", stats: { mec: 78, tmf: 76, frm: 78, cmp: 75, map: 75, ldr: 74 } },
    { id: 454, name: "Zven", role: "ADC", team: "DIG", year: 2024, rating: 82, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 83, frm: 84, cmp: 81, map: 80, ldr: 84 } },
    { id: 455, name: "Isles", role: "SUP", team: "DIG", year: 2024, rating: 73, quality: "Silver", region: "LCS", stats: { mec: 72, tmf: 74, frm: 55, cmp: 73, map: 75, ldr: 71 } },

    // ==========================================
    // --- 3. WORLD CHAMPIONS (Legacy Wildcards) ---
    // ==========================================
    { id: 9001, name: "Faker", role: "MID", team: "SKT", year: 2015, rating: 99, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 99, frm: 98, cmp: 99, map: 98, ldr: 99 } },
    { id: 9002, name: "MaRin", role: "TOP", team: "SKT", year: 2015, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 95, ldr: 97 } },
    { id: 9003, name: "Bang", role: "ADC", team: "SKT", year: 2015, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 97, frm: 96, cmp: 98, map: 89, ldr: 88 } },
    { id: 9004, name: "Wolf", role: "SUP", team: "SKT", year: 2015, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 82, tmf: 96, frm: 20, cmp: 95, map: 96, ldr: 94 } },
    { id: 9005, name: "Bengi", role: "JNG", team: "SKT", year: 2016, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 86, tmf: 96, frm: 88, cmp: 98, map: 99, ldr: 95 } },
    { id: 9006, name: "Duke", role: "TOP", team: "SKT", year: 2016, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 91, frm: 97, cmp: 92, map: 88, ldr: 86 } },
    
    { id: 9007, name: "TheShy", role: "TOP", team: "IG", year: 2018, rating: 97, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 95, frm: 97, cmp: 94, map: 88, ldr: 85 } },
    { id: 9008, name: "Rookie", role: "MID", team: "IG", year: 2018, rating: 97, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 97, cmp: 95, map: 94, ldr: 94 } },
    { id: 9009, name: "Ning", role: "JNG", team: "IG", year: 2018, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 92, cmp: 90, map: 94, ldr: 89 } },
    { id: 9010, name: "JackeyLove", role: "ADC", team: "IG", year: 2018, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 97, tmf: 96, frm: 95, cmp: 92, map: 89, ldr: 88 } },
    { id: 9011, name: "Baolan", role: "SUP", team: "IG", year: 2018, rating: 92, quality: "Champion", region: "Legacy", stats: { mec: 82, tmf: 95, frm: 18, cmp: 92, map: 92, ldr: 90 } },
    
    { id: 9012, name: "Mata", role: "SUP", team: "SSW", year: 2014, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 86, tmf: 96, frm: 20, cmp: 97, map: 99, ldr: 98 } },
    { id: 9013, name: "Looper", role: "TOP", team: "SSW", year: 2014, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 92, tmf: 94, frm: 91, cmp: 95, map: 94, ldr: 90 } },
    { id: 9014, name: "DanDy", role: "JNG", team: "SSW", year: 2014, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 97, frm: 95, cmp: 95, map: 98, ldr: 94 } },
    { id: 9015, name: "PawN", role: "MID", team: "SSW", year: 2014, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 93, cmp: 95, map: 92, ldr: 91 } },
    { id: 9016, name: "imp", role: "ADC", team: "SSW", year: 2014, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 97, tmf: 95, frm: 95, cmp: 94, map: 90, ldr: 89 } },
    
    { id: 9017, name: "Ambition", role: "JNG", team: "SSG", year: 2017, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 88, tmf: 95, frm: 92, cmp: 93, map: 98, ldr: 99 } },
    { id: 9018, name: "CuVee", role: "TOP", team: "SSG", year: 2017, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 95, cmp: 95, map: 89, ldr: 88 } },
    { id: 9019, name: "Crown", role: "MID", team: "SSG", year: 2017, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 92, tmf: 95, frm: 96, cmp: 96, map: 92, ldr: 90 } },
    { id: 9020, name: "Ruler", role: "ADC", team: "SSG", year: 2017, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 97, tmf: 98, frm: 97, cmp: 96, map: 91, ldr: 92 } },
    { id: 9021, name: "CoreJJ", role: "SUP", team: "SSG", year: 2017, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 82, tmf: 96, frm: 18, cmp: 96, map: 97, ldr: 95 } },
    
    { id: 9022, name: "ShowMaker", role: "MID", team: "DK", year: 2020, rating: 98, quality: "Champion", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 98, cmp: 97, map: 96, ldr: 96 } },
    { id: 9023, name: "Canyon", role: "JNG", team: "DK", year: 2020, rating: 98, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 98, frm: 99, cmp: 96, map: 99, ldr: 94 } },
    { id: 9024, name: "Nuguri", role: "TOP", team: "DK", year: 2020, rating: 97, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 98, cmp: 92, map: 90, ldr: 88 } },
    { id: 9025, name: "Ghost", role: "ADC", team: "DK", year: 2020, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 90, tmf: 96, frm: 94, cmp: 98, map: 94, ldr: 92 } },
    { id: 9026, name: "BeryL", role: "SUP", team: "DK", year: 2020, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 80, tmf: 95, frm: 15, cmp: 96, map: 99, ldr: 97 } },
    
    { id: 9027, name: "Doinb", role: "MID", team: "FPX", year: 2019, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 89, tmf: 98, frm: 94, cmp: 99, map: 99, ldr: 99 } },
    { id: 9028, name: "Tian", role: "JNG", team: "FPX", year: 2019, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 95, frm: 94, cmp: 94, map: 96, ldr: 91 } },
    { id: 9029, name: "Crisp", role: "SUP", team: "FPX", year: 2019, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 85, tmf: 94, frm: 15, cmp: 95, map: 95, ldr: 92 } },
    { id: 9030, name: "Lwx", role: "ADC", team: "FPX", year: 2019, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 95, cmp: 91, map: 92, ldr: 89 } },
    { id: 9031, name: "GimGoon", role: "TOP", team: "FPX", year: 2019, rating: 91, quality: "Champion", region: "Legacy", stats: { mec: 88, tmf: 93, frm: 92, cmp: 90, map: 91, ldr: 92 } },
    
    { id: 9032, name: "Flandre", role: "TOP", team: "EDG", year: 2021, rating: 92, quality: "Champion", region: "Legacy", stats: { mec: 90, tmf: 93, frm: 92, cmp: 95, map: 91, ldr: 91 } },
    { id: 9033, name: "Jiejie", role: "JNG", team: "EDG", year: 2021, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 93, tmf: 94, frm: 92, cmp: 91, map: 94, ldr: 90 } },
    { id: 9034, name: "Scout", role: "MID", team: "EDG", year: 2021, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 95, frm: 96, cmp: 94, map: 95, ldr: 94 } },
    { id: 9035, name: "Viper", role: "ADC", team: "EDG", year: 2021, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 97, cmp: 95, map: 94, ldr: 93 } },
    { id: 9036, name: "Meiko", role: "SUP", team: "EDG", year: 2021, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 85, tmf: 96, frm: 18, cmp: 96, map: 97, ldr: 98 } },
   
    { id: 9037, name: "Kingen", role: "TOP", team: "DRX", year: 2022, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 91, cmp: 90, map: 90, ldr: 89 } },
    { id: 9038, name: "Pyosik", role: "JNG", team: "DRX", year: 2022, rating: 92, quality: "Champion", region: "Legacy", stats: { mec: 93, tmf: 92, frm: 90, cmp: 92, map: 91, ldr: 91 } },
    { id: 9039, name: "Zeka", role: "MID", team: "DRX", year: 2022, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 98, tmf: 93, frm: 93, cmp: 90, map: 91, ldr: 88 } },
    { id: 9040, name: "Deft", role: "ADC", team: "DRX", year: 2022, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 96, frm: 95, cmp: 95, map: 94, ldr: 97 } },
    { id: 9041, name: "BeryL", role: "SUP", team: "DRX", year: 2022, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 78, tmf: 94, frm: 15, cmp: 98, map: 99, ldr: 98 } },

    // ==========================================
    // --- 4. MVP / NOTEWORTHY VETERANS ---
    // ==========================================
    { id: 9501, name: "Broxah", role: "JNG", team: "FNC", year: 2018, rating: 92, quality: "MVP", region: "LEC", stats: { mec: 92, tmf: 91, frm: 90, cmp: 89, map: 92, ldr: 90 } },
    { id: 9502, name: "Rekkles", role: "ADC", team: "FNC", year: 2018, rating: 95, quality: "MVP", region: "LEC", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 93, ldr: 92 } },
    { id: 9503, name: "Caps", role: "MID", team: "G2", year: 2019, rating: 96, quality: "MVP", region: "LEC", stats: { mec: 97, tmf: 95, frm: 94, cmp: 98, map: 94, ldr: 92 } },
    { id: 9504, name: "Perkz", role: "ADC", team: "G2", year: 2019, rating: 95, quality: "MVP", region: "LEC", stats: { mec: 93, tmf: 95, frm: 92, cmp: 98, map: 95, ldr: 97 } },
    { id: 9505, name: "Jankos", role: "JNG", team: "G2", year: 2019, rating: 94, quality: "MVP", region: "LEC", stats: { mec: 91, tmf: 94, frm: 92, cmp: 93, map: 96, ldr: 95 } },
    { id: 9506, name: "Wunder", role: "TOP", team: "G2", year: 2019, rating: 93, quality: "MVP", region: "LEC", stats: { mec: 93, tmf: 91, frm: 93, cmp: 95, map: 90, ldr: 88 } },
    { id: 9507, name: "Letme", role: "TOP", team: "RNG", year: 2018, rating: 92, quality: "MVP", region: "LPL", stats: { mec: 88, tmf: 94, frm: 90, cmp: 92, map: 91, ldr: 89 } },
    { id: 9508, name: "Karsa", role: "JNG", team: "RNG", year: 2018, rating: 94, quality: "MVP", region: "LPL", stats: { mec: 92, tmf: 93, frm: 91, cmp: 92, map: 96, ldr: 90 } },
    { id: 9509, name: "Xiaohu", role: "MID", team: "RNG", year: 2018, rating: 95, quality: "MVP", region: "LPL", stats: { mec: 93, tmf: 95, frm: 95, cmp: 94, map: 94, ldr: 93 } },
    { id: 9510, name: "Ming", role: "SUP", team: "RNG", year: 2018, rating: 95, quality: "MVP", region: "LPL", stats: { mec: 84, tmf: 95, frm: 18, cmp: 93, map: 96, ldr: 94 } },
    { id: 9511, name: "Uzi", role: "ADC", team: "RNG", year: 2018, rating: 97, quality: "MVP", region: "LPL", stats: { mec: 99, tmf: 97, frm: 98, cmp: 94, map: 93, ldr: 95 } },
    { id: 9512, name: "Faker", role: "MID", team: "SKT", year: 2017, rating: 98, quality: "MVP", region: "LCK", stats: { mec: 96, tmf: 99, frm: 95, cmp: 99, map: 98, ldr: 99 } },
    { id: 9513, name: "Chovy", role: "MID", team: "Gen.G", year: 2022, rating: 97, quality: "MVP", region: "LCK", stats: { mec: 98, tmf: 94, frm: 99, cmp: 93, map: 92, ldr: 88 } },
    { id: 9514, name: "Caps", role: "MID", team: "G2", year: 2020, rating: 95, quality: "MVP", region: "LEC", stats: { mec: 95, tmf: 93, frm: 92, cmp: 94, map: 95, ldr: 94 } }
];

window.playerDatabase = baseDatabase.map(p => {
    return { ...p, stats: p.stats ? p.stats : genStats(p.rating) };
});