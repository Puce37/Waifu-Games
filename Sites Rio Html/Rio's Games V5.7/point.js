let points = 0;

// Chargement initial des points
function loadPoints() {
  const saved = localStorage.getItem("points");
  if (saved) points = parseInt(saved);
  updatePointsDisplay();
}

function savePoints() {
  localStorage.setItem("points", points);
}

function addPoints(amount) {
  const bonus = getBonusMultiplier();
  const total = amount * bonus;
  points += total;
  updatePointsDisplay();
  savePoints();
}

function spendPoints(amount) {
  if (points >= amount) {
    points -= amount;
    updatePointsDisplay();
    savePoints();
    return true;
  } else {
    alert("Pas assez de points !");
    return false;
  }
}

function updatePointsDisplay() {
  const el = document.getElementById("points");
  if (el) el.textContent = points;
}

// --- INVENTAIRE ET BONUS ---

// Récupère les objets équipés (max 3) et calcule le multiplicateur total
function getBonusMultiplier() {
  const equipped = JSON.parse(localStorage.getItem("equipped") || "[]");
  const multipliers = JSON.parse(localStorage.getItem("multipliers") || "[]");

  // Sécurité : max 3
  if (equipped.length > 3) equipped.length = 3;

  let total = 0;
  for (const index of equipped) {
    const bonus = multipliers[index];
    if (bonus) total += bonus;
  }

  return total > 0 ? total : 1;
}

// À utiliser si tu veux voir l'inventaire dans la console
function debugInventory() {
  console.log("Inventaire:", JSON.parse(localStorage.getItem("multipliers") || "[]"));
  console.log("Équipés:", JSON.parse(localStorage.getItem("equipped") || "[]"));
}

window.addEventListener("load", loadPoints);

function getBonusMultiplier() {
  const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
  const equipped = JSON.parse(localStorage.getItem("equipped") || "[]");

  let total = 0;
  for (const i of equipped) {
    const item = inventory[i];
    if (item && item.bonus) {
      total += item.bonus;
    }
  }

  return 1 + total; // x1 de base + bonus total
}
