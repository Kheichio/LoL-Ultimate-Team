// database.js

window.roleIcons = { TOP: "┪", JNG: "⚔️", MID: "✦", ADC: "🏹", SUP: "🛡️", COACH: "📋" };
window.regionLogos = { LCK: "🇰🇷 LCK", LPL: "🇨🇳 LPL", LEC: "🇪🇺 LEC", LCS: "🇺🇸 LCS", Legacy: "👑 ICON" };
window.teamLineageBridges = { "SKT": "T1", "SKT T1": "T1", "SSG": "Gen.G", "SSW": "Gen.G", "Samsung Galaxy": "Gen.G", "FNC": "Fnatic", "ROX": "HLE", "DK": "Dplus KIA", "IG": "Invictus Gaming", "FPX": "FunPlus Phoenix", "DRX": "DragonX", "EDG": "EDward Gaming", "RNG": "Royal Never Give Up" };

// Fallback generator for future dynamic cards (if you ever need it)
function genStats(rating) {
    const v = () => Math.floor(Math.random() * 8) - 4; 
    return { mec: Math.min(99, rating + v()), frm: Math.min(99, rating + v()), map: Math.min(99, rating + v()), tmf: Math.min(99, rating + v()), cmp: Math.min(99, rating + v()), ldr: Math.min(99, rating + v()) };
}

const baseDatabase = [
    // --- COACHES ---
    { id: 801, name: "kkOma", role: "COACH", team: "T1", year: 2024, rating: 98, quality: "Master", region: "LCK", stats: { mec: 70, tmf: 99, frm: 80, cmp: 98, map: 99, ldr: 99 } },
    { id: 802, name: "Edgar", role: "COACH", team: "Gen.G", year: 2024, rating: 95, quality: "Diamond", region: "LCK", stats: { mec: 65, tmf: 96, frm: 75, cmp: 94, map: 96, ldr: 97 } },
    { id: 803, name: "Homme", role: "COACH", team: "JDG", year: 2023, rating: 96, quality: "Master", region: "LPL", stats: { mec: 72, tmf: 97, frm: 78, cmp: 96, map: 95, ldr: 96 } },
    { id: 804, name: "Dylan Falco", role: "COACH", team: "G2", year: 2024, rating: 92, quality: "Diamond", region: "LEC", stats: { mec: 75, tmf: 92, frm: 70, cmp: 98, map: 90, ldr: 93 } },
    { id: 805, name: "Reapered", role: "COACH", team: "C9", year: 2024, rating: 90, quality: "Platinum", region: "LCS", stats: { mec: 80, tmf: 89, frm: 72, cmp: 92, map: 88, ldr: 91 } },
    { id: 806, name: "Mac", role: "COACH", team: "MAD", year: 2024, rating: 88, quality: "Gold", region: "LEC", stats: { mec: 60, tmf: 90, frm: 65, cmp: 87, map: 89, ldr: 88 } },
    { id: 807, name: "DanDy", role: "COACH", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 85, tmf: 88, frm: 70, cmp: 86, map: 92, ldr: 87 } },
    { id: 808, name: "Hirai", role: "COACH", team: "KT", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 68, tmf: 87, frm: 69, cmp: 85, map: 88, ldr: 89 } },
    { id: 809, name: "Bigfafa", role: "COACH", team: "BLG", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 70, tmf: 95, frm: 75, cmp: 93, map: 94, ldr: 92 } },
    
    // --- T1 (LCK) ---
    { id: 101, name: "Faker", role: "MID", team: "T1", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 95, tmf: 99, frm: 94, cmp: 99, map: 99, ldr: 99 } },
    { id: 102, name: "Zeus", role: "TOP", team: "T1", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 95, cmp: 91, map: 89, ldr: 85 } },
    { id: 103, name: "Oner", role: "JNG", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 88, cmp: 89, map: 91, ldr: 87 } },
    { id: 104, name: "Gumayusi", role: "ADC", team: "T1", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 92, tmf: 93, frm: 92, cmp: 86, map: 88, ldr: 89 } },
    { id: 105, name: "Keria", role: "SUP", team: "T1", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 96, tmf: 91, frm: 82, cmp: 98, map: 94, ldr: 90 } },

    // --- Gen.G (LCK) ---
    { id: 111, name: "Kiin", role: "TOP", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 94, ldr: 92 } },
    { id: 112, name: "Canyon", role: "JNG", team: "Gen.G", year: 2024, rating: 96, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 95, frm: 98, cmp: 94, map: 97, ldr: 90 } },
    { id: 113, name: "Chovy", role: "MID", team: "Gen.G", year: 2024, rating: 98, quality: "Challenger", region: "LCK", stats: { mec: 99, tmf: 96, frm: 99, cmp: 96, map: 95, ldr: 91 } },
    { id: 114, name: "Peyz", role: "ADC", team: "Gen.G", year: 2024, rating: 95, quality: "Grandmaster", region: "LCK", stats: { mec: 96, tmf: 97, frm: 94, cmp: 92, map: 90, ldr: 85 } },
    { id: 115, name: "Lehends", role: "SUP", team: "Gen.G", year: 2024, rating: 92, quality: "Master", region: "LCK", stats: { mec: 88, tmf: 93, frm: 80, cmp: 94, map: 95, ldr: 93 } },

    // --- Hanwha Life (LCK) ---
    { id: 121, name: "Doran", role: "TOP", team: "HLE", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 90, tmf: 88, frm: 90, cmp: 86, map: 85, ldr: 87 } },
    { id: 122, name: "Peanut", role: "JNG", team: "HLE", year: 2024, rating: 92, quality: "Master", region: "LCK", stats: { mec: 86, tmf: 94, frm: 88, cmp: 93, map: 96, ldr: 95 } },
    { id: 123, name: "Zeka", role: "MID", team: "HLE", year: 2024, rating: 93, quality: "Master", region: "LCK", stats: { mec: 97, tmf: 92, frm: 93, cmp: 88, map: 89, ldr: 85 } },
    { id: 124, name: "Viper", role: "ADC", team: "HLE", year: 2024, rating: 94, quality: "Master", region: "LCK", stats: { mec: 96, tmf: 95, frm: 94, cmp: 91, map: 90, ldr: 89 } },
    { id: 125, name: "Delight", role: "SUP", team: "HLE", year: 2024, rating: 90, quality: "Diamond", region: "LCK", stats: { mec: 87, tmf: 93, frm: 75, cmp: 88, map: 91, ldr: 86 } },

    // --- Dplus KIA (LCK) ---
    { id: 131, name: "Kingen", role: "TOP", team: "DK", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 86, tmf: 89, frm: 87, cmp: 85, map: 84, ldr: 86 } },
    { id: 132, name: "Lucid", role: "JNG", team: "DK", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 88, tmf: 85, frm: 86, cmp: 83, map: 85, ldr: 81 } },
    { id: 133, name: "ShowMaker", role: "MID", team: "DK", year: 2024, rating: 91, quality: "Diamond", region: "LCK", stats: { mec: 93, tmf: 90, frm: 91, cmp: 92, map: 90, ldr: 91 } },
    { id: 134, name: "Aiming", role: "ADC", team: "DK", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 91, tmf: 88, frm: 90, cmp: 87, map: 85, ldr: 84 } },
    { id: 135, name: "Kellin", role: "SUP", team: "DK", year: 2024, rating: 85, quality: "Platinum", region: "LCK", stats: { mec: 86, tmf: 84, frm: 72, cmp: 85, map: 86, ldr: 82 } },

    // --- FearX (LCK) ---
    { id: 141, name: "Clear", role: "TOP", team: "FOX", year: 2024, rating: 77, quality: "Silver", region: "LCK", stats: { mec: 78, tmf: 76, frm: 79, cmp: 74, map: 75, ldr: 72 } },
    { id: 142, name: "Willer", role: "JNG", team: "FOX", year: 2024, rating: 81, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 80, frm: 81, cmp: 78, map: 82, ldr: 77 } },
    { id: 143, name: "Clozer", role: "MID", team: "FOX", year: 2024, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 86, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 78 } },
    { id: 144, name: "Hena", role: "ADC", team: "FOX", year: 2024, rating: 78, quality: "Silver", region: "LCK", stats: { mec: 79, tmf: 78, frm: 80, cmp: 76, map: 75, ldr: 74 } },
    { id: 145, name: "Execute", role: "SUP", team: "FOX", year: 2024, rating: 76, quality: "Silver", region: "LCK", stats: { mec: 77, tmf: 75, frm: 65, cmp: 74, map: 76, ldr: 73 } },

    // --- KT Rolster (LCK) ---
    { id: 151, name: "PerfecT", role: "TOP", team: "KT", year: 2024, rating: 82, quality: "Gold", region: "LCK", stats: { mec: 84, tmf: 80, frm: 83, cmp: 79, map: 80, ldr: 75 } },
    { id: 152, name: "Pyosik", role: "JNG", team: "KT", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 85, frm: 86, cmp: 84, map: 87, ldr: 83 } },
    { id: 153, name: "Bdd", role: "MID", team: "KT", year: 2024, rating: 89, quality: "Diamond", region: "LCK", stats: { mec: 88, tmf: 90, frm: 91, cmp: 89, map: 88, ldr: 87 } },
    { id: 154, name: "Deft", role: "ADC", team: "KT", year: 2024, rating: 88, quality: "Platinum", region: "LCK", stats: { mec: 87, tmf: 90, frm: 89, cmp: 88, map: 86, ldr: 91 } },
    { id: 155, name: "BeryL", role: "SUP", team: "KT", year: 2024, rating: 87, quality: "Platinum", region: "LCK", stats: { mec: 80, tmf: 88, frm: 70, cmp: 92, map: 93, ldr: 94 } },

    // --- Kwangdong Freecs (LCK) ---
    { id: 161, name: "DuDu", role: "TOP", team: "KDF", year: 2024, rating: 83, quality: "Gold", region: "LCK", stats: { mec: 85, tmf: 81, frm: 84, cmp: 80, map: 81, ldr: 79 } },
    { id: 162, name: "Cuzz", role: "JNG", team: "KDF", year: 2024, rating: 86, quality: "Platinum", region: "LCK", stats: { mec: 84, tmf: 87, frm: 85, cmp: 85, map: 88, ldr: 86 } },
    { id: 163, name: "BullDog", role: "MID", team: "KDF", year: 2024, rating: 80, quality: "Gold", region: "LCK", stats: { mec: 82, tmf: 79, frm: 81, cmp: 78, map: 79, ldr: 76 } },
    { id: 164, name: "Bull", role: "ADC", team: "KDF", year: 2024, rating: 74, quality: "Silver", region: "LCK", stats: { mec: 76, tmf: 73, frm: 75, cmp: 72, map: 71, ldr: 70 } },
    { id: 165, name: "Andil", role: "SUP", team: "KDF", year: 2024, rating: 75, quality: "Silver", region: "LCK", stats: { mec: 75, tmf: 74, frm: 60, cmp: 73, map: 76, ldr: 72 } },

    // --- BLG (LPL) ---
    { id: 201, name: "Bin", role: "TOP", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL", stats: { mec: 99, tmf: 95, frm: 96, cmp: 94, map: 93, ldr: 90 } },
    { id: 202, name: "Xun", role: "JNG", team: "BLG", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 91, tmf: 89, frm: 92, cmp: 88, map: 89, ldr: 87 } },
    { id: 203, name: "Knight", role: "MID", team: "BLG", year: 2024, rating: 97, quality: "Challenger", region: "LPL", stats: { mec: 98, tmf: 97, frm: 96, cmp: 95, map: 96, ldr: 93 } },
    { id: 204, name: "Elk", role: "ADC", team: "BLG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL", stats: { mec: 96, tmf: 95, frm: 95, cmp: 92, map: 91, ldr: 88 } },
    { id: 205, name: "ON", role: "SUP", team: "BLG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 93, tmf: 90, frm: 75, cmp: 90, map: 91, ldr: 86 } },

    // --- JDG (LPL) ---
    { id: 211, name: "Flandre", role: "TOP", team: "JDG", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 89, frm: 88, cmp: 90, map: 89, ldr: 91 } },
    { id: 212, name: "Kanavi", role: "JNG", team: "JDG", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 95, tmf: 93, frm: 96, cmp: 92, map: 94, ldr: 89 } },
    { id: 213, name: "Yagao", role: "MID", team: "JDG", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 92, frm: 90, cmp: 89, map: 91, ldr: 90 } },
    { id: 214, name: "Ruler", role: "ADC", team: "JDG", year: 2024, rating: 95, quality: "Grandmaster", region: "LPL", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 92, ldr: 93 } },
    { id: 215, name: "MISSING", role: "SUP", team: "JDG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 92, frm: 78, cmp: 90, map: 93, ldr: 90 } },

    // --- TES (LPL) ---
    { id: 221, name: "369", role: "TOP", team: "TES", year: 2024, rating: 93, quality: "Master", region: "LPL", stats: { mec: 91, tmf: 95, frm: 93, cmp: 92, map: 94, ldr: 90 } },
    { id: 222, name: "Tian", role: "JNG", team: "TES", year: 2024, rating: 90, quality: "Diamond", region: "LPL", stats: { mec: 88, tmf: 91, frm: 89, cmp: 90, map: 92, ldr: 91 } },
    { id: 223, name: "Creme", role: "MID", team: "TES", year: 2024, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 92, tmf: 88, frm: 90, cmp: 86, map: 85, ldr: 82 } },
    { id: 224, name: "JackeyLove", role: "ADC", team: "TES", year: 2024, rating: 94, quality: "Master", region: "LPL", stats: { mec: 96, tmf: 94, frm: 95, cmp: 92, map: 90, ldr: 93 } },
    { id: 225, name: "Meiko", role: "SUP", team: "TES", year: 2024, rating: 92, quality: "Master", region: "LPL", stats: { mec: 88, tmf: 93, frm: 80, cmp: 92, map: 95, ldr: 96 } },

    // --- NIP (LPL) ---
    { id: 231, name: "shanji", role: "TOP", team: "NIP", year: 2024, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 85, tmf: 83, frm: 84, cmp: 82, map: 81, ldr: 80 } },
    { id: 232, name: "AKi", role: "JNG", team: "NIP", year: 2024, rating: 82, quality: "Gold", region: "LPL", stats: { mec: 81, tmf: 83, frm: 82, cmp: 80, map: 83, ldr: 81 } },
    { id: 233, name: "Rookie", role: "MID", team: "NIP", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 90, tmf: 87, frm: 88, cmp: 89, map: 86, ldr: 90 } },
    { id: 234, name: "Photic", role: "ADC", team: "NIP", year: 2024, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 84, frm: 85, cmp: 83, map: 82, ldr: 80 } },
    { id: 235, name: "Zhuo", role: "SUP", team: "NIP", year: 2024, rating: 80, quality: "Gold", region: "LPL", stats: { mec: 80, tmf: 81, frm: 65, cmp: 79, map: 81, ldr: 78 } },

    // --- Weibo Gaming (LPL) ---
    { id: 241, name: "Breathe", role: "TOP", team: "WBG", year: 2024, rating: 86, quality: "Platinum", region: "LPL", stats: { mec: 87, tmf: 85, frm: 88, cmp: 85, map: 84, ldr: 82 } },
    { id: 242, name: "Tarzan", role: "JNG", team: "WBG", year: 2024, rating: 91, quality: "Diamond", region: "LPL", stats: { mec: 89, tmf: 92, frm: 90, cmp: 91, map: 93, ldr: 89 } },
    { id: 243, name: "Xiaohu", role: "MID", team: "WBG", year: 2024, rating: 89, quality: "Diamond", region: "LPL", stats: { mec: 87, tmf: 90, frm: 89, cmp: 91, map: 90, ldr: 92 } },
    { id: 244, name: "Light", role: "ADC", team: "WBG", year: 2024, rating: 87, quality: "Platinum", region: "LPL", stats: { mec: 88, tmf: 87, frm: 89, cmp: 85, map: 84, ldr: 83 } },
    { id: 245, name: "Crisp", role: "SUP", team: "WBG", year: 2024, rating: 88, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 89, frm: 75, cmp: 88, map: 90, ldr: 89 } },

    // --- LNG Esports (LPL Addition) ---
    { id: 251, name: "Zika", role: "TOP", team: "LNG", year: 2024, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 87, tmf: 84, frm: 86, cmp: 83, map: 82, ldr: 80 } },
    { id: 252, name: "Weiwei", role: "JNG", team: "LNG", year: 2024, rating: 84, quality: "Gold", region: "LPL", stats: { mec: 83, tmf: 85, frm: 84, cmp: 82, map: 86, ldr: 81 } },
    { id: 253, name: "Scout", role: "MID", team: "LNG", year: 2024, rating: 92, quality: "Master", region: "LPL", stats: { mec: 93, tmf: 92, frm: 94, cmp: 91, map: 92, ldr: 93 } },
    { id: 254, name: "GALA", role: "ADC", team: "LNG", year: 2024, rating: 92, quality: "Master", region: "LPL", stats: { mec: 94, tmf: 93, frm: 95, cmp: 89, map: 88, ldr: 86 } },
    { id: 255, name: "Hang", role: "SUP", team: "LNG", year: 2024, rating: 85, quality: "Platinum", region: "LPL", stats: { mec: 86, tmf: 84, frm: 70, cmp: 85, map: 84, ldr: 82 } },

    // --- G2 (LEC) ---
    { id: 301, name: "BrokenBlade", role: "TOP", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 85, tmf: 89, frm: 86, cmp: 88, map: 87, ldr: 88 } },
    { id: 302, name: "Yike", role: "JNG", team: "G2", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 86, frm: 87, cmp: 85, map: 86, ldr: 82 } },
    { id: 303, name: "Caps", role: "MID", team: "G2", year: 2024, rating: 95, quality: "Grandmaster", region: "LEC", stats: { mec: 95, tmf: 96, frm: 94, cmp: 97, map: 95, ldr: 96 } },
    { id: 304, name: "Hans Sama", role: "ADC", team: "G2", year: 2024, rating: 90, quality: "Diamond", region: "LEC", stats: { mec: 91, tmf: 89, frm: 91, cmp: 88, map: 87, ldr: 86 } },
    { id: 305, name: "Mikyx", role: "SUP", team: "G2", year: 2024, rating: 92, quality: "Master", region: "LEC", stats: { mec: 90, tmf: 93, frm: 78, cmp: 94, map: 94, ldr: 92 } },

    // --- Fnatic (LEC) ---
    { id: 311, name: "Oscarinin", role: "TOP", team: "FNC", year: 2024, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 83, frm: 85, cmp: 82, map: 81, ldr: 79 } },
    { id: 312, name: "Razork", role: "JNG", team: "FNC", year: 2024, rating: 88, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 89, frm: 86, cmp: 87, map: 88, ldr: 90 } },
    { id: 313, name: "Humanoid", role: "MID", team: "FNC", year: 2024, rating: 87, quality: "Platinum", region: "LEC", stats: { mec: 88, tmf: 86, frm: 88, cmp: 86, map: 85, ldr: 84 } },
    { id: 314, name: "Noah", role: "ADC", team: "FNC", year: 2024, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 84, frm: 86, cmp: 83, map: 82, ldr: 80 } },
    { id: 315, name: "Jun", role: "SUP", team: "FNC", year: 2024, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 87, tmf: 85, frm: 74, cmp: 86, map: 85, ldr: 83 } },

    // --- MAD Lions (LEC) ---
    { id: 321, name: "Myrwn", role: "TOP", team: "MAD", year: 2024, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 80, frm: 82, cmp: 85, map: 79, ldr: 78 } },
    { id: 322, name: "Elyoya", role: "JNG", team: "MAD", year: 2024, rating: 86, quality: "Platinum", region: "LEC", stats: { mec: 85, tmf: 87, frm: 85, cmp: 86, map: 88, ldr: 91 } },
    { id: 323, name: "Fresskowy", role: "MID", team: "MAD", year: 2024, rating: 78, quality: "Silver", region: "LEC", stats: { mec: 80, tmf: 77, frm: 79, cmp: 76, map: 77, ldr: 75 } },
    { id: 324, name: "Supa", role: "ADC", team: "MAD", year: 2024, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 84, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 80 } },
    { id: 325, name: "Alvaro", role: "SUP", team: "MAD", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 84, frm: 70, cmp: 82, map: 83, ldr: 81 } },

    // --- Team Vitality (LEC) ---
    { id: 331, name: "Photon", role: "TOP", team: "VIT", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 82, frm: 84, cmp: 81, map: 80, ldr: 78 } },
    { id: 332, name: "Lyncas", role: "JNG", team: "VIT", year: 2024, rating: 79, quality: "Silver", region: "LEC", stats: { mec: 80, tmf: 78, frm: 79, cmp: 77, map: 80, ldr: 76 } },
    { id: 333, name: "Vetheo", role: "MID", team: "VIT", year: 2024, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 85, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 77 } },
    { id: 334, name: "Carzzy", role: "ADC", team: "VIT", year: 2024, rating: 85, quality: "Platinum", region: "LEC", stats: { mec: 86, tmf: 85, frm: 86, cmp: 83, map: 82, ldr: 84 } },
    { id: 335, name: "Hylissang", role: "SUP", team: "VIT", year: 2024, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 83, tmf: 82, frm: 65, cmp: 80, map: 83, ldr: 85 } },

    // --- Team BDS (LEC Addition) ---
    { id: 341, name: "Adam", role: "TOP", team: "BDS", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 84, frm: 81, cmp: 78, map: 81, ldr: 83 } },
    { id: 342, name: "Sheo", role: "JNG", team: "BDS", year: 2024, rating: 82, quality: "Gold", region: "LEC", stats: { mec: 81, tmf: 83, frm: 82, cmp: 80, map: 84, ldr: 80 } },
    { id: 343, name: "nuc", role: "MID", team: "BDS", year: 2024, rating: 81, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 81, frm: 83, cmp: 80, map: 80, ldr: 79 } },
    { id: 344, name: "Ice", role: "ADC", team: "BDS", year: 2024, rating: 84, quality: "Gold", region: "LEC", stats: { mec: 86, tmf: 83, frm: 85, cmp: 82, map: 81, ldr: 78 } },
    { id: 345, name: "Labrov", role: "SUP", team: "BDS", year: 2024, rating: 83, quality: "Gold", region: "LEC", stats: { mec: 82, tmf: 84, frm: 68, cmp: 84, map: 83, ldr: 81 } },

    // --- Team Liquid (LCS) ---
    { id: 401, name: "Impact", role: "TOP", team: "TL", year: 2024, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 82, tmf: 89, frm: 86, cmp: 88, map: 89, ldr: 94 } },
    { id: 402, name: "UmTi", role: "JNG", team: "TL", year: 2024, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 83, tmf: 86, frm: 84, cmp: 85, map: 88, ldr: 87 } },
    { id: 403, name: "Apa", role: "MID", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 79, frm: 80, cmp: 76, map: 78, ldr: 77 } },
    { id: 404, name: "Yeon", role: "ADC", team: "TL", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 81, tmf: 78, frm: 81, cmp: 77, map: 76, ldr: 75 } },
    { id: 405, name: "CoreJJ", role: "SUP", team: "TL", year: 2024, rating: 89, quality: "Diamond", region: "LCS", stats: { mec: 84, tmf: 90, frm: 75, cmp: 91, map: 93, ldr: 96 } },

    // --- FlyQuest (LCS) ---
    { id: 411, name: "Bwipo", role: "TOP", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 85, frm: 84, cmp: 88, map: 83, ldr: 86 } },
    { id: 412, name: "Inspired", role: "JNG", team: "FLY", year: 2024, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 87, tmf: 88, frm: 89, cmp: 87, map: 90, ldr: 89 } },
    { id: 413, name: "Quad", role: "MID", team: "FLY", year: 2024, rating: 84, quality: "Gold", region: "LCS", stats: { mec: 86, tmf: 83, frm: 85, cmp: 82, map: 82, ldr: 80 } },
    { id: 414, name: "Massu", role: "ADC", team: "FLY", year: 2024, rating: 82, quality: "Gold", region: "LCS", stats: { mec: 84, tmf: 81, frm: 83, cmp: 80, map: 79, ldr: 78 } },
    { id: 415, name: "Busio", role: "SUP", team: "FLY", year: 2024, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 84, frm: 65, cmp: 82, map: 83, ldr: 81 } },

    // --- NRG (LCS) ---
    { id: 421, name: "Dhokla", role: "TOP", team: "NRG", year: 2024, rating: 76, quality: "Silver", region: "LCS", stats: { mec: 77, tmf: 76, frm: 77, cmp: 75, map: 74, ldr: 75 } },
    { id: 422, name: "Contractz", role: "JNG", team: "NRG", year: 2024, rating: 79, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 79, frm: 78, cmp: 77, map: 81, ldr: 82 } },
    { id: 423, name: "Palafox", role: "MID", team: "NRG", year: 2024, rating: 78, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 78, frm: 79, cmp: 76, map: 77, ldr: 76 } },
    { id: 424, name: "FBI", role: "ADC", team: "NRG", year: 2024, rating: 81, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 81, frm: 82, cmp: 79, map: 80, ldr: 81 } },
    { id: 425, name: "huhi", role: "SUP", team: "NRG", year: 2024, rating: 80, quality: "Gold", region: "LCS", stats: { mec: 78, tmf: 81, frm: 65, cmp: 80, map: 82, ldr: 84 } },
    
    // --- Cloud9 (LCS) ---
    { id: 431, name: "Fudge", role: "TOP", team: "C9", year: 2024, rating: 82, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 81, frm: 84, cmp: 80, map: 80, ldr: 79 } },
    { id: 432, name: "Blaber", role: "JNG", team: "C9", year: 2024, rating: 86, quality: "Platinum", region: "LCS", stats: { mec: 87, tmf: 85, frm: 86, cmp: 85, map: 87, ldr: 88 } },
    { id: 433, name: "Jojopyun", role: "MID", team: "C9", year: 2024, rating: 85, quality: "Platinum", region: "LCS", stats: { mec: 88, tmf: 84, frm: 85, cmp: 83, map: 82, ldr: 83 } },
    { id: 434, name: "Berserker", role: "ADC", team: "C9", year: 2024, rating: 88, quality: "Platinum", region: "LCS", stats: { mec: 91, tmf: 88, frm: 90, cmp: 85, map: 84, ldr: 82 } },
    { id: 435, name: "Vulcan", role: "SUP", team: "C9", year: 2024, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 84, frm: 65, cmp: 82, map: 84, ldr: 84 } },

    // --- 100 Thieves (LCS) ---
    { id: 441, name: "Sniper", role: "TOP", team: "100T", year: 2024, rating: 76, quality: "Silver", region: "LCS", stats: { mec: 80, tmf: 74, frm: 77, cmp: 73, map: 72, ldr: 70 } },
    { id: 442, name: "River", role: "JNG", team: "100T", year: 2024, rating: 83, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 83, frm: 82, cmp: 84, map: 85, ldr: 82 } },
    { id: 443, name: "Quid", role: "MID", team: "100T", year: 2024, rating: 81, quality: "Gold", region: "LCS", stats: { mec: 84, tmf: 80, frm: 82, cmp: 79, map: 78, ldr: 77 } },
    { id: 444, name: "Meech", role: "ADC", team: "100T", year: 2024, rating: 72, quality: "Silver", region: "LCS", stats: { mec: 74, tmf: 71, frm: 74, cmp: 70, map: 69, ldr: 68 } },
    { id: 445, name: "Eyla", role: "SUP", team: "100T", year: 2024, rating: 74, quality: "Silver", region: "LCS", stats: { mec: 73, tmf: 75, frm: 60, cmp: 74, map: 76, ldr: 72 } },

    // --- Dignitas (LCS) ---
    { id: 451, name: "Rich", role: "TOP", team: "DIG", year: 2024, rating: 77, quality: "Silver", region: "LCS", stats: { mec: 79, tmf: 76, frm: 78, cmp: 75, map: 74, ldr: 73 } },
    { id: 452, name: "Spica", role: "JNG", team: "DIG", year: 2024, rating: 81, quality: "Gold", region: "LCS", stats: { mec: 82, tmf: 81, frm: 82, cmp: 80, map: 83, ldr: 82 } },
    { id: 453, name: "Dove", role: "MID", team: "DIG", year: 2024, rating: 76, quality: "Silver", region: "LCS", stats: { mec: 78, tmf: 76, frm: 78, cmp: 75, map: 75, ldr: 74 } },
    { id: 454, name: "Zven", role: "ADC", team: "DIG", year: 2024, rating: 82, quality: "Gold", region: "LCS", stats: { mec: 83, tmf: 83, frm: 84, cmp: 81, map: 80, ldr: 84 } },
    { id: 455, name: "Isles", role: "SUP", team: "DIG", year: 2024, rating: 73, quality: "Silver", region: "LCS", stats: { mec: 72, tmf: 74, frm: 55, cmp: 73, map: 75, ldr: 71 } },

    // === HISTORIC LEGENDS (Legacy Works as Chemistry Wildcard) ===
    { id: 901, name: "Faker", role: "MID", team: "SKT", year: 2015, rating: 99, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 99, frm: 98, cmp: 99, map: 99, ldr: 99 } },
    { id: 902, name: "TheShy", role: "TOP", team: "IG", year: 2018, rating: 97, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 95, frm: 97, cmp: 94, map: 93, ldr: 89 } },
    { id: 903, name: "Mata", role: "SUP", team: "SSW", year: 2014, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 96, frm: 75, cmp: 97, map: 99, ldr: 98 } },
    { id: 904, name: "Ambition", role: "JNG", team: "SSG", year: 2017, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 95, frm: 92, cmp: 93, map: 98, ldr: 99 } },
    { id: 905, name: "Uzi", role: "ADC", team: "RNG", year: 2018, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 97, frm: 98, cmp: 94, map: 93, ldr: 95 } },
    { id: 906, name: "Rookie", role: "MID", team: "IG", year: 2018, rating: 97, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 96, frm: 97, cmp: 95, map: 96, ldr: 94 } },
    { id: 907, name: "ShowMaker", role: "MID", team: "DK", year: 2020, rating: 98, quality: "Legacy", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 98, cmp: 97, map: 98, ldr: 96 } },
    { id: 908, name: "Canyon", role: "JNG", team: "DK", year: 2020, rating: 98, quality: "Legacy", region: "Legacy", stats: { mec: 99, tmf: 98, frm: 99, cmp: 96, map: 99, ldr: 94 } },
    { id: 909, name: "Smeb", role: "TOP", team: "ROX", year: 2016, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 97, tmf: 96, frm: 95, cmp: 96, map: 95, ldr: 94 } },
    { id: 910, name: "Deft", role: "ADC", team: "DRX", year: 2022, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 94, tmf: 96, frm: 95, cmp: 95, map: 94, ldr: 97 } },
    { id: 911, name: "BeryL", role: "SUP", team: "DRX", year: 2022, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 94, frm: 70, cmp: 98, map: 99, ldr: 98 } },
    { id: 912, name: "Caps", role: "MID", team: "G2", year: 2019, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 97, tmf: 95, frm: 94, cmp: 98, map: 94, ldr: 92 } },
    { id: 913, name: "Perkz", role: "ADC", team: "G2", year: 2019, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 95, frm: 92, cmp: 98, map: 95, ldr: 97 } },
    { id: 914, name: "Jankos", role: "JNG", team: "G2", year: 2019, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 91, tmf: 94, frm: 92, cmp: 93, map: 96, ldr: 95 } },
    { id: 915, name: "Wunder", role: "TOP", team: "G2", year: 2019, rating: 92, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 91, frm: 93, cmp: 95, map: 90, ldr: 88 } },
    { id: 916, name: "Doinb", role: "MID", team: "FPX", year: 2019, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 89, tmf: 98, frm: 94, cmp: 99, map: 99, ldr: 99 } },
    { id: 917, name: "Tian", role: "JNG", team: "FPX", year: 2019, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 95, frm: 94, cmp: 94, map: 96, ldr: 91 } },
    { id: 918, name: "Crisp", role: "SUP", team: "FPX", year: 2019, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 75, cmp: 95, map: 95, ldr: 92 } },
    { id: 919, name: "Lwx", role: "ADC", team: "FPX", year: 2019, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 95, cmp: 91, map: 92, ldr: 89 } },
    { id: 920, name: "GimGoon", role: "TOP", team: "FPX", year: 2019, rating: 91, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 93, frm: 92, cmp: 90, map: 91, ldr: 92 } },

    // --- ADDITIONAL LEGACY EXPANSION ROSTERS ---
    { id: 921, name: "Looper", role: "TOP", team: "SSW", year: 2014, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 92, tmf: 94, frm: 91, cmp: 95, map: 94, ldr: 90 } },
    { id: 922, name: "DanDy", role: "JNG", team: "SSW", year: 2014, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 97, frm: 95, cmp: 95, map: 98, ldr: 94 } },
    { id: 923, name: "PawN", role: "MID", team: "SSW", year: 2014, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 94, frm: 93, cmp: 95, map: 94, ldr: 91 } },
    { id: 924, name: "imp", role: "ADC", team: "SSW", year: 2014, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 97, tmf: 95, frm: 95, cmp: 94, map: 93, ldr: 89 } },
    { id: 925, name: "MaRin", role: "TOP", team: "SKT", year: 2015, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 96, frm: 97, cmp: 94, map: 95, ldr: 97 } },
    { id: 926, name: "Bang", role: "ADC", team: "SKT", year: 2015, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 95, tmf: 97, frm: 96, cmp: 93, map: 94, ldr: 92 } },
    { id: 927, name: "Wolf", role: "SUP", team: "SKT", year: 2015, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 96, frm: 75, cmp: 95, map: 96, ldr: 94 } },
    { id: 928, name: "Broxah", role: "JNG", team: "FNC", year: 2018, rating: 91, quality: "Legacy", region: "Legacy", stats: { mec: 92, tmf: 91, frm: 90, cmp: 89, map: 92, ldr: 90 } },
    { id: 929, name: "Rekkles", role: "ADC", team: "FNC", year: 2018, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 94, tmf: 95, frm: 96, cmp: 93, map: 93, ldr: 92 } },

    // --- EDG 2021 (LPL Legacy) ---
    { id: 930, name: "Flandre", role: "TOP", team: "EDG", year: 2021, rating: 92, quality: "Legacy", region: "Legacy", stats: { mec: 90, tmf: 93, frm: 92, cmp: 95, map: 91, ldr: 91 } },
    { id: 931, name: "Jiejie", role: "JNG", team: "EDG", year: 2021, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 94, frm: 92, cmp: 91, map: 94, ldr: 90 } },
    { id: 932, name: "Scout", role: "MID", team: "EDG", year: 2021, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 96, tmf: 95, frm: 96, cmp: 94, map: 95, ldr: 94 } },
    { id: 933, name: "Viper", role: "ADC", team: "EDG", year: 2021, rating: 96, quality: "Legacy", region: "Legacy", stats: { mec: 98, tmf: 97, frm: 97, cmp: 95, map: 94, ldr: 93 } },
    { id: 934, name: "Meiko", role: "SUP", team: "EDG", year: 2021, rating: 95, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 96, frm: 78, cmp: 96, map: 97, ldr: 98 } },

    // --- RNG 2018 (LPL Legacy) ---
    { id: 935, name: "Letme", role: "TOP", team: "RNG", year: 2018, rating: 91, quality: "Legacy", region: "Legacy", stats: { mec: 88, tmf: 94, frm: 90, cmp: 92, map: 91, ldr: 89 } },
    { id: 936, name: "Karsa", role: "JNG", team: "RNG", year: 2018, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 92, tmf: 93, frm: 91, cmp: 92, map: 96, ldr: 90 } },
    { id: 937, name: "Xiaohu", role: "MID", team: "RNG", year: 2018, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 95, frm: 95, cmp: 94, map: 94, ldr: 93 } },
    { id: 938, name: "Ming", role: "SUP", team: "RNG", year: 2018, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 94, tmf: 95, frm: 75, cmp: 93, map: 96, ldr: 94 } },

    // --- DRX 2022 Additions (LCK Legacy) ---
    { id: 939, name: "Kingen", role: "TOP", team: "DRX", year: 2022, rating: 93, quality: "Legacy", region: "Legacy", stats: { mec: 94, tmf: 94, frm: 91, cmp: 90, map: 90, ldr: 89 } },
    { id: 940, name: "Pyosik", role: "JNG", team: "DRX", year: 2022, rating: 92, quality: "Legacy", region: "Legacy", stats: { mec: 93, tmf: 92, frm: 90, cmp: 92, map: 91, ldr: 91 } },
    { id: 941, name: "Zeka", role: "MID", team: "DRX", year: 2022, rating: 94, quality: "Legacy", region: "Legacy", stats: { mec: 98, tmf: 93, frm: 93, cmp: 90, map: 91, ldr: 88 } }
];

window.playerDatabase = baseDatabase.map(p => {
    return { ...p, stats: p.stats ? p.stats : genStats(p.rating) };
});