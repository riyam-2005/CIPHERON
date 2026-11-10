import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmniSynapticMatrix3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 12, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Bio-Quantum Omni-Synaptic Matrix & Photonic Lattice
    const osGroup = new THREE.Group();

    // 1. Primary Torus Knot Geometry (suggestion-v23.md Section 5.3)
    const torusGeo = new THREE.TorusKnotGeometry(6, 2, 120, 24);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // Purple
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const osMesh = new THREE.Mesh(torusGeo, torusMat);
    osGroup.add(osMesh);

    // 2. Holographic Subconscious Memory Core (Inner Sphere)
    const coreGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    osGroup.add(coreMesh);

    // 3. Silicon Photonic Waveguide Particle Cloud (100 Tbps/mm^2)
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      const r = 8 + Math.random() * 5;
      positions[i * 3] = r * Math.sin(v) * Math.cos(u);
      positions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
      positions[i * 3 + 2] = r * Math.cos(v);

      // Alternate cyan and violet photons
      if (i % 2 === 0) {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.3;
        colors[i * 3 + 2] = 1.0;
      }
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    osGroup.add(particleCloud);

    // 4. Closed-loop Foveal Vector Axis
    const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, 18, 8);
    const axisMat = new THREE.MeshBasicMaterial({
      color: 0x00e676, // Green
      transparent: true,
      opacity: 0.5
    });
    const axisMesh = new THREE.Mesh(axisGeo, axisMat);
    axisMesh.rotation.z = Math.PI / 4;
    osGroup.add(axisMesh);

    scene.add(osGroup);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotational matrix dynamics (Section 5.3)
      osGroup.rotation.y += 0.007;
      osGroup.rotation.x += 0.003;

      // Gamma oscillation pulse (40-120Hz simulated envelope)
      const pulse = 1.0 + 0.08 * Math.sin(elapsedTime * 6.0);
      coreMesh.scale.set(pulse, pulse, pulse);

      // Particle cloud counter-rotation
      particleCloud.rotation.y -= 0.004;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      torusGeo.dispose();
      torusMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      axisGeo.dispose();
      axisMat.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-purple-500/30 relative shadow-2xl shadow-purple-950/20">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-purple-500/20 text-purple-300 text-xs font-mono flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
        <span>OMNI-SYNAPTIC MATRIX V24.0 — PHOTONIC INTERPOSER: 100 TBPS/MM² | GAMMA BAND: 85 Hz | zk-STARK: LOCKED</span>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OmniSynapticMatrix3D;
