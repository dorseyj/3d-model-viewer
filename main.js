import * as THREE from 'https://cdn.skypack.dev/three@0.130.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.130.0//examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from "https://cdn.skypack.dev/three@0.130.0//examples/jsm/loaders/OBJLoader.js";
import {Object3D} from "https://cdn.skypack.dev/three@0.130.0/build/three.module.js";
import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfafafa);
//Perspective Camera (FOV in degrees, Aspect Ratio of Scene, Near clipping plane, Far clipping plane);
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer();


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const container = document.getElementById( 'viewer-window' );
document.body.appendChild( container );
container.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 5;
controls.update();

//Loading lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

const HemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add(HemisphereLight);

//Load texture
var textureLoader = new THREE.TextureLoader();
var map = textureLoader.load('assets/texture-07.svg');
var material = new THREE.MeshPhongMaterial({map: map});

// Instantiate a loader
const loader = new OBJLoader();



//Define the object in this scope for animation later.
let obj = new Object3D();

// Load an OBJ resource
loader.load(
    // resource URL
    'assets/Modelo.obj',
    // called when the resource is loaded
    function ( object ) {
        //Apply texture to object
        object.traverse( function ( node ) {

            if ( node.isMesh ) node.material = material;

        } );
        console.log(object);
        //Scale object
        object.scale.set(0.005,0.005,0.005);
        obj = object;
        //obj.children[10].scale.set(0.6,0.6,0.6);
        //obj.children[11].scale.set(0.6,0.6,0.6);
        //obj.children[12].scale.set(0.6,0.6,0.6);
        //Add object to scene
        scene.add(object);

    },
    // called while loading is progressing
    function ( xhr ) {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.visibility = "visible";

        var canvas = document.getElementById('canvas');
        canvas.style.visibility = "hidden";
        var errorScreen = document.getElementById('error-screen');
        errorScreen.style.visibility = "hidden";

        var htmlYawButton = document.getElementById('yaw-button');
        htmlYawButton.style.display = "none";

        var htmlRollButton = document.getElementById('roll-button');
        htmlRollButton.style.display = "none";


        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        if ((xhr.loaded / xhr.total * 100 ) === 100)
        {
            loadingScreen.style.visibility = "hidden";
            canvas.style.visibility = "visible";
        }

    },
    // called when loading has errors
    function ( error ) {
        var errorScreen = document.getElementById('error-screen');
        loadingScreen.style.visibility = "hidden";
        errorScreen.style.visibility = "visible";
        console.log( 'An error happened' );

    }
);
//For Debugging
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


//Controls the Wing and Tail sliders
var wing_pos = document.getElementById('wing-pos');
var tail_pos = document.getElementById('tail-pos');

wing_pos.oninput = function () {
    //wing max:400 min:-400

    if ((parseInt(wing_pos.value) <= 54) && (parseInt(wing_pos.value) >= 46))
    {
        wing_pos.value = 50;
    }
    if((parseInt(wing_pos.value)*2) <= parseInt(tail_pos.value))
    {
        wing_pos.value = parseInt(tail_pos.value)/2;
    }
    var wingInterpNum = (wing_pos.value - 50) * 8;
    obj.children[10].position.x = wingInterpNum;
    obj.children[11].position.x = wingInterpNum;
    obj.children[12].position.x = wingInterpNum;


};

tail_pos.oninput = function () {
    //tail max:400 min:0

    if((parseInt(wing_pos.value)*2) <= parseInt(tail_pos.value))
    {
        tail_pos.value = parseInt(wing_pos.value)*2;
    }

    var tailInterpNum = tail_pos.value * 4;
    obj.children[13].position.x = tailInterpNum;
    obj.children[14].position.x = tailInterpNum;
};

//Resets the camera and object
var resetButton = document.getElementById('reset-button');
resetButton.onclick = function(){
    camera.position.set(0,0,5);
    obj.rotation.set(0,0,0);
    wing_pos.value = 50;
    tail_pos.value = 0;
    obj.children[10].position.x = 0;
    obj.children[11].position.x = 0;
    obj.children[12].position.x = 0;
    obj.children[13].position.x = 0;
    obj.children[14].position.x = 0;
    animationnum = 0;
    tweenRoll.stop();
    tweenYaw.stop();
    tweenPitch.stop();
};

var fitToScreenButton = document.getElementById('fit-button');
fitToScreenButton.onclick = function () {
    var origin = new THREE.Spherical(0, 0, 0);
    origin.setFromCartesianCoords(camera.position.x, camera.position.y, camera.position.z);
    origin.radius = 5;
    camera.position.setFromSpherical(origin);

};


//Animation Inputs Begin
var animationnum = 0;
var rotateDegree = THREE.Math.degToRad(30);
var rotateNegative = THREE.Math.degToRad(-30);
var start = { num: 0};
var target = { num: rotateDegree};
var negTarget = { num: rotateNegative};

//Pitch
var tweenPitch = new TWEEN.Tween(start).to(target, 1000);
const pitchUpdate = function () {
    obj.rotation.z = start.num;
};
tweenPitch.onUpdate(pitchUpdate);

var tweenPitchNeg = new TWEEN.Tween(start).to(negTarget, 1000);
const pitchUpdateNeg = function () {
    obj.rotation.z = start.num;
};
tweenPitchNeg.onUpdate(pitchUpdateNeg);

//Yaw
var tweenYaw = new TWEEN.Tween(start).to(target, 1000);
const yawUpdate = function () {
    obj.rotation.y = start.num;
};
tweenYaw.onUpdate(yawUpdate);

var tweenYawNeg = new TWEEN.Tween(start).to(negTarget, 1000);
const yawUpdateNeg = function () {
    obj.rotation.y= start.num;
};
tweenYawNeg.onUpdate(yawUpdateNeg);

//Roll
var tweenRoll = new TWEEN.Tween(start).to(target, 1000);
const rollUpdate = function () {
    obj.rotation.x = start.num;
};
tweenRoll.onUpdate(rollUpdate);

var tweenRollNeg = new TWEEN.Tween(start).to(negTarget, 1000);
const rollUpdateNeg = function () {
    obj.rotation.x = start.num;
};
tweenRollNeg.onUpdate(rollUpdateNeg);

var pitchButton = document.getElementById('pitch-button');
pitchButton.onclick = function(){
    animationnum = 1;
};

var experimentalButton = document.getElementById('exper-button');
experimentalButton.onclick = function(){
    var htmlResetButton = document.getElementById('reset-button');
    var htmlFitButton = document.getElementById('fit-button');
    var htmlPitchButton = document.getElementById('pitch-button');
    var htmlRollButton = document.getElementById('roll-button');
    var htmlYawButton = document.getElementById('yaw-button');
    var toolBarBox = document.getElementById('tool-bar');

    if (htmlYawButton.style.display === "none")
    {
        htmlYawButton.style.display = "inline";
        htmlRollButton.style.display = "inline";
        htmlResetButton.style.width = "10%";
        htmlYawButton.style.width = "10%";
        htmlRollButton.style.width = "10%";
        htmlFitButton.style.width = "10%";
        htmlPitchButton.style.width = "10%";

        htmlResetButton.style.marginLeft = "3%";
        htmlYawButton.style.marginLeft = "3%";
        htmlRollButton.style.marginLeft = "3%";
        htmlFitButton.style.marginLeft = "3%";
        htmlPitchButton.style.marginLeft = "3%";
        toolBarBox.style.height = "8%";


    }
    else
    {
        htmlYawButton.style.display = "none";
        htmlRollButton.style.display = "none";

        htmlResetButton.style.width = "20%";
        htmlYawButton.style.width = "20%";
        htmlRollButton.style.width = "20%";
        htmlFitButton.style.width = "20%";
        htmlPitchButton.style.width = "20%";

        htmlResetButton.style.marginLeft = "10%";
        htmlYawButton.style.marginLeft = "10%";
        htmlRollButton.style.marginLeft = "10%";
        htmlFitButton.style.marginLeft = "10%";
        htmlPitchButton.style.marginLeft = "5%";
        toolBarBox.style.height = "7%";
    }
};
//############ The Yaw and Roll Functionality ############

var rollButton = document.getElementById('roll-button');
rollButton.onclick = function(){
    animationnum = 2;
};
var yawButton = document.getElementById('yaw-button');
yawButton.onclick = function(){
    animationnum = 3;
};


function animate()
{
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);


    var wingOffset = wing_pos.value - 50;
    var tailOffset = Math.round((100 - tail_pos.value)/2);
    if (tailOffset == 0)
        tailOffset = 1;

    var moment =(10*wingOffset) - (tailOffset);
    var duration = 3000 - Math.round((Math.abs(moment))*4.8);

    switch (animationnum) {
        case 1:
            if (moment > 0)
            {
                tweenPitch.duration(duration);
                tweenPitch.start();
            }
            else
            {
                tweenPitchNeg.duration(duration);
                tweenPitchNeg.start();
            }
            animationnum = 0;
            break;
        case 2:
            console.log(2);
            if (moment > 0)
            {
                tweenRoll.duration(duration);
                tweenRoll.start();
            }
            else
            {
                tweenRollNeg.duration(duration);
                tweenRollNeg.start();
            }
            animationnum = 0;
            break;
        case 3:
            if (moment > 0)
            {
                tweenYaw.duration(duration);
                tweenYaw.start();
            }
            else
            {
                tweenYawNeg.duration(duration);
                tweenYawNeg.start();
            }
            animationnum = 0;
            break;

        default:
            break;
    }

    //Display Values to stats-window
    document.getElementById("Moment").innerHTML = moment;
    document.getElementById("Wing-Distance").innerHTML = wingOffset;
    document.getElementById("Tail-Distance").innerHTML = tailOffset;

    document.getElementById("X-Axis").innerHTML = Math.round(THREE.Math.radToDeg(obj.rotation.x));
    document.getElementById("Y-Axis").innerHTML = Math.round(THREE.Math.radToDeg(obj.rotation.y));
    document.getElementById("Z-Axis").innerHTML = Math.round(THREE.Math.radToDeg(obj.rotation.z));
    var a = new THREE.Vector3( 0, 0, 0 );
    document.getElementById("Wing").innerHTML = camera.position;
    controls.update();
}

animate();

