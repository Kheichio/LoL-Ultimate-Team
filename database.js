// database.js

window.roleIcons = { TOP: "┪", JNG: "⚔️", MID: "✦", ADC: "🏹", SUP: "🛡️", COACH: "📋" };
window.regionLogos = { LCK: "🇰🇷 LCK", LPL: "🇨🇳 LPL", LEC: "🇪🇺 LEC", LCS: "🇺🇸 LCS", Champion: "👑 ICON" };
window.teamLineageBridges = { "SKT": "T1", "SKT T1": "T1", "SSG": "Gen.G", "SSW": "Gen.G", "Samsung Galaxy": "Gen.G", "FNC": "Fnatic", "ROX": "HLE", "DK": "Dplus KIA", "IG": "Invictus Gaming", "FPX": "FunPlus Phoenix", "DRX": "DragonX", "EDG": "EDward Gaming", "RNG": "Royal Never Give Up" };

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

    // === BRANDED WORLD CHAMPIONS ( Wildcard Core Node ) ===
    
    // SKT T1 2015-2016
    { id: 901, name: "Faker", role: "MID", team: "SKT", year: 2015, rating: 99, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 99, frm: 98, cmp: 99, map: 98, ldr: 99 } },
    { id: 925, name: "MaRin", role: "TOP", team: "SKT", year: 2015, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 95, ldr: 97 } },
    { id: 926, name: "Bang", role: "ADC", team: "SKT", year: 2015, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 97, frm: 96, cmp: 98, map: 89, ldr: 88 } },
    { id: 927, name: "Wolf", role: "SUP", team: "SKT", year: 2015, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 82, tmf: 96, frm: 20, cmp: 95, map: 96, ldr: 94 } },
    { id: 942, name: "Bengi", role: "JNG", team: "SKT", year: 2016, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 86, tmf: 96, frm: 88, cmp: 98, map: 99, ldr: 95 } },
    { id: 943, name: "Duke", role: "TOP", team: "SKT", year: 2016, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 91, frm: 97, cmp: 92, map: 88, ldr: 86 } },

    // IG 2018
    { id: 902, name: "TheShy", role: "TOP", team: "IG", year: 2018, rating: 97, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 95, frm: 97, cmp: 94, map: 88, ldr: 85 } },
    { id: 906, name: "Rookie", role: "MID", team: "IG", year: 2018, rating: 97, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 97, cmp: 95, map: 94, ldr: 94 } },
    { id: 944, name: "Ning", role: "JNG", team: "IG", year: 2018, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 92, cmp: 90, map: 94, ldr: 89 } },
    { id: 945, name: "JackeyLove", role: "ADC", team: "IG", year: 2018, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 97, tmf: 96, frm: 95, cmp: 92, map: 89, ldr: 88 } },
    { id: 946, name: "Baolan", role: "SUP", team: "IG", year: 2018, rating: 92, quality: "Champion", region: "Legacy", stats: { mec: 82, tmf: 95, frm: 18, cmp: 92, map: 92, ldr: 90 } },

    // SSW 2014
    { id: 903, name: "Mata", role: "SUP", team: "SSW", year: 2014, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 86, tmf: 96, frm: 20, cmp: 97, map: 99, ldr: 98 } },
    { id: 921, name: "Looper", role: "TOP", team: "SSW", year: 2014, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 92, tmf: 94, frm: 91, cmp: 95, map: 94, ldr: 90 } },
    { id: 922, name: "DanDy", role: "JNG", team: "SSW", year: 2014, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 97, frm: 95, cmp: 95, map: 98, ldr: 94 } },
    { id: 923, name: "PawN", role: "MID", team: "SSW", year: 2014, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 93, cmp: 95, map: 92, ldr: 91 } },
    { id: 924, name: "imp", role: "ADC", team: "SSW", year: 2014, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 97, tmf: 95, frm: 95, cmp: 94, map: 90, ldr: 89 } },

    // SSG 2017
    { id: 904, name: "Ambition", role: "JNG", team: "SSG", year: 2017, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 88, tmf: 95, frm: 92, cmp: 93, map: 98, ldr: 99 } },
    { id: 947, name: "CuVee", role: "TOP", team: "SSG", year: 2017, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 95, cmp: 95, map: 89, ldr: 88 } },
    { id: 948, name: "Crown", role: "MID", team: "SSG", year: 2017, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 92, tmf: 95, frm: 96, cmp: 96, map: 92, ldr: 90 } },
    { id: 949, name: "Ruler", role: "ADC", team: "SSG", year: 2017, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 97, tmf: 98, frm: 97, cmp: 96, map: 91, ldr: 92 } },
    { id: 950, name: "CoreJJ", role: "SUP", team: "SSG", year: 2017, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 82, tmf: 96, frm: 18, cmp: 96, map: 97, ldr: 95 } },

    // Damwon 2020
    { id: 907, name: "ShowMaker", role: "MID", team: "DK", year: 2020, rating: 98, quality: "Champion", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 98, cmp: 97, map: 96, ldr: 96 } },
    { id: 908, name: "Canyon", role: "JNG", team: "DK", year: 2020, rating: 98, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 98, frm: 99, cmp: 96, map: 99, ldr: 94 } },
    { id: 951, name: "Nuguri", role: "TOP", team: "DK", year: 2020, rating: 97, quality: "Champion", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 98, cmp: 92, map: 90, ldr: 88 } },
    { id: 952, name: "Ghost", role: "ADC", team: "DK", year: 2020, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 90, tmf: 96, frm: 94, cmp: 98, map: 94, ldr: 92 } },
    { id: 953, name: "BeryL", role: "SUP", team: "DK", year: 2020, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 80, tmf: 95, frm: 15, cmp: 96, map: 99, ldr: 97 } },

    // FPX 2019
    { id: 916, name: "Doinb", role: "MID", team: "FPX", year: 2019, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 89, tmf: 98, frm: 94, cmp: 99, map: 99, ldr: 99 } },
    { id: 917, name: "Tian", role: "JNG", team: "FPX", year: 2019, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 95, frm: 94, cmp: 94, map: 96, ldr: 91 } },
    { id: 918, name: "Crisp", role: "SUP", team: "FPX", year: 2019, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 85, tmf: 94, frm: 15, cmp: 95, map: 95, ldr: 92 } },
    { id: 919, name: "Lwx", role: "ADC", team: "FPX", year: 2019, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 95, cmp: 91, map: 92, ldr: 89 } },
    { id: 920, name: "GimGoon", role: "TOP", team: "FPX", year: 2019, rating: 91, quality: "Champion", region: "Legacy", stats: { mec: 88, tmf: 93, frm: 92, cmp: 90, map: 91, ldr: 92 } },

    // EDG 2021
    { id: 930, name: "Flandre", role: "TOP", team: "EDG", year: 2021, rating: 92, quality: "Champion", region: "Legacy", stats: { mec: 90, tmf: 93, frm: 92, cmp: 95, map: 91, ldr: 91 } },
    { id: 931, name: "Jiejie", role: "JNG", team: "EDG", year: 2021, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 93, tmf: 94, frm: 92, cmp: 91, map: 94, ldr: 90 } },
    { id: 932, name: "Scout", role: "MID", team: "EDG", year: 2021, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 96, tmf: 95, frm: 96, cmp: 94, map: 95, ldr: 94 } },
    { id: 933, name: "Viper", role: "ADC", team: "EDG", year: 2021, rating: 96, quality: "Champion", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 97, cmp: 95, map: 94, ldr: 93 } },
    { id: 934, name: "Meiko", role: "SUP", team: "EDG", year: 2021, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 85, tmf: 96, frm: 18, cmp: 96, map: 97, ldr: 98 } },

    // DRX 2022
    { id: 939, name: "Kingen", role: "TOP", team: "DRX", year: 2022, rating: 93, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 91, cmp: 90, map: 90, ldr: 89 } },
    { id: 940, name: "Pyosik", role: "JNG", team: "DRX", year: 2022, rating: 92, quality: "Champion", region: "Legacy", stats: { mec: 93, tmf: 92, frm: 90, cmp: 92, map: 91, ldr: 91 } },
    { id: 941, name: "Zeka", role: "MID", team: "DRX", year: 2022, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 98, tmf: 93, frm: 93, cmp: 90, map: 91, ldr: 88 } },
    { id: 910, name: "Deft", role: "ADC", team: "DRX", year: 2022, rating: 95, quality: "Champion", region: "Legacy", stats: { mec: 94, tmf: 96, frm: 95, cmp: 95, map: 94, ldr: 97 } },
    { id: 911, name: "BeryL", role: "SUP", team: "DRX", year: 2022, rating: 94, quality: "Champion", region: "Legacy", stats: { mec: 78, tmf: 94, frm: 15, cmp: 98, map: 99, ldr: 98 } },

    // --- STANDARD HIGH-TIER VETERANS (Not Champions, but historically elite) ---
    { id: 928, name: "Broxah", role: "JNG", team: "FNC", year: 2018, rating: 91, quality: "Diamond", region: "LEC", stats: { mec: 92, tmf: 91, frm: 90, cmp: 89, map: 92, ldr: 90 } },
    { id: 929, name: "Rekkles", role: "ADC", team: "FNC", year: 2018, rating: 94, quality: "Master", region: "LEC", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 93, ldr: 92 } },
    { id: 912, name: "Caps", role: "MID", team: "G2", year: 2019, rating: 95, quality: "Grandmaster", region: "LEC", stats: { mec: 97, tmf: 95, frm: 94, cmp: 98, map: 94, ldr: 92 } },
    { id: 913, name: "Perkz", role: "ADC", team: "G2", year: 2019, rating: 94, quality: "Master", region: "LEC", stats: { mec: 93, tmf: 95, frm: 92, cmp: 98, map: 95, ldr: 97 } },
    { id: 914, name: "Jankos", role: "JNG", team: "G2", year: 2019, rating: 93, quality: "Master", region: "LEC", stats: { mec: 91, tmf: 94, frm: 92, cmp: 93, map: 96, ldr: 95 } },
    { id: 915, name: "Wunder", role: "TOP", team: "G2", year: 2019, rating: 92, quality: "Diamond", region: "LEC", stats: { mec: 93, tmf: 91, frm: 93, cmp: 95, map: 90, ldr: 88 } },
    { id: 935, name: "Letme", role: "TOP", team: "RNG", year: 2018, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 94, frm: 90, cmp: 92, map: 91, ldr: 89 } },
    { id: 936, name: "Karsa", role: "JNG", team: "RNG", year: 2018, rating: 93, quality: "Master", region: "LPL", stats: { mec: 92, tmf: 93, frm: 91, cmp: 92, map: 96, ldr: 90 } },
    { id: 937, name: "Xiaohu", role: "MID", team: "RNG", year: 2018, rating: 94, quality: "Master", region: "LPL", stats: { mec: 93, tmf: 95, frm: 95, cmp: 94, map: 94, ldr: 93 } },
    { id: 938, name: "Ming", role: "SUP", team: "RNG", year: 2018, rating: 94, quality: "Master", region: "LPL", stats: { mec: 84, tmf: 95, frm: 18, cmp: 93, map: 96, ldr: 94 } },
    { id: 905, name: "Uzi", role: "ADC", team: "RNG", year: 2018, rating: 96, quality: "Grandmaster", region: "LPL", stats: { mec: 99, tmf: 97, frm: 98, cmp: 94, map: 93, ldr: 95 } }
];

window.playerDatabase = baseDatabase.map(p => {
    return { ...p, stats: p.stats ? p.stats : genStats(p.rating) };
});