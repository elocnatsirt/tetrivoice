/* eslint-disable indent */
/* eslint-disable prefer-rest-params */
/* eslint-disable brace-style */
/* eslint-disable require-jsdoc */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
let recognition;

const browserLang = navigator.language;
let currentLang = "English (United States)";

let score = 0;
let paused = false;
let scene;
let camera;
let renderer;
const spawnCord = new THREE.Vector3(-2, 20, 1);
const gridSize = 4;
const numGrids = 8;
const sceneFPS = 60;

// Helper Vars
let toggleKeyBoard = false;
let toggleDebug = false;

// Cannon Vars
let stop = false;
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;
let timeStep = 1/60;
let world = new CANNON.World();
let cannonDebugRenderer;

// Movement
const defaultCubeSpeed = -0.05;
let cubeSpeed = defaultCubeSpeed;
let angle = 0;
let lastmove = ['', '']
let hittingWall = [false, NaN];
let currPosX = spawnCord.x;
let currPosZ = spawnCord.z;
let leftDown = false;
let rightDown = false;
let northDown = false;
let southDown = false;

// Geometry
let box;
let queuedPiece;
let queuedPieceName;
let currentPiece;
let currentPieceBody;
let floorCube;
let leftWallCube;
let rightWallCube;
let northWallCube;
let southWallCube;
let floorBody;
let leftWallBody;
let rightWallBody;
let southWallBody;
let northWallBody;
let floorBox = new THREE.Box3();
let leftWallBox = new THREE.Box3();
let rightWallBox = new THREE.Box3();
let southWallBox = new THREE.Box3();
let northWallBox = new THREE.Box3();
let oldPieces = [];

// Listen for window resize event && ensure scene view resizes with window
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function pause() {
  if (!paused) {
    console.log("Pausing game.");
    document.getElementById("title").innerHTML = 'PAUSED';
    paused = true;
  } else if (paused) {
    console.log("Resuming game.");
    document.getElementById("title").innerHTML = 'TETRIVOICE';
    paused = false;
  }
}

//
// Setup scene
//
function init() {
  // Initialize scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x050505, 1, 250 );
  if (toggleDebug) {
    cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world );
  }
  scene.background = new THREE.Color( 0x050505 );

  // Lights
  scene.add( new THREE.AmbientLight( 0x222222 ) );
  let light = new THREE.DirectionalLight(0xdfebff, 1);

  light.position.set(0, 50, 0);
  light.position.multiplyScalar(1.3);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  const distance = 300;
  light.shadow.camera.left = - distance;
  light.shadow.camera.right = distance;
  light.shadow.camera.top = distance;
  light.shadow.camera.bottom = -distance;
  light.shadow.camera.far = 1000;
  scene.add(light);

  const color = 0xFFFFFF;
  const intensity = 0.5;
  const angle = new THREE.MathUtils.degToRad(45);
  const penumbra = 1;
  const decay = 1;
  const spotlight = new THREE.SpotLight(color, intensity);
  spotlight.position.set(30, 40, -30);
  spotlight.target.position.set(0, 0, 0);
  scene.add(spotlight);
  scene.add(spotlight.target);

  spotlight.position.set(-30, 50, -30);
  spotlight.target.position.set(0, 0, 30);
  scene.add(spotlight);
  scene.add(spotlight.target);

  // Setup perspective camera
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );

  // Setup renderer
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.shadowMap.enabled = true; // Enable shadows
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Setup controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.object.position.set(0,80,70);
  controls.enabled = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.object.updateProjectionMatrix();
  controls.update();

  // Spawn arena geometry
  setupArena();
  // Spawn initial piece
  spawnPiece();
  // Initialize Cannon physics
  function initCannon() {
    world.gravity.set(0,0,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 1;
  }
  initCannon();
  startAnimating(sceneFPS);
}

// Control animation FPS
// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe/19772220#19772220
// Initialize the timer variables and start the animation
function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;

  // Animate scene
  function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;

    // Cannon
    function updatePhysics() {
      // Step the physics world
      world.step(timeStep);
    
      // Copy coordinates from Cannon.js to Three.js
      currentPiece.position.copy(currentPieceBody.position);
      currentPiece.quaternion.copy(currentPieceBody.quaternion);
    }

    if (elapsed > fpsInterval && !paused) {
      document.getElementById("score").innerHTML = score;
      document.getElementById("nextpiece").innerHTML = ('NEXT PIECE: [ <span style="color: yellow">' + queuedPieceName.toUpperCase() + '</span> ]');

      // Get ready for next frame by setting then=now, but...
      // Also, adjust for fpsInterval not being multiple of 16.67
      then = now - (elapsed % fpsInterval);

      currentPieceBody.position.y += cubeSpeed;
      currentPiece.position.y += cubeSpeed;

      hitWall();
      updatePhysics();
      console.log('hitting wall: ' + hittingWall[0])

      // Render
      if (toggleDebug) {
        cannonDebugRenderer.update();
      }
      renderer.render(scene, camera);
    }
  }
  animate();
}

//
// Clear lines
// TODO: Ensure pieces only collide with each other on top/bottom faces
//
function clearLine() {
  let positions = []; // Should probably use object?
  let line = (numGrids * numGrids) / 4;

  function addPos(vec, piece) {
    if (positions[vec] == undefined) {
      positions[vec] = []
      positions[vec].splice(0, 1, piece);
    } else {
      positions[vec].push(piece);
    }
  }

  for (let i = 0; i < oldPieces.length; i++) {
    let pos = oldPieces[i][1].position.y;
    let gridPos = floorCube.position.y;
    for (let p = 0; p < numGrids; p++) {
      if (pos > gridPos && pos < (gridPos + gridSize)) {
        addPos(p, oldPieces[i]);
      }
      gridPos += gridSize
    };
  };


  let clearedLines = [];
  for (let i = 0; i < positions.length; i++) {
    console.log(positions)
    console.log('checking ' + positions[i])
    console.log(positions[i])
    if (positions[i] != undefined && positions[i].length == line) {
      clearedLines.push(i);
      score += 1000;
      console.log("CLEARING LINE")
      for (let p = 0; p < positions[i].length; p++) {
        console.log("DELETING PIECE")

        console.log('before delete piece splice...')
        console.log(oldPieces)
        oldPieces.splice(oldPieces.indexOf(positions[i][p]), 1);
        console.log('after delete piece splice...')
        console.log(oldPieces)

        let obj = positions[i][p][0];
        scene.remove(obj);
        obj.geometry.dispose();
        obj.material.dispose();
        world.removeBody(positions[i][p][1]);
      }
    }
    console.log(positions)
  }

  for (let i = 0; i < clearedLines.length; i++) {
    let oldpos = positions[clearedLines[i]][0][1].position.y;
    let oldposbody = positions[clearedLines[i]][0][0].position.y;
    for (let p = 0; p < oldPieces.length; p++) {
      let newpos = oldPieces[p][1].position.y;
      let newposbody = oldPieces[p][0].position.y;
      if (newpos > (oldpos + 1)) {
        oldPieces[p][1].position.y = (newpos - 4);
        oldPieces[p][0].position.y = (newposbody - 4);
        oldPieces[p][0].updateMatrix();
        oldPieces[p][0].updateMatrixWorld();
        oldPieces[p][0].updateWorldMatrix(true, true);
      }
    }
  }

  hittingWall = [false, NaN]
}

function hitWall() {
  if (hittingWall[0] == true) {
    if (hittingWall[1] == leftWallBody.id || hittingWall[1] == rightWallBody.id | hittingWall[1] == northWallBody.id || hittingWall[1] == southWallBody.id) {
      console.log('wall piece')
      if (lastmove[0] == 'rotate') {
        if (lastmove[1] == 'left') {
          rotatePiece('right');
        } else if (lastmove[1] == 'right') {
          rotatePiece('left');
        };
      } else if (lastmove[0] == 'move') {
        if (hittingWall[1] == leftWallBody.id) {
          console.log('hit left wall, moving back');
          movePiece('right');
        } else if (hittingWall[1] == rightWallBody.id) {
          console.log('hit right wall, moving back');
          movePiece('left');
        } else if (hittingWall[1] == northWallBody.id) {
          console.log('hit north wall, moving back');
          movePiece('south');
        } else if (hittingWall[1] == southWallBody.id) {
          console.log('hit south wall, moving back');
          movePiece('north');
        }
      }
    } else if (hittingWall[1] == floorBody.id) {
      if (currentPiece.position.y > -5) {
        // This is a bug. I am currently unsure why it is required.
        console.log('ERROR: Recognized hit as floor piece but currentpiece is not near floor.')
      } else {
        if (currentPiece.position.y > 25) {
        // Same as above for testing...
        console.log('ERROR: Recognized hit as old piece but currentpiece is just spawning.')
        } else {
          console.log('floor piece')
          score += 10;
          oldPieces.push([currentPiece, currentPieceBody]);
          clearLine();
          spawnPiece();
        }
      }
    } else {
      console.log('old piece')
      score += 10;
      for (let i = 0; i < oldPieces.length; i++) {
        console.log('checkingpieces: ' + i)
        if (hittingWall[1] == oldPieces[i][1].id) {
          if (oldPieces[i][1].id == floorBody.id) {
            console.log('ERROR: piece in oldPieces array has id of ground mesh')
            break;
          }
          console.log('hittingpieces: ' + i + ' -- with id # ' + oldPieces[i][1].id)
          oldPieces.push([currentPiece, currentPieceBody]);
          clearLine();
          spawnPiece();
        }
      }
    }
  };
  hittingWall = [false, NaN]
};

function movePiece(dir) {
  let num = 1;
  if (dir == 'left' || dir == 'north') {
    num = -1
  };
  if (dir == 'left' || dir == 'right') {
    currentPieceBody.position.x += (4 * num);
    currentPiece.position.x += (4 * num);
  } else {
    currentPieceBody.position.z += (4 * num);
    currentPiece.position.z += (4 * num);
  }
};

function rotatePiece(dir) {
  let num = -2;
  if (dir == 'left' || dir == 'north') {
    num = 2
  };
  if (dir == 'left' || dir == 'right') {
    let axis = new CANNON.Vec3(0,1,0);
    angle += Math.PI / num;
    currentPieceBody.quaternion.setFromAxisAngle(axis, angle);
  } else {
    let axis = new CANNON.Vec3(0,0,1);
    angle += Math.PI / num;
    currentPieceBody.quaternion.setFromAxisAngle(axis, angle);
  }
}

// Listen for keyboard input
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  const keyCode = event.which;
  // Movement
  if (keyCode == 32) {
    cubeSpeed = -0.2;
    //console.log('space down');
  } else if (keyCode == 68) {
    lastmove = ['move', 'right'];
    if (toggleKeyBoard) {
      movePiece('right');
    }
    rightDown = true;
    document.getElementById('rightArrow').style.backgroundColor = '#ebe834';
    //console.log('d down');
  } else if (keyCode == 65) {
    leftDown = true;
    lastmove = ['move', 'left'];
    if (toggleKeyBoard) {
      movePiece('left');
    }
    document.getElementById('leftArrow').style.backgroundColor = '#ebe834';
    //console.log('a down');
  } else if (keyCode == 87) {
    northDown = true;
    lastmove = ['move', 'north'];
    if (toggleKeyBoard) {
      movePiece('north');
    }
    document.getElementById('upArrow').style.backgroundColor = '#ebe834';
    //console.log('w down');
  } else if (keyCode == 83) {
    southDown = true;
    lastmove = ['move', 'south'];
    if (toggleKeyBoard) {
      movePiece('south');
    }
    document.getElementById('downArrow').style.backgroundColor = '#ebe834';
    //console.log('s down');
  } else if (keyCode == 82) {
    //console.log('r down');
  }
  // Rotation
  else if (keyCode == 81) {
    if (toggleKeyBoard) {
      rotatePiece('left');
    }
    lastmove = ['rotate', 'left'];
    //console.log('q down');
  } else if (keyCode == 69) {
    if (toggleKeyBoard) {
      rotatePiece('right');
    }
    lastmove = ['rotate', 'right'];
    //console.log('e down');
  } else if (keyCode == 27) {
    pause();
  };
};

document.addEventListener('keyup', onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
  const keyCode = event.which;
  if (keyCode == 32) {
    cubeSpeed = defaultCubeSpeed;
    //console.log('space up');
  }
  else if (keyCode == 68) {
    document.getElementById('rightArrow').style.backgroundColor = 'transparent';
    //console.log('d up');
    rightDown = false;
  }
  else if (keyCode == 65) {
    document.getElementById('leftArrow').style.backgroundColor = 'transparent';
    //console.log('a up');
    leftDown = false;
  }
  else if (keyCode == 87) {
    document.getElementById('upArrow').style.backgroundColor = 'transparent';
    //console.log('w up');
    northDown = false;
  }
  else if (keyCode == 83) {
    document.getElementById('downArrow').style.backgroundColor = 'transparent';
    //console.log('s up');
    southDown = false;
  }
};
