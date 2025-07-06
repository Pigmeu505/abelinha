// Animação da abelha voando da esquerda para a direita em onda e florescendo flores
const bee = document.getElementById('bee');
const flowersContainer = document.querySelector('.flowers');
let beeY = 0;
let beeAmplitude = 50;
let beeFrequency = 0.012;
let beeFrame = 0;
let beeSpeed = 2; // px por frame
let beeX = 0; // posição "virtual" da abelha
let flowers = [];
const FLOWER_SPACING = 220; // px
const FLOWER_VARIATION = 80; // px de variação na altura
const NUM_FLOWERS_ON_SCREEN = 7;

function createFlower(x) {
    // Paletas de cores para pétalas e centro
    // ... (restante igual)

    // Paletas de cores para pétalas e centro
    const petalColors = [
      {bg: '#ffb6c1', grad: 'linear-gradient(to top, #f48fb1, #ad1457)'}, // rosa
      {bg: '#ffe066', grad: 'linear-gradient(to top, #ffe066, #fbc02d)'}, // amarelo
      {bg: '#81d4fa', grad: 'linear-gradient(to top, #81d4fa, #0288d1)'}, // azul
      {bg: '#aed581', grad: 'linear-gradient(to top, #aed581, #689f38)'}, // verde
      {bg: '#f48fb1', grad: 'linear-gradient(to top, #f48fb1, #ad1457)'}, // pink
    ];
    const centerColors = [
      'radial-gradient(circle at 60% 40%, #fffbe7 70%, #ffe066 100%)',
      'radial-gradient(circle at 60% 40%, #fffbe7 70%, #81d4fa 100%)',
      'radial-gradient(circle at 60% 40%, #fffbe7 70%, #f48fb1 100%)',
      'radial-gradient(circle at 60% 40%, #fffbe7 70%, #aed581 100%)',
    ];
    const petal = petalColors[Math.floor(Math.random()*petalColors.length)];
    const centerBg = centerColors[Math.floor(Math.random()*centerColors.length)];

    // Cria a estrutura da flower-modern
    const div = document.createElement('div');
    div.className = 'flower-modern';
    div.style.position = 'absolute';
    div.style.left = x + 'px';
    div.style.bottom = (10 + Math.random()*FLOWER_VARIATION) + 'px';
    div.style.zIndex = 10;

    // Linha/caule
    const line = document.createElement('div');
    line.className = 'flower-modern__line';
    // Leafs (pétalas)
    const leafs = document.createElement('div');
    leafs.className = 'flower-modern__leafs';
    for (let i = 1; i <= 4; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'flower-modern__leaf flower-modern__leaf--' + i;
      leaf.style.backgroundColor = petal.bg;
      leaf.style.backgroundImage = petal.grad;
      leafs.appendChild(leaf);
    }
    // Centro
    const center = document.createElement('div');
    center.className = 'flower-modern__center';
    center.style.background = centerBg;
    leafs.appendChild(center);
    // Círculo branco
    const whiteCircle = document.createElement('div');
    whiteCircle.className = 'flower-modern__white-circle';
    leafs.appendChild(whiteCircle);
    div.appendChild(leafs);

    // Caúle embaixo
    div.appendChild(line);

    flowersContainer.appendChild(div);
    const flowerObj = { x, el: div, active: true };
    saveOriginalColors(flowerObj);
    return flowerObj;
}


function resetFlowers() {
    flowersContainer.innerHTML = '';
    flowers = [];
    let startX = -FLOWER_SPACING;
    for(let i=0;i<NUM_FLOWERS_ON_SCREEN+2;i++) {
        flowers.push(createFlower(startX + i*FLOWER_SPACING));
    }
}

function getSkyRect() {
    return document.querySelector('.sky').getBoundingClientRect();
}

function updateBeePosition() {
    const beeWidth = bee.offsetWidth;
    const beeHeight = bee.offsetHeight;
    // A abelha fica sempre centralizada na tela
    beeX += beeSpeed;
    beeFrame++;
    const skyHeight = document.querySelector('.sky').offsetHeight;
    beeY = skyHeight / 2 + beeAmplitude * Math.sin(beeFrame * beeFrequency) - beeHeight / 2;
    bee.style.left = `calc(50vw - ${beeWidth/2}px)`;
    bee.style.top = `${beeY}px`;
    updateFlowers();
    checkBeeFlowerCollision();
}



function checkBeeFlowerCollision() {
    const beeRect = bee.getBoundingClientRect();
    flowers.forEach(flower => {
        if (!flower.active) return;
        const flowerRect = flower.el.getBoundingClientRect();
        if (
            beeRect.right > flowerRect.left + 5 &&
            beeRect.left < flowerRect.right - 5 &&
            beeRect.bottom > flowerRect.top + 10 &&
            beeRect.top < flowerRect.bottom - 10
        ) {
            if (!flower.el.classList.contains('florescendo')) {
                flower.el.classList.add('florescendo');
                setTimeout(() => flower.el.classList.remove('florescendo'), 800);
                flower.active = false;
            }
        }
    });
}


function updateFlowers() {
    // Move as flores para a esquerda conforme a abelha avança
    flowers.forEach(flower => {
        flower.x -= beeSpeed;
        flower.el.style.left = flower.x + 'px';
    });
    // Remove flores que saíram da tela e adiciona novas na frente
    if (flowers.length && flowers[0].x < -120) {
        const lastX = flowers[flowers.length-1].x;
        flowers[0].el.remove();
        flowers.shift();
        flowers.push(createFlower(lastX + FLOWER_SPACING));
    }
}

function animateBee() {
    updateBeePosition();
    requestAnimationFrame(animateBee);
}


window.addEventListener('resize', () => {
    resetFlowers();
    beeX = 0;
    beeFrame = 0;
});
window.addEventListener('DOMContentLoaded', () => {
    resetFlowers();
    beeX = 0;
    beeFrame = 0;
    animateBee();
    animateClouds();
});

// --- EXPERIÊNCIA INTERATIVA: FLORES E CÉU MÁGICOS ---

let holdActive = false;
let colorChangeInterval = null;

// Salvar as cores originais de cada flor ao criar
function saveOriginalColors(flower) {
  const leafs = flower.el.querySelectorAll('.flower-modern__leaf');
  flower._originalLeafColors = [];
  leafs.forEach(leaf => {
    flower._originalLeafColors.push({
      backgroundColor: leaf.style.backgroundColor,
      backgroundImage: leaf.style.backgroundImage
    });
  });
  const center = flower.el.querySelector('.flower-modern__center');
  if (center) {
    flower._originalCenterBg = center.style.background;
  }
}

function restoreOriginalColors() {
  flowers.forEach(flower => {
    if (!flower.el || !flower._originalLeafColors) return;
    const leafs = flower.el.querySelectorAll('.flower-modern__leaf');
    flower._originalLeafColors.forEach((color, i) => {
      if (leafs[i]) {
        leafs[i].style.backgroundColor = color.backgroundColor;
        leafs[i].style.backgroundImage = color.backgroundImage;
      }
    });
    const center = flower.el.querySelector('.flower-modern__center');
    if (center && flower._originalCenterBg) {
      center.style.background = flower._originalCenterBg;
    }
  });
}

function randomFlowerColors() {
  flowers.forEach(flower => {
    if (!flower.el) return;
    // Petalas
    const leafs = flower.el.querySelectorAll('.flower-modern__leaf');
    leafs.forEach(leaf => {
      const colorSets = [
        {bg: '#ffb6c1', grad: 'linear-gradient(to top, #f48fb1, #ad1457)'},
        {bg: '#ffe066', grad: 'linear-gradient(to top, #ffe066, #fbc02d)'},
        {bg: '#81d4fa', grad: 'linear-gradient(to top, #81d4fa, #0288d1)'},
        {bg: '#aed581', grad: 'linear-gradient(to top, #aed581, #689f38)'},
        {bg: '#f48fb1', grad: 'linear-gradient(to top, #f48fb1, #ad1457)'},
      ];
      const pick = colorSets[Math.floor(Math.random()*colorSets.length)];
      leaf.style.backgroundColor = pick.bg;
      leaf.style.backgroundImage = pick.grad;
    });
    // Centro
    const center = flower.el.querySelector('.flower-modern__center');
    if (center) {
      const centers = [
        'radial-gradient(circle at 60% 40%, #fffbe7 70%, #ffe066 100%)',
        'radial-gradient(circle at 60% 40%, #fffbe7 70%, #81d4fa 100%)',
        'radial-gradient(circle at 60% 40%, #fffbe7 70%, #f48fb1 100%)',
        'radial-gradient(circle at 60% 40%, #fffbe7 70%, #aed581 100%)',
      ];
      center.style.background = centers[Math.floor(Math.random()*centers.length)];
    }
  });
}

function startMagicHold() {
  if (holdActive) return;
  holdActive = true;
  colorChangeInterval = setInterval(randomFlowerColors, 180);
  // Efeito de florescer
  flowers.forEach(flower => {
    if (flower.el) flower.el.classList.add('florescendo');
  });
}

function stopMagicHold() {
  holdActive = false;
  clearInterval(colorChangeInterval);
  restoreOriginalColors();
  // Remove efeito de florescer
  flowers.forEach(flower => {
    if (flower.el) flower.el.classList.remove('florescendo');
  });
}

// Eventos para mouse e touch
function setupHoldEvents() {
  let holdTimeout = null;
  // Mouse
  document.body.addEventListener('mousedown', e => {
    holdTimeout = setTimeout(startMagicHold, 180); // só ativa se segurar
  });
  document.addEventListener('mouseup', () => {
    clearTimeout(holdTimeout);
    stopMagicHold();
  });
  // Touch
  document.body.addEventListener('touchstart', e => {
    holdTimeout = setTimeout(startMagicHold, 180);
  });
  document.addEventListener('touchend', () => {
    clearTimeout(holdTimeout);
    stopMagicHold();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupHoldEvents();

  // --- Nuvens clicáveis ---
  document.querySelectorAll('.cloud').forEach(cloud => {
    cloud.addEventListener('click', () => {
      if (cloud.classList.contains('invisible')) return;
      cloud.classList.add('invisible');
      setTimeout(() => {
        cloud.classList.remove('invisible');
      }, 3000);
    });
    // Touch para mobile
    cloud.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (cloud.classList.contains('invisible')) return;
      cloud.classList.add('invisible');
      setTimeout(() => {
        cloud.classList.remove('invisible');
      }, 3000);
    });
  });

  // --- Toque especial na abelha ---
  const bee = document.getElementById('bee');
  let beeSpinning = false;
  function spinBee() {
    if (beeSpinning) return;
    beeSpinning = true;
    bee.classList.add('spinning');
    setTimeout(() => {
      bee.classList.remove('spinning');
      beeSpinning = false;
    }, 800);
  }
  bee.addEventListener('click', spinBee);
  bee.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    spinBee();
  });
});

// --- Animação de nuvens (parallax mais natural) ---
const cloudData = [
  { speed: 18 + Math.random()*8, floatAmp: 8 + Math.random()*8, floatSpeed: 0.28 + Math.random()*0.11, yBase: 10 },
  { speed: 10 + Math.random()*7, floatAmp: 12 + Math.random()*8, floatSpeed: 0.22 + Math.random()*0.13, yBase: 5 },
  { speed: 14 + Math.random()*7, floatAmp: 7 + Math.random()*7, floatSpeed: 0.18 + Math.random()*0.15, yBase: 7 },
  { speed: 7 + Math.random()*5, floatAmp: 10 + Math.random()*6, floatSpeed: 0.14 + Math.random()*0.13, yBase: 12 },
  { speed: 13 + Math.random()*8, floatAmp: 9 + Math.random()*8, floatSpeed: 0.21 + Math.random()*0.13, yBase: 3 }
];
let lastCloudTime = null;
function animateClouds(now) {
    const clouds = document.querySelectorAll('.cloud');
    if (!lastCloudTime) lastCloudTime = now;
    const delta = (now - lastCloudTime) / 1000; // segundos
    lastCloudTime = now;
    clouds.forEach((cloud, i) => {
        let left = parseFloat(cloud.style.left);
        if (isNaN(left)) left = cloud.offsetLeft;
        left -= cloudData[i].speed * delta;
        // Flutuação vertical suave
        const float = Math.sin(now * cloudData[i].floatSpeed / 700 + i) * cloudData[i].floatAmp;
        let baseY = cloudData[i].yBase;
        if (i === 0) baseY = 10; else baseY = 5; // ajuste para cloud1 e cloud2
        cloud.style.top = `calc(${baseY}vh + ${float}px)`;
        // Se saiu da tela, volta para a direita e sorteia nova altura
        if (left < -cloud.offsetWidth) {
            // Garante espaçamento mínimo de 180px da nuvem anterior
            let maxLeft = window.innerWidth + 40 + Math.random() * 60;
            if (clouds.length > 1) {
                // Procura a nuvem imediatamente à frente
                let idxFront = (i === 0) ? clouds.length - 1 : i - 1;
                let frontLeft = parseFloat(clouds[idxFront].style.left);
                if (isNaN(frontLeft)) frontLeft = clouds[idxFront].offsetLeft;
                if (frontLeft - maxLeft < 180) {
                    maxLeft = frontLeft + 180 + Math.random()*50;
                }
            }
            left = maxLeft;
            cloudData[i].yBase = 3 + Math.random()*10;
        }
        cloud.style.left = left + 'px';
    });
    requestAnimationFrame(animateClouds);
}

