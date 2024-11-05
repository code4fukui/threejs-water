//import { THREE } from "https://code4fukui.github.io/egxr.js/egxr.js";
//import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js";
import { loadFile } from "./loadFile.js";

const black = new THREE.Color('black');

export class Caustics {

  constructor(lightFrontGeometry, light) {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

    this._geometry = lightFrontGeometry;

    this.texture = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.UNSIGNED_BYTE});

    const shadersPromises = [
      loadFile('shaders/caustics/vertex.glsl'),
      loadFile('shaders/caustics/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      const material = new THREE.RawShaderMaterial({
        uniforms: {
            light: { value: light },
            water: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this._causticMesh = new THREE.Mesh(this._geometry, material);
    });
  }

  update(renderer, waterTexture) {
    this._causticMesh.material.uniforms['water'].value = waterTexture;

    renderer.setRenderTarget(this.texture);
    renderer.setClearColor(black, 0);
    renderer.clear();

    // TODO Camera is useless here, what should be done?
    renderer.render(this._causticMesh, this._camera);
  }

}
