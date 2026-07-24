let jars = [];
let activeJarIndex = 0;
let isFilling = false;
let currentMaterial = null;
let maxFill = 200;
let isDraggingPalette = false;
let dragOffsetX = 0, dragOffsetY = 0;
let modal = document.querySelector('.modal');

let materials = {
  glitter: {
    palette: [[255,20,147],[180,3,91],[253,246,249],[130,3,78]],
    size: 4, speed: 3.5, name: "Glitter"
  },
  sand: {
    palette: [[244,164,96],[210,180,140],[205,133,63]],
    size: 4, speed: 4, name: "Sand"
  },
  pearl: {
    palette: [[255,255,255],[240,248,255],[230,230,250]],
    size: 8, speed: 2, name: "Pearl"
  },
  cute: {
    palette: [[255,105,180],[255,182,193],[186,85,211],[255,215,0]],
    size: 5, speed: 3, name: "cute"
  },
  ocean: {
    palette: [[2,107,255],[24,2,102],[78,111,246]],
    size: 9, speed: 3, name: "ocean"
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
    palette.position(x - dragOffsetX, y - dragOffsetY);
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
    jars.pop();
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
    let jarHtml = `
      <div class="jar-wrapper" onclick="setActiveJar(${j})">
        <div class="jar-graphic" id="jar${j}">
          <img src="images/jar.png" style="opacity:0.3;">
          <div class="jar-filler"></div>
        </div>
        <input type="text" placeholder="Jar Title" class="jar-title">
      </div>
    `;
    container.html(container.html() + jarHtml);
  }
}

function setup() {
  let myCanvas = createCanvas(windowWidth, windowHeight);
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
  
  document.getElementById('clear-btn')?.addEventListener('click', () => {
    if (jars.length > 0 && jars[activeJarIndex]) {
      jars[activeJarIndex].sparkles = [];
      jars[activeJarIndex].fillLevel = 0;
    }
  });

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
  if (jars.length === 0) return;
  clear();

  let targetIndex = getPipeTargetIndex();

  for (let j = 0; j < jars.length; j++) {
    let jarData = jars[j];
    let jarElement = select("#jar" + j);
    if (!jarElement || !jarElement.elt) continue;

    let rect = jarElement.elt.getBoundingClientRect();
    let jarTop = rect.top;
    let jarBottom = rect.bottom;
    let jarLeft = rect.left;
    let jarRight = rect.right;
    let jarWidth = jarRight - jarLeft;
    let jarHeight = jarBottom - jarTop;

    if (jarHeight <= 0 || jarWidth <= 0) continue;

    // إضافة الجزيئات عند السكب
    if (isFilling && targetIndex === j && currentMaterial) {
      // سرعات متفاوتة وبطيئة/متوسطة فقط
      let variedSpeed = random(currentMaterial.speed * 0.6, currentMaterial.speed * 1.2);
      
      let particle = {
        relX: random(0.18, 0.82), // حصر النزول في الجزء الأوسط للجرّة
        relY: 0.05,
        speedY: variedSpeed / jarHeight, // تحويل السرعة لتناسب الارتفاع المتري
        speedX: random(-0.15, 0.15),
        size: currentMaterial.size,
        color: currentMaterial.palette ? random(currentMaterial.palette) : null,
        emoji: currentMaterial.emoji,
        isStatic: false,
        staticX: 0,
        staticY: 0
      };
      jarData.sparkles.push(particle);
    }

    // مستوى الامتلاء الحالي من الأسفل
    let maxFillPx = min(jarData.fillLevel, jarHeight * 0.85);
    let fillTopY = jarBottom - maxFillPx;

    for (let p = jarData.sparkles.length - 1; p >= 0; p--) {
      let s = jarData.sparkles[p];

      if (!s.isStatic) {
        // حركة السقوط
        s.relY += s.speedY;
        s.relX += s.speedX * 0.005;
        s.relX = constrain(s.relX, 0.1, 0.9);

        let currentY = jarTop + (s.relY * jarHeight);

        // عند الوصول لقاع الجرة أو لمستوى استقرار الجزيئات السابق
        if (currentY >= fillTopY - (s.size / 2)) {
          s.isStatic = true;
          // حفظ الموقع النسبي الثابت داخل الجرة مباشرة لضمان تحرك الجرة مع الشاشة دون انفصال
          s.staticX = s.relX;
          s.staticY = (jarBottom - currentY) / jarHeight;

          if (jarData.fillLevel < maxFill) {
            jarData.fillLevel = min(jarData.fillLevel + 0.8, maxFill);
          }
        }
      }

      // حساب مكان الرسم الحقيقي
      let drawX, drawY;

      if (s.isStatic) {
        drawX = jarLeft + (s.staticX * jarWidth);
        drawY = jarBottom - (s.staticY * jarHeight);
      } else {
        drawX = jarLeft + (s.relX * jarWidth);
        drawY = jarTop + (s.relY * jarHeight);
      }

      // حصر دقيق لمنع خروج أي جزء خارج حدود الجرة
      drawX = constrain(drawX, jarLeft + s.size, jarRight - s.size);
      drawY = constrain(drawY, jarTop + s.size, jarBottom - s.size / 2);

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