// =================================================================
// CHARGEMENT DES DONNÉES DEPUIS DATA.JS
// =================================================================
const playerData = loadGameData(); // Assurez-vous que loadGameData() est définie dans data.js

// Configuration Icons
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

// CONSTRUCTION DU DECK DE JEU
let deckData = [];
playerData.deck.forEach(cardId => {
    let inventoryInfo = playerData.inventory[cardId];
    if (inventoryInfo) {
        let stats = getCardStats(cardId, inventoryInfo.level); 
        deckData.push(stats);
    }
});
deckData = deckData.sort(() => Math.random() - 0.5);

let discardData = []; 

// Éléments DOM
let handDiv = document.getElementById("hand");
let slots = document.querySelectorAll(".slot");
let discardCountDisplay = document.getElementById("discard-count");
let discardPileDiv = document.getElementById("discard-pile"); 
let endTurnBtn = document.getElementById("end-turn-btn");
const turnBanner = document.getElementById("turn-banner");
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCloseBtn = document.getElementById("modal-close-btn");

// Cibles UI
const bossContainer = document.getElementById("boss-container");
const playerHpContainer = document.querySelector(".hp-bar-container");
const playerShieldContainer = document.querySelector(".shield-bar-container");
const playerEnergyContainer = document.querySelector(".energy-bar-container");

// Initialisation État
let bossState = { name: "Rio Cyber", maxHp: 100, currentHp: 100, imgUrl: "boss-image.png" };
let gameState = {
    maxEnergy: playerData.playerStats.maxEnergy,
    currentEnergy: playerData.playerStats.maxEnergy,
    maxHandSize: 7, 
    maxHp: playerData.playerStats.maxHp, 
    currentHp: playerData.playerStats.maxHp, 
    currentShield: playerData.playerStats.startShield, 
    maxShield: playerData.playerStats.maxShield || 100 // Utilisation de maxShield de data.js
};

// Barres
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
// FONCTIONS D'AFFICHAGE & UTILITAIRES
// =================================================================

function showFloatingText(targetElement, text, color) {
    if(!targetElement) return;
    let floatDiv = document.createElement("div");
    floatDiv.className = "floating-text";
    floatDiv.textContent = text;
    floatDiv.style.color = color;
    let rect = targetElement.getBoundingClientRect();
    let left = rect.left + (rect.width / 2);
    let top = rect.top;
    floatDiv.style.left = left + "px";
    floatDiv.style.top = top + "px";
    document.body.appendChild(floatDiv);
    setTimeout(() => floatDiv.remove(), 1200);
}

function showTurnBanner(type) {
    let text = (type === 'player') ? "VOTRE TOUR" : "TOUR DE L'ENNEMI";
    let cssClass = (type === 'player') ? "player-turn-banner" : "enemy-turn-banner";
    turnBanner.textContent = text;
    turnBanner.className = ''; 
    turnBanner.classList.add(cssClass);
    setTimeout(() => turnBanner.classList.add('banner-show'), 50);
    setTimeout(() => turnBanner.classList.remove('banner-show'), 1500);
}

function updateDisplay() {
    // PV
    let hpPercent = (gameState.currentHp / gameState.maxHp) * 100;
    gameState.currentHp = Math.max(0, gameState.currentHp);
    playerHpFill.style.width = `${hpPercent}%`;
    playerHpText.textContent = `${gameState.currentHp} / ${gameState.maxHp}`;
    
    // Bouclier
    let shieldPercent = (gameState.currentShield / gameState.maxShield) * 100; 
    playerShieldFill.style.width = `${shieldPercent}%`;
    playerShieldText.textContent = `${gameState.currentShield}`;

    // Énergie
    let energyPercent = (gameState.currentEnergy / gameState.maxEnergy) * 100;
    playerEnergyFill.style.width = `${energyPercent}%`;
    playerEnergyText.textContent = `${gameState.currentEnergy} / ${gameState.maxEnergy}`;
    
    // Boss
    bossImg.style.backgroundImage = `url('${bossState.imgUrl}')`;
    let bossPercent = (bossState.currentHp / bossState.maxHp) * 100;
    bossState.currentHp = Math.max(0, bossState.currentHp);
    bossHpFill.style.width = `${bossPercent}%`;
    bossHpText.textContent = `${bossState.currentHp} / ${bossState.maxHp}`;
    
    updateDiscardCount();
    checkEndGame(); 
}

function updateDiscardCount() {
    discardCountDisplay.textContent = `Défausse (${discardData.length})`;
}

function checkEndGame() {
    if (bossState.currentHp <= 0) {
        let reward = 50;
        playerData.coins += reward;
        saveGameData(playerData); 
        showModal("VICTOIRE !", `Le Boss est vaincu ! Vous gagnez ${reward} pièces.`, true);
    } else if (gameState.currentHp <= 0) {
        showModal("DÉFAITE...", "Vos PV sont à 0. Retournez au QG.", true);
    }
}

function showModal(title, msg, isEnd) {
    modalTitle.textContent = title;
    modalMessage.textContent = msg;
    modalOverlay.style.display = 'flex';
    endTurnBtn.disabled = true;
    if (isEnd) {
        modalCloseBtn.textContent = "Retour Menu";
        modalCloseBtn.onclick = () => window.location.href = "index.html";
    } else {
        modalCloseBtn.textContent = "OK";
        modalCloseBtn.onclick = () => modalOverlay.style.display = 'none';
    }
}

// =================================================================
// ANIMATIONS FLUIDES : PIOCHE & DÉFAUSSE (Améliorées)
// =================================================================

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

function discardCard(cardElement, delay = 0) {
    let targetRect = discardPileDiv.getBoundingClientRect();
    let cardRect = cardElement.getBoundingClientRect();
    
    // Positionnement absolu pour l'animation
    if(cardElement.parentElement !== document.body) {
        let tempRect = cardElement.getBoundingClientRect();
        document.body.appendChild(cardElement);
        cardElement.style.position = "fixed";
        cardElement.style.left = tempRect.left + "px";
        cardElement.style.top = tempRect.top + "px";
    }
    
    cardElement.style.transition = "transform 0.5s ease-in, left 0.5s ease-in, top 0.5s ease-in, opacity 0.5s ease-in";
    cardElement.style.zIndex = 9999;
    
    let targetX = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2);
    let targetY = targetRect.top + (targetRect.height / 2) - (cardRect.height / 2);
    let moveX = targetX - cardRect.left;
    let moveY = targetY - cardRect.top;
    let randomOffsetX = Math.floor(Math.random() * 80) - 40; 
    let randomOffsetY = Math.floor(Math.random() * 80) - 40;
    let randomRot = Math.floor(Math.random() * 40) - 20; 
    
    // Ajout à la pile de défausse
    discardData.push(cardElement.originalData);
    
    setTimeout(() => {
        // Mouvement vers la défausse avec rotation 3D et échelle réduite
        cardElement.style.transform = `translateX(${moveX + randomOffsetX}px) translateY(${moveY + randomOffsetY}px) scale(0.7) rotate(${randomRot}deg) rotateY(180deg)`;
        cardElement.style.opacity = 0; 
    }, delay);

    setTimeout(() => {
        cardElement.remove();
        updateDiscardCount();
    }, delay + 500); 
}

function createCardElement(data) {
    let card = document.createElement("div");
    card.className = "card flipped"; 
    card.originalData = data; 
    
    // Stockage des stats dans les datasets pour le drag&drop
    card.dataset.type = data.type;
    card.dataset.cardName = data.name; 
    card.dataset.cardCost = data.energy;
    card.dataset.cardAttack = data.atk;
    card.dataset.cardShield = data.shield;
    card.dataset.cardEnergyPot = data.energy_pot;
    card.dataset.cardHealthPot = data.health_pot;

    let back = document.createElement("div"); back.className = "back";
    let front = document.createElement("div"); front.className = "front";
    front.style.backgroundImage = `url('${data.front}')`;
    
    let statsHTML = '';
    if (data.atk > 0) statsHTML += `<div class="stat"><img src="${iconAttack}"><span>${data.atk}</span></div>`;
    if (data.shield > 0) statsHTML += `<div class="stat"><img src="${iconShield}"><span>${data.shield}</span></div>`;
    if (data.energy_pot > 0) statsHTML += `<div class="stat"><img src="${iconEnergyPot}"><span>${data.energy_pot}</span></div>`;
    if (data.health_pot > 0) statsHTML += `<div class="stat"><img src="${iconHealthPot}"><span>${data.health_pot}</span></div>`;
    if (data.energy > 0) statsHTML += `<div class="stat cost-stat"><img src="${iconEnergy}"><span>${data.energy}</span></div>`;

    front.innerHTML = `<div class="card-title">${data.name}</div><div class="card-stats" style="${data.statsBg ? `background:url(${data.statsBg})` : ''}">${statsHTML}</div>`;
    card.appendChild(front);
    card.appendChild(back);
    
    // 1. Positionnement initial deck
    let deckRect = document.getElementById("deck").getBoundingClientRect();
    document.body.appendChild(card);
    card.style.position = "fixed";
    card.style.left = deckRect.left + "px";
    card.style.top = deckRect.top + "px";
    card.style.zIndex = 1000;
    card.style.transition = "all 0.4s ease-out";

    // 2. Mouvement vers le centre (visible) + flip
    setTimeout(() => {
        card.style.left = (window.innerWidth / 2 - 60) + "px";
        card.style.top = (window.innerHeight - 250) + "px"; 
        card.style.transform = "scale(1.3) rotateY(0deg)";
        card.className = "card"; 
    }, 50);

    // 3. Intégration dans la main
    setTimeout(() => {
        card.style.transition = "none"; 
        card.style.transform = "scale(1)";
        handDiv.appendChild(card); 
        updateHandLayout();
        enableDrag(card);
        requestAnimationFrame(() => card.style.transition = "transform 0.4s, left 0.4s, top 0.4s");
    }, 700);
}

// =================================================================
// LOGIQUE DE JEU : TOURS & DRAG/DROP
// =================================================================

function enemyTurn() {
    showTurnBanner('enemy');
    endTurnBtn.disabled = true; 
    
    setTimeout(() => {
        const enemyAttack = 10; 
        let incomingDamage = enemyAttack;
        let finalDamage = 0;
        
        if (gameState.currentShield >= incomingDamage) {
            gameState.currentShield -= incomingDamage;
            showFloatingText(playerShieldContainer, `-${incomingDamage}`, COLORS.HURT);
            finalDamage = 0;
        } else {
            let shieldAbsorbed = gameState.currentShield;
            if (shieldAbsorbed > 0) {
                showFloatingText(playerShieldContainer, `-${shieldAbsorbed}`, COLORS.HURT);
            }
            finalDamage = incomingDamage - gameState.currentShield;
            gameState.currentShield = 0;
        }
        
        if (finalDamage > 0) {
            gameState.currentHp -= finalDamage;
            showFloatingText(playerHpContainer, `-${finalDamage}`, COLORS.HURT);
        } else if (enemyAttack > 0) {
            showFloatingText(playerHpContainer, "Bloqué", COLORS.SHIELD);
        }

        updateDisplay();
        checkEndGame();
        
        if(gameState.currentHp > 0) {
            setTimeout(() => {
                // Recharge énergie et tour du joueur
                gameState.currentEnergy = gameState.maxEnergy;
                updateDisplay(); 
                showFloatingText(playerEnergyContainer, "Recharge", COLORS.HEAL);
                endTurnBtn.disabled = false;
                showTurnBanner('player');
            }, 800);
        }
        
    }, 1600); 
}

function endTurn() {
    endTurnBtn.disabled = true; 
    let totalAttack = 0;
    let unitsOnField = [];
    
    slots.forEach(slot => {
        if (slot.firstChild) unitsOnField.push(slot.firstChild);
    });

    // 1. Animation d'attaque des unités (NOUVEAU)
    unitsOnField.forEach((unitElement, index) => {
        let atk = parseInt(unitElement.originalData.atk) || 0;
        totalAttack += atk;
        let delay = index * 200; 

        if (atk > 0) {
            setTimeout(() => {
                unitElement.style.transition = "transform 0.2s ease-out";
                unitElement.style.transform = "scale(1.1) translateY(-20px)"; 
            }, delay);
            
            setTimeout(() => {
                unitElement.style.transform = "scale(1) translateY(0px)"; 
            }, delay + 200);
        }
    });

    let totalAnimationTime = unitsOnField.length * 200 + 400; // Délai pour l'animation d'attaque

    // 2. Application des dégâts et Défausse
    setTimeout(() => {
        if (totalAttack > 0) {
            bossState.currentHp -= totalAttack;
            updateDisplay();
            showFloatingText(bossContainer, `-${totalAttack}`, COLORS.DAMAGE);
        }
        
        checkEndGame();

        let cardsInHand = Array.from(handDiv.children);
        let cardsToDiscard = unitsOnField.concat(cardsInHand);

        // Défausse de toutes les cartes (Main + Terrain)
        cardsToDiscard.forEach((cardElement, index) => {
            let discardDelay = index * 80; 
            discardCard(cardElement, discardDelay); 
        });
        
        handDiv.innerHTML = '';
        
        // 3. Tour Ennemi
        let discardDuration = cardsToDiscard.length * 80 + 500;
        
        if (bossState.currentHp > 0 && gameState.currentHp > 0) {
            setTimeout(() => {
                gameState.currentEnergy = gameState.maxEnergy;
                showFloatingText(playerEnergyContainer, "Recharge", COLORS.HEAL);
                updateDisplay(); 
                enemyTurn(); 
            }, discardDuration + 300);
        } else {
             endTurnBtn.disabled = false;
        }
        
    }, totalAnimationTime); 
}

endTurnBtn.addEventListener('click', endTurn);

// --- PIOCHE ---
function drawCard(count) {
    if(deckData.length === 0 && discardData.length > 0) {
        showFloatingText(document.getElementById("deck"), "Mélange!", "#fff");
        deckData = discardData;
        discardData = [];
        updateDiscardCount();
        deckData = deckData.sort(() => Math.random() - 0.5); 
    }
    
    for (let i = 0; i < count; i++) {
        if(deckData.length === 0) { showFloatingText(document.getElementById("deck"), "Vide!", COLORS.ERROR); break; }
        if(handDiv.children.length >= gameState.maxHandSize) { showFloatingText(handDiv, "Main Pleine!", COLORS.ERROR); break; }
        
        let data = deckData.pop(); 
        createCardElement(data);
    }
}

document.getElementById("deck").onclick = () => { drawCard(1); };

// --- DRAG & DROP (Réintégré pour la fonctionnalité) ---

function resetCard(card) {
    card.style.position = "absolute"; 
    handDiv.appendChild(card);
    updateHandLayout();
    card.style.transition = "all 0.4s";
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
        let data = card.originalData;
        let cardCost = data.energy || 0; 

        // 1. Check Zones
        slots.forEach(slot => {
            let r = slot.getBoundingClientRect();
            if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
                
                // VÉRIFICATION ÉNERGIE
                if (gameState.currentEnergy < cardCost) {
                    showFloatingText(playerEnergyContainer, "Pas assez d'énergie !", COLORS.ERROR);
                    return; 
                }

                if (data.type === "UNIT") {
                    if (slot.hasChildNodes()) {
                        showFloatingText(slot, "Occupé!", COLORS.ERROR);
                        return;
                    }
                    
                    // PAIEMENT ET PLACEMENT
                    gameState.currentEnergy -= cardCost;
                    showFloatingText(playerEnergyContainer, `-${cardCost}`, COLORS.HEAL);
                    
                    card.remove();
                    slot.appendChild(card); 
                    
                    card.style.position = "static";
                    card.style.left = "";
                    card.style.top = "";
                    card.style.transform = "none";
                    card.style.zIndex = 1;
                    card.style.width = "100%";
                    card.style.height = "100%";
                    
                    updateDisplay(); 
                    showFloatingText(slot, "Déployé!", "#fff");
                    card.onpointerdown = null; 
                    dropped = true;
                    return; 
                }
            }
        });

        // 2. Check Drop "dans le vide" pour les Sorts (Skill)
        if (!dropped && data.type === "SKILL") {
            if (e.clientY < window.innerHeight - 200) { 
                
                // PAIEMENT
                if (cardCost > 0) { 
                    gameState.currentEnergy -= cardCost;
                    showFloatingText(playerEnergyContainer, `-${cardCost}`, COLORS.HEAL);
                }
                
                // EFFETS SKILL
                if (data.energy_pot > 0) {
                    gameState.currentEnergy = Math.min(gameState.maxEnergy, gameState.currentEnergy + data.energy_pot);
                    showFloatingText(playerEnergyContainer, `+${data.energy_pot}`, COLORS.HEAL);
                }
                if (data.health_pot > 0) {
                    gameState.currentHp = Math.min(gameState.maxHp, gameState.currentHp + data.health_pot);
                    showFloatingText(playerHpContainer, `+${data.health_pot}`, COLORS.HEAL);
                }
                if (data.shield > 0) {
                    gameState.currentShield += data.shield;
                    showFloatingText(playerShieldContainer, `+${data.shield}`, COLORS.SHIELD);
                }
                
                updateDisplay();
                
                // Défausse la carte Skill (animée)
                card.remove(); 
                discardCard(card, 0); 
                updateHandLayout();
                dropped = true;
            }
        }


        if (!dropped) {
            resetCard(card);
        } else {
            updateHandLayout();
        }

        slots.forEach(s => s.classList.remove('highlight'));
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    };
}


// Démarrage
updateDisplay();
showTurnBanner('player');