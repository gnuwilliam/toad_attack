// Global variables
var canvas, engine, scene, camera, score = 0;
var TOAD_MODEL;

// An array to store each ending of the lane
var ENDINGS = [];

// An array to store the mushrooms
var ENEMIES = [];

/**
* Load the scene when the canvas is fully loaded
*/
document.addEventListener('DOMContentLoaded', function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
        initGame();
    }
}, false);

/**
* Adds keyboard event listener
*/
window.addEventListener('keydown', onKeyDown);

/**
 * Creates a new BABYLON Engine and initialize the scene
 */
function initScene () {
    // Get canvas
    canvas = document.getElementById('canvas');

    // Create Babylon engine
    engine = new BABYLON.Engine(canvas, true);

    // Create a scene
    scene = new BABYLON.Scene(engine);

    // Create the camera
    camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 4, -10), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 10));
    camera.attachControl(canvas);

    // Create light
    var light = new BABYLON.PointLight('light', new BABYLON.Vector3(0, 5, -5), scene);

    engine.runRenderLoop(function () {
        scene.render();
        ENEMIES.forEach(function (mushroom) {
            if (mushroom.killed) {
                //TODO: implement
            } else {
                mushroom.position.z -= 0.5;
            }
        });
        cleanMushrooms();
    });

    // Create box
    var skybox = BABYLON.Mesh.CreateBox('skyBox', 1000.0, scene);

    // Create sky
    var skyBoxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
    skyBoxMaterial.backFaceCulling = false;
    skyBoxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyBoxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyBoxMaterial.reflectionTexture = new BABYLON.CubeTexture('data/textures/pixelbg/pixelbg', scene);
    skyBoxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // Box + Sky
    skybox.material = skyBoxMaterial;
}

/**
 * Initialize the game
 */
function initGame () {
    // Number of lanes
    var LANE_NUMBER = 3;

    // Space between lanes
    var LANE_INTERVAL = 5;
    var LANES_POSITIONS = [];

    // Set ground texture
    var ground = new BABYLON.StandardMaterial('ground', scene);
    var texture = new BABYLON.Texture('data/textures/boxes2.jpg', scene);
    texture.uScale = 100;
    texture.vScale = 1;
    ground.diffuseTexture = texture;

    // Function to create lanes
    var createLane = function (id, position) {
        var lane = BABYLON.Mesh.CreateBox('lane'+id, 1, scene);
        lane.scaling.y = 0.1;
        lane.scaling.x = 3;
        lane.scaling.z = 800;
        lane.position.x = position;
        lane.position.z = lane.scaling.z / 2 - 200;
        lane.material = ground;
    }

    var createEnding = function (id, position) {
        var ending = BABYLON.Mesh.CreateGround(id, 3, 4, 1, scene);
        ending.position.x = position;
        ending.position.y = 0.1;
        ending.position.z = 1;

        var mat = new BABYLON.StandardMaterial('endingMat', scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        ending.material = mat;

        return ending;
    }

    var currentLanePosition = LANE_INTERVAL * -1 * (LANE_NUMBER / 2);

    for (var i = 0; i < LANE_NUMBER; i++) {
        LANES_POSITIONS[i] = currentLanePosition;

        createLane(i, currentLanePosition);

        var e = createEnding(i, currentLanePosition);
        ENDINGS.push(e);

        currentLanePosition += LANE_INTERVAL;
    }

    // The function ImportMesh will import the custom model in the scene
    BABYLON.SceneLoader.ImportMesh('red_toad', 'data/models/', 'toad.babylon', scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = false;
        m.scaling = new BABYLON.Vector3(0.5,0.5,0.5);
        TOAD_MODEL = m;
    });

    // Create a mushroom model in a random lane
    var createEnemy = function () {
        // The starting position of the toads
        var posZ = 100;

        // Get a random lane
        var posX = LANES_POSITIONS[Math.floor(Math.random() * LANE_NUMBER)];

        // Create a clone of the template
        var mushroom = TOAD_MODEL.clone(TOAD_MODEL.name);
        mushroom.id = TOAD_MODEL.name + (ENEMIES.length + 1);
        mushroom.killed = false;
        mushroom.isVisible = true;
        mushroom.position = new BABYLON.Vector3(posX, mushroom.position.y / 2, posZ);

        ENEMIES.push(mushroom);
    }

    // Add a new mushroom every 1s
    setInterval(createEnemy, 1000);

    camera.position.x = LANES_POSITIONS[Math.floor(LANE_NUMBER / 2)];
}

// Clear all the toads behind the camera
function cleanMushrooms () {
    for (var n = 0; n < ENEMIES.length; n++) {
        if (ENEMIES[n].killed) {
            var mushroom = ENEMIES[n];
            // Destroy the clone
            mushroom.dispose();
            ENEMIES.splice(n, 1);
            n--;

            // Increase score
            score += 1;
        } else if (ENEMIES[n].position.z < -10) {
            var mushroom = ENEMIES[n];
            // Destroy the clone
            mushroom.dispose();
            ENEMIES.splice(n, 1);
            n--;

            // Decrease score
            score -= 1;
        }
    }
}

// Add animation
function animateEnding (ending) {
    // Get the initial position of our Mesh
    var posY = ending.position.y;

    // Create the animation object
    var animateEnding = new BABYLON.Animation(
        'animateEnding',
        'position.y',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE
    );

    // Animation keys
    var keys = [];
    keys.push(
        { frame: 0, value: posY },
        { frame: 5, value: posY + 0.5 },
        { frame: 10, value: posY }
    );

    // Add keys to the animation
    animateEnding.setKeys(keys);

    // Link the animation to the Mesh
    ending.animations.push(animateEnding);

    // Run the animation
    scene.beginAnimation(ending, 0, 10, false, 1);
}

function onKeyDown(evt) {
    var currentEnding = -1;

    switch (evt.keyCode) {
        case 65: //'A'
            currentEnding = 0;
            break;
        case 83: //'S'
            currentEnding = 1;
            break;
        case 68: //'D'
            currentEnding = 2;
            break;
    }

    if (currentEnding != -1) {
        // Animate
        animateEnding(ENDINGS[currentEnding]);

        var mushroom = getToad(ENDINGS[currentEnding]);
        if (mushroom) {
            // Destroy the toad
            mushroom.killed = true;
        }
    }
}

// Function checking if a toad is present on a given ending
function getToad (ending) {
    // for each toad
    for (var i = 0; i < ENEMIES.length; i++) {
        var mushroom = ENEMIES[i];

        // Check if a toad is on the good lane
        if (mushroom.position.x === ending.position.x) {
            // Check if the toad is ON the ending
            var diffSup = ending.position.z + 3;
            var diffInf = ending.position.z - 3;

            if (mushroom.position.z > diffInf && mushroom.position.z < diffSup) {
                return mushroom;
            }
        }
    }
    return null;
}
