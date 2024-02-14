import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let camera, scene, renderer;
let stats, glbModel, orbitControls, plane, plane1, jData, dispText = [];;

let grid;
let controls;

function init() {

    const container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(render);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    stats = new Stats();
    container.appendChild(stats.dom);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(10, 5, 15);
    camera.position.set(0, 0, 8);

    controls = new OrbitControls(camera, container);
    controls.maxDistance = 9;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.target.set(0, 0.5, 0);
    controls.update();

    // ORBIT CAMERA CONTROLS
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.mouseButtons = {
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN
    }
    orbitControls.enableDamping = true
    orbitControls.enablePan = true
    orbitControls.minDistance = 5
    orbitControls.maxDistance = 60
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05 // prevent camera below ground
    orbitControls.minPolarAngle = Math.PI / 4        // prevent top down view
    orbitControls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    scene.environment = new RGBELoader().load('textures/venice_sunset_1k.hdr');
    scene.environment.mapping = THREE.EquirectangularReflectionMapping;
    scene.fog = new THREE.Fog(0x333333, 10, 20);

    grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff);
    grid.material.opacity = 0.2;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);

    // Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('js/Draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('models/PTC_Aachen1.glb', function (gltf) {

        // console.log(gltf);
        glbModel = gltf.scene;
        // glbModel = gltf.scene.children[0];

        for (let i = 0; i < glbModel.children.length; i++) {
            // console.log(glbModel.children[i].name);
        }
        glbModel.scale.set(.7, .7, .7);
        scene.add(glbModel);


    });

    fetch('./JSON/data.json')
        .then((response) => response.json())
        .then((json) => jData = json);

    const geometry = new THREE.PlaneGeometry(1.5, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    plane = new THREE.Mesh(geometry, material);
    plane.position.set(-3, 2.2, 0);
    scene.add(plane);

    plane1 = new THREE.Mesh(geometry, material);
    plane1.position.set(2, 2.2, -2);
    scene.add(plane1);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {
    plane.lookAt(camera.position);
    plane1.lookAt(camera.position);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
    // console.log(camera.position);
}

init();



var xhr = new XMLHttpRequest();
// var url = "https://cors.x7.workers.dev/https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D";
var url = "https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D";
// var url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "text/plain");
xhr.setRequestHeader("appKey", "983ab5c1-ba96-42b2-bb23-25d3b4a1984e");
xhr.setRequestHeader("Accept", "application/json");
xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
xhr.setRequestHeader("Access-Control-Max-Age", "1800");

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.password);
    }
    return true;
};
var data = JSON.stringify({ "email": "hey@mail.com", "password": "101010" });
xhr.send(data);

// var xhr = new XMLHttpRequest();
// var url = "https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D?data=" + encodeURIComponent(JSON.stringify({ "email": "hey@mail.com", "password": "101010" }));
// xhr.open("GET", url, true);
// xhr.setRequestHeader("Content-Type", "application/json");
// xhr.setRequestHeader("appKey", "983ab5c1-ba96-42b2-bb23-25d3b4a1984e");
// xhr.setRequestHeader("Accept", "application/json");
// xhr.onreadystatechange = function () {
//   if (xhr.readyState === 4 && xhr.status === 200) {
//     var json = JSON.parse(xhr.responseText);
//     console.log(json.email + ", " + json.password);
//   }
// };
// xhr.send();
// curl--location--request POST 'https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D' \
// --header 'Content-Type: application/json' \
// --header 'appKey: 983ab5c1-ba96-42b2-bb23-25d3b4a1984e' \
// --header 'Accept: application/json' \
// --data - raw ''


function getValue() {
    let URL = "https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D";
    fetch(URL, {
        method: 'POST',
        // mode: 'no-cors', // 'cors' by default
        headers: {
            'Content-Type': 'text/plain',
            'appKey': '983ab5c1-ba96-42b2-bb23-25d3b4a1984e',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': 'https://dfa-twx.germanywestcentral.cloudapp.azure.com',
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Max-Age": "1800"
        }
    }
    )
        .then((response) => {
            console.log(response.text)
            if (response.ok) {
                return response.text()
            }
        }
        )
        .then(data => {
            console.log(data)
            //$scope.setWidgetProp('label-4', 'text', data)
        }
        )
        .catch(function (error) {
            console.log('FETCH FAIL', error);
            //$scope.setWidgetProp('label-4', 'text', 'Fail to fetch data')
            throw error;
        }
        )
}
getValue();

// fetch("https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D", {
//   headers: {
//     'Content-Type': 'application/json',
//     'appKey': '983ab5c1-ba96-42b2-bb23-25d3b4a1984e',
//     'Accept': 'application/json',
//     'Access-Control-Allow-Origin': '*',
//     "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
//   }
// }
// )
//   .then((res) => res.json())
//   .then((json) => {
//     const letters = json.letters;
//     console.log(letters);
//   });

// $.getJSON('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m', function (data) {
//   console.log("data", data)
// });

// $.getJSON('https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D', function (data) {
//   console.log("data", data)
// });

function loadJson() {
    console.log("loadJson");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var tags = JSON.parse(this.responseText);
            console.log(tags);
        }
    };
    xhttp.open("POST", "https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("appKey", "983ab5c1-ba96-42b2-bb23-25d3b4a1984e");
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.setRequestHeader("Access-Control-Allow-Origin", "https://dfa-twx.germanywestcentral.cloudapp.azure.com");
    xhttp.send();
}
// loadJson();

// $.ajax({
//   type: "POST", //rest Type
//   dataType: 'json', //mispelled
//   url: "https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D",
//   contentType: "application/json",
//   appKey: "983ab5c1-ba96-42b2-bb23-25d3b4a1984e",
//   accept: 'application/json',
//   success: function (msg) {
//     console.log(msg);
//   },
//   error: function (err, status) {
//     console.log(err, status)
//   }
// });

async function getUser() {
    console.log("getUser");
    try {
        const response = await fetch('https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D', {
            method: 'GET',
            headers: {
                accept: 'application/json',
                appKey: "983ab5c1-ba96-42b2-bb23-25d3b4a1984e",
                contentType: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (err) {
        console.log(err);
    }
}

// getUser();

// const url1 = 'https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D';
// const options = {
//   method: 'POST',
//   headers: {
//     "Content-type": 'application/json; charset=UTF-8',
//     "appKey": '983ab5c1-ba96-42b2-bb23-25d3b4a1984e',
//     "accept": 'application/json'
//   },
// };

// try {
//   const response = await fetch(url1, options);
//   const result = await response.text();
//   console.log(result);
// } catch (error) {
//   console.error(error);
// }

// Example POST method implementation:
async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        // mode: "no-cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            "appKey": "983ab5c1-ba96-42b2-bb23-25d3b4a1984e",
            "accept": "application/json"
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    console.log(response)
    return response.json(); // parses JSON response into native JavaScript objects
}

// postData("https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D", { answer: 42 }).then((data) => {
//   console.log(data); // JSON data parsed by `data.json()` call
// });



//    let URL = "https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D"; 
