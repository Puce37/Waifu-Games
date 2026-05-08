function updateStore() {
  const container = document.getElementById("store");
  container.innerHTML = "";

  storeItems.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
    <img src="${item.image}" alt="${item.name}">
    <p><strong>${item.name}</strong></p>
    <p>💠 Prix : ${item.price} pts</p>
    <button onclick='buyItem(${JSON.stringify(item)})'>Acheter</button>
  `;
    container.appendChild(div);
  });
}

function buyItem(item) {
  const points = parseInt(localStorage.getItem("points") || "0");

  if (points < item.price) {
    alert("Pas assez de points !");
    return;
  }

  const newPoints = points - item.price;
  localStorage.setItem("points", newPoints);
  updatePointsDisplay();

  const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
  inventory.push({
    name: item.name,
    image: item.image,
    bonus: 0,
    rarity: "special",
  });
  localStorage.setItem("inventory", JSON.stringify(inventory));
  alert(`${item.name} a été ajouté à ton inventaire !`);
}

window.addEventListener("load", () => {
  updatePointsDisplay();
  updateStore();
});

function goBack() {
  window.location.href = "../index.html";
}

function gacha() {
  window.location.href = "./gacha.html";
}