// Global variables
var canvas, engine, scene, camera, score = 0;
var TOAD_MODEL;

// An array to store each ending of the lane
var ENDINGS = [];

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
    });
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

    // Function to create lanes
    var createLane = function (id, position) {
        var lane = BABYLON.Mesh.CreateBox('lane'+id, 1, scene);
        lane.scaling.y = 0.1;
        lane.scaling.x = 3;
        lane.scaling.z = 800;
        lane.position.x = position;
        lane.position.z = lane.scaling.z / 2 - 200;
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

    camera.position.x = LANES_POSITIONS[Math.floor(LANE_NUMBER / 2)];
}
