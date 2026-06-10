// database.js

window.roleIcons = { TOP: "┪", JNG: "⚔️", MID: "✦", ADC: "🏹", SUP: "🛡️", COACH: "📋" };
window.regionLogos = { LCK: "🇰🇷 LCK", LPL: "🇨🇳 LPL", LEC: "🇪🇺 LEC", LCS: "🇺🇸 LCS", Legacy: "👑 ICON" };
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
    // --- COACHES ---
    { id: 801, name: "kkOma", role: "COACH", team: "T1", year: 2024, rating: 98, quality: "Master", region: "LCK", stats: { mec: 20, tmf: 95, frm: 15, cmp: 98, map: 99, ldr: 99 } },
    { id: 802, name: "Edgar", role: "COACH", team: "Gen.G", year: 2024, rating: 95, quality: "Diamond", region: "LCK", stats: { mec: 22, tmf: 94, frm: 12, cmp: 94, map: 96, ldr: 97 } },
    { id: 803, name: "Homme", role: "COACH", team: "JDG", year: 2023, rating: 96, quality: "Master", region: "LPL", stats: { mec: 25, tmf: 97, frm: 10, cmp: 96, map: 97, ldr: 96 } },
    { id: 804, name: "Dylan Falco", role: "COACH", team: "G2", year: 2024, rating: 92, quality: "Diamond", region: "LEC", stats: { mec: 18, tmf: 90, frm: 15, cmp: 92, map: 95, ldr: 94 } },
    { id: 805, name: "Reapered", role: "COACH", team: "C9", year: 2024, rating: 90, quality: "Platinum", region: "LCS", stats: { mec: 35, tmf: 88, frm: 20, cmp: 90, map: 92, ldr: 91 } },
    { id: 806, name: "Mac", role: "COACH", team: "MAD", year: 2024, rating: 88, quality: "Gold", region: "LEC", stats: { mec: 20, tmf: 85, frm: 15, cmp: 87, map: 89, ldr: 88 } },
    { id: 807, name: "DanDy", role: "COACH", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 40, tmf: 88, frm: 25, cmp: 86, map: 92, ldr: 87 } },
    { id: 808, name: "Hirai", role: "COACH", team: "KT", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 25, tmf: 85, frm: 15, cmp: 85, map: 88, ldr: 89 } },
    { id: 809, name: "Bigfafa", role: "COACH", team: "BLG", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 28, tmf: 95, frm: 14, cmp: 93, map: 94, ldr: 92 } },
    
    // --- T1 (LCK) ---
    { id: 101, name: "Faker", role: "MID", team: "T1", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 95, tmf: 99, frm: 94, cmp: 99, map: 98, ldr: 99 } },
    { id: 102, name: "Zeus", role: "TOP", team: "T1", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 95, cmp: 91, map: 85, ldr: 82 } },
    { id: 103, name: "Oner", role: "JNG", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 88, cmp: 89, map: 91, ldr: 85 } },
    { id: 104, name: "Gumayusi", role: "ADC", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 98, map: 82, ldr: 84 } },
    { id: 105, name: "Keria", role: "SUP", team: "T1", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 90, tmf: 92, frm: 35, cmp: 95, map: 96, ldr: 90 } },

    // --- Gen.G (LCK) ---
    { id: 111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 88, ldr: 89 } },
    { id: 112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2024, rating: 96, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 95, frm: 98, cmp: 94, map: 97, ldr: 90 } },
    { id: 113, name: "Chovy", role: "MID", team: "Gen.G", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 99, tmf: 96, frm: 99, cmp: 96, map: 92, ldr: 88 } },
    { id: 114, name: "Peyz", role: "ADC", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 97, frm: 94, cmp: 92, map: 85, ldr: 82 } },
    { id: 115, name: "Lehends", role: "SUP", team: "Gen.G", year: 2024, rating: 92, quality: "Master", region: "LCK", stats: { mec: 82, tmf: 93, frm: 25, cmp: 94, map: 95, ldr: 93 } },

    // --- Hanwha Life (LCK) ---
    { id: 121, name: "Doran", role: "TOP", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 90, tmf: 88, frm: 90, cmp: 84, map: 82, ldr: 85 } },
    { id: 122, name: "Peanut", role: "JNG", team: "HLE", year: 2024, rating: 92, quality: "Master", region: "LCK", stats: { mec: 86, tmf: 94, frm: 88, cmp: 93, map: 96, ldr: 95 } },
    { id: 123, name: "Zeka", role: "MID", team: "HLE", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 93, cmp: 88, map: 86, ldr: 83 } },
    { id: 124, name: "Viper", role: "ADC", team: "HLE", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 96, tmf: 95, frm: 94, cmp: 91, map: 88, ldr: 86 } },
    { id: 125, name: "Delight", role: "SUP", team: "HLE", year: 2024, rating: 90, quality: "Diamond", region: "LCK", stats: { mec: 84, tmf: 93, frm: 30, cmp: 88, map: 91, ldr: 86 } },

    // --- Dplus KIA (LCK) ---
    { id: 131, name: "Kingen", role: "TOP", team: "DK", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 86, tmf: 89, frm: 87, cmp: 85, map: 81, ldr: 84 } },
    { id: 132, name: "Lucid", role: "JNG", team: "DK", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 85, frm: 86, cmp: 83, map: 85, ldr: 81 } },
    { id: 133, name: "ShowMaker", role: "MID", team: "DK", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 91, cmp: 92, map: 90, ldr: 91 } },
    { id: 134, name: "Aiming", role: "ADC", team: "DK", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 91, tmf: 88, frm: 90, cmp: 87, map: 82, ldr: 81 } },
    { id: 135, name: "Kellin", role: "SUP", team: "DK", year: 2024, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 82, tmf: 84, frm: 20, cmp: 85, map: 86, ldr: 82 } },

    // --- FearX (LCK - Lower Tier Fillers) ---
    { id: 141, name: "Clear", role: "TOP", team: "FOX", year: 2024, rating: 77, quality: "Silver", region: "LCK", stats: { mec: 78, tmf: 76, frm: 79, cmp: 74, map: 72, ldr: 70 } },
    { id: 142, name: "Willer", role: "JNG", team: "FOX", year: 2024, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 80, frm: 81, cmp: 78, map: 82, ldr: 77 } },
    { id: 143, name: "Clozer", role: "MID", team: "FOX", year: 2024, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 86, tmf: 81, frm: 83, cmp: 80, map: 77, ldr: 75 } },
    { id: 144, name: "Hena", role: "ADC", team: "FOX", year: 2024, rating: 78, quality: "Silver", region: "LCK", stats: { mec: 79, tmf: 78, frm: 80, cmp: 76, map: 73, ldr: 72 } },
    { id: 145, name: "Execute", role: "SUP", team: "FOX", year: 2024, rating: 76, quality: "Silver", region: "LCK", stats: { mec: 72, tmf: 75, frm: 18, cmp: 74, map: 76, ldr: 73 } },

    // --- BLG (LPL) ---
    { id: 201, name: "Bin", role: "TOP", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 95, frm: 96, cmp: 94, map: 89, ldr: 88 } },
    { id: 202, name: "Xun", role: "JNG", team: "BLG", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 91, tmf: 89, frm: 92, cmp: 88, map: 89, ldr: 87 } },
    { id: 203, name: "Knight", role: "MID", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL", stats: { mec: 98, tmf: 97, frm: 96, cmp: 95, map: 94, ldr: 90 } },
    { id: 204, name: "Elk", role: "ADC", team: "BLG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL", stats: { mec: 96, tmf: 95, frm: 95, cmp: 92, map: 88, ldr: 85 } },
    { id: 205, name: "ON", role: "SUP", team: "BLG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 90, frm: 28, cmp: 90, map: 91, ldr: 86 } },

    // --- JDG (LPL) ---
    { id: 211, name: "Flandre", role: "TOP", team: "JDG", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 89, frm: 88, cmp: 90, map: 85, ldr: 88 } },
    { id: 212, name: "Kanavi", role: "JNG", team: "JDG", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 93, frm: 96, cmp: 92, map: 94, ldr: 89 } },
    { id: 213, name: "Yagao", role: "MID", team: "JDG", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 92, frm: 90, cmp: 89, map: 91, ldr: 90 } },
    { id: 214, name: "Ruler", role: "ADC", team: "JDG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 89, ldr: 90 } },
    { id: 215, name: "MISSING", role: "SUP", team: "JDG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 85, tmf: 92, frm: 22, cmp: 90, map: 93, ldr: 90 } },

    // --- G2 (LEC) ---
    { id: 301, name: "BrokenBlade", role: "TOP", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 85, tmf: 89, frm: 86, cmp: 88, map: 84, ldr: 88 } },
    { id: 302, name: "Yike", role: "JNG", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 86, frm: 87, cmp: 85, map: 86, ldr: 82 } },
    { id: 303, name: "Caps", role: "MID", team: "G2", year: 2024, rating: 95, quality: "Grandmaster", region: "LEC", stats: { mec: 95, tmf: 96, frm: 94, cmp: 97, map: 95, ldr: 96 } },
    { id: 304, name: "Hans Sama", role: "ADC", team: "G2", year: 2024, rating: 90, quality: "Diamond", region: "LEC", stats: { mec: 91, tmf: 89, frm: 91, cmp: 88, map: 85, ldr: 84 } },
    { id: 305, name: "Mikyx", role: "SUP", team: "G2", year: 2024, rating: 92, quality: "Master", region: "LEC", stats: { mec: 86, tmf: 93, frm: 25, cmp: 94, map: 94, ldr: 92 } },

    // --- Team Liquid (LCS) ---
    { id: 401, name: "Impact", role: "TOP", team: "TL", year: 2024, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 82, tmf: 89, frm: 86, cmp: 88, map: 86, ldr: 94 } },
    { id: 402, name: "UmTi", role: "JNG", team: "TL", year: 2024, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 83, tmf: 86, frm: 84, cmp: 85, map: 88, ldr: 87 } },
    { id: 403, name: "Apa", role: "MID", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 79, frm: 80, cmp: 76, map: 75, ldr: 74 } },
    { id: 404, name: "Yeon", role: "ADC", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 81, tmf: 78, frm: 81, cmp: 77, map: 74, ldr: 72 } },
    { id: 405, name: "CoreJJ", role: "SUP", team: "TL", year: 2024, rating: 89, quality: "Diamond", region: "LCS", stats: { mec: 80, tmf: 90, frm: 22, cmp: 91, map: 93, ldr: 96 } },

    // === HISTORIC LEGENDS (Legacy Works as Chemistry Wildcard) ===
    
    // SKT T1 2015-2016
    { id: 901, name: "Faker", role: "MID", team: "SKT", year: 2015, rating: 99, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 99, frm: 98, cmp: 99, map: 98, ldr: 99 } },
    { id: 925, name: "MaRin", role: "TOP", team: "SKT", year: 2015, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 95, ldr: 97 } },
    { id: 926, name: "Bang", role: "ADC", team: "SKT", year: 2015, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 97, frm: 96, cmp: 98, map: 89, ldr: 88 } },
    { id: 927, name: "Wolf", role: "SUP", team: "SKT", year: 2015, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 96, frm: 25, cmp: 95, map: 96, ldr: 94 } },
    { id: 942, name: "Bengi", role: "JNG", team: "SKT", year: 2016, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 86, tmf: 96, frm: 88, cmp: 98, map: 99, ldr: 95 } },
    { id: 943, name: "Duke", role: "TOP", team: "SKT", year: 2016, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 91, frm: 97, cmp: 92, map: 88, ldr: 86 } },

    // IG 2018
    { id: 902, name: "TheShy", role: "TOP", team: "IG", year: 2018, rating: 97, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 95, frm: 97, cmp: 94, map: 88, ldr: 85 } },
    { id: 906, name: "Rookie", role: "MID", team: "IG", year: 2018, rating: 97, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 97, cmp: 95, map: 94, ldr: 94 } },
    { id: 944, name: "Ning", role: "JNG", team: "IG", year: 2018, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 92, cmp: 90, map: 94, ldr: 89 } },
    { id: 945, name: "JackeyLove", role: "ADC", team: "IG", year: 2018, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 97, tmf: 96, frm: 95, cmp: 92, map: 89, ldr: 88 } },
    { id: 946, name: "Baolan", role: "SUP", team: "IG", year: 2018, rating: 92, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 95, frm: 22, cmp: 92, map: 92, ldr: 90 } },

    // SSW 2014
    { id: 903, name: "Mata", role: "SUP", team: "SSW", year: 2014, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 92, tmf: 96, frm: 25, cmp: 97, map: 99, ldr: 98 } },
    { id: 921, name: "Looper", role: "TOP", team: "SSW", year: 2014, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 92, tmf: 94, frm: 91, cmp: 95, map: 94, ldr: 90 } },
    { id: 922, name: "DanDy", role: "JNG", team: "SSW", year: 2014, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 97, frm: 95, cmp: 95, map: 98, ldr: 94 } },
    { id: 923, name: "PawN", role: "MID", team: "SSW", year: 2014, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 93, cmp: 95, map: 92, ldr: 91 } },
    { id: 924, name: "imp", role: "ADC", team: "SSW", year: 2014, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 97, tmf: 95, frm: 95, cmp: 94, map: 90, ldr: 89 } },

    // SSG 2017
    { id: 904, name: "Ambition", role: "JNG", team: "SSG", year: 2017, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 95, frm: 92, cmp: 93, map: 98, ldr: 99 } },
    { id: 947, name: "CuVee", role: "TOP", team: "SSG", year: 2017, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 95, cmp: 95, map: 89, ldr: 88 } },
    { id: 948, name: "Crown", role: "MID", team: "SSG", year: 2017, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 92, tmf: 95, frm: 96, cmp: 96, map: 92, ldr: 90 } },
    { id: 949, name: "Ruler", role: "ADC", team: "SSG", year: 2017, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 97, tmf: 98, frm: 97, cmp: 96, map: 91, ldr: 92 } },
    { id: 950, name: "CoreJJ", role: "SUP", team: "SSG", year: 2017, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 89, tmf: 96, frm: 26, cmp: 96, map: 97, ldr: 95 } },

    // Damwon 2020
    { id: 907, name: "ShowMaker", role: "MID", team: "DK", year: 2020, rating: 98, quality: "Legacy", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 98, cmp: 97, map: 96, ldr: 96 } },
    { id: 908, name: "Canyon", role: "JNG", team: "DK", year: 2020, rating: 98, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 98, frm: 99, cmp: 96, map: 99, ldr: 94 } },
    { id: 951, name: "Nuguri", role: "TOP", team: "DK", year: 2020, rating: 97, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 98, cmp: 92, map: 90, ldr: 88 } },
    { id: 952, name: "Ghost", role: "ADC", team: "DK", year: 2020, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 90, tmf: 96, frm: 94, cmp: 98, map: 94, ldr: 92 } },
    { id: 953, name: "BeryL", role: "SUP", team: "DK", year: 2020, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 86, tmf: 95, frm: 20, cmp: 96, map: 99, ldr: 97 } },

    // Alternative Active Stars
    { id: 954, name: "Faker", role: "MID", team: "SKT", year: 2017, rating: 97, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 99, frm: 95, cmp: 99, map: 98, ldr: 99 } },
    { id: 955, name: "Chovy", role: "MID", team: "Gen.G", year: 2022, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 98, tmf: 94, frm: 99, cmp: 93, map: 92, ldr: 88 } },
    { id: 956, name: "Caps", role: "MID", team: "G2", year: 2020, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 93, frm: 92, cmp: 94, map: 95, ldr: 94 } }
];

window.playerDatabase = baseDatabase.map(p => {
    return { ...p, stats: p.stats ? p.stats : genStats(p.rating) };
});