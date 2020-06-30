import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";
//import * as dat from "dat.gui";

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container; //stats;
var camera, scene, renderer;

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  // CAMERA

  camera = new THREE.PerspectiveCamera(
    40,
    SCREEN_WIDTH / SCREEN_HEIGHT,
    1,
    10000
  );

  camera.position.set(0, 400, 600);

  // SCENE

  scene = new THREE.Scene();

  // LIGHTS

  var light = new THREE.DirectionalLight(0xaabbff, 0.3);
  light.position.x = 300;
  light.position.y = 250;
  light.position.z = -500;
  scene.add(light);

  // SKYDOME

  var vertexShader = document.getElementById("vertexShader").textContent;
  var fragmentShader = document.getElementById("fragmentShader").textContent;
  var uniforms = {
    topColor: { value: new THREE.Color(0x0077ff) },
    bottomColor: { value: new THREE.Color(0xffffff) },
    offset: { value: 400 },
    exponent: { value: 0.6 },
  };
  uniforms.topColor.value.copy(light.color);

  var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
  var skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide,
  });

  var sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  /*
  // the ground
  const groundGeometry = new THREE.PlaneBufferGeometry(500, 500);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x422d22 });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = Math.PI * -0.5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
  */

  //grass ground
  var grass_loader = new THREE.TextureLoader();
  var groundTexture = grass_loader.load("./src/jsm/grasslight-big.jpg");
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  groundTexture.anisotropy = 16;
  groundTexture.encoding = THREE.sRGBEncoding;

  var groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });

  var mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2000, 2000),
    groundMaterial
  );
  mesh.position.y = 0;
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // RENDERER

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // CONTROLS

  var controls = new OrbitControls(camera, renderer.domElement);

  controls.maxPolarAngle = (0.95 * Math.PI) / 2;
  controls.minPolarAngle = (0.3 * Math.PI) / 2;
  controls.enableZoom = true;
  controls.minDistance = 50;
  controls.maxDistance = 500;

  // limit panning
  var minPan = new THREE.Vector3(-500, -500, -500);
  var maxPan = new THREE.Vector3(500, 0, 0);
  var _v = new THREE.Vector3();

  controls.addEventListener("change", function () {
    _v.copy(controls.target);
    controls.target.clamp(minPan, maxPan);
    _v.sub(controls.target);
    camera.position.sub(_v);
  });

  var text_loader = new THREE.FontLoader();
  console.log("this worked");
  text_loader.load("./src/jsm/helvetiker_regular.typeface.json", function (
    font
  ) {
    var xMid, text;

    var color = 0xff6600;

    var matDark = new THREE.LineBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
    });

    var matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    var message = "   Three.js\nSimple text.";

    var shapes = font.generateShapes(message, 10);

    var geometry = new THREE.ShapeBufferGeometry(shapes);

    geometry.computeBoundingBox();

    xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 0, 0);

    // make shape ( N.B. edge view not visible )

    text = new THREE.Mesh(geometry, matLite);
    text.position.z = 0;
    text.position.y = 20;
    scene.add(text);
  }); //end load function
  // STATS
  console.log("after text loader");
  //stats = new Stats();
  //container.appendChild(stats.dom);

  // MODEL

  var loader = new THREE.ObjectLoader();
  loader.load("jsm/lightmap.json", function (object) {
    scene.add(object);
  });

  //

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  //stats.update();
}
