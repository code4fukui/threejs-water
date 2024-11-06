//import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js";
//import TrackballControls from "https://cdn.jsdelivr.net/npm/three-trackballcontrols@0.9.0/index.min.js";
import { WaterSim } from "./WaterSim.js";

const canvas = document.getElementById('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;

const width = canvas.width;
const height = canvas.height;

// Create Renderer
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
camera.position.set(0.426, 0.677 + 0.8, -2.095 + 0.5);
camera.rotation.set(2.828, 0.191, 3.108);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
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

  //const radius = 0.03;
  //const strength = 0.04;
  const radius = 0.1;
  const strength = 0.01;
  for (let intersect of intersects) {
    watersim.addDrop(renderer, intersect.point.x, intersect.point.z, radius, strength);
  }
}

canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

//const radius = 0.03;
const radius = 0.3;
//const strength = 0.02;
const strength = 0.2;
for (let i = 0; i < 20; i++) {
  watersim.addDrop(
    renderer,
    Math.random() * 2 - 1, Math.random() * 2 - 1,
    radius, ((i & 1) ? 1 : -1) * strength
  );
}

animate();

setInterval(() => {
  const radius = 0.03;
  const strength = 0.02;
  const ndrops = 3;
  for (let i = 0; i < ndrops; i++) {
    watersim.addDrop(
      renderer,
      Math.random() * 2 - 1, Math.random() * 2 - 1,
      radius, strength
    );
  }
}, 100);
