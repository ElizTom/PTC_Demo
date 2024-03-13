import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let camera, scene, renderer;
let stats, glbModel, dialModel = [], orbitControls, jData, redMaterial, greenMaterial, dialMaterial, glassMaterial;
let planes = [], textMesh = [], box = [], dialLoaded = false, whiteC, blackC, canedit = true;
let grid;
let controls;

function init() {

    const container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
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
    grid.receiveShadow = true;
    scene.add(grid);

    // const groundGeo = new THREE.PlaneGeometry(10000, 10000);
    // const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // groundMat.color.setHSL(0.095, 1, 0.75);

    // const ground = new THREE.Mesh(groundGeo, groundMat);
    // ground.position.y = 0;
    // ground.rotation.x = - Math.PI / 2;
    // ground.receiveShadow = true;
    // scene.add(ground);

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    // scene.add(ambientLight);

    // const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // dirLight.position.set(0, 1000, 0);
    // scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    scene.add(hemiLightHelper);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(- 1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 10;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    // const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
    // scene.add(dirLightHelper);


    whiteC = new THREE.Color(0xffffff);
    blackC = new THREE.Color(0x000);

    dialMaterial = new THREE.MeshPhysicalMaterial({
        metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03
    });

    glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
    });

    redMaterial = new THREE.MeshStandardMaterial({
        color: 0xbf3030, metalness: 1.0, roughness: 0.5
    });

    greenMaterial = new THREE.MeshStandardMaterial({
        color: 0x5bb73b, metalness: 1.0, roughness: 0.5
    });

    // Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('js/Draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('models/PTC_Aachen.glb', function (gltf) {
        glbModel = gltf.scene;
        glbModel.scale.set(.7, .7, .7);
        // glbModel.position.set(0, 0, 0);
        scene.add(glbModel);
        glbModel.traverse(function (node) {
            if (node.isMesh || node.isLight) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        })
    });

    creatPlane("plane1", 1.7, 1.7, -5, 1) //CAG
    creatPlane("plane2", -3, 2.2, 0, 2) //HFL
    creatPlane("plane3", 0.7, 2, -3.5, 3) //LC
    creatPlane("plane4", 0, 2.2, -0, 4) //LM
    creatPlane("plane5", -2.5, 1.4, -3.5, 5) //LV

    for (let i = 0; i < planes.length; i++) {
        box[i] = [];
        textMesh[i] = [];
        dialModel[i] = [];
    }
    for (let i = 0; i < planes.length; i++) {
        createBox(planes[i], -.5, -.3, 0, i, 0);
        createBox(planes[i], -0, -.3, 0, i, 1);
        createBox(planes[i], .5, -.3, 0, i, 2);

        loadDial(planes[i], -.5, -.1, 0, "p" + i + "Dial", i, 0)
        loadDial(planes[i], 0, -.1, 0, "p" + i + "Dial", i, 1)
        loadDial(planes[i], .5, -.1, 0, "p" + i + "Dial", i, 2)

        const geometry = new THREE.PlaneGeometry(1.5, .2);
        const material = new THREE.MeshBasicMaterial({ color: 0x000e69, side: THREE.DoubleSide });
        let blueP1 = new THREE.Mesh(geometry, material);
        blueP1.position.set(0, .4, 0.01);
        planes[i].add(blueP1);
    }
    setTimeout(() => {
        ajaxCall();
    }, 3000);
}

function loadDial(planeNm, x, y, z, dName, index, dId) {
    let dial = dName + dId;
    let modelD = 'models/Dial.glb';
    if (dId == 2) modelD = 'models/Dial 1.glb';
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('js/Draco/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(modelD, function (gltf) {
        dial = gltf.scene;
        dial.traverse(function (node) {
            if (node.isMesh || node.isLight) {
                node.castShadow = true;
                node.receiveShadow = false;
            }

        });

        dial.scale.set(.1, .1, .1);
        dial.rotation.set(1.55, 0, 0);
        dial.position.set(x, y, .019);
        planeNm.add(dial);
        dialModel[index][dId] = dial;
    });

}

function creatPlane(planeNm, x, y, z, id) {
    const geometry = new THREE.PlaneGeometry(1.5, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    planeNm = new THREE.Mesh(geometry, material);
    planeNm.position.set(x, y, z);
    planeNm.castShadow = true;
    planeNm.receiveShadow = true;
    scene.add(planeNm);
    planes[id - 1] = planeNm;
}

function createBox(planeName, x, y, z, index, bId) {
    let boxName = index + "Box" + bId;
    const geometry = new THREE.BoxGeometry(.13, .07, .001);
    const material = new THREE.MeshBasicMaterial({ color: 0x5bb73b });
    geometry.center();
    boxName = new THREE.Mesh(geometry, material);
    boxName.position.set(x, y, z);
    planeName.add(boxName);
    box[index][bId] = boxName;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {
    // console.log("iS")
    for (let i = 0; i < planes.length; i++) {
        planes[i].lookAt(camera.position)
    }
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}

setInterval(ajaxCall, 30000);
// setInterval(dialFn, 5000);
init();
function dialFn() {
    if (dialModel[0][0]) {
        // console.log(dialModel[0][0].getObjectByName('Needle'))
        console.log(dialModel[0][0].getObjectByName('Needle').material)

        for (let i = 0; i < dialModel[0][0].children.length; i++) {
            // console.log(dialModel[0][0].children[i].name)
            // dialModel[i][j].getObjectByName('Needle').children[1].material = redMaterial
            //     if (dialModel[0][0].children[i].children.length > 0) {
            //         for (let j = 0; j < dialModel[0][0].children[i].children.length; j++) {
            //             // dialModel[0][0].children[i].material

            //             dialModel[0][0].children[i].children[j].material = dialMaterial
            //         }
            //     }
            //     else {
            //         dialModel[0][0].children[i].material = dialMaterial
            //     }
            //     dialModel[0][0].castShadow = true
        }
    }
}

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

        for (let i = 0; i < planes.length; i++) {
            for (let j = 0; j < 7; j++) {
                if (j > 3) {
                    planes[i].remove(textMesh[i][j]);
                }
            }
        }

        for (let i = 0; i < planes.length; i++) {
            for (let j = 0; j < 3; j++) {
                if (dialModel[i][j]) {
                    dialLoaded = true;
                    if (j == 0) {
                        if (jData.rows[i].Current > 50) {
                            dialModel[i][j].getObjectByName('Needle').material = redMaterial;
                            box[i][j].material.color = new THREE.Color(0xbf3030);
                        } else {
                            dialModel[i][j].getObjectByName('Needle').material = greenMaterial;
                            box[i][j].material.color = new THREE.Color(0x5bb73b);
                        }
                        dialModel[i][j].getObjectByName('Needle').rotation.y = jData.rows[i].Current * (-2.3 / 50);
                    }
                    else if (j == 1) {
                        if (jData.rows[i].Power > 50) {
                            dialModel[i][j].getObjectByName('Needle').material = redMaterial;
                            box[i][j].material.color = new THREE.Color(0xbf3030);
                        } else {
                            dialModel[i][j].getObjectByName('Needle').material = greenMaterial;
                            box[i][j].material.color = new THREE.Color(0x5bb73b);
                        }
                        dialModel[i][j].getObjectByName('Needle').rotation.y = jData.rows[i].Power * (-2.3 / 50);
                    }
                    else if (j == 2) {
                        if (jData.rows[i].Voltage > 400 && jData.rows[i].Voltage < 500) {
                            dialModel[i][j].getObjectByName('Needle1').material = greenMaterial;
                            box[i][j].material.color = new THREE.Color(0x5bb73b);
                        }
                        else {
                            dialModel[i][j].getObjectByName('Needle1').material = redMaterial;
                            box[i][j].material.color = new THREE.Color(0xbf3030);
                        }
                        let dataV = jData.rows[i].Voltage;
                        if (dataV == 0) dataV = 300;
                        dialModel[i][j].getObjectByName('Needle1').rotation.y = (dataV - 300) * (-2.3 / 150);
                    }
                }
            }
        }

        if (dialLoaded) {
            for (let i = 0; i < planes.length; i++) {
                if (canedit) {
                    loadText(jData.rows[i].AssetName, planes[i], 0, .37, 0.2, .05, i, 0, "p" + (i + 1) + "AssetName", whiteC);
                    loadText("Current Average (A)", planes[i], -.5, .13, 0, .025, i, 1, "p" + (i + 1) + "CurrentText", blackC);
                    loadText("Active Power (kW)", planes[i], 0, .13, 0, .025, i, 2, "p" + (i + 1) + "PowerText", blackC);
                    loadText("Line Voltage Average (V)", planes[i], .5, .13, 0, .025, i, 3, "p" + (i + 1) + "VoltageText", blackC);
                }
                loadText(jData.rows[i].Current, planes[i], -.5, -.3, 0, .025, i, 4, "p" + (i + 1) + "Current", blackC);
                loadText(jData.rows[i].Power, planes[i], 0, -.3, 0, .025, i, 5, "p" + (i + 1) + "Power", blackC);
                loadText(jData.rows[i].Voltage, planes[i], .5, -.3, 0, .025, i, 6, "p" + (i + 1) + "Voltage", blackC);
            }
            canedit = false;

        }
    });
}

function loadText(textArr, planeName, x, y, z, sz, index, tId, uname, clr) {
    // plane1Box1.material.color = new THREE.Color(0xbf3030);
    let textname = uname + tId;
    const fontLoad = new FontLoader();
    fontLoad.load('./fonts/helvetiker_regular.typeface.json', function (font) {
        const geometry = new TextGeometry(textArr, {
            font: font,
            size: sz,
            height: .005
        });
        const materials = [
            new THREE.MeshPhongMaterial({ color: clr }), // front
            new THREE.MeshPhongMaterial({ color: clr }) // side
        ];
        geometry.center();
        textname = new THREE.Mesh(geometry, materials);
        textname.position.set(x, y, z);
        textname.textAlign = 'center';
        planeName.add(textname)

        textMesh[index][tId] = textname;
    });
}