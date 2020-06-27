/* eslint-disable indent */
/* eslint-disable prefer-rest-params */
/* eslint-disable brace-style */
/* eslint-disable require-jsdoc */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
let recognition;

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

// Localization Support
//
// Default language set as English
// Get languages from languages.js
// Show settings page/dropdown menu for languages
// If user changes localization, look up & set translated commands
//

const browserLang = navigator.language;
let currentLang = "English (United States)";

function loadLanguages() {
  const langId = document.getElementById('languagesDD');
  const langs = Object.keys(langList)
  for (const l of langs) {
    if (langList[l]["code"]) {
      if (langList[l]["code"] == 'en-US') {
        langId.options[langId.options.length] = new Option(l, langList[l]["code"], true, true);
      } else {
        langId.options[langId.options.length] = new Option(l, langList[l]["code"], false, false);
      }
    }
  }

  langId.addEventListener("change", function(){
    console.log('Changed language to ' + langId.options[langId.selectedIndex].innerHTML);
    currentLang = langId.options[langId.selectedIndex].innerHTML;
    recognition.lang = langList[currentLang]["code"];
    // Update displayed commands
    document.getElementById("rotate").innerHTML = langList[currentLang]["voiceCommands"]["rotate"].toUpperCase();
    document.getElementById("move").innerHTML = langList[currentLang]["voiceCommands"]["move"].toUpperCase();
    document.getElementById("drop").innerHTML = langList[currentLang]["voiceCommands"]["drop"].toUpperCase();
  });
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

// Geometry
function setupArena() {
  // Spawn arena floor
  function setupGround() {
    const floorGeometry = new THREE.BoxGeometry(45, 0.1, 45);
    const loader = new THREE.TextureLoader();
    // const floorMaterial = new THREE.MeshPhongMaterial({
    //   map: loader.load('./misc/textures/tiledgreyback1.png'),
    // });
    const floorMaterial = new THREE.MeshPhongMaterial({color: 0x313a3b});
    floorCube = new THREE.Mesh(floorGeometry, floorMaterial, 0);
    floorCube.receiveShadow = true;
    floorCube.position.y = -21;
    scene.add(floorCube);
    floorCube.name = "ground"

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(25, 0.05, 25));
    floorBody = new CANNON.Body({
      mass: 0
    });
    floorBody.addShape(cubeShape);
    floorBody.position.y = -21;

    world.addBody(floorBody);

    // Draw floor grid
    const lineMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      opacity: 1,
      transparent: true,
    });

    // Draws a straight line with two sets of given vector coordinates
    // Ex.: drawLine([,,], [,,]);
    function drawLine() {
      let num = 0;
      if (arguments[2] == 'vertical') {
        num = 1
      };
      const points = [];
      points.push(new THREE.Vector3(
        arguments[0][0],
        arguments[0][1],
        (arguments[0][2] - num),
      ));
      points.push(new THREE.Vector3(
        arguments[1][0],
        arguments[1][1],
        (arguments[1][2] - num),
      ));
      const line = new THREE.BufferGeometry().setFromPoints(points);
      const newline = new THREE.Line(line, lineMaterial);
      scene.add(newline);
    }

    // Draws a specified set of horizontal lines at a given start and unit step.
    // Ex.: horizontalLines([St,ar,t], Step, Total)
    function horizontalLines() {
      let start = arguments[0][2];
      for (let i = 0; i < arguments[2]; i += 1) {
        drawLine(
          [arguments[0][0], arguments[0][1], start],
          [-arguments[0][0], arguments[0][1], start],
        );
        start += arguments[1];
      }
    }
    horizontalLines([-16, -20, -17], gridSize, (numGrids + 1));

    // Draws a specified set of vertical lines at a given start and unit step.
    // Ex.: verticalLines([St,ar,t], Step, Total)
    function verticalLines() {
      let start = arguments[0][0];
      for (let i = 0; i < arguments[2]; i += 1) {
        drawLine(
          [start, arguments[0][1], arguments[0][2]],
          [start, arguments[0][1], -arguments[0][2]],
          'vertical',
        );
        start += arguments[1];
      }
    }
    verticalLines([-16, -20, 16], gridSize, (numGrids + 1));
  };

  // Spawn grid walls
  function setupWalls() {
    // Setup placeholder walls
    const sideWallGeometry = new THREE.BoxGeometry(0.1, 50, 32.5);
    const poleWallGeometry = new THREE.BoxGeometry(32.5, 50, 0.1);
    const wallMaterial = new THREE.MeshLambertMaterial({
      color: 0x9e0018,
      opacity: 0.1,
      transparent: true,
    });
    // Left
    leftWallCube = new THREE.Mesh(sideWallGeometry, wallMaterial, 0);
    leftWallCube.position.x = -16;
    leftWallCube.position.y = 3;
    leftWallCube.position.z = -1;
    scene.add(leftWallCube);
    leftWallCube.name = "leftWall"
    leftWallCube.geometry.computeBoundingBox();
    // Cannon
    const sideWallShape = new CANNON.Box(new CANNON.Vec3(0.05, 25, 20));
    leftWallBody = new CANNON.Body({
      mass: 0
    });
    leftWallBody.addShape(sideWallShape);
    leftWallBody.position.x = -17;
    leftWallBody.position.y = 3;
    leftWallBody.position.z = -1;
    world.addBody(leftWallBody);

    // Right
    rightWallCube = new THREE.Mesh(sideWallGeometry, wallMaterial, 0);
    rightWallCube.position.x = 16;
    rightWallCube.position.y = 3;
    rightWallCube.position.z = -1;
    scene.add(rightWallCube);
    rightWallCube.name = "rightWall"
    rightWallCube.geometry.computeBoundingBox();
    // Cannon
    rightWallBody = new CANNON.Body({
      mass: 0
    });
    rightWallBody.addShape(sideWallShape);
    rightWallBody.position.x = 17;
    rightWallBody.position.y = 3;
    rightWallBody.position.z = -1;
    world.addBody(rightWallBody);

    // south
    southWallCube = new THREE.Mesh(poleWallGeometry, wallMaterial, 0);
    southWallCube.position.x = 0;
    southWallCube.position.y = 3;
    southWallCube.position.z = 15;
    scene.add(southWallCube);
    southWallCube.name = "southWall"
    southWallCube.geometry.computeBoundingBox();
    // Cannon
    const poleWallShape = new CANNON.Box(new CANNON.Vec3(20, 25, 0.05));
    southWallBody = new CANNON.Body({
      mass: 0
    });
    southWallBody.addShape(poleWallShape);
    southWallBody.position.x = 0;
    southWallBody.position.y = 3;
    southWallBody.position.z = 16;
    world.addBody(southWallBody);

    // north
    northWallCube = new THREE.Mesh(poleWallGeometry, wallMaterial, 0);
    northWallCube.position.x = 0;
    northWallCube.position.y = 3;
    northWallCube.position.z = -17;
    scene.add(northWallCube);
    northWallCube.name = "northWall"
    northWallCube.geometry.computeBoundingBox();
    // Cannon
    northWallBody = new CANNON.Body({
      mass: 0
    });
    northWallBody.addShape(poleWallShape);
    northWallBody.position.x = 0;
    northWallBody.position.y = 3;
    northWallBody.position.z = -18;
    world.addBody(northWallBody);
  };

  setupGround();
  setupWalls();
}

// Spawn tetrominoes
// TODO: simplify functions/autogenerate pieces
function spawnPiece() {
  cubeSpeed = defaultCubeSpeed;
  if (currentPiece && currentPiece.position.y > (spawnCord.y - 5)) {
    console.log('not spawning new piece...')
    return
  }
  function spawnIPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0x00eaff});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -4);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(0, 0, -8);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(0, 0, -12);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3)
    currentPiece.updateMatrix();
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-12));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-8));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-4));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  function spawnOPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0xffe100});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -4);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(-4, 0, -4);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(-4, 0, 0);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    // // For making cube...unsure about keeping
    // const cube4 = new THREE.Mesh(geometry, material);
    // cube4.position.set(0, 4, -4);
    // cube4.castShadow = true;
    // cube4.receiveShadow = true;
    // cube4.updateMatrix();

    // const cube5 = new THREE.Mesh(geometry, material);
    // cube5.position.set(-4, 4, 0);
    // cube5.updateMatrix();

    // const cube6 = new THREE.Mesh(geometry, material);
    // cube6.position.set(-4, 4, -4);
    // cube6.castShadow = true;
    // cube6.receiveShadow = true;
    // cube6.updateMatrix();

    // const cube7 = new THREE.Mesh(geometry, material);
    // cube7.position.set(0, 4, 0);
    // cube7.castShadow = true;
    // cube7.receiveShadow = true;
    // cube7.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3);
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(-4,0,0));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(-4,0,-4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-4));
    // currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,4,0));
    // currentPieceBody.addShape(cubeShape, new CANNON.Vec3(-4,4,0));
    // currentPieceBody.addShape(cubeShape, new CANNON.Vec3(-4,4,-4));
    // currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,4,-4));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  function spawnTPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0x6d2e8c});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -4);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(0, 0, -8);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(4, 0, -4);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3);
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(4,0,-4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-8));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-4));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  function spawnSPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0x37b027});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(-4, 0, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(0, 0, 4);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(-4, 0, -4);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3);
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(-4,0,-4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(-4,0,0));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  function spawnZPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0xc71414});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(4, 0, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(0, 0, 4);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(4, 0, -4);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3);
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(4,0,-4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(4,0,0));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  function spawnJPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0x19308c});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -4);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(0, 0, -8);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(4, 0, -8);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3);
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.collisions = 0;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(4,0,-8));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-8));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-4));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  function spawnLPiece() {
    const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const material = new THREE.MeshToonMaterial({color: 0xde7a10});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -4);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.updateMatrix();

    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.set(0, 0, -8);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    cube2.updateMatrix();

    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.set(4, 0, 0);
    cube3.castShadow = true;
    cube3.receiveShadow = true;
    cube3.updateMatrix();

    currentPiece = new THREE.Mesh(geometry, material);
    currentPiece.add(cube, cube2, cube3);
    currentPiece.castShadow = true;
    currentPiece.receiveShadow = true;
    currentPiece.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
    scene.add(currentPiece);

    // Cannon
    const cubeShape = new CANNON.Box(new CANNON.Vec3(1.9,1.9,1.9));
    currentPieceBody = new CANNON.Body({
      mass: 1
    });
    currentPieceBody.angularDamping = 1; // Stops rotating movement
    currentPieceBody.linearDamping = 1;
    currentPieceBody.addShape(cubeShape);
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-4));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(0,0,-8));
    currentPieceBody.addShape(cubeShape, new CANNON.Vec3(4,0,0));
    currentPieceBody.position.set(spawnCord.x, spawnCord.y, spawnCord.z);
  }

  // Spawn pieces randomly
  const pieces = [
    spawnIPiece,
    spawnOPiece,
    spawnTPiece,
    spawnSPiece,
    spawnZPiece,
    spawnJPiece,
    spawnLPiece,
  ];

  if (!queuedPiece) {
    pieces[Math.floor((Math.random() * pieces.length))]();
  } else {
    pieces[queuedPiece]();
  }
  queuedPiece = Math.floor((Math.random() * pieces.length));
  queuedPieceName = pieces[queuedPiece].name.toLowerCase().replace('spawn','').replace('piece','');

  world.addBody(currentPieceBody);
  currentPiece.updateMatrix();
  currentPiece.updateMatrixWorld();
  currentPiece.updateWorldMatrix(true, true);
  currPosX = spawnCord.x;
  currPosZ = spawnCord.z;

  currentPieceBody.addEventListener("collide",function(e){
    hittingWall = [true, e.body.id]
    // console.log("Collided with body:",e.body);
    // console.log("Contact between bodies:",e.contact);
  });
  // hittingWall = [false, NaN]
  //console.log('spawning piece with id: ' + currentPiece.id + ' :body: ' + currentPieceBody.id)
}

//
// Handle movement
//

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

// Handle microphone input
window.addEventListener('DOMContentLoaded', () => {
  loadLanguages();
  // Initialize music player controls
  let music = document.getElementById('soundtrack');
  music.volume = 0.05;
  music.controls = true;

  const button = document.getElementById("button");
  const main = document.getElementsByTagName("main")[0];

  let listening = false;

  if (typeof SpeechRecognition !== "undefined") {
    recognition = new SpeechRecognition();
    recognition.lang = langList[currentLang]["code"];
    recognition.maxAlternatives = 0;

    const stop = () => {
      main.classList.remove("speaking");
      recognition.stop();
      button.textContent = "Start playing";
    };

    const start = () => {
      main.classList.add("speaking");
      recognition.start();
      button.hidden = true;
      music.play();
      init();
    };

    const onResult = (event) => {
      for (const res of event.results[event.results.length - 1]) {
        // Try to filter rapid voice results
        speechSynthesis.pause();
        let matchedWord = res.transcript.trim().split(' ');
        if (matchedWord.length != 0) {
          matchedWord = matchedWord.sort();
          // Find most used word
          let counts = {};
          let countsArr = [];
          for (let i = 0; i < matchedWord.length; i++) {
            counts[matchedWord[i]] = 1 + (counts[matchedWord[i]] || 0);
          }
          for (let command in counts) {
            countsArr.push([command, counts[command]]);
        }
        let newBig = 0;
        countsArr.sort(function(a, b) {
            return a[1] - b[1];
        });          
          for (let arr in countsArr) {
            if (countsArr[arr][1] > newBig) {
              newBig = arr;
            }
          }
          console.log('the final word is ' + countsArr[newBig][0])
          // Set most used word to matchedWord
          matchedWord = countsArr[newBig][0];
        }

        if (matchedWord == langList[currentLang]["voiceCommands"]["rotate"]) {
          //console.log("matched " + voiceCommands[0]);
          if (rightDown) {
            rotatePiece('right');
            lastmove = ['rotate', 'right'];
          } else if (leftDown) {
            rotatePiece('left');
            lastmove = ['rotate', 'left'];
          } else {
            console.log('no rotate direction specified');
          }
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["move"]) {
          //console.log("matched " + voiceCommands[1])
          if (rightDown) {
            movePiece('right');
            lastmove = ['move', 'right'];
          } else if (leftDown) {
            movePiece('left');
            lastmove = ['move', 'left'];
          } else if (northDown) {
            movePiece('north');
            lastmove = ['move', 'north'];
          } else if (southDown) {
            movePiece('south');
            lastmove = ['move', 'south'];
          } else {
            console.log('no move direction specified');
          }
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["drop"]) {
          //console.log("matched " + voiceCommands[2])
          cubeSpeed = -0.2;
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["swap"]) {
          //console.log("matched " + voiceCommands[3]);
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["spawn"]) {
          spawnPiece();
          //console.log("matched " + voiceCommands[4]);
        } else {
          console.log('No voice commands recognized');
        };
      }
    };
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.addEventListener("result", onResult);
    button.addEventListener("click", event => {
      const startMessage = document.getElementById("startText");
      startMessage.style.display = "none"
      const scoreText = document.getElementById("scoretext");
      const scoreVar = document.getElementById("score");
      scoreVar.style.display = "block"
      scoreText.style.display = "block"
      listening ? stop() : start();
      listening = !listening;
      document.getElementById("languagesDD").setAttribute('disabled', true)
      document.getElementById("languagesDDlabel").style.display = "none"
      document.getElementById("languagesDD").style.display = "none"
    });
  } else {
    button.remove();
    const message = document.getElementById("message");
    message.removeAttribute("hidden");
    message.setAttribute("aria-hidden", "false");
    const startMessage = document.getElementById("startText");
    startMessage.style.display = "none";
    document.getElementById("languagesDD").setAttribute('disabled', true);
  }
});
