import { loadFile } from "./loadFile.js";
import { WaterSimulation } from "./WaterSimulation.js";
import { Caustics } from "./Caustics.js";
import { Water } from "./Water.js";
import { Pool } from "./Pool.js";
import { Debug } from "./Debug.js";

const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

// Shader chunks
THREE.ShaderChunk['utils'] = await loadFile('shaders/utils.glsl');

// Create Renderer
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
camera.position.set(0.426, 0.677, -2.095);
camera.rotation.set(2.828, 0.191, 3.108);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(width, height);
renderer.autoClear = false;

// Light direction
const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

// Create mouse Controls
const controls = new THREE.TrackballControls(camera, canvas);

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

// Textures
const cubetextureloader = new THREE.CubeTextureLoader();

const textureCube = cubetextureloader.load([
  'xpos.jpg', 'xneg.jpg',
  'ypos.jpg', 'ypos.jpg',
  'zpos.jpg', 'zneg.jpg',
]);

const textureloader = new THREE.TextureLoader();

const tiles = textureloader.load('tiles.jpg');

const waterSimulation = new WaterSimulation();
const water = new Water(light, tiles, textureCube);
const caustics = new Caustics(water.geometry, light);
const pool = new Pool(light, tiles);

const debug = new Debug();


// Main rendering loop
const white = new THREE.Color('white');
function animate() {
  waterSimulation.stepSimulation(renderer);
  waterSimulation.updateNormals(renderer);

  const waterTexture = waterSimulation.texture.texture;

  caustics.update(renderer, waterTexture);

  const causticsTexture = caustics.texture.texture;

  debug.draw(renderer, causticsTexture);

  renderer.setRenderTarget(null);
  renderer.setClearColor(white, 1);
  renderer.clear();

  water.draw(renderer, waterTexture, causticsTexture, camera);
  pool.draw(renderer, waterTexture, causticsTexture, camera);

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
    waterSimulation.addDrop(renderer, intersect.point.x, intersect.point.z, 0.03, 0.04);
  }
}

const loaded = [waterSimulation.loaded, caustics.loaded, water.loaded, pool.loaded, debug.loaded];
await Promise.all(loaded);

canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

for (let i = 0; i < 20; i++) {
  waterSimulation.addDrop(
    renderer,
    Math.random() * 2 - 1, Math.random() * 2 - 1,
    0.03, (i & 1) ? 0.02 : -0.02
  );
}

animate();
