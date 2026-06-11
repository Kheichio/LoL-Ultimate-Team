// database.js

window.roleIcons = { TOP: "┪", JNG: "⚔️", MID: "✦", ADC: "🏹", SUP: "🛡️", COACH: "📋" };
window.regionLogos = { LCK: "🇰🇷 LCK", LPL: "🇨🇳 LPL", LEC: "🇪🇺 LEC", LCS: "🇺🇸 LCS", Champion: "👑 ICON" };
window.teamLineageBridges = { "SKT": "T1", "SKT T1": "T1", "SSG": "Gen.G", "SSW": "Gen.G", "Samsung Galaxy": "Gen.G", "FNC": "Fnatic", "ROX": "HLE", "DK": "Dplus KIA", "IG": "Invictus Gaming", "FPX": "FunPlus Phoenix", "DRX": "DragonX", "EDG": "EDward Gaming", "RNG": "Royal Never Give Up" };

// Fallback generator for future dynamic cards
function genStats(rating) {
    const v = () => Math.floor(Math.random() * 8) - 4; 
    return { mec: Math.min(99, rating + v()), frm: Math.min(99, rating + v()), map: Math.min(99, rating + v()), tmf: Math.min(99, rating + v()), cmp: Math.min(99, rating + v()), ldr: Math.min(99, rating + v()) };
}

// FULLY RESCALED DATABASE
// Coaches: MEC (20-40), FRM (10-25), High LDR/MAP/CMP
// Supports: MEC (65-85), FRM (15-35), High MAP/LDR/TMF
// Top/Mid/ADC: High FRM/MEC, lower MAP/LDR compared to supports.

const baseDatabase = [
    // --- COACHES (2024 & 2026) ---
    { id: 801, name: "kkOma", role: "COACH", team: "T1", year: 2024, rating: 98, quality: "Master", region: "LCK", stats: { mec: 20, tmf: 95, frm: 15, cmp: 98, map: 99, ldr: 99 } },
    { id: 1801, name: "kkOma", role: "COACH", team: "T1", year: 2026, rating: 97, quality: "Master", region: "LCK", stats: { mec: 22, tmf: 94, frm: 14, cmp: 97, map: 98, ldr: 99 } },
    { id: 802, name: "Ryu", role: "COACH", team: "Gen.G", year: 2026, rating: 94, quality: "Diamond", region: "LCK", stats: { mec: 30, tmf: 92, frm: 18, cmp: 90, map: 94, ldr: 92 } },
    { id: 803, name: "Homme", role: "COACH", team: "HLE", year: 2026, rating: 97, quality: "Master", region: "LCK", stats: { mec: 25, tmf: 97, frm: 10, cmp: 96, map: 97, ldr: 96 } },
    { id: 804, name: "Dylan Falco", role: "COACH", team: "G2", year: 2026, rating: 93, quality: "Diamond", region: "LEC", stats: { mec: 18, tmf: 93, frm: 15, cmp: 92, map: 96, ldr: 95 } },
    { id: 805, name: "Inero", role: "COACH", team: "C9", year: 2026, rating: 89, quality: "Diamond", region: "LCS", stats: { mec: 28, tmf: 88, frm: 12, cmp: 89, map: 91, ldr: 90 } },
    { id: 807, name: "Daeny", role: "COACH", team: "BLG", year: 2026, rating: 96, quality: "Master", region: "LPL", stats: { mec: 32, tmf: 96, frm: 18, cmp: 95, map: 98, ldr: 97 } },
    { id: 808, name: "Score", role: "COACH", team: "KT", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 25, tmf: 91, frm: 15, cmp: 93, map: 94, ldr: 92 } },
    
    // --- T1 (LCK 2024 & 2026) ---
    { id: 101, name: "Faker", role: "MID", team: "T1", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 95, tmf: 99, frm: 94, cmp: 99, map: 98, ldr: 99 } },
    { id: 1101, name: "Faker", role: "MID", team: "T1", year: 2026, rating: 97, quality: "Challenger", region: "LCK", stats: { mec: 92, tmf: 98, frm: 92, cmp: 99, map: 99, ldr: 99 } },
    { id: 102, name: "Zeus", role: "TOP", team: "T1", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 95, cmp: 91, map: 85, ldr: 82 } },
    { id: 1102, name: "Doran", role: "TOP", team: "T1", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 92, tmf: 89, frm: 91, cmp: 86, map: 85, ldr: 88 } },
    { id: 103, name: "Oner", role: "JNG", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 88, cmp: 89, map: 91, ldr: 87 } },
    { id: 1103, name: "Oner", role: "JNG", team: "T1", year: 2026, rating: 93, quality: "Master", region: "LCK", stats: { mec: 95, tmf: 92, frm: 90, cmp: 91, map: 92, ldr: 89 } },
    { id: 104, name: "Gumayusi", role: "ADC", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 98, map: 82, ldr: 84 } },
    { id: 1104, name: "Peyz", role: "ADC", team: "T1", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 96, tmf: 95, frm: 95, cmp: 90, map: 86, ldr: 85 } },
    { id: 105, name: "Keria", role: "SUP", team: "T1", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 85, tmf: 92, frm: 25, cmp: 95, map: 96, ldr: 90 } },
    { id: 1105, name: "Keria", role: "SUP", team: "T1", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 84, tmf: 94, frm: 22, cmp: 96, map: 97, ldr: 92 } },

    // --- Gen.G (LCK 2024 & 2026) ---
    { id: 111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 88, ldr: 89 } },
    { id: 1111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2026, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 93, tmf: 96, frm: 96, cmp: 94, map: 89, ldr: 91 } },
    { id: 112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2024, rating: 96, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 95, frm: 98, cmp: 94, map: 97, ldr: 90 } },
    { id: 1112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2026, rating: 97, quality: "Challenger", region: "LCK", stats: { mec: 97, tmf: 96, frm: 98, cmp: 95, map: 98, ldr: 92 } },
    { id: 113, name: "Chovy", role: "MID", team: "Gen.G", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 99, tmf: 96, frm: 99, cmp: 96, map: 92, ldr: 88 } },
    { id: 1113, name: "Chovy", role: "MID", team: "Gen.G", year: 2026, rating: 99, quality: "Challenger", region: "LCK", stats: { mec: 99, tmf: 98, frm: 99, cmp: 97, map: 95, ldr: 90 } },
    { id: 1114, name: "Ruler", role: "ADC", team: "Gen.G", year: 2026, rating: 96, quality: "Grandmaster", region: "LCK", stats: { mec: 97, tmf: 98, frm: 96, cmp: 95, map: 88, ldr: 91 } },
    { id: 1115, name: "Duro", role: "SUP", team: "Gen.G", year: 2026, rating: 88, quality: "Platinum", region: "LCK", stats: { mec: 78, tmf: 89, frm: 18, cmp: 85, map: 90, ldr: 86 } },

    // --- Hanwha Life (LCK 2024 & 2026) ---
    { id: 1221, name: "Zeus", role: "TOP", team: "HLE", year: 2026, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 98, tmf: 94, frm: 96, cmp: 92, map: 87, ldr: 85 } },
    { id: 1222, name: "Kanavi", role: "JNG", team: "HLE", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 94, tmf: 93, frm: 95, cmp: 91, map: 92, ldr: 89 } },
    { id: 123, name: "Zeka", role: "MID", team: "HLE", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 93, cmp: 88, map: 86, ldr: 83 } },
    { id: 1223, name: "Zeka", role: "MID", team: "HLE", year: 2026, rating: 94, quality: "Master", region: "LCK", stats: { mec: 98, tmf: 93, frm: 94, cmp: 90, map: 88, ldr: 85 } },
    { id: 1224, name: "Gumayusi", role: "ADC", team: "HLE", year: 2026, rating: 93, quality: "Master", region: "LCK", stats: { mec: 95, tmf: 95, frm: 96, cmp: 99, map: 85, ldr: 88 } },
    { id: 125, name: "Delight", role: "SUP", team: "HLE", year: 2024, rating: 90, quality: "Diamond", region: "LCK", stats: { mec: 82, tmf: 93, frm: 25, cmp: 88, map: 91, ldr: 86 } },
    { id: 1225, name: "Delight", role: "SUP", team: "HLE", year: 2026, rating: 92, quality: "Master", region: "LCK", stats: { mec: 84, tmf: 94, frm: 22, cmp: 90, map: 93, ldr: 89 } },

    // --- Dplus KIA (LCK 2026) ---
    { id: 1331, name: "Siwoo", role: "TOP", team: "DK", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 86, tmf: 84, frm: 85, cmp: 80, map: 81, ldr: 78 } },
    { id: 1332, name: "Lucid", role: "JNG", team: "DK", year: 2026, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 91, tmf: 88, frm: 89, cmp: 86, map: 88, ldr: 85 } },
    { id: 1333, name: "ShowMaker", role: "MID", team: "DK", year: 2026, rating: 92, quality: "Master", region: "LCK", stats: { mec: 94, tmf: 92, frm: 92, cmp: 94, map: 92, ldr: 93 } },
    { id: 1334, name: "Smash", role: "ADC", team: "DK", year: 2026, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 85, frm: 87, cmp: 82, map: 80, ldr: 79 } },
    { id: 1335, name: "Career", role: "SUP", team: "DK", year: 2026, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 78, tmf: 84, frm: 15, cmp: 81, map: 83, ldr: 80 } },

    // --- KT Rolster (LCK 2026) ---
    { id: 1551, name: "PerfecT", role: "TOP", team: "KT", year: 2026, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 84, frm: 86, cmp: 82, map: 83, ldr: 80 } },
    { id: 1552, name: "Cuzz", role: "JNG", team: "KT", year: 2026, rating: 88, quality: "Platinum", region: "LCK", stats: { mec: 85, tmf: 89, frm: 86, cmp: 87, map: 90, ldr: 88 } },
    { id: 1553, name: "Bdd", role: "MID", team: "KT", year: 2026, rating: 90, quality: "Diamond", region: "LCK", stats: { mec: 89, tmf: 91, frm: 92, cmp: 90, map: 89, ldr: 88 } },
    { id: 1554, name: "Aiming", role: "ADC", team: "KT", year: 2026, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 89, frm: 92, cmp: 88, map: 85, ldr: 84 } },
    { id: 1555, name: "Ghost", role: "SUP", team: "KT", year: 2026, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 80, tmf: 88, frm: 20, cmp: 93, map: 92, ldr: 94 } },

    // --- BLG (LPL 2026) ---
    { id: 1201, name: "Bin", role: "TOP", team: "BLG", year: 2026, rating: 98, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 97, frm: 97, cmp: 96, map: 91, ldr: 90 } },
    { id: 1202, name: "Xun", role: "JNG", team: "BLG", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 88, frm: 90, cmp: 87, map: 88, ldr: 86 } },
    { id: 1203, name: "Knight", role: "MID", team: "BLG", year: 2026, rating: 98, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 98, frm: 97, cmp: 96, map: 95, ldr: 92 } },
    { id: 1204, name: "Viper", role: "ADC", team: "BLG", year: 2026, rating: 96, quality: "Grandmaster", region: "LPL", stats: { mec: 98, tmf: 96, frm: 97, cmp: 95, map: 90, ldr: 88 } },
    { id: 1205, name: "ON", role: "SUP", team: "BLG", year: 2026, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 85, tmf: 88, frm: 20, cmp: 89, map: 90, ldr: 88 } },

    // --- G2 (LEC 2026) ---
    { id: 1301, name: "BrokenBlade", role: "TOP", team: "G2", year: 2026, rating: 89, quality: "Diamond", region: "LEC", stats: { mec: 87, tmf: 91, frm: 88, cmp: 90, map: 86, ldr: 90 } },
    { id: 1302, name: "SkewMond", role: "JNG", team: "G2", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 86, tmf: 85, frm: 84, cmp: 82, map: 85, ldr: 80 } },
    { id: 1303, name: "Caps", role: "MID", team: "G2", year: 2026, rating: 96, quality: "Grandmaster", region: "LEC", stats: { mec: 96, tmf: 97, frm: 95, cmp: 98, map: 96, ldr: 97 } },
    { id: 1304, name: "Hans Sama", role: "ADC", team: "G2", year: 2026, rating: 89, quality: "Diamond", region: "LEC", stats: { mec: 90, tmf: 88, frm: 90, cmp: 87, map: 84, ldr: 83 } },
    { id: 1305, name: "Labrov", role: "SUP", team: "G2", year: 2026, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 82, tmf: 89, frm: 18, cmp: 88, map: 90, ldr: 86 } },

    // --- C9 (LCS 2026) ---
    { id: 1431, name: "Thanatos", role: "TOP", team: "C9", year: 2026, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 88, tmf: 85, frm: 87, cmp: 83, map: 82, ldr: 80 } },
    { id: 1432, name: "Blaber", role: "JNG", team: "C9", year: 2026, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 89, tmf: 87, frm: 88, cmp: 86, map: 89, ldr: 90 } },
    { id: 1433, name: "APA", role: "MID", team: "C9", year: 2026, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 84, tmf: 82, frm: 85, cmp: 80, map: 81, ldr: 82 } },
    { id: 1434, name: "Zven", role: "ADC", team: "C9", year: 2026, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 84, tmf: 86, frm: 87, cmp: 88, map: 83, ldr: 85 } },
    { id: 1435, name: "Vulcan", role: "SUP", team: "C9", year: 2026, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 80, tmf: 85, frm: 15, cmp: 83, map: 86, ldr: 86 } },

    // --- TL (LCS 2026) ---
    { id: 1401, name: "Morgan", role: "TOP", team: "TL", year: 2026, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 83, tmf: 88, frm: 86, cmp: 85, map: 84, ldr: 83 } },
    { id: 1402, name: "Josedeodo", role: "JNG", team: "TL", year: 2026, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 85, tmf: 84, frm: 83, cmp: 82, map: 85, ldr: 84 } },
    { id: 1403, name: "Quid", role: "MID", team: "TL", year: 2026, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 87, tmf: 85, frm: 88, cmp: 83, map: 84, ldr: 82 } },
    { id: 1404, name: "Yeon", role: "ADC", team: "TL", year: 2026, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 86, tmf: 84, frm: 87, cmp: 82, map: 80, ldr: 78 } },
    { id: 1405, name: "CoreJJ", role: "SUP", team: "TL", year: 2026, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 78, tmf: 89, frm: 16, cmp: 92, map: 94, ldr: 96 } },

    // --- 2026 LEC EXPANSION TEAMS LCK LPL LEC ---
    { id: 3001, name: "Canna", role: "TOP", team: "KC", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 80, frm: 84, cmp: 78, map: 79, ldr: 76 } },
    { id: 3002, name: "Closer", role: "JNG", team: "KC", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 82, frm: 83, cmp: 80, map: 81, ldr: 82 } },
    { id: 3003, name: "Vetheo", role: "MID", team: "KC", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 84, frm: 86, cmp: 82, map: 81, ldr: 79 } },
    { id: 3004, name: "Caliste", role: "ADC", team: "KC", year: 2026, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 89, tmf: 86, frm: 88, cmp: 83, map: 80, ldr: 77 } },
    { id: 3005, name: "Targamas", role: "SUP", team: "KC", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 76, tmf: 82, frm: 20, cmp: 79, map: 84, ldr: 81 } },

    { id: 3006, name: "Sparda", role: "TOP", team: "NAVI", year: 2026, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 76, tmf: 75, frm: 78, cmp: 74, map: 73, ldr: 71 } },
    { id: 3007, name: "Rabble", role: "JNG", team: "NAVI", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 77, tmf: 76, frm: 77, cmp: 75, map: 74, ldr: 73 } },
    { id: 3008, name: "Dajor", role: "MID", team: "NAVI", year: 2026, rating: 77, quality: "Silver", region: "LEC", stats: { mec: 75, tmf: 76, frm: 78, cmp: 73, map: 74, ldr: 72 } },
    { id: 3009, name: "BAO", role: "ADC", team: "NAVI", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 79, frm: 81, cmp: 77, map: 75, ldr: 74 } },
    { id: 3010, name: "Parus", role: "SUP", team: "NAVI", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 74, tmf: 78, frm: 19, cmp: 75, map: 80, ldr: 77 } },

    { id: 3011, name: "Photon", role: "TOP", team: "VIT", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 81, frm: 85, cmp: 80, map: 79, ldr: 78 } },
    { id: 3012, name: "Lyncas", role: "JNG", team: "VIT", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 83, frm: 82, cmp: 79, map: 81, ldr: 80 } },
    { id: 3013, name: "Czajek", role: "MID", team: "VIT", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 77, ldr: 76 } },
    { id: 3014, name: "Carzzy", role: "ADC", team: "VIT", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 86, frm: 87, cmp: 85, map: 82, ldr: 83 } },
    { id: 3015, name: "Hylissang", role: "SUP", team: "VIT", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 78, tmf: 84, frm: 22, cmp: 79, map: 83, ldr: 84 } },

    { id: 3016, name: "Wunder", role: "TOP", team: "TH", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 83, frm: 84, cmp: 85, map: 83, ldr: 84 } },
    { id: 3017, name: "Jankos", role: "JNG", team: "TH", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 85, frm: 82, cmp: 84, map: 88, ldr: 89 } },
    { id: 3018, name: "Zwyroo", role: "MID", team: "TH", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 79, tmf: 78, frm: 80, cmp: 76, map: 77, ldr: 75 } },
    { id: 3019, name: "Flakked", role: "ADC", team: "TH", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 81, frm: 84, cmp: 80, map: 78, ldr: 77 } },
    { id: 3020, name: "Trymbi", role: "SUP", team: "TH", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 77, tmf: 84, frm: 21, cmp: 82, map: 86, ldr: 85 } },

    { id: 3021, name: "Odoamne", role: "TOP", team: "GX", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 78, tmf: 83, frm: 81, cmp: 85, map: 84, ldr: 86 } },
    { id: 3022, name: "Juhan", role: "JNG", team: "GX", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 79, frm: 80, cmp: 78, map: 79, ldr: 77 } },
    { id: 3023, name: "Jackies", role: "MID", team: "GX", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 80, frm: 81, cmp: 77, map: 76, ldr: 75 } },
    { id: 3024, name: "Patrik", role: "ADC", team: "GX", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 81, frm: 83, cmp: 80, map: 78, ldr: 79 } },
    { id: 3025, name: "Ignar", role: "SUP", team: "GX", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 75, tmf: 82, frm: 20, cmp: 78, map: 81, ldr: 82 } },

    { id: 3026, name: "Myrwn", role: "TOP", team: "MKOI", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 80, frm: 82, cmp: 79, map: 78, ldr: 77 } },
    { id: 3027, name: "Elyoya", role: "JNG", team: "MKOI", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 85, tmf: 87, frm: 84, cmp: 85, map: 88, ldr: 89 } },
    { id: 3028, name: "Fresskowy", role: "MID", team: "MKOI", year: 2026, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 80, frm: 83, cmp: 78, map: 79, ldr: 77 } },
    { id: 3029, name: "Supa", role: "ADC", team: "MKOI", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 83, frm: 85, cmp: 81, map: 80, ldr: 80 } },
    { id: 3030, name: "Alvaro", role: "SUP", team: "MKOI", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 80, tmf: 86, frm: 24, cmp: 84, map: 87, ldr: 85 } },

    { id: 3036, name: "Satorius", role: "TOP", team: "LR", year: 2026, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 76, tmf: 77, frm: 79, cmp: 75, map: 74, ldr: 73 } },
    { id: 3037, name: "Gilius", role: "JNG", team: "LR", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 75, tmf: 78, frm: 77, cmp: 76, map: 80, ldr: 81 } },
    { id: 3038, name: "Nemesis", role: "MID", team: "LR", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 86, tmf: 84, frm: 88, cmp: 85, map: 83, ldr: 84 } },
    { id: 3039, name: "Crownie", role: "ADC", team: "LR", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 83, frm: 85, cmp: 80, map: 79, ldr: 81 } },
    { id: 3040, name: "Rekkles", role: "SUP", team: "LR", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 78, tmf: 83, frm: 26, cmp: 87, map: 86, ldr: 88 } },

    { id: 3041, name: "Carlsen", role: "TOP", team: "Shifters", year: 2026, rating: 77, quality: "Silver", region: "LEC", stats: { mec: 78, tmf: 75, frm: 77, cmp: 73, map: 74, ldr: 72 } },
    { id: 3042, name: "Daglas", role: "JNG", team: "Shifters", year: 2026, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 79, tmf: 76, frm: 78, cmp: 74, map: 75, ldr: 73 } },
    { id: 3043, name: "Emenes", role: "MID", team: "Shifters", year: 2026, rating: 80, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 78, frm: 80, cmp: 75, map: 76, ldr: 74 } },
    { id: 3044, name: "Keduii", role: "ADC", team: "Shifters", year: 2026, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 81, tmf: 78, frm: 80, cmp: 76, map: 74, ldr: 73 } },
    { id: 3045, name: "Zoelys", role: "SUP", team: "Shifters", year: 2026, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 74, tmf: 77, frm: 18, cmp: 75, map: 76, ldr: 74 } },

    { id: 3046, name: "Irrelevant", role: "TOP", team: "SK", year: 2026, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 86, tmf: 85, frm: 86, cmp: 83, map: 82, ldr: 81 } },
    { id: 3047, name: "Isma", role: "JNG", team: "SK", year: 2026, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 82, frm: 81, cmp: 80, map: 83, ldr: 81 } },
    { id: 3048, name: "Nisqy", role: "MID", team: "SK", year: 2026, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 86, frm: 84, cmp: 83, map: 85, ldr: 84 } },
    { id: 3049, name: "Rahel", role: "ADC", team: "SK", year: 2026, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 85, frm: 87, cmp: 84, map: 82, ldr: 81 } },
    { id: 3050, name: "Luon", role: "SUP", team: "SK", year: 2026, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 78, tmf: 83, frm: 21, cmp: 80, map: 82, ldr: 80 } },

    // --- 2026 LCK EXPANSION TEAMS ---
    { id: 3051, name: "DnDn", role: "TOP", team: "NS", year: 2026, rating: 79, quality: "Silver", region: "LCK", stats: { mec: 78, tmf: 80, frm: 81, cmp: 76, map: 77, ldr: 75 } },
    { id: 3052, name: "Sylvie", role: "JNG", team: "NS", year: 2026, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 81, tmf: 79, frm: 80, cmp: 77, map: 81, ldr: 78 } },
    { id: 3053, name: "Callme", role: "MID", team: "NS", year: 2026, rating: 78, quality: "Silver", region: "LCK", stats: { mec: 80, tmf: 77, frm: 79, cmp: 75, map: 76, ldr: 74 } },
    { id: 3054, name: "Jiwoo", role: "ADC", team: "NS", year: 2026, rating: 82, quality: "Gold", region: "LCK", stats: { mec: 85, tmf: 81, frm: 82, cmp: 79, map: 78, ldr: 76 } },
    { id: 3055, name: "Peter", role: "SUP", team: "NS", year: 2026, rating: 79, quality: "Silver", region: "LCK", stats: { mec: 75, tmf: 80, frm: 19, cmp: 77, map: 80, ldr: 78 } },

    { id: 3056, name: "DuDu", role: "TOP", team: "DNS", year: 2026, rating: 84, quality: "Gold", region: "LCK", stats: { mec: 86, tmf: 82, frm: 85, cmp: 81, map: 80, ldr: 79 } },
    { id: 3057, name: "Cuzz", role: "JNG", team: "DNS", year: 2026, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 84, tmf: 88, frm: 86, cmp: 86, map: 89, ldr: 87 } },
    { id: 3058, name: "BuLLDoG", role: "MID", team: "DNS", year: 2026, rating: 82, quality: "Gold", region: "LCK", stats: { mec: 84, tmf: 81, frm: 83, cmp: 79, map: 80, ldr: 78 } },
    { id: 3059, name: "Bull", role: "ADC", team: "DNS", year: 2026, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 79, frm: 81, cmp: 78, map: 77, ldr: 76 } },
    { id: 3060, name: "Andil", role: "SUP", team: "DNS", year: 2026, rating: 79, quality: "Silver", region: "LCK", stats: { mec: 75, tmf: 79, frm: 18, cmp: 77, map: 80, ldr: 78 } },

    { id: 3061, name: "Morgan", role: "TOP", team: "BRO", year: 2026, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 79, tmf: 83, frm: 82, cmp: 80, map: 81, ldr: 82 } },
    { id: 3062, name: "Gideon", role: "JNG", team: "BRO", year: 2026, rating: 79, quality: "Silver", region: "LCK", stats: { mec: 80, tmf: 78, frm: 79, cmp: 76, map: 78, ldr: 77 } },
    { id: 3063, name: "Karis", role: "MID", team: "BRO", year: 2026, rating: 78, quality: "Silver", region: "LCK", stats: { mec: 79, tmf: 77, frm: 80, cmp: 75, map: 76, ldr: 75 } },
    { id: 3064, name: "Envyy", role: "ADC", team: "BRO", year: 2026, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 79, frm: 81, cmp: 77, map: 76, ldr: 75 } },
    { id: 3065, name: "Effort", role: "SUP", team: "BRO", year: 2026, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 75, tmf: 80, frm: 21, cmp: 78, map: 83, ldr: 82 } },

    // --- 2026 LPL EXPANSION TEAMS ---
    { id: 3076, name: "Ale", role: "TOP", team: "AL", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 89, tmf: 84, frm: 86, cmp: 82, map: 83, ldr: 81 } },
    { id: 3077, name: "Croco", role: "JNG", team: "AL", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 85, frm: 84, cmp: 83, map: 85, ldr: 84 } },
    { id: 3078, name: "Shanks", role: "MID", team: "AL", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 87, tmf: 86, frm: 87, cmp: 84, map: 85, ldr: 83 } },
    { id: 3079, name: "Hope", role: "ADC", team: "AL", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 85, frm: 87, cmp: 83, map: 82, ldr: 81 } },
    { id: 3080, name: "Kael", role: "SUP", team: "AL", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 79, tmf: 85, frm: 22, cmp: 82, map: 86, ldr: 84 } },

    { id: 3081, name: "Breathe", role: "TOP", team: "WBG", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 86, frm: 88, cmp: 85, map: 85, ldr: 84 } },
    { id: 3082, name: "Tarzan", role: "JNG", team: "WBG", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 90, frm: 89, cmp: 88, map: 92, ldr: 90 } },
    { id: 3083, name: "Xiaohu", role: "MID", team: "WBG", year: 2026, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 89, frm: 88, cmp: 89, map: 88, ldr: 91 } },
    { id: 3084, name: "Light", role: "ADC", team: "WBG", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 87, frm: 88, cmp: 86, map: 84, ldr: 83 } },
    { id: 3085, name: "Crisp", role: "SUP", team: "WBG", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 81, tmf: 88, frm: 24, cmp: 87, map: 89, ldr: 88 } },

    { id: 3086, name: "Sheer", role: "TOP", team: "JDG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 89, tmf: 85, frm: 87, cmp: 82, map: 83, ldr: 81 } },
    { id: 3087, name: "Yagao", role: "MID", team: "JDG", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 87, tmf: 91, frm: 89, cmp: 88, map: 90, ldr: 89 } },
    { id: 3088, name: "Missing", role: "SUP", team: "JDG", year: 2026, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 85, tmf: 92, frm: 25, cmp: 90, map: 92, ldr: 90 } },

    { id: 3089, name: "369", role: "TOP", team: "TES", year: 2026, rating: 92, quality: "Master", region: "LPL", stats: { mec: 90, tmf: 94, frm: 92, cmp: 91, map: 93, ldr: 89 } },
    { id: 3090, name: "Tian", role: "JNG", team: "TES", year: 2026, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 91, frm: 89, cmp: 89, map: 92, ldr: 90 } },
    { id: 3091, name: "Creme", role: "MID", team: "TES", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 92, tmf: 88, frm: 90, cmp: 86, map: 85, ldr: 83 } },
    { id: 3092, name: "JackeyLove", role: "ADC", team: "TES", year: 2026, rating: 93, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 93, frm: 94, cmp: 91, map: 89, ldr: 92 } },
    { id: 3093, name: "Meiko", role: "SUP", team: "TES", year: 2026, rating: 92, quality: "Master", region: "LPL", stats: { mec: 86, tmf: 93, frm: 23, cmp: 92, map: 95, ldr: 95 } },

    { id: 3094, name: "YSKM", role: "TOP", team: "iG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 87, tmf: 79, frm: 82, cmp: 76, map: 77, ldr: 75 } },
    { id: 3095, name: "Glc", role: "JNG", team: "iG", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 80, tmf: 78, frm: 79, cmp: 75, map: 78, ldr: 76 } },
    { id: 3096, name: "Cryin", role: "MID", team: "iG", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 84, frm: 84, cmp: 81, map: 82, ldr: 80 } },
    { id: 3097, name: "Ahn", role: "ADC", team: "iG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 77, ldr: 76 } },
    { id: 3098, name: "Wink", role: "SUP", team: "iG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 78, tmf: 83, frm: 24, cmp: 80, map: 83, ldr: 82 } },

    { id: 3099, name: "shanji", role: "TOP", team: "NIP", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 84, frm: 85, cmp: 83, map: 82, ldr: 81 } },
    { id: 3100, name: "AKi", role: "JNG", team: "NIP", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 84, frm: 83, cmp: 81, map: 84, ldr: 82 } },
    { id: 3101, name: "Rookie", role: "MID", team: "NIP", year: 2026, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 91, tmf: 88, frm: 89, cmp: 88, map: 87, ldr: 90 } },
    { id: 3102, name: "Photic", role: "ADC", team: "NIP", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 87, tmf: 85, frm: 86, cmp: 84, map: 83, ldr: 81 } },
    { id: 3103, name: "Zhuo", role: "SUP", team: "NIP", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 78, tmf: 83, frm: 21, cmp: 80, map: 83, ldr: 80 } },

    { id: 3104, name: "Wayward", role: "TOP", team: "WE", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 83, frm: 85, cmp: 81, map: 82, ldr: 80 } },
    { id: 3105, name: "Heng", role: "JNG", team: "WE", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 81, frm: 82, cmp: 79, map: 82, ldr: 80 } },
    { id: 3106, name: "FOFO", role: "MID", team: "WE", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 85, frm: 86, cmp: 83, map: 84, ldr: 82 } },
    { id: 3107, name: "Prince", role: "ADC", team: "WE", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 87, tmf: 83, frm: 85, cmp: 81, map: 80, ldr: 79 } },
    { id: 3108, name: "Iwandy", role: "SUP", team: "WE", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 77, tmf: 84, frm: 20, cmp: 81, map: 85, ldr: 82 } },

    { id: 3109, name: "Solokill", role: "TOP", team: "EDG", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 78, frm: 81, cmp: 76, map: 77, ldr: 75 } },
    { id: 3110, name: "Jiejie", role: "JNG", team: "EDG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 85, tmf: 87, frm: 86, cmp: 84, map: 88, ldr: 86 } },
    { id: 3111, name: "Fisher", role: "MID", team: "EDG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 80, frm: 82, cmp: 78, map: 79, ldr: 77 } },
    { id: 3112, name: "Leave", role: "ADC", team: "EDG", year: 2026, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 87, tmf: 83, frm: 85, cmp: 80, map: 81, ldr: 79 } },
    { id: 3113, name: "Vampire", role: "SUP", team: "EDG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 78, tmf: 83, frm: 20, cmp: 80, map: 83, ldr: 81 } },

    { id: 3114, name: "HOYA", role: "TOP", team: "TT", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 80, tmf: 82, frm: 83, cmp: 79, map: 80, ldr: 78 } },
    { id: 3115, name: "Beichuan", role: "JNG", team: "TT", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 81, frm: 82, cmp: 80, map: 83, ldr: 81 } },
    { id: 3116, name: "ucal", role: "MID", team: "TT", year: 2026, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 85, frm: 86, cmp: 84, map: 83, ldr: 82 } },
    { id: 3117, name: "1xn", role: "ADC", team: "TT", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 79, ldr: 77 } },
    { id: 3118, name: "QiuQiu", role: "SUP", team: "TT", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 75, tmf: 81, frm: 18, cmp: 79, map: 82, ldr: 80 } },

    { id: 3119, name: "Zika", role: "TOP", team: "LNG", year: 2026, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 86, frm: 87, cmp: 85, map: 84, ldr: 83 } },
    { id: 3120, name: "Weiwei", role: "JNG", team: "LNG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 85, tmf: 87, frm: 86, cmp: 84, map: 87, ldr: 85 } },
    { id: 3121, name: "Scout", role: "MID", team: "LNG", year: 2026, rating: 92, quality: "Master", region: "LPL", stats: { mec: 93, tmf: 92, frm: 94, cmp: 91, map: 92, ldr: 93 } },
    { id: 3122, name: "GALA", role: "ADC", team: "LNG", year: 2026, rating: 93, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 94, frm: 95, cmp: 90, map: 89, ldr: 88 } },
    { id: 3123, name: "Hang", role: "SUP", team: "LNG", year: 2026, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 80, tmf: 87, frm: 21, cmp: 85, map: 88, ldr: 86 } },

    { id: 3124, name: "Cube", role: "TOP", team: "OMG", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 79, tmf: 81, frm: 82, cmp: 78, map: 79, ldr: 77 } },
    { id: 3125, name: "Xiaofang", role: "JNG", team: "OMG", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 80, tmf: 78, frm: 79, cmp: 76, map: 80, ldr: 78 } },
    { id: 3126, name: "Angel", role: "MID", team: "OMG", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 84, frm: 84, cmp: 81, map: 82, ldr: 80 } },
    { id: 3127, name: "Starry", role: "ADC", team: "OMG", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 79, ldr: 77 } },
    { id: 3128, name: "ppgod", role: "SUP", team: "OMG", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 75, tmf: 83, frm: 18, cmp: 80, map: 84, ldr: 82 } },

    { id: 3129, name: "Burdol", role: "TOP", team: "LGD", year: 2026, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 84, tmf: 80, frm: 83, cmp: 79, map: 80, ldr: 78 } },
    { id: 3130, name: "Meteor", role: "JNG", team: "LGD", year: 2026, rating: 83, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 84, frm: 83, cmp: 81, map: 85, ldr: 83 } },
    { id: 3131, name: "haichao", role: "MID", team: "LGD", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 79, frm: 81, cmp: 78, map: 79, ldr: 77 } },
    { id: 3132, name: "Kepler", role: "ADC", team: "LGD", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 81, tmf: 78, frm: 80, cmp: 76, map: 77, ldr: 75 } },
    { id: 3133, name: "Jinjiao", role: "SUP", team: "LGD", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 74, tmf: 82, frm: 18, cmp: 79, map: 83, ldr: 81 } },

    { id: 3134, name: "Decade", role: "TOP", team: "UP", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 77, tmf: 78, frm: 80, cmp: 75, map: 76, ldr: 74 } },
    { id: 3135, name: "H4cker", role: "JNG", team: "UP", year: 2026, rating: 79, quality: "Silver", region: "LPL", stats: { mec: 78, tmf: 79, frm: 80, cmp: 76, map: 80, ldr: 78 } },
    { id: 3136, name: "Yuekai", role: "MID", team: "UP", year: 2026, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 82, tmf: 79, frm: 81, cmp: 77, map: 78, ldr: 76 } },
    { id: 3137, name: "Doggo", role: "ADC", team: "UP", year: 2026, rating: 81, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 80, frm: 82, cmp: 78, map: 79, ldr: 77 } },
    { id: 3138, name: "Jice", role: "SUP", team: "UP", year: 2026, rating: 78, quality: "Silver", region: "LPL", stats: { mec: 73, tmf: 79, frm: 15, cmp: 76, map: 79, ldr: 77 } }
];

window.playerDatabase = baseDatabase.map(p => {
    return { ...p, stats: p.stats ? p.stats : genStats(p.rating) };
});