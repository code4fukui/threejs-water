//import { THREE } from "https://code4fukui.github.io/egxr.js/egxr.js";

export function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}
