//import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js";
//import TrackballControls from "https://cdn.jsdelivr.net/npm/three-trackballcontrols@0.9.0/index.min.js";
import { WaterSim } from "./WaterSim.js";

const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

// Create Renderer
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
camera.position.set(0.426, 0.677, -2.095);
camera.rotation.set(2.828, 0.191, 3.108);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(width, height);
renderer.autoClear = false;

// Create mouse Controls
const controls = new THREE.TrackballControls(camera, canvas);
//const controls = new TrackballControls(camera, canvas);

controls.screen.width = width;
controls.screen.height = height;

controls.rotateSpeed = 2.5;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.9;
controls.dynamicDampingFactor = 0.9;

// Ray caster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const targetgeometry = new THREE.PlaneGeometry(2, 2);
for (const vertex of targetgeometry.vertices) {
  vertex.z = -vertex.y;
  vertex.y = 0.;
}
const targetmesh = new THREE.Mesh(targetgeometry);

const watersim = await WaterSim.create();

// Main rendering loop
function animate() {
  watersim.draw(renderer, camera);

  controls.update();

  window.requestAnimationFrame(animate);
  //setTimeout(animate, 1000 / 60);
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = (event.clientX - rect.left) * 2 / width - 1;
  mouse.y = - (event.clientY - rect.top) * 2 / height + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(targetmesh);

  for (let intersect of intersects) {
    watersim.addDrop(renderer, intersect.point.x, intersect.point.z, 0.03, 0.04);
  }
}

canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

for (let i = 0; i < 20; i++) {
  watersim.addDrop(
    renderer,
    Math.random() * 2 - 1, Math.random() * 2 - 1,
    0.03, (i & 1) ? 0.02 : -0.02
  );
}

animate();
