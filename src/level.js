//
// Setup 3D playing field
//
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
