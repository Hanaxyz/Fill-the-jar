//Variables :
let jars = [];
let activeJarIndex = 0;
let isFilling = false;
let currentMaterial = null;
let maxFill = 200;
let paletteX = 100, paletteY = 100;
let isDraggingPalette = false;
let dragOffsetX = 0, dragOffsetY = 0;
let modal=document.querySelector('.modal');

// defining the materials :
let materials = {
  glitter: {
    palette: [[255,20,147],[180,3,91],[253,246,249],[130,3,78]],
    size: 4, speed: 4, name: "Glitter"
  },
  sand: {
    palette: [[244,164,96],[210,180,140],[205,133,63]],
    size: 4, speed: 7, name: "Sand"
  },
  pearl: {
    palette: [[255,255,255],[240,248,255],[230,230,250]],
    size: 8, speed: 2, name: "Pearl"
  },
  cute: {
    palette: [[255,105,180],[255,182,193],[186,85,211],[255,215,0]],
    size: 5, speed: 4, name: "cute"
  },
  ocean: {
    palette: [[2,107,255],[24,2,102],[78,111,246]],
    size: 9, speed: 4, name: "ocean"
  },
  hearts: { emoji: "❤️", size: 9, speed: 4, name: "hearts" },
  stars:  { emoji: "⭐", size: 9, speed: 4, name: "stars" },
  diamond:{ emoji: "💎", size: 11, speed: 4, name: "diamond" },
  leaf:   { emoji: "🍀", size: 15, speed: 2, name: "leaf" }
};



// touch and mouse logic 
function startInteraction(e) {
  let palette = select('.Palette');
  if (!palette) return;
  

  let x = e.touches ? e.touches[0].clientX : mouseX;
  let y = e.touches ? e.touches[0].clientY : mouseY;
  
  let rect = palette.elt.getBoundingClientRect();

  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
    isDraggingPalette = true;
    dragOffsetX = x - rect.left;
    dragOffsetY = y - rect.top;
  }
}

function moveInteraction(e) {
  if (isDraggingPalette) {
    let x = e.touches ? e.touches[0].clientX : mouseX;
    let y = e.touches ? e.touches[0].clientY : mouseY;
    
    let palette = select('.Palette');
    palette.position(x - dragOffsetX, y - dragOffsetY);
  }
}


function mousePressed(e) { startInteraction(e); }
function touchStarted(e) { startInteraction(e); return false; }
function mouseDragged(e) { moveInteraction(e); }
function touchMoved(e) { moveInteraction(e); return false; }

//add a jar 

function addJar() {
  jars.push({ id: jars.length, sparkles: [], fillLevel: 0 });
  renderJars();
}

// remove a jar :
function removeJar() {
  if (jars.length > 0) {
    jars.pop();
    activeJarIndex = Math.max(0, jars.length - 1);
    
    renderJars();
  }
}

// selecting a jar : (the active one that's being filled )

function setActiveJar(index) {
  activeJarIndex = index;
}

//creating the filling using html element :

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

// set up 
function setup() {
  let myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.position(0, 0);
  myCanvas.style('z-index', '0');
  textFont('Arial');

  select('#btn-add').mousePressed(addJar);
  select('#btn-minus').mousePressed(removeJar);

  let btnClear = createButton('Clear');

btnClear.style('margin-top', '65px');
  btnClear.position(140, 20);
  btnClear.mousePressed(() => {
    if (jars.length > 0) {
      jars[activeJarIndex].sparkles = [];
      jars[activeJarIndex].fillLevel = 0;
    }
  });

  select('#glitter').mousePressed(() => selectMaterial(materials.glitter));
  select('#sand').mousePressed(() => selectMaterial(materials.sand));
  select('#pearl').mousePressed(() => selectMaterial(materials.pearl));
  select('#cute').mousePressed(() => selectMaterial(materials.cute));
  select('#ocean').mousePressed(() => selectMaterial(materials.ocean));
  select('#hearts').mousePressed(() => selectMaterial(materials.hearts));
  select('#stars').mousePressed(() => selectMaterial(materials.stars));
  select('#diamond').mousePressed(() => selectMaterial(materials.diamond));
  select('#leaf').mousePressed(() => selectMaterial(materials.leaf));
}


// selecting the materials 
function selectMaterial(material) {
  if (currentMaterial === material) {
    // stop the filling when the user press the same material again 
    isFilling = !isFilling;
  } else {
    currentMaterial = material;
    isFilling = true;
  }
}

// drawing the materials
function draw() {
  if (jars.length < 0) return;
  clear();

  let targetIndex = getPipeTargetIndex();

  for (let j = 0; j < jars.length; j++) {
    let jarData = jars[j];
    let jarElement = select("#jar" + j);
   

    let rect = jarElement.elt.getBoundingClientRect();
    let jarTop = rect.top;
    let jarBottom = rect.bottom;
    let jarLeft = rect.left;
    let jarRight = rect.right;
    let jarWidth = jarRight - jarLeft;
    let jarHeight = jarBottom - jarTop;

    // adding new particles 
    if (isFilling && targetIndex === j && currentMaterial) {
      let particle = {
        relX: random(0.15, 0.85),
        relY: 0.0,
        speedY: random(currentMaterial.speed, currentMaterial.speed + 2),
        speedX: random(-0.3, 0.3),
        size: currentMaterial.size,
        color: currentMaterial.palette ? random(currentMaterial.palette) : null,
        emoji: currentMaterial.emoji,
        isStatic: false,
        offsetFromBottom: 0
      };
      jarData.sparkles.push(particle);
    }

    // update the state :
    let fillHeight = jarData.fillLevel;
    let stopLine = jarBottom - fillHeight;

    for (let p = 0; p < jarData.sparkles.length; p++) {
      let s = jarData.sparkles[p];

      if (!s.isStatic) {
        s.relY += s.speedY /jarHeight ;
        s.relX += s.speedX/jarWidth;
        s.relX = constrain(s.relX, 0.05, 0.95);

        let currentY_abs = jarTop + s.relY * jarHeight;
        if (currentY_abs > stopLine - s.size/2) {
          s.isStatic = true;
          s.offsetFromBottom = (jarBottom - currentY_abs) / jarHeight;
          if (jarData.fillLevel < maxFill) {
            jarData.fillLevel += 0.8;
          }
        }
      }

      let drawX = jarLeft + s.relX * jarWidth;
      let drawY = s.isStatic ? (jarBottom - s.offsetFromBottom * jarHeight) : (jarTop + s.relY * jarHeight);

      noStroke();
      if (s.emoji) {
        push();
        textAlign(CENTER, CENTER);
        textSize(s.size);
        let emojiX = constrain(drawX, jarLeft + 5, jarRight - 5);
        let emojiY = constrain(drawY, jarTop + 5, jarBottom - 5);
        text(s.emoji, emojiX, emojiY);
        pop();
      } else if (s.color) {
        fill(s.color[0], s.color[1], s.color[2]);
        let circleX=constrain(drawX,jarLeft+5 , jarRight-5);
        let circleY=constrain(drawY,jarTop+5, jarBottom-5);
        circle(circleX,circleY,s.size);
      }
    }
  }
}
// the logic to target a jar with pipe :
function getPipeTargetIndex() {
  let pipe = document.getElementById('pipe');
  if (!pipe) return null;

  let pipeRect = pipe.getBoundingClientRect();
  let pipeX = pipeRect.left + pipeRect.width / 2;
  let pipeY = pipeRect.top + pipeRect.height / 2;

  let minDistance = Infinity;
  let closestIndex = null;
  let padding = 90; 

  for (let j = 0; j < jars.length; j++) {
    let jar = document.getElementById('jar' + j);
    if (!jar) continue;
    let jarRect = jar.getBoundingClientRect();

    // inspect 
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


function openModal(text,link){
  document.getElementById('text').innerHTML=text;
  modal.style.display='flex';

}

document.querySelector('.about').addEventListener('click', () => openModal(`
  Hi! I'm Hana :). I'm learning to code and design. 
  This game is a classic that everyone plays on paper, so I thought, "Why not bring it to life as a website?" 
  It was my first time handling many concepts and tools like p5.js, and with some AI assistance, I managed to build this. 
  I'm not a fan of "vibe coding," so I worked hard to write,and understand the logic behind it .
  I hope you enjoy this digital version. If you have any feedback or find any bugs, feel free to DM me on 
  <a href="https://x.com/HanaH37938" target="_blank" style="color: blue;">My Twitter</a>.Have a nice Day ^o^
`));


document.querySelector('.how').addEventListener('click', () => openModal(`
    <h3>How to Play</h3>
    <ul style="text-align: left; margin-top: 10px; line-height: 1.6;">
      <li><b>+</b> : Add a jar.</li>
      <li><b>-</b> : Remove a jar.</li>
      <li><b>Particles</b> : Click the colored circle to start/stop filling.</li>
      <li><b>Clear a Jar content </b> : Click on a jar, then press clear.</li>
      <li><b>Clear All</b> : Just refresh the page :D</li>
    </ul>
  `));
document.getElementById('close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
