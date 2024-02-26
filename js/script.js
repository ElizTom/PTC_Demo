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
let stats, glbModel, orbitControls, plane1, plane2, plane3, plane4, plane5, circle, jData, dispText = [];;

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

    //circle
    const geometryCirle = new THREE.CircleGeometry(.1, 32);
    const materialCircle = new THREE.MeshBasicMaterial({ color: 0xffffff });
    circle = new THREE.Mesh(geometryCirle, materialCircle);
    circle.position.set(0, 2, 0);
    scene.add(circle);

    // Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('js/Draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('models/PTC_Aachen.glb', function (gltf) {

        // console.log(gltf);
        glbModel = gltf.scene;
        // glbModel = gltf.scene.children[0];

        for (let i = 0; i < glbModel.children.length; i++) {
            // console.log(glbModel.children[i].name);
        }
        glbModel.scale.set(.7, .7, .7);
        scene.add(glbModel);


    });


    const geometry = new THREE.PlaneGeometry(1.5, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    plane1 = new THREE.Mesh(geometry, material);
    plane1.position.set(-3, 2.2, 0);
    scene.add(plane1);

    plane2 = new THREE.Mesh(geometry, material);
    plane2.position.set(2, 2.2, -2);
    scene.add(plane2);
    plane3 = new THREE.Mesh(geometry, material);
    plane3.position.set(2, 2.2, -2);
    scene.add(plane3);
    plane4 = new THREE.Mesh(geometry, material);
    plane4.position.set(2, 2.2, -2);
    scene.add(plane4);
    plane5 = new THREE.Mesh(geometry, material);
    plane5.position.set(2, 2.2, -2);
    scene.add(plane5);

    ajaxCall();

    // fontLoad.load('./fonts/helvetiker_regular.typeface.json', function (font) {
    //     for (let i = 0; i <= 4; i++) {
    //         dispText[i] = "";
    //         for (var key in jData.rows[i]) {
    //             dispText[i] += key + " : " + jData.rows[i][key] + "\n";
    //         }
    //     }
    //     const geometry = new TextGeometry(dispText[1], {
    //         font: font,
    //         size: .08,
    //         height: .001
    //     });
    //     const materials = [
    //         new THREE.MeshPhongMaterial({ color: 0x000 }), // front
    //         new THREE.MeshPhongMaterial({ color: 0x000 }) // side
    //     ];
    //     const textMesh1 = new THREE.Mesh(geometry, materials);
    //     textMesh1.position.set(-.7, .2, 0);
    //     textMesh1.textAlign = 'center';
    //     plane1.add(textMesh1)
    // });

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {
    plane1.lookAt(camera.position);
    plane2.lookAt(camera.position);
    circle.lookAt(camera.position);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
    // console.log(camera.position);
}

setInterval(ajaxCall, 30000);
init();

function ajaxCall() {
    console.log("ajax")
    $.ajax({
        url: 'https://dfa-twx.germanywestcentral.cloudapp.azure.com/Thingworx/Things/LTTS.ESM.Manager/Services/GetAllAssetDataFor3D',
        crossDomain: true,
        method: 'post',
        headers: {
            'appKey': '983ab5c1-ba96-42b2-bb23-25d3b4a1984e',
            'Accept': 'application/json'
        },
        contentType: 'application/json'
    }).done(function (response) {
        jData = response;
        console.log("jData", jData);
        console.log("jData", jData.rows[0]);

        // for (let i = 0; i <= 4; i++) {
        //     dispText[i] = "";
        //     for (var key in jData.rows[i]) {
        //         // console.log(key + " : " + jData.rows[i][key]);
        //         dispText[i] += key + " : " + jData.rows[i][key] + "\n";
        //     }
        // }
    });
    // const fontLoad = new FontLoader();
    // fontLoad.load('./fonts/helvetiker_regular.typeface.json', function (font) {
    //     console.log(dispText)
    //     const geometry = new TextGeometry(dispText[0], {
    //         font: font,
    //         size: .08,
    //         height: .001
    //     });
    //     const materials = [
    //         new THREE.MeshPhongMaterial({ color: 0x000 }), // front
    //         new THREE.MeshPhongMaterial({ color: 0x000 }) // side
    //     ];
    //     const textMesh1 = new THREE.Mesh(geometry, materials);
    //     textMesh1.position.set(-.7, .2, 0);
    //     textMesh1.textAlign = 'center';
    //     plane1.add(textMesh1)
    // });
}
