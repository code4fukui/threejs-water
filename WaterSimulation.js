//import { THREE } from "https://code4fukui.github.io/egxr.js/egxr.js";
import { loadFile } from "./loadFile.js";

export class WaterSimulation {

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

    this._geometry = new THREE.PlaneGeometry(2, 2);

    this._textureA = new THREE.WebGLRenderTarget(256, 256, { type: THREE.FloatType });
    this._textureB = new THREE.WebGLRenderTarget(256, 256, { type: THREE.FloatType });
    this.texture = this._textureA;

    const shadersPromises = [
      loadFile('shaders/simulation/vertex.glsl'),
      loadFile('shaders/simulation/drop_fragment.glsl'),
      loadFile('shaders/simulation/normal_fragment.glsl'),
      loadFile('shaders/simulation/update_fragment.glsl'),
    ];

    const deltat = 1 / 256 * .1; // for 120fps

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, dropFragmentShader, normalFragmentShader, updateFragmentShader]) => {
      const dropMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          center: { value: [0, 0] },
          radius: { value: 0 },
          strength: { value: 0 },
          texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: dropFragmentShader,
      });

      const normalMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          delta: { value: [deltat, deltat] },  // TODO: Remove this useless uniform and hardcode it in shaders?
          texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: normalFragmentShader,
      });

      const updateMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          delta: { value: [deltat, deltat] },  // TODO: Remove this useless uniform and hardcode it in shaders?
          texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: updateFragmentShader,
      });

      this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
      this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
      this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
    });
  }

  // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
  addDrop(renderer, x, y, radius, strength) {
    this._dropMesh.material.uniforms['center'].value = [x, y];
    this._dropMesh.material.uniforms['radius'].value = radius;
    this._dropMesh.material.uniforms['strength'].value = strength;

    this._render(renderer, this._dropMesh);
  }

  stepSimulation(renderer) {
    const now = performance.now();
    const fps = Math.max(Math.floor(1000 / (now - this._bkt)), 60);
    this._bkt = now;
    const d = fps > 60 ? 1 / 256 / 2 : 1 / 256; // fps 60 or 120
    const delta = [d, d];
    this._normalMesh.material.uniforms.delta.value = delta;
    this._updateMesh.material.uniforms.delta.value = delta;

    this._render(renderer, this._updateMesh);
  }

  updateNormals(renderer) {
    this._render(renderer, this._normalMesh);
  }

  _render(renderer, mesh) {
    // Swap textures
    const oldTexture = this.texture;
    const newTexture = this.texture === this._textureA ? this._textureB : this._textureA;

    mesh.material.uniforms['texture'].value = oldTexture.texture;

    renderer.setRenderTarget(newTexture);

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera);

    this.texture = newTexture;
  }

}