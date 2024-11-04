import { loadFile } from "./loadFile.js";

export class Debug {

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);
    this._geometry = new THREE.PlaneBufferGeometry();

    const shadersPromises = [
      loadFile('shaders/debug/vertex.glsl'),
      loadFile('shaders/debug/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this._material = new THREE.RawShaderMaterial({
        uniforms: {
            texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this._mesh = new THREE.Mesh(this._geometry, this._material);
    });
  }

  draw(renderer, texture) {
    this._material.uniforms['texture'].value = texture;

    renderer.setRenderTarget(null);
    renderer.render(this._mesh, this._camera);
  }

}
