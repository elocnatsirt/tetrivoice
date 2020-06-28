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
