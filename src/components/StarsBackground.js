import React, { useEffect } from 'react';
import * as THREE from 'three';

const StarsBackground = () => {
  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Add alpha to allow transparency

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a geometry and material for the stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 }); // You can adjust the size of the stars

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000; // Spread stars across the x-axis
      const y = (Math.random() - 0.5) * 2000; // Spread stars across the y-axis
      const z = (Math.random() - 0.5) * 2000; // Spread stars across the z-axis
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Set the camera position - ensure it's centered
    camera.position.z = 1.5; // Adjust distance from stars

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Optional: slight rotation for subtle movement
      stars.rotation.y += 0.001;  // Adjust rotation speed as needed

      renderer.render(scene, camera);
    };
    animate();

    // Clean up on component unmount
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
};

export default StarsBackground;
