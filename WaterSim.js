//import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js";
//import { THREE } from "https://code4fukui.github.io/egxr.js/egxr.js";
import { loadFile } from "./loadFile.js";
import { WaterSimulation } from "./WaterSimulation.js";
import { Caustics } from "./Caustics.js";
import { Water } from "./Water.js";
import { Pool } from "./Pool.js";
import { Debug } from "./Debug.js";

const white = new THREE.Color('white');
const black = new THREE.Color('black');
const gray = new THREE.Color('gray');
const bgcolor = gray;

export class WaterSim {
  static async create() {
    // Shader chunks
    THREE.ShaderChunk['utils'] = await loadFile('shaders/utils.glsl');

    // Light direction
    const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

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

    const loaded = [waterSimulation.loaded, caustics.loaded, water.loaded, pool.loaded, debug.loaded];
    await Promise.all(loaded);

    return new WaterSim(waterSimulation, water, caustics, pool, debug);
  }
  constructor(waterSimulation, water, caustics, pool, debug) {
    this.waterSimulation = waterSimulation;
    this.caustics = caustics;
    this.water = water;
    this.pool = pool;
    this.debug = debug;
  }
  draw(renderer, camera) {
    const waterSimulation = this.waterSimulation;
    const caustics = this.caustics;
    const debug = this.debug;
    const water = this.water;
    const pool = this.pool;

    waterSimulation.stepSimulation(renderer);
    waterSimulation.updateNormals(renderer);
    const waterTexture = waterSimulation.texture.texture;

    caustics.update(renderer, waterTexture);
    const causticsTexture = caustics.texture.texture;

    //debug.draw(renderer, causticsTexture);

    renderer.setRenderTarget(null);
    renderer.setClearColor(bgcolor, 1);
    renderer.clear();

    water.draw(renderer, waterTexture, causticsTexture, camera);
    pool.draw(renderer, waterTexture, causticsTexture, camera);
  }
  addDrop(renderer, x, y, radius, strength) {
    this.waterSimulation.addDrop(renderer, x, y, radius, strength);
  }
}
