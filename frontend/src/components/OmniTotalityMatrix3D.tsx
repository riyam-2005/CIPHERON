import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmniTotalityMatrix3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000001);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 30, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3D Omni-Totality Reality Matrix Geometry Group
    const otGroup = new THREE.Group();

    // Hyper-Aleph Totality Manifold Torus Knot Geometry per Section 6.3
    const knotGeo = new THREE.TorusKnotGeometry(18, 6, 180, 36);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0xd8b4fe,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const otMesh = new THREE.Mesh(knotGeo, knotMat);
    otGroup.add(otMesh);

    // Inner glowing Totality vacuum singularity core
    const coreGeo = new THREE.SphereGeometry(5.0, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    otGroup.add(coreMesh);

    // Totality 10,000,000,000 Reality Anchor Particle Cloud
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 32 + (Math.random() - 0.5) * 10;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.95,
      transparent: true,
      opacity: 0.92,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    otGroup.add(particlePoints);

    scene.add(otGroup);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      otGroup.rotation.y += 0.009;
      otGroup.rotation.x += 0.005;

      particlePoints.rotation.y -= 0.007;

      // Pulse core scale to reflect Vacuum Singularity energy flux
      const pulse = 1.0 + Math.sin(elapsedTime * 4.5) * 0.18;
      coreMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      knotGeo.dispose();
      knotMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-purple-500/40 relative shadow-2xl shadow-purple-950/40 bg-slate-950/90">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-purple-500/30 text-xs font-mono text-purple-300">
        <div className="text-purple-400 font-bold mb-1">
          ABSOLUTE OMNI-TOTALITY — MANIFOLD M_aleph_inf+inf | TOTALITY REALITY LOCK: ACTIVE | TOTALITY POWER: &gt;10⁴⁸ W/cm³
        </div>
        <div className="text-slate-400 text-[11px] flex gap-4">
          <span>Rank: ℵ_∞+∞</span>
          <span>Homological: Ψ ≈ 2.718282</span>
          <span>Anchors: 10,000,000,000</span>
          <span>Decouple: &lt;1ps SLA</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OmniTotalityMatrix3D;
