// Initialisation
let playerData = loadGameData();
updateUI();

// --- NAVIGATION ---
function switchTab(tabId) {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- MISE À JOUR UI ---
function updateUI() {
    // Top Bar
    document.getElementById('coin-display').textContent = playerData.coins;
    document.getElementById('stat-hp-display').textContent = `❤️ ${playerData.playerStats.maxHp}`;
    document.getElementById('stat-energy-display').textContent = `⚡ ${playerData.playerStats.maxEnergy}`;
    document.getElementById('stat-shield-display').textContent = `🛡️ ${playerData.playerStats.startShield}`;

    // Deck Count
    let deckSize = playerData.deck.length;
    let counterEl = document.getElementById('deck-counter');
    counterEl.textContent = `Deck: ${deckSize} / 60`;
    if (deckSize > 60) counterEl.style.color = "red";
    else if (deckSize < 5) counterEl.style.color = "orange"; // Deck trop petit
    else counterEl.style.color = "#00ff00";

    renderInventory();
}

// --- INVENTAIRE & DECK BUILDER ---
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    // On parcourt TOUTES les cartes existantes (base DB)
    CARD_DB.forEach(baseCard => {
        let playerCardInfo = playerData.inventory[baseCard.id];
        
        // Si le joueur ne possède pas la carte, on ne l'affiche pas (ou en grisé)
        if (!playerCardInfo) return;

        let currentStats = getCardStats(baseCard.id, playerCardInfo.level);
        let nextCost = getLevelUpCost(playerCardInfo.level);
        let progressPercent = Math.min(100, (playerCardInfo.copies / nextCost) * 100);
        let canUpgrade = playerCardInfo.copies >= nextCost;
        
        // Combien de fois cette carte est dans le deck ?
        let inDeckCount = playerData.deck.filter(id => id === baseCard.id).length;
        
        let cardDiv = document.createElement('div');
        cardDiv.className = `menu-card ${inDeckCount > 0 ? 'in-deck' : ''}`;
        
        // Flèche d'upgrade
        let arrowHtml = canUpgrade ? `<div class="upgrade-arrow" style="display:block;">⬆️</div>` : '';

        cardDiv.innerHTML = `
            ${arrowHtml}
            <div class="menu-card-img" style="background-image: url('${baseCard.front}');"></div>
            <div style="font-weight:bold; color:#fff;">${baseCard.name}</div>
            <div style="font-size:10px; color:#aaa;">Lvl ${playerCardInfo.level}</div>
            
            <!-- Stats simplifiées -->
            <div style="display:flex; gap:5px; font-size:10px;">
                ${currentStats.atk ? `<span style="color:#ff5555">⚔️${currentStats.atk}</span>` : ''}
                ${currentStats.shield ? `<span style="color:#33ccff">🛡️${currentStats.shield}</span>` : ''}
                ${currentStats.health_pot ? `<span style="color:#00ff00">💚${currentStats.health_pot}</span>` : ''}
            </div>

            <!-- Barre verte XP -->
            <div class="xp-bar-container">
                <div class="xp-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div style="font-size:10px; margin-bottom:5px;">${playerCardInfo.copies} / ${nextCost} cartes</div>
            
            <!-- Compteur Deck -->
            <div class="menu-card-info" style="color:${inDeckCount > 0 ? '#00ff00' : '#888'}">
                Dans le deck: ${inDeckCount}
            </div>
        `;

        // Gestionnaire de clic
        cardDiv.onclick = (e) => {
            // Si on clique sur l'upgrade (zone haute si possible, mais ici tout clic gère l'upgrade SI dispo)
            if (canUpgrade) {
                if (confirm(`Améliorer ${baseCard.name} au niveau ${playerCardInfo.level + 1} pour ${nextCost} copies ?`)) {
                    performUpgrade(baseCard.id);
                }
            } else {
                // Sinon on ajoute/retire du deck
                toggleDeckCard(baseCard.id);
            }
        };

        grid.appendChild(cardDiv);
    });
}

function toggleDeckCard(cardId) {
    // Logique simple: si on a moins de 60 cartes, on ajoute. 
    // Si on veut retirer, c'est plus compliqué avec un simple clic.
    // Pour V15 : Click gauche = Ajouter, Click Droit (ou Shift+Click) = Retirer
    // Simplifions : Ajoute jusqu'à 3 copies max par carte, puis retire tout.
    
    let currentCount = playerData.deck.filter(id => id === cardId).length;
    
    if (currentCount < 3 && playerData.deck.length < 60) {
        playerData.deck.push(cardId);
    } else {
        // Retire toutes les copies de cette carte
        playerData.deck = playerData.deck.filter(id => id !== cardId);
    }
    saveGameData(playerData);
    updateUI();
}

function performUpgrade(cardId) {
    let info = playerData.inventory[cardId];
    let cost = getLevelUpCost(info.level);
    
    info.copies -= cost;
    info.level++;
    
    alert("Niveau Supérieur ! Les stats de la carte ont augmenté.");
    saveGameData(playerData);
    updateUI();
}

// --- SHOP ---
function buyUpgrade(type) {
    let cost = 0;
    if (type === 'hp') cost = 100;
    if (type === 'energy') cost = 300;
    if (type === 'shield') cost = 150;

    if (playerData.coins >= cost) {
        playerData.coins -= cost;
        if (type === 'hp') playerData.playerStats.maxHp += 5;
        if (type === 'energy') playerData.playerStats.maxEnergy += 1;
        if (type === 'shield') playerData.playerStats.startShield += 5;
        
        saveGameData(playerData);
        updateUI();
        document.getElementById('shop-msg').textContent = "Achat réussi !";
        setTimeout(()=>document.getElementById('shop-msg').textContent="", 2000);
    } else {
        document.getElementById('shop-msg').textContent = "Pas assez d'argent !";
    }
}

// --- GACHA ---
function pullGacha() {
    if (playerData.coins < GACHA_COST) {
        alert("Pas assez de pièces !");
        return;
    }

    playerData.coins -= GACHA_COST;
    
    // Tirage aléatoire
    let randIndex = Math.floor(Math.random() * CARD_DB.length);
    let cardWon = CARD_DB[randIndex];
    
    // Ajout à l'inventaire
    if (!playerData.inventory[cardWon.id]) {
        playerData.inventory[cardWon.id] = {level: 1, copies: 0};
        showGachaResult(cardWon, "NOUVELLE CARTE !");
    } else {
        playerData.inventory[cardWon.id].copies++;
        showGachaResult(cardWon, "DOUBLON ! (+1 Copie)");
    }
    
    saveGameData(playerData);
    updateUI();
}

function showGachaResult(card, text) {
    let resultOverlay = document.getElementById('gacha-result');
    let cardDisplay = document.getElementById('new-card-display');
    let textDisplay = document.getElementById('gacha-text');
    
    // Construction visuelle de la carte
    let innerHTML = `
        <div class="front" style="background-image: url('${card.front}'); border: 2px solid #4bd3ff;">
            <div class="card-title">${card.name}</div>
        </div>
        <div class="back" style="background: url('card-back.png') center/cover;"></div>
    `;
    cardDisplay.innerHTML = innerHTML;
    
    textDisplay.textContent = text;
    resultOverlay.style.display = "flex";
}

function closeGachaResult() {
    document.getElementById('gacha-result').style.display = "none";
}