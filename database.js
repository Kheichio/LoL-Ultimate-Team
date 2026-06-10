window.roleIcons = { TOP: "┪", JNG: "⚔️", MID: "✦", ADC: "🏹", SUP: "🛡️", COACH: "📋" };
window.regionLogos = { LCK: "🇰🇷 LCK", LPL: "🇨🇳 LPL", LEC: "🇪🇺 LEC", LCS: "🇺🇸 LCS", Legacy: "👑 ICON" };
window.teamLineageBridges = { "SKT": "T1", "SKT T1": "T1", "SSG": "Gen.G", "SSW": "Gen.G", "Samsung Galaxy": "Gen.G", "FNC": "Fnatic", "ROX": "HLE", "DK": "Dplus KIA", "IG": "Invictus Gaming", "FPX": "FunPlus Phoenix", "DRX": "DragonX" };

function genStats(rating) {
    const v = () => Math.floor(Math.random() * 8) - 4; 
    return { mec: Math.min(99, rating + v()), frm: Math.min(99, rating + v()), map: Math.min(99, rating + v()), tmf: Math.min(99, rating + v()), cmp: Math.min(99, rating + v()), ldr: Math.min(99, rating + v()) };
}

const baseDatabase = [
    // --- COACHES ---
    { id: 801, name: "kkOma", role: "COACH", team: "T1", year: 2024, rating: 98, quality: "Master", region: "LCK" },
    { id: 802, name: "Edgar", role: "COACH", team: "Gen.G", year: 2024, rating: 95, quality: "Diamond", region: "LCK" },
    { id: 803, name: "Homme", role: "COACH", team: "JDG", year: 2023, rating: 96, quality: "Master", region: "LPL" },
    { id: 804, name: "Dylan Falco", role: "COACH", team: "G2", year: 2024, rating: 92, quality: "Diamond", region: "LEC" },
    { id: 805, name: "Reapered", role: "COACH", team: "C9", year: 2024, rating: 90, quality: "Platinum", region: "LCS" },
    { id: 806, name: "Mac", role: "COACH", team: "MAD", year: 2024, rating: 88, quality: "Gold", region: "LEC" },
    { id: 807, name: "DanDy", role: "COACH", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK" },
    { id: 808, name: "Hirai", role: "COACH", team: "KT", year: 2024, rating: 87, quality: "Platinum", region: "LCK" },
    { id: 809, name: "Bigfafa", role: "COACH", team: "BLG", year: 2024, rating: 94, quality: "Master", region: "LPL" },
    
    // --- T1 (LCK) ---
    { id: 101, name: "Faker", role: "MID", team: "T1", year: 2024, rating: 98, quality: "Challenger", region: "LCK" },
    { id: 102, name: "Zeus", role: "TOP", team: "T1", year: 2024, rating: 94, quality: "Master", region: "LCK" },
    { id: 103, name: "Oner", role: "JNG", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK" },
    { id: 104, name: "Gumayusi", role: "ADC", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK" },
    { id: 105, name: "Keria", role: "SUP", team: "T1", year: 2024, rating: 93, quality: "Master", region: "LCK" },

    // --- Gen.G (LCK) ---
    { id: 111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK" },
    { id: 112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2024, rating: 96, quality: "Grandmaster", region: "LCK" },
    { id: 113, name: "Chovy", role: "MID", team: "Gen.G", year: 2024, rating: 98, quality: "Challenger", region: "LCK" },
    { id: 114, name: "Peyz", role: "ADC", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK" },
    { id: 115, name: "Lehends", role: "SUP", team: "Gen.G", year: 2024, rating: 92, quality: "Master", region: "LCK" },

    // --- Hanwha Life (LCK) ---
    { id: 121, name: "Doran", role: "TOP", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK" },
    { id: 122, name: "Peanut", role: "JNG", team: "HLE", year: 2024, rating: 92, quality: "Master", region: "LCK" },
    { id: 123, name: "Zeka", role: "MID", team: "HLE", year: 2024, rating: 93, quality: "Master", region: "LCK" },
    { id: 124, name: "Viper", role: "ADC", team: "HLE", year: 2024, rating: 94, quality: "Master", region: "LCK" },
    { id: 125, name: "Delight", role: "SUP", team: "HLE", year: 2024, rating: 90, quality: "Diamond", region: "LCK" },

    // --- Dplus KIA (LCK) ---
    { id: 131, name: "Kingen", role: "TOP", team: "DK", year: 2024, rating: 87, quality: "Platinum", region: "LCK" },
    { id: 132, name: "Lucid", role: "JNG", team: "DK", year: 2024, rating: 86, quality: "Platinum", region: "LCK" },
    { id: 133, name: "ShowMaker", role: "MID", team: "DK", year: 2024, rating: 91, quality: "Diamond", region: "LCK" },
    { id: 134, name: "Aiming", role: "ADC", team: "DK", year: 2024, rating: 89, quality: "Diamond", region: "LCK" },
    { id: 135, name: "Kellin", role: "SUP", team: "DK", year: 2024, rating: 85, quality: "Platinum", region: "LCK" },

    // --- FearX (LCK - Lower Tier Fillers) ---
    { id: 141, name: "Clear", role: "TOP", team: "FOX", year: 2024, rating: 77, quality: "Silver", region: "LCK" },
    { id: 142, name: "Willer", role: "JNG", team: "FOX", year: 2024, rating: 81, quality: "Gold", region: "LCK" },
    { id: 143, name: "Clozer", role: "MID", team: "FOX", year: 2024, rating: 83, quality: "Gold", region: "LCK" },
    { id: 144, name: "Hena", role: "ADC", team: "FOX", year: 2024, rating: 78, quality: "Silver", region: "LCK" },
    { id: 145, name: "Execute", role: "SUP", team: "FOX", year: 2024, rating: 76, quality: "Silver", region: "LCK" },

    // --- BLG (LPL) ---
    { id: 201, name: "Bin", role: "TOP", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL" },
    { id: 202, name: "Xun", role: "JNG", team: "BLG", year: 2024, rating: 90, quality: "Diamond", region: "LPL" },
    { id: 203, name: "Knight", role: "MID", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL" },
    { id: 204, name: "Elk", role: "ADC", team: "BLG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL" },
    { id: 205, name: "ON", role: "SUP", team: "BLG", year: 2024, rating: 91, quality: "Diamond", region: "LPL" },

    // --- JDG (LPL) ---
    { id: 211, name: "Flandre", role: "TOP", team: "JDG", year: 2024, rating: 88, quality: "Platinum", region: "LPL" },
    { id: 212, name: "Kanavi", role: "JNG", team: "JDG", year: 2024, rating: 94, quality: "Master", region: "LPL" },
    { id: 213, name: "Yagao", role: "MID", team: "JDG", year: 2024, rating: 90, quality: "Diamond", region: "LPL" },
    { id: 214, name: "Ruler", role: "ADC", team: "JDG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL" },
    { id: 215, name: "MISSING", role: "SUP", team: "JDG", year: 2024, rating: 91, quality: "Diamond", region: "LPL" },

    // --- TES (LPL) ---
    { id: 221, name: "369", role: "TOP", team: "TES", year: 2024, rating: 93, quality: "Master", region: "LPL" },
    { id: 222, name: "Tian", role: "JNG", team: "TES", year: 2024, rating: 90, quality: "Diamond", region: "LPL" },
    { id: 223, name: "Creme", role: "MID", team: "TES", year: 2024, rating: 89, quality: "Diamond", region: "LPL" },
    { id: 224, name: "JackeyLove", role: "ADC", team: "TES", year: 2024, rating: 94, quality: "Master", region: "LPL" },
    { id: 225, name: "Meiko", role: "SUP", team: "TES", year: 2024, rating: 92, quality: "Master", region: "LPL" },

    // --- NIP (LPL - Mid Tier) ---
    { id: 231, name: "shanji", role: "TOP", team: "NIP", year: 2024, rating: 84, quality: "Gold", region: "LPL" },
    { id: 232, name: "AKi", role: "JNG", team: "NIP", year: 2024, rating: 82, quality: "Gold", region: "LPL" },
    { id: 233, name: "Rookie", role: "MID", team: "NIP", year: 2024, rating: 88, quality: "Platinum", region: "LPL" },
    { id: 234, name: "Photic", role: "ADC", team: "NIP", year: 2024, rating: 85, quality: "Platinum", region: "LPL" },
    { id: 235, name: "Zhuo", role: "SUP", team: "NIP", year: 2024, rating: 80, quality: "Gold", region: "LPL" },

    // --- G2 (LEC) ---
    { id: 301, name: "BrokenBlade", role: "TOP", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC" },
    { id: 302, name: "Yike", role: "JNG", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC" },
    { id: 303, name: "Caps", role: "MID", team: "G2", year: 2024, rating: 95, quality: "Grandmaster", region: "LEC" },
    { id: 304, name: "Hans Sama", role: "ADC", team: "G2", year: 2024, rating: 90, quality: "Diamond", region: "LEC" },
    { id: 305, name: "Mikyx", role: "SUP", team: "G2", year: 2024, rating: 92, quality: "Master", region: "LEC" },

    // --- Fnatic (LEC) ---
    { id: 311, name: "Oscarinin", role: "TOP", team: "FNC", year: 2024, rating: 84, quality: "Gold", region: "LEC" },
    { id: 312, name: "Razork", role: "JNG", team: "FNC", year: 2024, rating: 88, quality: "Platinum", region: "LEC" },
    { id: 313, name: "Humanoid", role: "MID", team: "FNC", year: 2024, rating: 87, quality: "Platinum", region: "LEC" },
    { id: 314, name: "Noah", role: "ADC", team: "FNC", year: 2024, rating: 85, quality: "Platinum", region: "LEC" },
    { id: 315, name: "Jun", role: "SUP", team: "FNC", year: 2024, rating: 86, quality: "Platinum", region: "LEC" },

    // --- MAD Lions (LEC) ---
    { id: 321, name: "Myrwn", role: "TOP", team: "MAD", year: 2024, rating: 81, quality: "Gold", region: "LEC" },
    { id: 322, name: "Elyoya", role: "JNG", team: "MAD", year: 2024, rating: 86, quality: "Platinum", region: "LEC" },
    { id: 323, name: "Fresskowy", role: "MID", team: "MAD", year: 2024, rating: 78, quality: "Silver", region: "LEC" },
    { id: 324, name: "Supa", role: "ADC", team: "MAD", year: 2024, rating: 82, quality: "Gold", region: "LEC" },
    { id: 325, name: "Alvaro", role: "SUP", team: "MAD", year: 2024, rating: 83, quality: "Gold", region: "LEC" },

    // --- Team Liquid (LCS) ---
    { id: 401, name: "Impact", role: "TOP", team: "TL", year: 2024, rating: 86, quality: "Platinum", region: "LCS" },
    { id: 402, name: "UmTi", role: "JNG", team: "TL", year: 2024, rating: 85, quality: "Platinum", region: "LCS" },
    { id: 403, name: "Apa", role: "MID", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS" },
    { id: 404, name: "Yeon", role: "ADC", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS" },
    { id: 405, name: "CoreJJ", role: "SUP", team: "TL", year: 2024, rating: 89, quality: "Diamond", region: "LCS" },

    // --- FlyQuest (LCS) ---
    { id: 411, name: "Bwipo", role: "TOP", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS" },
    { id: 412, name: "Inspired", role: "JNG", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS" },
    { id: 413, name: "Quad", role: "MID", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS" },
    { id: 414, name: "Massu", role: "ADC", team: "FLY", year: 2024, rating: 82, quality: "Gold", region: "LCS" },
    { id: 415, name: "Busio", role: "SUP", team: "FLY", year: 2024, rating: 83, quality: "Gold", region: "LCS" },

    // --- NRG (LCS) ---
    { id: 421, name: "Dhokla", role: "TOP", team: "NRG", year: 2024, rating: 76, quality: "Silver", region: "LCS" },
    { id: 422, name: "Contractz", role: "JNG", team: "NRG", year: 2024, rating: 79, quality: "Silver", region: "LCS" },
    { id: 423, name: "Palafox", role: "MID", team: "NRG", year: 2024, rating: 78, quality: "Silver", region: "LCS" },
    { id: 424, name: "FBI", role: "ADC", team: "NRG", year: 2024, rating: 81, quality: "Gold", region: "LCS" },
    { id: 425, name: "huhi", role: "SUP", team: "NRG", year: 2024, rating: 80, quality: "Gold", region: "LCS" },
    
    // --- Cloud9 (LCS) ---
    { id: 431, name: "Fudge", role: "TOP", team: "C9", year: 2024, rating: 82, quality: "Gold", region: "LCS" },
    { id: 432, name: "Blaber", role: "JNG", team: "C9", year: 2024, rating: 86, quality: "Platinum", region: "LCS" },
    { id: 433, name: "Jojopyun", role: "MID", team: "C9", year: 2024, rating: 85, quality: "Platinum", region: "LCS" },
    { id: 434, name: "Berserker", role: "ADC", team: "C9", year: 2024, rating: 88, quality: "Platinum", region: "LCS" },
    { id: 435, name: "Vulcan", role: "SUP", team: "C9", year: 2024, rating: 83, quality: "Gold", region: "LCS" },

    // --- HISTORIC LEGENDS (Legacy works as a chemistry wildcard) ---
    { id: 901, name: "Faker", role: "MID", team: "SKT", year: 2015, rating: 99, quality: "Legacy", region: "Legacy" },
    { id: 902, name: "TheShy", role: "TOP", team: "IG", year: 2018, rating: 97, quality: "Legacy", region: "Legacy" },
    { id: 903, name: "Mata", role: "SUP", team: "SSW", year: 2014, rating: 96, quality: "Legacy", region: "Legacy" },
    { id: 904, name: "Ambition", role: "JNG", team: "SSG", year: 2017, rating: 94, quality: "Legacy", region: "Legacy" },
    { id: 905, name: "Uzi", role: "ADC", team: "RNG", year: 2018, rating: 96, quality: "Legacy", region: "Legacy" },
    { id: 906, name: "Rookie", role: "MID", team: "IG", year: 2018, rating: 97, quality: "Legacy", region: "Legacy" },
    { id: 907, name: "ShowMaker", role: "MID", team: "DK", year: 2020, rating: 98, quality: "Legacy", region: "Legacy" },
    { id: 908, name: "Canyon", role: "JNG", team: "DK", year: 2020, rating: 98, quality: "Legacy", region: "Legacy" },
    { id: 909, name: "Smeb", role: "TOP", team: "ROX", year: 2016, rating: 96, quality: "Legacy", region: "Legacy" },
    { id: 910, name: "Deft", role: "ADC", team: "DRX", year: 2022, rating: 95, quality: "Legacy", region: "Legacy" },
    { id: 911, name: "BeryL", role: "SUP", team: "DRX", year: 2022, rating: 94, quality: "Legacy", region: "Legacy" },
    { id: 912, name: "Caps", role: "MID", team: "G2", year: 2019, rating: 95, quality: "Legacy", region: "Legacy" },
    { id: 913, name: "Perkz", role: "ADC", team: "G2", year: 2019, rating: 94, quality: "Legacy", region: "Legacy" },
    { id: 914, name: "Jankos", role: "JNG", team: "G2", year: 2019, rating: 93, quality: "Legacy", region: "Legacy" },
    { id: 915, name: "Wunder", role: "TOP", team: "G2", year: 2019, rating: 92, quality: "Legacy", region: "Legacy" },
    { id: 916, name: "Doinb", role: "MID", team: "FPX", year: 2019, rating: 96, quality: "Legacy", region: "Legacy" },
    { id: 917, name: "Tian", role: "JNG", team: "FPX", year: 2019, rating: 95, quality: "Legacy", region: "Legacy" },
    { id: 918, name: "Crisp", role: "SUP", team: "FPX", year: 2019, rating: 94, quality: "Legacy", region: "Legacy" },
    { id: 919, name: "Lwx", role: "ADC", team: "FPX", year: 2019, rating: 93, quality: "Legacy", region: "Legacy" },
    { id: 920, name: "GimGoon", role: "TOP", team: "FPX", year: 2019, rating: 91, quality: "Legacy", region: "Legacy" }
];

window.playerDatabase = baseDatabase.map(p => {
    return { ...p, stats: p.stats ? p.stats : genStats(p.rating) };
});