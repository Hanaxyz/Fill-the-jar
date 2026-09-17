let jars = [];
let activeJarIndex = 0;
let isFilling = false;
let currentMaterial = null;
let maxFill = 350;
let isDraggingPalette = false;
let dragOffsetX = 0, dragOffsetY = 0;
let modal = document.querySelector('.modal');

let materials = {
  glitter: {
    palette: [[255,20,147],[180,3,91],[253,246,249],[130,3,78]],
    size: 4, speed: 1.5, name: "Glitter"
  },
  sand: {
    palette: [[244,164,96],[210,180,140],[205,133,63]],
    size: 4, speed: 2, name: "Sand"
  },
  pearl: {
    palette: [[255,255,255],[240,248,255],[230,230,250]],
    size: 8, speed: 0.5, name: "Pearl"
  },
  cute: {
    palette: [[255,105,180],[255,182,193],[186,85,211],[255,215,0]],
    size: 5, speed: 1, name: "cute"
  },
  ocean: {
    palette: [[2,107,255],[24,2,102],[78,111,246]],
    size: 9, speed: 1, name: "ocean"
  },
  hearts: { emoji: "❤️", size: 9, speed: 3, name: "hearts" },
  stars:  { emoji: "⭐", size: 9, speed: 3, name: "stars" },
  diamond: { emoji: "💎", size: 11, speed: 3, name: "diamond" },
  leaf:   { emoji: "🍀", size: 15, speed: 2.2, name: "leaf" }
};

function startInteraction(e) {
  let x, y;
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = mouseX;
    y = mouseY;
  }
  let target = document.elementFromPoint(x, y);
  let palette = select('.Palette');
  if (!palette) return;
  if (target && target.closest('.Palette')) {
    isDraggingPalette = true;
    let rect = palette.elt.getBoundingClientRect();
    dragOffsetX = x - rect.left;
    dragOffsetY = y - rect.top;
  } else {
    isDraggingPalette = false;
  }
}

function moveInteraction(e) {
  if (!isDraggingPalette) return;
  e.preventDefault();
  let x, y;
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = mouseX;
    y = mouseY;
  }
  let palette = select('.Palette');
  if (palette) {
    let rect = palette.elt.getBoundingClientRect();
    let minX = -rect.width + 60;
    let maxX = windowWidth - 60;
    let minY = 0;
    let maxY = windowHeight - 40;

    let newX = constrain(x - dragOffsetX, minX, maxX);
    let newY = constrain(y - dragOffsetY, minY, maxY);
    palette.position(newX, newY);
  }
}

function endInteraction() {
  isDraggingPalette = false;
}

function mousePressed(e) { startInteraction(e); }
function mouseDragged(e) { moveInteraction(e); }
function mouseReleased() { endInteraction(); }
function touchStarted(e) {
  startInteraction(e);
  if (isDraggingPalette) return false;
}
function touchMoved(e) {
  if (isDraggingPalette) {
    moveInteraction(e);
    return false;
  }
}
function touchEnded() { endInteraction(); }

function addJar() {
  jars.push({ id: jars.length, sparkles: [], fillLevel: 0 });
  renderJars();
}

function removeJar() {
  if (jars.length > 0) {
    let removedJar = jars.pop();
    removedJar.sparkles = [];
    activeJarIndex = Math.max(0, jars.length - 1);
    renderJars();
  }
}

function setActiveJar(index) {
  activeJarIndex = index;
}

function renderJars() {
  let container = select('#jars-container');
  container.html('');
  for (let j = 0; j < jars.length; j++) {
    jars[j].id = j;
    let jarHtml = `
      <div class="jar-wrapper" onclick="setActiveJar(${j})">
        <div class="jar-graphic" id="jar${j}">
          <img src="images/jar.png" style="opacity:0.3;">
          <div class="jar-filler"></div>
        </div>
        <input type="text" placeholder="Enter A Title" class="jar-title">
      </div>
    `;
    container.html(container.html() + jarHtml);
  }
}

function setup() {
  let myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.position(0, 0, 'fixed');
  myCanvas.style('z-index', '0');
  myCanvas.style('pointer-events', 'none');
  textFont('Arial');

  function bindButton(id, callback) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        callback();
      });
    }
  }

  bindButton("btn-add", addJar);
  bindButton("btn-minus", removeJar);
  
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (jars.length > 0 && jars[activeJarIndex]) {
        jars[activeJarIndex].sparkles = [];
        jars[activeJarIndex].fillLevel = 0;
      }
    });
  }

  bindButton("glitter", () => selectMaterial(materials.glitter));
  bindButton("sand", () => selectMaterial(materials.sand));
  bindButton("pearl", () => selectMaterial(materials.pearl));
  bindButton("cute", () => selectMaterial(materials.cute));
  bindButton("ocean", () => selectMaterial(materials.ocean));
  bindButton("hearts", () => selectMaterial(materials.hearts));
  bindButton("stars", () => selectMaterial(materials.stars));
  bindButton("diamond", () => selectMaterial(materials.diamond));
  bindButton("leaf", () => selectMaterial(materials.leaf));
}

function selectMaterial(material) {
  if (currentMaterial === material) {
    isFilling = !isFilling;
  } else {
    currentMaterial = material;
    isFilling = true;
  }
}

function draw() {
  clear();
  if (jars.length === 0) return;

  let targetIndex = getPipeTargetIndex();

  for (let j = 0; j < jars.length; j++) {
    let jarData = jars[j];
    let jarElement = select("#jar" + j);
    if (!jarElement || !jarElement.elt) continue;

    let rect = jarElement.elt.getBoundingClientRect();

    let jarLeft = rect.left + (rect.width * 0.15);
    let jarRight = rect.right - (rect.width * 0.15);
    let jarTop = rect.top + (rect.height * 0.2); 
    let jarBottom = rect.bottom - (rect.height * 0.1); 

    let jarHeight = jarBottom - jarTop;
    if (jarHeight <= 0) continue;

    let currentFillPx = min(jarData.fillLevel, jarHeight * 0.95);
    let fillSurfaceY = jarBottom - currentFillPx;

    if (isFilling && targetIndex === j && currentMaterial) {
      let variedSpeed = random(currentMaterial.speed * 0.6, currentMaterial.speed * 1.1);

      jarData.sparkles.push({
        x: random(jarLeft, jarRight),
        y: jarTop,
        speedY: max(1.5, variedSpeed),
        speedX: random(-0.2, 0.2),
        size: currentMaterial.size,
        color: currentMaterial.palette ? random(currentMaterial.palette) : null,
        emoji: currentMaterial.emoji,
        isStatic: false,
        offsetX: 0,
        offsetY: 0
      });
    }

    for (let p = jarData.sparkles.length - 1; p >= 0; p--) {
      let s = jarData.sparkles[p];

      if (!s.isStatic) {
        s.y += s.speedY;
        s.x += s.speedX;
        s.x = constrain(s.x, jarLeft, jarRight);

        if (s.y >= fillSurfaceY && s.y > jarTop + 10) {
          s.isStatic = true;
          s.y = fillSurfaceY;
          s.offsetX = s.x - jarLeft;
          s.offsetY = jarBottom - s.y;

          if (jarData.fillLevel < maxFill) {
            jarData.fillLevel = min(jarData.fillLevel + 0.8, maxFill);
          }
        }
      }

      let drawX = s.isStatic ? (jarLeft + s.offsetX) : s.x;
      let drawY = s.isStatic ? (jarBottom - s.offsetY) : s.y;

      drawX = constrain(drawX, jarLeft, jarRight);
      drawY = constrain(drawY, jarTop, jarBottom);

      noStroke();
      if (s.emoji) {
        push();
        textAlign(CENTER, CENTER);
        textSize(s.size);
        text(s.emoji, drawX, drawY);
        pop();
      } else if (s.color) {
        fill(s.color[0], s.color[1], s.color[2]);
        circle(drawX, drawY, s.size);
      }
    }
  }
}

function getPipeTargetIndex() {
  let pipe = document.getElementById('pipe');
  if (!pipe) return 0;
  let pipeRect = pipe.getBoundingClientRect();
  let pipeX = pipeRect.left + pipeRect.width / 2;
  let pipeY = pipeRect.top + pipeRect.height / 2;
  let minDistance = Infinity;
  let closestIndex = 0;
  let padding = 100;
  for (let j = 0; j < jars.length; j++) {
    let jar = document.getElementById('jar' + j);
    if (!jar) continue;
    let jarRect = jar.getBoundingClientRect();
    if (pipeX > (jarRect.left - padding) &&
        pipeX < (jarRect.right + padding) &&
        pipeY > (jarRect.top - padding) &&
        pipeY < (jarRect.bottom + padding)) {
      let jarCenterX = (jarRect.left + jarRect.right) / 2;
      let jarCenterY = (jarRect.top + jarRect.bottom) / 2;
      let distance = dist(pipeX, pipeY, jarCenterX, jarCenterY);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = j;
      }
    }
  }
  return closestIndex;
}

function openModal(text) {
  document.getElementById('text').innerHTML = text;
  modal.style.display = 'flex';
}

document.querySelector('.about')?.addEventListener('click', () => openModal(`
  Hi! I'm Hana :). I'm learning to code and design. 
  This game is a classic that everyone plays on paper, so I thought, "Why not bring it to life as a website?" 
  It was my first time handling many concepts and tools like p5.js, and with some AI assistance, I managed to build this. 
  I'm not a fan of "vibe coding," so I worked hard to write and understand the logic behind it.
  I hope you enjoy this digital version. If you have any feedback or find any bugs, feel free to DM me on 
  <a href="https://x.com/HanaH37938" target="_blank" style="color: blue;">My Twitter</a>. Have a nice Day ^o^
`));

document.querySelector('.how')?.addEventListener('click', () => openModal(`
  <h3>How to Play</h3>
  <ul style="text-align: left; margin-top: 10px; line-height: 1.6;">
    <li><b>+</b> : Add a jar.</li>
    <li><b>-</b> : Remove a jar.</li>
    <li><b>Palette</b>: Drag it anywhere on the screen.</li>
    <li><b>Particles</b> : Click the colored circle to start/stop filling.</li>
    <li><b>Clear a Jar content</b> : Click on a jar, then press clear.</li>
    <li><b>Clear All</b> : Just refresh the page :D</li>
  </ul>
`));

document.getElementById('close-btn')?.addEventListener('click', () => {
  modal.style.display = 'none';
});

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
