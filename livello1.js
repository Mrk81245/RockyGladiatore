// === BLOCCO 1: CANVAS E IMMAGINI ===

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const tempioImg = new Image();
tempioImg.src = "images/tempio.png";
const cielo = new Image(); cielo.src = "images/cielo.png";
const terra = new Image(); terra.src = "images/terra.png";
const rockyWalk = new Image(); rockyWalk.src = "images/rocky_walk.png";
const statua = new Image(); statua.src = "images/statua.png";
const albero = new Image(); albero.src = "images/albero.png";
const rovine = new Image(); rovine.src = "images/rovine.png";
const aquilaImg = new Image(); aquilaImg.src = "images/aquila.png";
const cacchinaImg = new Image(); cacchinaImg.src = "images/cacchina.png";
const startImage = new Image(); startImage.src = "images/copertina.png";
const startBanner = new Image(); startBanner.src = "images/startgame.png";
const mostro4 = new Image(); mostro4.src = "images/mostro_4.png";
const fuocoImg = new Image(); fuocoImg.src = "images/fuoco.png";
const rocciaImg = new Image(); rocciaImg.src = "images/rocce.png";
const gameOverImg = new Image(); gameOverImg.src = "images/game_over.png";
const sangueVerde = new Image(); sangueVerde.src = "images/sangue_verde.png";
const teschioImg = new Image(); teschioImg.src = "images/teschio.png";

const enemyImages = [
  "images/mostro_1.png",
  "images/mostro_2.png",
  "images/mostro_3.png"
];
const loadedEnemyImages = enemyImages.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});







// === BLOCCO 2: AUDIO ===
const backgroundMusic = new Audio("sounds/Pixel Dreams.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

const introMusic = new Audio("sounds/Jungle Quest.mp3");
introMusic.loop = true;
introMusic.volume = 0.5;

const shootSound = new Audio("sounds/sparo.mp3");
const hitSound = new Audio("sounds/boom.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");








// === BLOCCO 3: VARIABILI ===
let showLevelBanner = true;
let levelBannerTimer = 120; // 2 secondi a 60 fps
let rockyX = 100;
let rockyY = 0;
const rockyWidth = 120;
const rockyHeight = 120;
let velocityY = 0;
const gravity = 1;
let jumpCount = 0;
let groundY = canvas.height - 100;
rockyY = groundY - rockyHeight + 10;
let scrollLimit;
let keys = {};
let projectiles = [];
let enemyProjectiles = [];
let enemies = [];
let strongerEnemies = [];
let cacchine = [];
let aquile = [];
let rocce = [];
let teschi = [];
let bloodSplashes = [];
 
let score = 0;
let gameOver = false;
let canShoot = true;
let showStartScreen = true;
let showGameOver = false;
let energy = 100;
let shakeTimer = 0;

let currentFrame = 0;
let frameTimer = 0;
const frameInterval = 8;
let level = 1;
let levelCompleted = false;
let showNextLevelBanner = false;
let nextLevelTimer = 120;

let tempio = {
  x: 20000,             // Molto più lontano nel livello
  y: groundY - 680,
  width: 900,          // Più largo
  height: 900          // Più alto
};







// === BLOCCO 4: INPUT TASTIERA ===
// Gestione input tastiera + gestione audio per copertina/gioco

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (showStartScreen && e.code === "Enter") {
    showStartScreen = false;
    introMusic.pause();
    introMusic.currentTime = 0;
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    resetGame();
  }

  if (showGameOver && e.code === "Enter") {
    showGameOver = false;
    gameOver = false;
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    resetGame();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});







// === BLOCCO 5:  ===

function launchProjectile() {
  if (canShoot) {
    projectiles.push({
      x: rockyX + rockyWidth + scrollX,
      y: rockyY + 20,
      velocityX: 15,
      width: 60,  // ingrandita
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
  const img = loadedEnemyImages[Math.floor(Math.random() * loadedEnemyImages.length)];
  enemies.push({
    x: canvas.width + scrollX,
    y: groundY - 130,
    width: 150,
    height: 150,
    image: img,
    speed: 2
  });
}

function spawnStrongerEnemy() {
  strongerEnemies.push({
    x: canvas.width + scrollX + 200,
    y: groundY - 220,
    width: 260, // +20% dimensione
    height: 260,
    image: mostro4,
    speed: 1.8,
    health: 3,
    shootCooldown: 0
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
    dropCooldown: 80,
    health: 1
  });
}

function spawnTeschio() {
  if (Math.random() < 0.002 && rocce.length > 0 && teschi.length < 1) {
    const rocceVisibili = rocce.filter(r => r.x + r.width - scrollX > 0 && r.x - scrollX < canvas.width);
    if (rocceVisibili.length > 0) {
      const r = rocceVisibili[Math.floor(Math.random() * rocceVisibili.length)];
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
let strongEnemySpawnTimer = 0;
let aquilaSpawnTimer = 0;

function update() {
  if (gameOver || showStartScreen) return;

  if (showLevelBanner) {
    levelBannerTimer--;
    if (levelBannerTimer <= 0) {
      showLevelBanner = false;
    }
    return;
  }

  if (showNextLevelBanner) {
    nextLevelTimer--;
    if (nextLevelTimer <= 0) {
      window.location.href = "livello2.html"; // 🔁 passa al prossimo livello
    }
    return;
  }

  // Movimento laterale
  if (keys["ArrowRight"] || joypadKeys["ArrowRight"]) {
    if (scrollX < scrollLimit) {
      scrollX += 5;
    } else {
      // Rocky può ancora muoversi un po’ a destra, ma non a oltranza
      if (rockyX < canvas.width - rockyWidth - 50) {
        rockyX += 5;
      }
    }
  }
  
  if (keys["ArrowLeft"] || joypadKeys["ArrowLeft"]) {
    if (rockyX > 100) {
      rockyX -= 5;
    } else if (scrollX > 0) {
      scrollX -= 5;
    }
  }

  // Salto e doppio salto
  if (keys["ArrowUp"] || joypadKeys["ArrowUp"] && jumpCount < 2 && !keys["_jumping"]) {
    velocityY = -20;
    jumpCount++;
    keys["_jumping"] = true;
  }
  if (!keys["ArrowUp"] || joypadKeys["ArrowUp"]) keys["_jumping"] = false;

  // Sparo
  if (keys["Space"] || joypadKeys["Space"]) launchProjectile();

  // Gravità
  rockyY += velocityY;
  velocityY += gravity;

  let isOnGround = false;

  // Collisione con terreno
  if (rockyY >= groundY - rockyHeight + 10) {
    rockyY = groundY - rockyHeight + 10;
    velocityY = 0;
    jumpCount = 0;
    isOnGround = true;
  }

  // Collisione con rocce
  for (const r of rocce) {
    const rockyWorldX = rockyX + scrollX;
    const rockyCenterX = rockyWorldX + rockyWidth / 2;
    const rockyBottom = rockyY + rockyHeight;
    const nextBottom = rockyY + velocityY + rockyHeight;

    const isCentered = rockyCenterX > r.x + 30 && rockyCenterX < r.x + r.width - 30;
    const isFalling = velocityY >= 0;
    const comingFromAbove = rockyBottom <= r.y + 10;

    if (isCentered && isFalling && comingFromAbove && nextBottom >= r.y) {
      rockyY = r.y - rockyHeight;
      velocityY = 0;
      jumpCount = 0;
      isOnGround = true;
      break;
    }
  }

  // Proiettili giocatore
  for (let p of projectiles) p.x += p.velocityX;
  projectiles = projectiles.filter(p => p.x - scrollX <= canvas.width);

  // Nemici
  for (const e of enemies) e.x -= e.speed;

  // Nemici forti con fuoco zig-zag
  for (const e of strongerEnemies) {
    e.x -= e.speed;
    e.y += Math.sin(Date.now() / 100) * 0.5;
    e.shootCooldown--;
    if (e.shootCooldown <= 0) {
      enemyProjectiles.push({
        x: e.x,
        y: e.y + e.height / 2,
        width: 100,
        height: 100,
        speedX: -5,
        zigzagPhase: 0
      });
      e.shootCooldown = 100 + Math.random() * 100;
    }

    // Animazione mostro 4
    e.frameTimer++;
    if (e.frameTimer >= frameInterval) {
      e.frameTimer = 0;
      e.currentFrame = (e.currentFrame + 1) % 6;
    }
  }

  // Movimento zig-zag dei proiettili nemici
  for (let p of enemyProjectiles) {
    p.x += p.speedX;
    p.zigzagPhase += 0.2;
    p.y += Math.sin(p.zigzagPhase) * 2.5;
  }

  // Aquile
  for (let a of aquile) {
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
  }

  // Cacchine
  for (let c of cacchine) c.y += c.speedY;

  // Rocce dinamiche
  spawnRocceDinamiche();

  // Spawn raro del teschio (uno solo alla volta)
  spawnTeschio();

  // Fluttuazione teschio
  for (let t of teschi) {
    t.y = t.baseY + Math.sin((Date.now() + t.floatOffset) / 300) * 5;
  }

  // Timer spawn nemici
  enemySpawnTimer++;
  strongEnemySpawnTimer++;
  aquilaSpawnTimer++;

  if (enemySpawnTimer > 180) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }
  if (strongEnemySpawnTimer > 600) {
    spawnStrongerEnemy();
    strongEnemySpawnTimer = 0;
  }
  if (aquilaSpawnTimer > 500 || aquile.length === 0) {
    spawnAquila();
    aquilaSpawnTimer = 0;
  }

  // Pulizia entità fuori schermo
  enemies = enemies.filter(e => e.x + e.width - scrollX > -200);
  strongerEnemies = strongerEnemies.filter(e => e.x + e.width - scrollX > -200);
  aquile = aquile.filter(a => a.x + a.width - scrollX > -200);
  rocce = rocce.filter(r => r.x + r.width - scrollX > -800);
  teschi = teschi.filter(t => t.x + t.width - scrollX > -200);
  cacchine = cacchine.filter(c => c.y < canvas.height);
  enemyProjectiles = enemyProjectiles.filter(p => p.x + p.width - scrollX > 0);

  // Sangue verde temporaneo
  bloodSplashes = bloodSplashes.filter(b => Date.now() - b.timestamp < 300);

  // Gestione collisioni
  handleCollisions();

  // FINE LIVELLO se raggiungo il tempio
  const rockyWorldX = rockyX + scrollX;
  if (!levelCompleted &&
      rockyWorldX + rockyWidth > tempio.x &&
      rockyWorldX < tempio.x + tempio.width) {
    levelCompleted = true;
    showNextLevelBanner = true;
    nextLevelTimer = 120;
  }
}



 // === BLOCCO 8: COLLISIONI ===

 function handleCollisions() {
  function check(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  // Proiettili → Nemici normali
  enemies = enemies.filter(e => {
    const hitIndex = projectiles.findIndex(p => check(p, e));
    if (hitIndex !== -1) {
      bloodSplashes.push({ x: e.x, y: e.y, timestamp: Date.now() });
      projectiles.splice(hitIndex, 1); // Rimuovi la testa
      score += 10;
      hitSound.play();
      return false;
    }
    if (check({ x: rockyX + scrollX, y: rockyY, width: rockyWidth, height: rockyHeight }, e)) {
      energy -= 5;
      if (energy <= 0) endGame();
      return false;
    }
    return true;
  });

  // Proiettili → Nemici forti
  strongerEnemies = strongerEnemies.filter(e => {
    for (let j = projectiles.length - 1; j >= 0; j--) {
      if (check(projectiles[j], e)) {
        e.health--;
        projectiles.splice(j, 1); // Rimuovi la testa
        hitSound.play();
        if (e.health <= 0) {
          bloodSplashes.push({ x: e.x, y: e.y, timestamp: Date.now() });
          score += 30;
          return false;
        }
      }
    }
    if (check({ x: rockyX + scrollX, y: rockyY, width: rockyWidth, height: rockyHeight }, e)) {
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
      projectiles.splice(hitIndex, 1); // Rimuovi la testa
      hitSound.play();
      return false;
    }
    return true;
  });

  // Fuoco nemico → Rocky
  enemyProjectiles = enemyProjectiles.filter(p => {
    p.x += p.speedX;
    if (check({ x: rockyX + scrollX, y: rockyY, width: rockyWidth, height: rockyHeight }, p)) {
      energy -= 10;
      if (energy <= 0) endGame();
      return false;
    }
    return p.x + p.width - scrollX > 0;
  });

  // Cacchina → Rocky
  cacchine = cacchine.filter(c => {
    if (check({ x: rockyX + scrollX, y: rockyY, width: rockyWidth, height: rockyHeight }, c)) {
      energy -= 8;
      if (energy <= 0) endGame();
      return false;
    }
    return c.y < canvas.height;
  });

  // Rocky → Teschio
  teschi = teschi.filter(t => {
    if (check({ x: rockyX + scrollX, y: rockyY, width: rockyWidth, height: rockyHeight }, t)) {
      enemies = [];
      strongerEnemies = [];
      aquile = [];
      bloodSplashes.push({ x: rockyX + scrollX, y: rockyY, timestamp: Date.now() });
      shakeTimer = 20;
      return false;
    }
    return true;
  });
}

function endGame() {
  gameOver = true;
  showGameOver = true;
  backgroundMusic.pause();
  gameOverSound.play();
}













// === BLOCCO 9: DISEGNO ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showStartScreen) {
    ctx.drawImage(startImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(startBanner, (canvas.width - 400) / 2, (canvas.height - 100) / 2 + 150, 400, 120);
    return;
  }

  // Banner inizio livello
  if (showLevelBanner) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL " + level, canvas.width / 2, canvas.height / 2 + 15);
    return;
  }

  // Banner fine livello
  if (showNextLevelBanner) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL COMPLETE!", canvas.width / 2, canvas.height / 2 + 15);
    return;
  }

  // Effetto shake (se attivo)
  if (shakeTimer > 0) {
    ctx.save();
    const dx = Math.random() * 10 - 5;
    const dy = Math.random() * 10 - 5;
    ctx.translate(dx, dy);
    shakeTimer--;
  }

  // Sfondo cielo
  ctx.drawImage(cielo, 0, 0, canvas.width, canvas.height);

  // Terra
  for (let x = -scrollX % terra.width - terra.width; x < canvas.width + terra.width; x += terra.width) {
    ctx.drawImage(terra, x, groundY);
  }

  // Rocce
  for (const r of rocce) {
    ctx.drawImage(rocciaImg, r.x - scrollX, r.y, r.width, r.height);
  }

  // Nemici normali
  for (const e of enemies) {
    ctx.drawImage(e.image, e.x - scrollX, e.y, e.width, e.height);
  }

  // Nemici forti animati (mostro_4)
  for (const e of strongerEnemies) {
    const mFrameW = 96, mFrameH = 96, mCols = 3;
    const msx = (e.currentFrame % mCols) * mFrameW;
    const msy = Math.floor(e.currentFrame / mCols) * mFrameH;
    ctx.drawImage(e.image, msx, msy, mFrameW, mFrameH, e.x - scrollX, e.y, e.width, e.height);
  }

  // Aquile
  for (const a of aquile) ctx.drawImage(aquilaImg, a.x - scrollX, a.y, a.width, a.height);

  // Cacchine
  for (const c of cacchine) ctx.drawImage(cacchinaImg, c.x - scrollX, c.y, c.width, c.height);

  // Proiettili nemici
  for (const p of enemyProjectiles) ctx.drawImage(fuocoImg, p.x - scrollX, p.y, p.width, p.height);

  // Proiettili Rocky
  for (const p of projectiles) {
    ctx.drawImage(statua, p.x - scrollX, p.y, p.width, p.height);
  }

  // Teschi bonus
  for (const t of teschi) {
    ctx.drawImage(teschioImg, t.x - scrollX, t.y, t.width, t.height);
  }

  // === ANIMAZIONE ROCKY (2x3) ===
  if (keys["ArrowRight"] || joypadKeys["ArrowRight"] || keys["ArrowLeft"] || joypadKeys["ArrowLeft"]) {
    frameTimer++;
    if (frameTimer >= frameInterval) {
      frameTimer = 0;
      currentFrame = (currentFrame + 1) % 6;
    }
  } else {
    currentFrame = 0;
  }

  const frameWidth = 96;
  const frameHeight = 96;
  const columns = 3;
  const sx = (currentFrame % columns) * frameWidth;
  const sy = Math.floor(currentFrame / columns) * frameHeight;

  ctx.drawImage(
    rockyWalk,
    sx, sy, frameWidth, frameHeight,
    rockyX, rockyY, rockyWidth, rockyHeight
  );

  // Oggetti in primo piano
  for (let x = -scrollX % 2400 - 2400; x < canvas.width + scrollX; x += 2400) {
    ctx.drawImage(albero, x + 300, groundY - 440, 600, 600);
    ctx.drawImage(rovine, x + 1600, groundY - 440, 600, 600);
  }

  // Sangue verde
  for (const b of bloodSplashes) {
    ctx.drawImage(sangueVerde, b.x - scrollX, b.y, 100, 100);
  }

  // === TEMPIO DI FINE LIVELLO (sopra rovine e alberi) ===
  ctx.drawImage(
    tempioImg,
    tempio.x - scrollX,
    tempio.y,
    tempio.width,
    tempio.height
  );

// HUD centrato
ctx.font = "24px Arial";
ctx.textAlign = "center";
ctx.fillStyle = "white";
ctx.fillText("PUNTEGGIO: " + score, canvas.width / 2, 40);

// Barra energia sotto il punteggio
const barWidth = 200;
const barX = (canvas.width - barWidth) / 2;
ctx.fillStyle = "gray";
ctx.fillRect(barX, 60, barWidth, 20);
ctx.fillStyle = energy > 50 ? "lime" : energy > 20 ? "orange" : "red";
ctx.fillRect(barX, 60, (energy / 100) * barWidth, 20);
ctx.strokeStyle = "black";
ctx.strokeRect(barX, 60, barWidth, 20);

  // Game Over
  if (showGameOver) {
    ctx.drawImage(gameOverImg, (canvas.width - 500) / 2, (canvas.height - 300) / 2, 500, 300);
  }

  // Chiudi contesto shake (se attivo)
  if (shakeTimer === 0) ctx.restore();
}









// === BLOCCO 10: GAME LOOP & RESET ===
// Riavvia il gioco e avvia il ciclo principale

function resetGame() {
  score = 0;
  scrollX = 0;
  rockyY = groundY - rockyHeight + 10;
  velocityY = 0;
  jumpCount = 0;

  projectiles = [];
  enemyProjectiles = [];
  enemies = [];
  strongerEnemies = [];
  aquile = [];
  cacchine = [];
  rocce = [];
  teschi = [];
  bloodSplashes = [];

  nextRockSpawnX = 1000;
  energy = 100;
  shakeTimer = 0;

  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
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
  introMusic.play();
  scrollLimit = tempio.x - canvas.width + 600; // scroll si ferma quando il tempio entra da destra
  gameLoop();
};











