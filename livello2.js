// === BLOCCO 1: CANVAS E IMMAGINI ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// === Caricamento immagini principali ===
const cielo = new Image(); cielo.src = "images/sfondo_2.png";
const terra = new Image(); terra.src = "images/terra_2.png";
const rockyWalk = new Image(); rockyWalk.src = "images/rocky_walk.png";
const statua = new Image(); statua.src = "images/statua.png";
const albero = new Image(); albero.src = "images/albero_1.png";
const totem = new Image(); totem.src = "images/totem.png";
const aquilaImg = new Image(); aquilaImg.src = "images/cicogna.png";
const cacchinaImg = new Image(); cacchinaImg.src = "images/uovo.png";
const mostroVeg1 = new Image(); mostroVeg1.src = "images/mostro_veg_1.png";
const calesseImg = new Image(); calesseImg.src = "images/calesse.png";
const fuocoImg = new Image(); fuocoImg.src = "images/fuoco.png";
const rocciaImg = new Image(); rocciaImg.src = "images/fiori.png";
const gameOverImg = new Image();
let gameOverImgReady = false;

gameOverImg.onload = () => {
  console.log("✅ Immagine Game Over caricata");
  gameOverImgReady = true;
};

gameOverImg.onerror = () => {
  console.error("❌ Errore nel caricamento dell'immagine Game Over");
};

gameOverImg.src = "images/game_over.png";
const sangueVerde = new Image(); sangueVerde.src = "images/sangue_verde.png";
const tempioImg = new Image(); tempioImg.src = "images/tempio.png";
const teschioImg = new Image(); teschioImg.src = "images/teschio.png";














// === BLOCCO 2: AUDIO ===
const level2Music = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
level2Music.loop = true;
level2Music.volume = 0.5;

const shootSound = new Audio("sounds/sparo.mp3");
const hitSound = new Audio("sounds/boom.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");








// === BLOCCO 3: VARIABILI ===
let rockyX = 100;
let rockyY = 0;
const rockyWidth = 120;
const rockyHeight = 120;
let velocityY = 0;
const gravity = 1;
let jumpCount = 0;
let groundY = canvas.height - 100;
rockyY = groundY - rockyHeight + 10;

let scrollX = 0;
let scrollLimit;

let showLevelBanner = true;
let levelBannerTimer = 120;
let showStartScreen = true;
let showGameOver = false;
let showNextLevelBanner = false;
let nextLevelTimer = 120;

let keys = {};
let projectiles = [];
let enemyProjectiles = [];
let enemies = [];
let strongerEnemies = []; // ← verrà usato solo se servono altri nemici in futuro
let cacchine = [];
let aquile = [];
let rocce = [];
let teschi = [];
let bloodSplashes = [];

let score = 0;
let gameOver = false;
let canShoot = true;
let energy = 100;
let shakeTimer = 0;
let currentFrame = 0;
let frameTimer = 0;
const frameInterval = 8;

const tempio = {
  x: 20000,
  y: groundY - 680,
  width: 900,
  height: 900
};
scrollLimit = tempio.x - canvas.width + 600;











// === BLOCCO 4: INPUT TASTIERA ===
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (showStartScreen && e.code === "Enter") {
    showStartScreen = false;
    level2Music.currentTime = 0;
    level2Music.play();
    resetGame();
  }

  if (showGameOver && e.code === "Enter") {
    showGameOver = false;
    gameOver = false;
    level2Music.currentTime = 0;
    level2Music.play();
    resetGame();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});











// === BLOCCO 5: SPARO ===
function launchProjectile() {
  if (canShoot) {
    projectiles.push({
      x: rockyX + rockyWidth + scrollX,
      y: rockyY + 20,
      velocityX: 15,
      width: 60,
      height: 60
    });
    shootSound.currentTime = 0;
    shootSound.play();
    canShoot = false;
    setTimeout(() => canShoot = true, 300);
  }
}










// === BLOCCO 6: SPAWNING ===

function spawnEnemy() {
  const width = 190;
  const height = 150;
  enemies.push({
    x: canvas.width + scrollX,
    y: groundY - height, // 👈 tocca terra!
    width: width,
    height: height,
    image: mostroVeg1,
    speed: 2,
    bounceOffset: Math.random() * 100
  });
}

function spawnCalesse() {
  const width = 230;
  const height = 160;
  enemies.push({
    x: canvas.width + scrollX + 200,
    y: groundY - height, // 👈 anche lui tocca terra!
    width: width,
    height: height,
    image: calesseImg,
    speed: 1.5,
    bounceOffset: Math.random() * 100
  });
}

function spawnAquila() {
  aquile.push({
    x: canvas.width + scrollX + 300,
    y: 80 + Math.random() * 150,
    width: 180,
    height: 120,
    speedX: 5,
    speedY: 1.5,
    directionY: 1,
    dropCooldown: 80
  });
}

function spawnTeschio() {
  if (Math.random() < 0.002 && teschi.length < 1 && rocce.length > 0) {
    const r = rocce[Math.floor(Math.random() * rocce.length)];
    teschi.push({
      x: r.x + r.width / 2 - 50,
      baseY: r.y - 100,
      y: r.y - 100,
      width: 100,
      height: 100,
      floatOffset: Math.random() * 100
    });
  }
}

let nextRockSpawnX = 1000;
function spawnRocceDinamiche() {
  const visibile = scrollX + canvas.width;
  while (nextRockSpawnX < visibile + 1200) {
    const altezzaRandom = Math.random() > 0.5 ? -80 : 40;
    rocce.push({
      x: nextRockSpawnX,
      y: groundY - 200 + altezzaRandom,
      width: 500,
      height: 120
    });
    nextRockSpawnX += 1000;
  }
}









// === BLOCCO 7: UPDATE ===

let enemySpawnTimer = 0;
let calesseSpawnTimer = 0;
let aquilaSpawnTimer = 0;
let levelCompleted = false;

function update() {
  if (gameOver) return;

  // === Banner iniziale ===
  if (showLevelBanner) {
    levelBannerTimer--;
    if (levelBannerTimer <= 0) showLevelBanner = false;
    return;
  }

  // === Banner fine livello ===
  if (showNextLevelBanner) {
    nextLevelTimer--;
    if (nextLevelTimer <= 0) {
      // window.location.href = "livello3.html";
    }
    return;
  }

  // === Movimento di Rocky e scroll ===
  const rockyWorldX = rockyX + scrollX;
  if (!levelCompleted && rockyWorldX >= tempio.x - 50) {
    scrollX = scrollLimit;
    rockyX += 5;
  } else {
    if (keys["ArrowRight"] || joypadKeys["ArrowRight"]) {
      if (scrollX < scrollLimit) scrollX += 5;
      else rockyX += 5;
    }
  }

  if (keys["ArrowLeft"] || joypadKeys["ArrowLeft"] && scrollX > 0) scrollX -= 5;

  if (keys["ArrowUp"] || joypadKeys["ArrowUp"] && jumpCount < 2 && !keys["_jumping"]) {
    velocityY = -20;
    jumpCount++;
    keys["_jumping"] = true;
  }
  if (!keys["ArrowUp"] || joypadKeys["ArrowUp"]) keys["_jumping"] = false;

  if (keys["Space"] || joypadKeys["Space"]) launchProjectile();

  // === Gravità e salti ===
  rockyY += velocityY;
  velocityY += gravity;

  if (rockyY >= groundY - rockyHeight + 10) {
    rockyY = groundY - rockyHeight + 10;
    velocityY = 0;
    jumpCount = 0;
  }

  // === Collisione con rocce (atterraggio) ===
  for (const r of rocce) {
    const cx = rockyX + rockyWidth / 2 + scrollX;
    const b = rockyY + rockyHeight;
    const nextB = rockyY + velocityY + rockyHeight;

    if (cx > r.x + 30 && cx < r.x + r.width - 30 &&
        velocityY >= 0 && b <= r.y + 10 && nextB >= r.y) {
      rockyY = r.y - rockyHeight + 10;
      velocityY = 0;
      jumpCount = 0;
      break;
    }
  }

  // === Movimento entità ===
  projectiles.forEach(p => p.x += p.velocityX);
  projectiles = projectiles.filter(p => p.x - scrollX < canvas.width);

  // Movimento nemici vegetali (normale)
  enemies.forEach(e => {
    e.x -= e.speed;
  });

  // Movimento calesse (oscillante)
enemies.forEach(e => {
  if (e.image === calesseImg) {
    e.y = groundY - 180 + Math.sin((Date.now() + e.bounceOffset) / 200) * 5;
  }
});

  // Aquile e cacchine
  aquile.forEach(a => {
    a.x -= a.speedX;
    a.y += a.speedY * a.directionY;
    if (a.y < 50 || a.y > 250) a.directionY *= -1;

    a.dropCooldown--;
    if (a.dropCooldown <= 0) {
      cacchine.push({
        x: a.x,
        y: a.y + a.height,
        width: 40,
        height: 40,
        speedY: 6
      });
      a.dropCooldown = 100;
    }
  });

  cacchine.forEach(c => c.y += c.speedY);

  // Rocce dinamiche e teschi fluttuanti
  spawnRocceDinamiche();
  spawnTeschio();
  teschi.forEach(t => {
    t.y = t.baseY + Math.sin((Date.now() + t.floatOffset) / 300) * 5;
  });

  // === Spawn nemici ===
  if (++enemySpawnTimer > 180) {
    spawnEnemy(); // mostro_veg_1
    enemySpawnTimer = 0;
  }

  if (++calesseSpawnTimer > 600) {
    spawnCalesse();
    calesseSpawnTimer = 0;
  }

  if (++aquilaSpawnTimer > 500 || aquile.length === 0) {
    spawnAquila();
    aquilaSpawnTimer = 0;
  }
// Movimento calesse o vegetale con rimbalzo
enemies.forEach(e => {
  if (e.image === calesseImg || e.image === mostroVeg1) {
    e.y = groundY - e.height + Math.sin((Date.now() + e.bounceOffset) / 200) * 5;
  }
});
  // === Pulizia array ===
  enemies = enemies.filter(e => e.x + e.width - scrollX > -200);
  aquile = aquile.filter(a => a.x + a.width - scrollX > -200);
  rocce = rocce.filter(r => r.x + r.width - scrollX > -800);
  teschi = teschi.filter(t => t.x + t.width - scrollX > -200);
  cacchine = cacchine.filter(c => c.y < canvas.height);
  enemyProjectiles = enemyProjectiles.filter(p => p.x + p.width - scrollX > 0);
  bloodSplashes = bloodSplashes.filter(b => Date.now() - b.timestamp < 300);

  // === Collisioni e fine livello ===
  handleCollisions();

  if (!levelCompleted &&
      rockyX + scrollX + rockyWidth > tempio.x &&
      rockyX + scrollX < tempio.x + tempio.width) {
    levelCompleted = true;
    showNextLevelBanner = true;
    nextLevelTimer = 120;
  }
}















// === BLOCCO 8: COLLISIONI ===
function handleCollisions() {
  function check(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  const rockyHitbox = {
    x: rockyX + scrollX,
    y: rockyY,
    width: rockyWidth,
    height: rockyHeight
  };

  // Proiettili → Nemici (vegetali e calesse)
  enemies = enemies.filter(e => {
    const hitIndex = projectiles.findIndex(p => check(p, e));
    if (hitIndex !== -1) {
      bloodSplashes.push({ x: e.x, y: e.y, timestamp: Date.now() });
      projectiles.splice(hitIndex, 1);
      score += 10;
      hitSound.play();
      return false;
    }

    // Collisione con Rocky
    if (check(rockyHitbox, e)) {
      energy -= 10;
      if (energy <= 0) endGame();
      return false;
    }

    return true;
  });

  // Proiettili → Aquile
  aquile = aquile.filter(a => {
    const hitIndex = projectiles.findIndex(p => check(p, a));
    if (hitIndex !== -1) {
      bloodSplashes.push({ x: a.x, y: a.y, timestamp: Date.now() });
      projectiles.splice(hitIndex, 1);
      hitSound.play();
      return false;
    }
    return true;
  });

  // Fuoco nemico → Rocky
  enemyProjectiles = enemyProjectiles.filter(p => {
    if (check(rockyHitbox, p)) {
      energy -= 10;
      if (energy <= 0) endGame();
      return false;
    }
    return true;
  });

  // Cacchina → Rocky
  cacchine = cacchine.filter(c => {
    if (check(rockyHitbox, c)) {
      energy -= 8;
      if (energy <= 0) endGame();
      return false;
    }
    return true;
  });

  // Teschio → Rocky (BONUS: distrugge tutto)
  teschi = teschi.filter(t => {
    if (check(rockyHitbox, t)) {
      enemies = [];
      aquile = [];
      enemyProjectiles = [];
      cacchine = [];
      bloodSplashes.push({ x: rockyHitbox.x, y: rockyHitbox.y, timestamp: Date.now() });
      shakeTimer = 20;
      return false;
    }
    return true;
  });
}

function endGame() {
  gameOver = true;
  showGameOver = true;
  level2Music.pause();  // ✅ musica giusta fermata
  gameOverSound.play();
}














// === BLOCCO 9: DRAW ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === BANNER INIZIO LIVELLO ===
  if (showLevelBanner) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL 2", canvas.width / 2, canvas.height / 2 + 15);
    return;
  }

  // === BANNER FINE LIVELLO ===
  if (showNextLevelBanner) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL COMPLETE!", canvas.width / 2, canvas.height / 2 + 15);
    return;
  }

  // === GAME OVER SHAKE E IMMAGINE ===
  if (showGameOver) {
    ctx.save();
    const dx = Math.random() * 10 - 5;
    const dy = Math.random() * 10 - 5;
    ctx.translate(dx, dy);
    if (gameOverImgReady) {
      ctx.drawImage(gameOverImg, canvas.width / 2 - 400, canvas.height / 2 - 200, 800, 400);
    } else {
      ctx.fillStyle = "white";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 + 15);
    }
    ctx.restore();
    return;
  }

  // === EFFETTO SHAKE (se attivo) ===
  if (shakeTimer > 0) {
    ctx.save();
    const dx = Math.random() * 10 - 5;
    const dy = Math.random() * 10 - 5;
    ctx.translate(dx, dy);
    shakeTimer--;
  }

  // === SFONDO ===
  ctx.drawImage(cielo, 0, 0, canvas.width, canvas.height);

  for (let x = -scrollX % terra.width - terra.width; x < canvas.width + terra.width; x += terra.width) {
    ctx.drawImage(terra, x, groundY);
  }

  for (let r of rocce) ctx.drawImage(rocciaImg, r.x - scrollX, r.y, r.width, r.height);
  for (let e of enemies) ctx.drawImage(e.image, e.x - scrollX, e.y, e.width, e.height);
  for (let a of aquile) ctx.drawImage(aquilaImg, a.x - scrollX, a.y, a.width, a.height);
  for (let c of cacchine) ctx.drawImage(cacchinaImg, c.x - scrollX, c.y, c.width, c.height);
  for (let p of enemyProjectiles) ctx.drawImage(fuocoImg, p.x - scrollX, p.y, p.width, p.height);
  for (let p of projectiles) ctx.drawImage(statua, p.x - scrollX, p.y, p.width, p.height);
  for (let t of teschi) ctx.drawImage(teschioImg, t.x - scrollX, t.y, t.width, t.height);

  // === ROCKY ANIMATO ===
  if (keys["ArrowRight"] || joypadKeys["ArrowRight"] || keys["ArrowLeft"] || joypadKeys["ArrowLeft"]) {
    frameTimer++;
    if (frameTimer >= frameInterval) {
      frameTimer = 0;
      currentFrame = (currentFrame + 1) % 6;
    }
  } else {
    currentFrame = 0;
  }

  const frameWidth = 96, frameHeight = 96, columns = 3;
  const sx = (currentFrame % columns) * frameWidth;
  const sy = Math.floor(currentFrame / columns) * frameHeight;

  ctx.drawImage(rockyWalk, sx, sy, frameWidth, frameHeight, rockyX, rockyY, rockyWidth, rockyHeight);

  // === OGGETTI DECORATIVI ===
  for (let x = -scrollX % 2400 - 2400; x < canvas.width + scrollX; x += 2400) {
    ctx.drawImage(albero, x + 300, groundY - 440, 600, 600);
    ctx.drawImage(totem, x + 1600, groundY - 440, 600, 600);
  }

  // === TEMPIO ===
  ctx.drawImage(tempioImg, tempio.x - scrollX, tempio.y, tempio.width, tempio.height);

  // === SANGUE VERDE ===
  for (let b of bloodSplashes) {
    ctx.drawImage(sangueVerde, b.x - scrollX, b.y, 100, 100);
  }

  // === HUD: PUNTEGGIO + BARRA VITA ===
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText("PUNTEGGIO: " + score, canvas.width / 2, 40);

  const barWidth = 200, barX = (canvas.width - barWidth) / 2;
  ctx.fillStyle = "gray";
  ctx.fillRect(barX, 60, barWidth, 20);
  ctx.fillStyle = energy > 50 ? "lime" : energy > 20 ? "orange" : "red";
  ctx.fillRect(barX, 60, (energy / 100) * barWidth, 20);
  ctx.strokeStyle = "black";
  ctx.strokeRect(barX, 60, barWidth, 20);

  // === RIPRISTINA CONTESTO SHAKE ===
  if (shakeTimer > 0) ctx.restore();
}



















// === BLOCCO 10: LOOP ===

function resetGame() {
  score = 0;
  scrollX = 0;
  rockyY = groundY - rockyHeight + 10;
  velocityY = 0;
  jumpCount = 0;
  energy = 100;
  shakeTimer = 0;

  projectiles = [];
  enemyProjectiles = [];
  enemies = [];             // Solo mostro_calesse e mostro_veg_1
  strongerEnemies = [];     // Rimane vuoto, ma lasciato per sicurezza futura
  aquile = [];
  cacchine = [];
  rocce = [];
  teschi = [];
  bloodSplashes = [];

  nextRockSpawnX = 1000;
  scrollLimit = tempio.x - canvas.width + 600;

  levelCompleted = false;
  showGameOver = false;
  showNextLevelBanner = false;
  nextLevelTimer = 120;
}


// === SUPPORTO GAMEPAD AVANZATO CON SALTO INTELLIGENTE ===
let joypadKeys = {};
let prevJoypadButtons = {};

function handleGamepadInput() {
  const gamepads = navigator.getGamepads();
  if (!gamepads) return;
  const gp = gamepads[0];
  if (!gp) return;

  const deadzone = 0.3;

  // Reset tasti joypad
  joypadKeys["ArrowLeft"] = false;
  joypadKeys["ArrowRight"] = false;
  joypadKeys["ArrowUp"] = false;
  joypadKeys["Space"] = false;

  if (gp.axes[0] < -deadzone) joypadKeys["ArrowLeft"] = true;
  if (gp.axes[0] > deadzone)  joypadKeys["ArrowRight"] = true;

  // Salto solo quando passa da non premuto a premuto
  if (!prevJoypadButtons[0] && gp.buttons[0].pressed) {
    joypadKeys["ArrowUp"] = true;
  }

  // Spara solo quando effettivamente premuto
  if (gp.buttons[1].pressed) {
    joypadKeys["Space"] = true;
  }

  // Salva stato corrente dei pulsanti
  prevJoypadButtons[0] = gp.buttons[0].pressed;
  prevJoypadButtons[1] = gp.buttons[1].pressed;
}


function gameLoop() {
  handleGamepadInput();
  groundY = canvas.height - 100;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.onload = () => {
  resetGame();
  gameLoop();

  let musicaAvviata = false;

  const avviaMusica = () => {
    if (!musicaAvviata) {
      level2Music.currentTime = 0;
      level2Music.play().then(() => {
        musicaAvviata = true;
        console.log("🎵 Musica avviata");
      }).catch(err => {
        console.error("Errore avvio musica:", err);
      });
    }
  };

  window.addEventListener("click", avviaMusica, { once: true });
  window.addEventListener("keydown", avviaMusica, { once: true });
};