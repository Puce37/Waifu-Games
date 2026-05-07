// ==========================================
// BASE DE DONNÉES DES CARTES
// ==========================================
const CARD_DB = [
    {id: "c1", type:"UNIT", name:"Space Rio", atk:4, energy:2, shield:0, special:1, energy_pot:0, health_pot:0, front:"card1-front.png", statsBg:"stats-bg1.png"},
    {id: "c2", type:"UNIT", name:"Drone Amas", atk:2, energy:1, shield:0, special:3, energy_pot:0, health_pot:0, front:"card2-front.png", statsBg:"stats-bg2.png"},
    {id: "c3", type:"UNIT", name:"Laser", atk:5, energy:3, shield:0, special:0, energy_pot:0, health_pot:0, front:"card3-front.png", statsBg:"stats-bg3.png"}, 
    {id: "c4", type:"SKILL", name:"Bouclier", atk:0, energy:2, shield:5, special:0, energy_pot:0, health_pot:0, front:"card4-front.png", statsBg:"stats-bg4.png"}, 
    {id: "c5", type:"SKILL", name:"Recharge", atk:0, energy:0, shield:0, special:0, energy_pot:3, health_pot:0, front:"card5-front.png", statsBg:"stats-bg1.png"}, 
    {id: "c6", type:"SKILL", name:"Soin", atk:0, energy:0, shield:0, special:0, energy_pot:0, health_pot:5, front:"card6-front.png", statsBg:"stats-bg2.png"},
    {id: "c7", type:"SKILL", name:"Mega Shield", atk:0, energy:3, shield:10, special:0, energy_pot:0, health_pot:0, front:"card4-front.png", statsBg:"stats-bg4.png"}
];

const GACHA_COST = 50;
const LEVEL_SCALING_FACTOR = 3; 

// ==========================================
// SAUVEGARDE
// ==========================================
const DEFAULT_SAVE = {
    coins: 100,
    playerStats: {
        maxHp: 20,
        maxEnergy: 3,
        startShield: 0,
        maxShield: 50 // NOUVEAU
    },
    inventory: {
        "c1": {level: 1, copies: 0},
        "c2": {level: 1, copies: 0},
        "c4": {level: 1, copies: 0},
        "c5": {level: 1, copies: 0}
    },
    deck: ["c1", "c2", "c4", "c5", "c1", "c2"]
};

function loadGameData() {
    let saved = localStorage.getItem("rio_tcg_save_v2");
    if (saved) {
        let data = JSON.parse(saved);
        // Migration simple si maxShield n'existe pas
        if(!data.playerStats.maxShield) data.playerStats.maxShield = 50;
        return data;
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
}

function saveGameData(data) {
    localStorage.setItem("rio_tcg_save_v2", JSON.stringify(data));
}

// ==========================================
// CALCUL DE STATS
// ==========================================
function getCardStats(cardId, level) {
    let base = CARD_DB.find(c => c.id === cardId);
    if (!base) return null;
    let stats = JSON.parse(JSON.stringify(base));
    let multiplier = 1 + (level - 1) * 0.5;

    if (stats.atk > 0) stats.atk = Math.floor(stats.atk * multiplier);
    if (stats.shield > 0) stats.shield = Math.floor(stats.shield * multiplier);
    if (stats.health_pot > 0) stats.health_pot = Math.floor(stats.health_pot * multiplier);
    
    return stats;
}

function getLevelUpCost(currentLevel) {
    return currentLevel * 3;
}