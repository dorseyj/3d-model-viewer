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
        //Add object to scene
        scene.add(object);

    },
    // called while loading is progressing
    function ( xhr ) {
        var loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.visibility = "visible";
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        if ((xhr.loaded / xhr.total * 100 ) === 100)
        {
            loadingScreen.style.visibility = "hidden";
        }

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened' );

    }
);
//For Debugging
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


var animationnum = 0;
var rotateDegree = THREE.Math.degToRad(30);
var start = { num: 0};
var target = { num: rotateDegree};

var tweenPitch = new TWEEN.Tween(start).to(target, 1000);
const pitchUpdate = function () {
    obj.rotation.z = start.num;
};
tweenPitch.onUpdate(pitchUpdate);

var tweenYaw = new TWEEN.Tween(start).to(target, 1000);
const yawUpdate = function () {
    obj.rotation.y = start.num;
};
tweenYaw.onUpdate(yawUpdate);

var tweenRoll = new TWEEN.Tween(start).to(target, 1000);
const rollUpdate = function () {
    obj.rotation.x = start.num;
};
tweenRoll.onUpdate(rollUpdate);


//tweenPitch.duration(3000);



var pitchButton = document.getElementById('pitch-button');
pitchButton.onclick = function(){
    animationnum = 1;
};
var rollButton = document.getElementById('roll-button');
rollButton.onclick = function(){
    animationnum = 2;
};
var yawButton = document.getElementById('yaw-button');
yawButton.onclick = function(){
    animationnum = 3;
};


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






function animate()
{
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);

    switch (animationnum) {
        case 1:
            tweenPitch.duration(3000);
            tweenPitch.start();
            animationnum = 0;
            break;
        case 2:
            tweenRoll.duration(3000);
            tweenRoll.start();
            animationnum = 0;
            break;
        case 3:
            tweenYaw.duration(3000);
            tweenYaw.start();
            animationnum = 0;
            break;

        default:
            break;
    }

    //Display Values to stats-window
    document.getElementById("X-Axis").innerHTML = Math.round(THREE.Math.radToDeg(obj.rotation.x));
    document.getElementById("Y-Axis").innerHTML = Math.round(THREE.Math.radToDeg(obj.rotation.y));
    document.getElementById("Z-Axis").innerHTML = Math.round(THREE.Math.radToDeg(obj.rotation.z));
    controls.update();
}

animate();

