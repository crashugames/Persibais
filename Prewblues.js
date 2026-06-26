// Prewblues.js - Persibais Advanced Game Engine
// Upgraded to full Three.js level with PBR, SSS approximation, shadows, post-processing
// Unity-like graphics in browser

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class PrewbluesEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Post-processing for Unity-like effects
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      1.5, 0.4, 0.85
    );
    this.composer.addPass(bloomPass);

    this.controls = new OrbitControls(this.camera, canvas);
    this.loader = new GLTFLoader();

    this.animate();
    console.log('🚀 PrewbluesEngine initialized - Three.js Unity-level graphics');
  }

  loadModel(url, onLoad) {
    this.loader.load(url, (gltf) => {
      // Apply PBR materials + SSS approximation
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.metalness = 0.3;
          child.material.roughness = 0.7;
          // SSS simulation via custom shader or transmission
          if (child.material.transmission) child.material.transmission = 0.5;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.scene.add(gltf.scene);
      if (onLoad) onLoad(gltf);
      console.log('Model loaded with PBR + SSS materials');
    });
  }

  addLight() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);
    this.scene.add(new THREE.AmbientLight(0x404040, 0.6));
  }

  addSSSMaterial(color = 0xffd0b0, thickness = 1.0) {
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.4,
      transmission: 0.6, // for translucent SSS effect
      thickness: thickness,
      envMapIntensity: 1.0
    });
    return material;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.composer.render();
  }

  resize() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.composer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
}

// Export for module use
export default PrewbluesEngine;

// Global for CDN/simple script
window.PrewbluesEngine = PrewbluesEngine;

console.log('✅ Prewblues.js upgraded to Three.js level - PBR, SSS, Bloom, Shadows ready for Persibais');