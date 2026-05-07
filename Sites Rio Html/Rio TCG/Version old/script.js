// =================================================================
// DONNÉES ET CONFIGURATION
// =================================================================
const iconAttack = "attack.png";
const iconEnergy = "energy.png"; 
const iconShield = "shield.png"; 
const iconSpecial = "special.png"; 
const iconEnergyPot = "energy-pot.png";
const iconHealthPot = "health-pot.png";

// Couleurs pour les textes flottants
const COLORS = {
    DAMAGE: "#ffcc00", // Jaune (Dégâts infligés)
    HEAL: "#00ff00",   // Vert (Soin / Energie)
    SHIELD: "#33ccff", // Bleu (Bouclier)
    HURT: "#ff3333",   // Rouge (Dégâts reçus)
    ERROR: "#aaaaaa"   // Gris (Erreurs)
};

let deckData = [
    {type:"UNIT", name:"Space Rio", atk:4, energy:2, shield:0, special:1, energy_pot:0, health_pot:0, front:"card1-front.png", statsBg:"stats-bg1.png"},
    {type:"UNIT", name:"Drone Amas", atk:2, energy:1, shield:0, special:3, energy_pot:0, health_pot:0, front:"card2-front.png", statsBg:"stats-bg2.png"},
    {type:"UNIT", name:"Laser", atk:5, energy:3, shield:0, special:0, energy_pot:0, health_pot:0, front:"card3-front.png", statsBg:"stats-bg3.png"}, 
    {type:"SKILL", name:"Bouclier", atk:0, energy:2, shield:5, special:0, energy_pot:0, health_pot:0, front:"card4-front.png", statsBg:"stats-bg4.png"}, 
    {type:"SKILL", name:"Recharge Rapide", atk:0, energy:0, shield:0, special:0, energy_pot:3, health_pot:0, front:"card5-front.png", statsBg:"stats-bg1.png"}, 
    {type:"SKILL", name:"Régénération", atk:0, energy:0, shield:0, special:0, energy_pot:0, health_pot:5, front:"card6-front.png", statsBg:"stats-bg2.png"},
    {type:"SKILL", name:"Super Shield", atk:0, energy:3, shield:10, special:0, energy_pot:0, health_pot:0, front:"card4-front.png", statsBg:"stats-bg4.png"}
];

deckData = deckData.concat(JSON.parse(JSON.stringify(deckData))); 

let discardData = []; 

// Éléments DOM
let handDiv = document.getElementById("hand");
let slots = document.querySelectorAll(".slot");
let discardCountDisplay = document.getElementById("discard-count");
let discardPileDiv = document.getElementById("discard-pile"); 
let endTurnBtn = document.getElementById("end-turn-btn");
const turnBanner = document.getElementById("turn-banner");

// Cibles pour les textes flottants
const bossContainer = document.getElementById("boss-container");
const playerHpContainer = document.querySelector(".hp-bar-container");
const playerShieldContainer = document.querySelector(".shield-bar-container");
const playerEnergyContainer = document.querySelector(".energy-bar-container");

// --- ÉTAT DU JEU ---
let bossState = {
    name: "Rio Cyber",
    maxHp: 50, 
    currentHp: 50, 
    imgUrl: "boss-image.png" 
};

let gameState = {
    maxEnergy: 3,
    currentEnergy: 3,
    maxHandSize: 7, 
    maxHp: 20, 
    currentHp: 20, 
	maxShield: 100,
    currentShield: 0,
};

// Barres visuelles
let playerHpFill = document.getElementById("player-hp-fill");
let playerHpText = document.getElementById("player-hp-text");
let playerShieldFill = document.getElementById("player-shield-fill");
let playerShieldText = document.getElementById("player-shield-text");
let playerEnergyFill = document.getElementById("player-energy-fill");
let playerEnergyText = document.getElementById("player-energy-text");
let bossImg = document.getElementById("boss-img");
let bossHpFill = document.getElementById("boss-hp-fill");
let bossHpText = document.getElementById("boss-hp-text");

// =================================================================
// FONCTIONS D'AFFICHAGE (Animation & Bannière)
// =================================================================

// --- NOUVEAU : FONCTION TEXTE FLOTTANT ---
function showFloatingText(targetElement, text, color) {
    if(!targetElement) return;

    // Création de l'élément
    let floatDiv = document.createElement("div");
    floatDiv.className = "floating-text";
    floatDiv.textContent = text;
    floatDiv.style.color = color;

    // Positionnement
    let rect = targetElement.getBoundingClientRect();
    // On le centre horizontalement par rapport à la cible, et on le met un peu au-dessus
    let left = rect.left + (rect.width / 2);
    let top = rect.top;

    floatDiv.style.left = left + "px";
    floatDiv.style.top = top + "px";

    document.body.appendChild(floatDiv);

    // Suppression automatique après l'animation (1.2s défini dans le CSS)
    setTimeout(() => {
        floatDiv.remove();
    }, 1200);
}

// Fonction Bannière de tour (Inchangée)
function showTurnBanner(type) {
    let text = "";
    let cssClass = "";
    
    if (type === 'player') {
        text = "VOTRE TOUR";
        cssClass = "player-turn-banner";
    } else if (type === 'enemy') {
        text = "TOUR DE L'ENNEMI";
        cssClass = "enemy-turn-banner";
    }

    turnBanner.textContent = text;
    turnBanner.className = ''; 
    turnBanner.classList.add(cssClass);

    setTimeout(() => turnBanner.classList.add('banner-show'), 50);
    setTimeout(() => turnBanner.classList.remove('banner-show'), 1500);
}

// Mise à jour de l'interface Joueur
function updatePlayerDisplay() {
    // PV
    let hpPercent = (gameState.currentHp / gameState.maxHp) * 100;
    if (gameState.currentHp < 0) gameState.currentHp = 0;
    playerHpFill.style.width = `${hpPercent}%`;
    playerHpText.textContent = `${gameState.currentHp} / ${gameState.maxHp}`;
    
    if (gameState.currentHp <= 0) {
        showTurnBanner("enemy"); // Réutiliser la bannière pour la défaite
        turnBanner.textContent = "DÉFAITE...";
        turnBanner.style.background = "#000";
        endTurnBtn.disabled = true;
    }

    // Bouclier
    let shieldPercent = (gameState.currentShield / gameState.maxShield) * 100; 
    playerShieldFill.style.width = `${shieldPercent}%`;
    playerShieldText.textContent = `${gameState.currentShield} / ${gameState.maxShield}`;

    // Énergie
    updateEnergyDisplay();
}

function updateEnergyDisplay() {
    let energyPercent = (gameState.currentEnergy / gameState.maxEnergy) * 100;
    playerEnergyFill.style.width = `${energyPercent}%`;
    playerEnergyText.textContent = `${gameState.currentEnergy} / ${gameState.maxEnergy}`;
}

// Mise à jour de l'interface Boss
function updateBossDisplay() {
    bossImg.style.backgroundImage = `url('${bossState.imgUrl}')`;
    let percent = (bossState.currentHp / bossState.maxHp) * 100;
    if (bossState.currentHp < 0) bossState.currentHp = 0;
    bossHpFill.style.width = `${percent}%`;
    bossHpText.textContent = `${bossState.currentHp} / ${bossState.maxHp}`;
    
    if (bossState.currentHp <= 0) {
        showTurnBanner("player"); // Réutiliser la bannière pour la victoire
        turnBanner.textContent = "VICTOIRE !";
        turnBanner.style.background = "gold";
        turnBanner.style.color = "black";
        endTurnBtn.disabled = true;
    }
}

function updateDiscardCount() {
    discardCountDisplay.textContent = `Défausse (${discardData.length})`;
}

// Initialisation
updateEnergyDisplay();
updateBossDisplay(); 
updatePlayerDisplay();
updateDiscardCount();


// =================================================================
// LOGIQUE DE JEU
// =================================================================

// --- ANIMATION DE DÉFAUSSE (Inchangée) ---
function discardCard(cardElement, delay = 0) {
    let targetRect = discardPileDiv.getBoundingClientRect();
    let cardRect = cardElement.getBoundingClientRect();
    
    cardElement.style.transition = "transform 0.5s ease-in, left 0.5s ease-in, top 0.5s ease-in, opacity 0.5s ease-in";
    document.body.appendChild(cardElement);
    cardElement.style.position = "fixed";
    cardElement.style.left = cardRect.left + "px";
    cardElement.style.top = cardRect.top + "px";
    cardElement.style.zIndex = 9999;
    
    let targetX = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2);
    let targetY = targetRect.top + (targetRect.height / 2) - (cardRect.height / 2);
    let moveX = targetX - cardRect.left;
    let moveY = targetY - cardRect.top;
    let randomOffsetX = Math.floor(Math.random() * 80) - 40; 
    let randomOffsetY = Math.floor(Math.random() * 80) - 40;
    let randomRot = Math.floor(Math.random() * 40) - 20; 
    
    setTimeout(() => {
        cardElement.style.transform = `translateX(${moveX + randomOffsetX}px) translateY(${moveY + randomOffsetY}px) scale(0.7) rotate(${randomRot}deg) rotateY(180deg)`;
        cardElement.style.opacity = 1; 
    }, delay);

    setTimeout(() => {
        cardElement.style.transition = "none";
        cardElement.remove();
        discardPileDiv.appendChild(cardElement);
        cardElement.style.position = "absolute";
        
        let cardSize = { w: 120 * 0.7, h: 170 * 0.7 }; 
        let discardPileCenter = { x: discardPileDiv.clientWidth / 2, y: discardPileDiv.clientHeight / 2 };
        cardElement.style.left = `${discardPileCenter.x - (cardSize.w / 2) + Math.floor(Math.random()*10)}px`;
        cardElement.style.top = `${discardPileCenter.y - (cardSize.h / 2) + Math.floor(Math.random()*10)}px`;
        cardElement.style.zIndex = discardData.length + 10; 
        cardElement.style.transform = `scale(0.7) rotate(${randomRot}deg) rotateY(180deg)`;
        cardElement.style.opacity = 1;
        
        updateDiscardCount();
    }, delay + 500); 
}

// --- TOUR ENNEMI ---
function enemyTurn() {
    showTurnBanner('enemy');
    endTurnBtn.disabled = true; 
    
    setTimeout(() => {
        const enemyAttack = 5; 
        let incomingDamage = enemyAttack;
        let finalDamage = 0;
        
        // Calcul Dégâts / Bouclier
        if (gameState.currentShield >= incomingDamage) {
            gameState.currentShield -= incomingDamage;
            // Affiche -5 sur le bouclier
            showFloatingText(playerShieldContainer, `-${incomingDamage}`, COLORS.);
            incomingDamage = 0;
            finalDamage = 0;
        } else {
            // Le bouclier casse
            let shieldAbsorbed = gameState.currentShield;
            if (shieldAbsorbed > 0) {
                showFloatingText(playerShieldContainer, `-${shieldAbsorbed}`, COLORS.SHIELD);
            }
            finalDamage = incomingDamage - gameState.currentShield;
            gameState.currentShield = 0;
        }
        
        // Application dégâts PV
        if (finalDamage > 0) {
            gameState.currentHp -= finalDamage;
            showFloatingText(playerHpContainer, `-${finalDamage}`, COLORS.HURT);
        } else {
            showFloatingText(playerHpContainer, "Bloqué", COLORS.SHIELD);
        }

        updatePlayerDisplay();

        setTimeout(() => {
            endTurnBtn.disabled = false;
            showTurnBanner('player');
        }, 1000);
        
    }, 1600); 
}

// --- FIN TOUR JOUEUR ---
function endTurn() {
    let totalAttack = 0;
    let unitsOnField = [];
    
    slots.forEach(slot => {
        if (slot.hasChildNodes()) unitsOnField.push(slot.firstChild);
    });

    let cardsInHand = Array.from(handDiv.children);
    let cardsToDiscard = unitsOnField.concat(cardsInHand);

    endTurnBtn.disabled = true; 
    
    cardsToDiscard.forEach((cardElement, index) => {
        let delay = index * 100; 
        discardData.push(cardElement.originalData);
        
        if (unitsOnField.includes(cardElement)) {
            let atk = parseInt(cardElement.dataset.cardAttack) || 0;
            totalAttack += atk;
            
            // Animation : La carte "frappe" le boss
            if (atk > 0) {
                // Petit effet visuel si voulu, sinon juste le texte
            }
            discardCard(cardElement, delay);

        } else if (cardsInHand.includes(cardElement)) {
            discardCard(cardElement, delay);
        }
    });
    
    // Application des dégâts au boss APRÈS un petit délai pour l'animation
    setTimeout(() => {
        if (totalAttack > 0) {
            bossState.currentHp -= totalAttack;
            updateBossDisplay();
            // AFFICHER DÉGÂTS JAUNES SUR LE BOSS
            showFloatingText(bossContainer, `-${totalAttack}`, COLORS.DAMAGE);
        }
        
        // Recharge de l'énergie et passage au tour ennemi
        setTimeout(() => {
            gameState.currentEnergy = gameState.maxEnergy;
            updatePlayerDisplay(); 
            // Petit texte vert pour dire énergie rechargée
            showFloatingText(playerEnergyContainer, "Recharge", COLORS.HEAL);
            
            enemyTurn();
        }, 800);
        
    }, cardsToDiscard.length * 80 + 200); 
    
    handDiv.innerHTML = '';
}

endTurnBtn.addEventListener('click', endTurn);

// --- PIOCHE ET CRÉATION DE CARTE ---

function drawCard(count) {
    if(deckData.length === 0 && discardData.length > 0) {
        showFloatingText(document.getElementById("deck"), "Mélange!", "#fff");
        deckData = discardData;
        discardData = [];
        updateDiscardCount();
    }
    
    for (let i = 0; i < count; i++) {
        if(deckData.length === 0) { 
            showFloatingText(document.getElementById("deck"), "Vide!", COLORS.ERROR);
            break; 
        }
        if(handDiv.children.length >= gameState.maxHandSize) { 
            showFloatingText(handDiv, "Main Pleine!", COLORS.ERROR);
            break; 
        }
        
        let randomIndex = Math.floor(Math.random() * deckData.length);
        let data = deckData.splice(randomIndex, 1)[0]; 
        createCard(data);
    }
}

document.getElementById("deck").onclick = () => {
    drawCard(1); 
};

function createCard(data) {
    let card = document.createElement("div");
    card.className = "card flipped"; 
    card.originalData = data; 
    card.dataset.type = data.type;
    card.dataset.cardName = data.name; 
    card.dataset.cardCost = data.energy;
    card.dataset.cardAttack = data.atk;
    card.dataset.cardShield = data.shield;
    card.dataset.cardEnergyPot = data.energy_pot;
    card.dataset.cardHealthPot = data.health_pot;

    let back = document.createElement("div");
    back.className = "back";
    let front = document.createElement("div");
    front.className = "front";
    front.style.backgroundImage = `url('${data.front}')`;
    let bgStyle = data.statsBg ? `background-image: url('${data.statsBg}');` : "";
    
    let statsHTML = '';
    if (data.atk > 0) statsHTML += `<div class="stat"><img src="${iconAttack}"><span>${data.atk}</span></div>`;
    if (data.shield > 0) statsHTML += `<div class="stat"><img src="${iconShield}"><span>${data.shield}</span></div>`;
    if (data.energy_pot > 0) statsHTML += `<div class="stat"><img src="${iconEnergyPot}"><span>${data.energy_pot}</span></div>`;
    if (data.health_pot > 0) statsHTML += `<div class="stat"><img src="${iconHealthPot}"><span>${data.health_pot}</span></div>`;
    if (data.special > 0 && data.atk === 0 && data.shield === 0 && data.energy_pot === 0 && data.health_pot === 0) statsHTML += `<div class="stat"><img src="${iconSpecial}"><span>${data.special}</span></div>`;
    if (data.energy > 0) statsHTML += `<div class="stat cost-stat"><img src="${iconEnergy}"><span>${data.energy}</span></div>`;

    front.innerHTML = `<div class="card-title">${data.name}</div><div class="card-stats" style="${bgStyle}">${statsHTML}</div>`;
    card.appendChild(front);
    card.appendChild(back);

    let deckRect = document.getElementById("deck").getBoundingClientRect();
    document.body.appendChild(card);
    card.style.left = deckRect.left + "px";
    card.style.top = deckRect.top + "px";
    card.style.zIndex = 1000;

    setTimeout(() => {
        card.style.left = (window.innerWidth / 2 - 60) + "px";
        card.style.top = (window.innerHeight - 250) + "px";
        card.style.transform = "scale(1.5) rotateY(0deg)"; 
        card.className = "card"; 
    }, 50);

    setTimeout(() => {
        card.style.transition = "none"; 
        card.style.transform = "scale(1)";
        handDiv.appendChild(card); 
        updateHandLayout();
        enableDrag(card);
        requestAnimationFrame(() => card.style.transition = "transform 0.4s, left 0.4s, top 0.4s");
    }, 700);
}

function updateHandLayout() {
    const cards = Array.from(handDiv.children);
    const total = cards.length;
    const arcAngle = 40; 
    cards.forEach((card, index) => {
        card.style.position = "absolute";
        card.style.top = ""; 
        card.style.left = "50%";
        let centerIndex = (total - 1) / 2;
        let offset = index - centerIndex;
        let angle = offset * (arcAngle / (total || 1));
        let indent = Math.abs(offset) * 15; 
        card.style.transform = `translateX(-50%) translateX(${offset * 70}px) translateY(${indent}px) rotate(${angle}deg)`;
        card.style.zIndex = index + 1;
    });
}

// --- DRAG & DROP MODIFIÉ POUR TEXTES FLOTTANTS ---
function enableDrag(card) {
    let isDragging = false;
    let startX, startY;

    card.onpointerdown = (e) => {
        if (card.parentElement !== handDiv) return; 
        e.preventDefault(); 
        isDragging = true;
        card.setPointerCapture(e.pointerId);
        card.style.transition = "none"; 
        
        let rect = card.getBoundingClientRect();
        document.body.appendChild(card);
        card.style.position = "fixed";
        card.style.left = rect.left + "px";
        card.style.top = rect.top + "px";
        card.style.transform = "none";
        card.style.zIndex = 9999;

        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        card.style.transform = "scale(1.1)"; 
        
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        card.style.left = (e.clientX - startX) + "px";
        card.style.top = (e.clientY - startY) + "px";
        checkSlotHover(e.clientX, e.clientY);
    };

    const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.style.transition = "transform 0.4s, left 0.4s, top 0.4s"; 

        let dropped = false;
        let cardCost = parseInt(card.dataset.cardCost) || 0; 
        let cardShield = parseInt(card.dataset.cardShield) || 0;
        let cardEnergyPot = parseInt(card.dataset.cardEnergyPot) || 0; 
        let cardHealthPot = parseInt(card.dataset.cardHealthPot) || 0; 
        
        slots.forEach(slot => {
            let r = slot.getBoundingClientRect();
            if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
                
                // --- VÉRIFICATION ÉNERGIE ---
                if (gameState.currentEnergy < cardCost) {
                    // Affiche le texte flottant "Manque d'énergie" sur la barre d'énergie
                    showFloatingText(playerEnergyContainer, "Pas assez d'énergie !", COLORS.ERROR);
                    return; 
                }

                // --- PAIEMENT ---
                if (cardCost > 0) { 
                    gameState.currentEnergy -= cardCost;
                    updatePlayerDisplay(); 
                    // Affiche -X en vert/rouge sur la barre d'énergie
                    showFloatingText(playerEnergyContainer, `-${cardCost}`, COLORS.HEAL);
                }

                if (card.dataset.type === "SKILL") {
                    // --- EFFETS SKILL ---
                    
                    // Énergie (Potion)
                    if (cardEnergyPot > 0) {
                        gameState.currentEnergy = Math.min(gameState.maxEnergy, gameState.currentEnergy + cardEnergyPot);
                        showFloatingText(playerEnergyContainer, `+${cardEnergyPot}`, COLORS.HEAL);
                    }
                    
                    // Santé (Potion)
                    if (cardHealthPot > 0) {
                        gameState.currentHp = Math.min(gameState.maxHp, gameState.currentHp + cardHealthPot);
                        showFloatingText(playerHpContainer, `+${cardHealthPot}`, COLORS.HEAL);
                    }
                    
                    // Bouclier
                    if (cardShield > 0) {
                        gameState.currentShield += cardShield;
                        showFloatingText(playerShieldContainer, `+${cardShield}`, COLORS.SHIELD);
                    }

                    updatePlayerDisplay();
                    
                    // Défausse la carte Skill
                    card.remove(); 
                    discardData.push(card.originalData); 
                    discardCard(card, 0); 
                    updateHandLayout();
                    dropped = true;
                    return; 
                    
                } else if (card.dataset.type === "UNIT") {
                    // --- EFFETS UNIT ---
                    if (slot.hasChildNodes()) {
                        showFloatingText(slot, "Occupé!", COLORS.ERROR);
                        // Rembourser l'énergie
                        gameState.currentEnergy += cardCost;
                        updatePlayerDisplay();
                        return;
                    }
                    
                    // Placement
                    card.style.position = "static";
                    card.style.left = "";
                    card.style.top = "";
                    card.style.transform = "none";
                    card.style.zIndex = 1;
                    slot.appendChild(card);
                    card.style.width = "100%";
                    card.style.height = "100%";
                    
                    updateHandLayout(); 
                    // Petit texte de confirmation au-dessus de l'unité
                    showFloatingText(slot, "Prêt!", "#fff");
                    
                    card.onpointerdown = null; 
                    dropped = true;
                    return; 
                }
            }
            slot.classList.remove('highlight');
        });

        if (!dropped) {
            handDiv.appendChild(card);
            updateHandLayout();
            card.style.position = "absolute"; 
            card.style.zIndex = 1; 
            card.style.transform = "none"; 
        }

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    };
}

function checkSlotHover(x, y) {
    slots.forEach(slot => {
        let r = slot.getBoundingClientRect();
        if (x > r.left && x < r.right && y > r.top && y < r.bottom) {
            slot.classList.add('highlight');
        } else {
            slot.classList.remove('highlight');
        }
    });
}

// Démarrage
showTurnBanner('player');