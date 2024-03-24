import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  async ngOnInit() {
    // Create a scene
    this.scene = new THREE.Scene();

    // Create a camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Create a renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1.0);

    // Define colors for the groups
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff];

    for (let i = 0; i < 5; i++) {
      // Load the vector data
      const jsonData: number[][] = await fetch(`/assets/embeddings${i + 1}.json`).then(res => res.json());

      // Flatten array and convert to Float32Array
      const flattened: number[] = this.flattenArray(jsonData);
      const typedArray: Float32Array = new Float32Array(flattened);

      // Create a buffer geometry and set position attribute
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(typedArray, 3));

      // Create a point cloud
      const material = new THREE.PointsMaterial({ color: colors[i], size: 0.5, fog: false});
      const points = new THREE.Points(geometry, material);

      // Add the point cloud to the scene
      this.scene.add(points);
    }

    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    this.camera.position.z = 5;

    // Set up orbit controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.addEventListener('change', () => this.renderer.render(this.scene, this.camera));

    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

      this.renderer.render(this.scene, this.camera);
    };

    animate();

    alert("Use mouse to rotate and zoom in/out in the scene");
  }

  flattenArray(data: number[][]): number[] {
    return data.reduce((acc, val) => acc.concat(val), []);
  }
}
