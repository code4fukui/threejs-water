//import { THREE } from "https://code4fukui.github.io/egxr.js/egxr.js";
import { loadFile } from "./loadFile.js";

export class Water {

  constructor(light, tiles, textureCube) {
    this.geometry = new THREE.PlaneGeometry(2, 2, 200, 200);

    const shadersPromises = [
      loadFile('shaders/water/vertex.glsl'),
      loadFile('shaders/water/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this.material = new THREE.RawShaderMaterial({
        uniforms: {
            light: { value: light },
            tiles: { value: tiles },
            sky: { value: textureCube },
            water: { value: null },
            causticTex: { value: null },
            underwater: { value: false },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
    });
  }

  draw(renderer, waterTexture, causticsTexture, camera) {
    this.material.uniforms['water'].value = waterTexture;
    this.material.uniforms['causticTex'].value = causticsTexture;

    this.material.side = THREE.FrontSide;
    this.material.uniforms['underwater'].value = true;
    renderer.render(this.mesh, camera);

    this.material.side = THREE.BackSide;
    this.material.uniforms['underwater'].value = false;
    renderer.render(this.mesh, camera);
  }

}