import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OmniInfinityMatrix3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000003);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 28, 56);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3D Omni-Infinity Reality Matrix Geometry Group
    const oiGroup = new THREE.Group();

    // Hyper-Aleph Reality Manifold Torus Knot Geometry per Section 6.3
    const knotGeo = new THREE.TorusKnotGeometry(16, 5, 160, 32);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const oiMesh = new THREE.Mesh(knotGeo, knotMat);
    oiGroup.add(oiMesh);

    // Inner glowing Planck-density quantum singularity core
    const coreGeo = new THREE.SphereGeometry(4.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xe879f9,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    oiGroup.add(coreMesh);

    // Universal 1,000,000,000 Reality Anchor Particle Cloud
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 28 + (Math.random() - 0.5) * 8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.9,
      transparent: true,
      opacity: 0.92,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    oiGroup.add(particlePoints);

    scene.add(oiGroup);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      oiGroup.rotation.y += 0.008;
      oiGroup.rotation.x += 0.004;

      particlePoints.rotation.y -= 0.006;

      // Pulse core scale to reflect Planck zero-point energy flux
      const pulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.16;
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
          ABSOLUTE OMNI-INFINITY — MANIFOLD M_aleph_inf+1 | UNIVERSAL REALITY LOCK: ACTIVE | PLANCK POWER: &gt;10⁴² W/cm³
        </div>
        <div className="text-slate-400 text-[11px] flex gap-4">
          <span>Rank: ℵ_∞+1</span>
          <span>Homological: Φ ≈ 1.618034</span>
          <span>Anchors: 1,000,000,000</span>
          <span>Decouple: &lt;2ps SLA</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OmniInfinityMatrix3D;
