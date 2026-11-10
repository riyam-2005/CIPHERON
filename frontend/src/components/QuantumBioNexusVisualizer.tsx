import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface QuantumBioNexusVisualizerProps {
  squeezingR?: number;
  membranePotential?: number;
  gcrPowerUw?: number;
  isTransmuted?: boolean;
}

export const QuantumBioNexusVisualizer: React.FC<QuantumBioNexusVisualizerProps> = ({
  squeezingR = 2.85,
  membranePotential = -70.0,
  gcrPowerUw = 28.5,
  isTransmuted = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010205);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 3, 60);
    purpleLight.position.set(0, 10, 10);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.5, 50);
    cyanLight.position.set(-15, -8, -10);
    scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2, 40);
    goldLight.position.set(15, -6, 8);
    scene.add(goldLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. 3D Quantum Field Entanglement Lattice (Mode A and Mode B)
    const fieldGroup = new THREE.Group();
    const particleGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const particleMat = new THREE.MeshStandardMaterial({
      color: isTransmuted ? 0x94a3b8 : 0x8b5cf6,
      emissive: isTransmuted ? 0x1e293b : 0x6d28d9,
      emissiveIntensity: 0.6,
      wireframe: !isTransmuted,
      roughness: 0.2,
      metalness: 0.8,
    });

    const particles: THREE.Mesh[] = [];
    const particleCount = isTransmuted ? 60 : 36;

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeo, particleMat);
      if (isTransmuted) {
        // Dispersed noble gas atom cloud
        particle.position.set(
          (Math.random() - 0.5) * 36,
          (Math.random() - 0.5) * 28,
          (Math.random() - 0.5) * 36
        );
      } else {
        // Structured EPR bipartite lattice
        const modeOffset = i % 2 === 0 ? -7 : 7;
        particle.position.set(
          modeOffset + (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 16
        );
      }
      fieldGroup.add(particle);
      particles.push(particle);
    }

    // EPR Quantum Entanglement Correlation Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: isTransmuted ? 0x334155 : 0xa855f7,
      transparent: true,
      opacity: isTransmuted ? 0.05 : 0.45,
    });

    if (!isTransmuted) {
      for (let i = 0; i < 18; i++) {
        const p1 = particles[i * 2];
        const p2 = particles[i * 2 + 1];
        if (p1 && p2) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([p1.position, p2.position]);
          const line = new THREE.Line(lineGeo, lineMat);
          fieldGroup.add(line);
        }
      }
    }

    masterGroup.add(fieldGroup);

    // 2. Bio-Inorganic Lipid Bilayer Ion-Channel Plane (Memristive Interface)
    const bioGroup = new THREE.Group();
    const planeGeo = new THREE.PlaneGeometry(22, 14, 16, 10);
    const planeMat = new THREE.MeshStandardMaterial({
      color: isTransmuted ? 0x1e293b : 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const membranePlane = new THREE.Mesh(planeGeo, planeMat);
    membranePlane.rotation.x = -Math.PI / 2.4;
    membranePlane.position.y = -6;
    bioGroup.add(membranePlane);

    // Memristive Gate Nanowire Junctions
    const junctionGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const junctionColor = membranePotential > 0 ? 0x10b981 : 0x06b6d4;
    const junctionMat = new THREE.MeshBasicMaterial({ color: isTransmuted ? 0x475569 : junctionColor });
    for (let x = -8; x <= 8; x += 4) {
      for (let z = -5; z <= 5; z += 3.5) {
        const junction = new THREE.Mesh(junctionGeo, junctionMat);
        junction.position.set(x, -5.8, z);
        bioGroup.add(junction);
      }
    }
    masterGroup.add(bioGroup);

    // 3. Galactic Cosmic Ray (GCR) Proton Cascade Ionization Rays
    const cosmicRaysGroup = new THREE.Group();
    const rayMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
    });
    for (let r = 0; r < 6; r++) {
      const topPoint = new THREE.Vector3((Math.random() - 0.5) * 20, 16, (Math.random() - 0.5) * 16);
      const bottomPoint = new THREE.Vector3(topPoint.x + (Math.random() - 0.5) * 4, -8, topPoint.z + (Math.random() - 0.5) * 4);
      const rayGeo = new THREE.BufferGeometry().setFromPoints([topPoint, bottomPoint]);
      const rayLine = new THREE.Line(rayGeo, rayMat);
      cosmicRaysGroup.add(rayLine);
    }
    masterGroup.add(cosmicRaysGroup);

    // Animation Loop
    let animationFrameId: number;
    let t = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.01;

      if (!isTransmuted) {
        fieldGroup.rotation.y += 0.003;
        fieldGroup.rotation.z += 0.001;
        bioGroup.rotation.y = Math.sin(t * 0.5) * 0.04;

        // Pulse particle luminescence
        particles.forEach((p, idx) => {
          p.position.y += Math.sin(t * 2 + idx) * 0.008;
        });
      } else {
        // Disintegration expansion
        particles.forEach((p) => {
          p.position.x += (Math.random() - 0.5) * 0.05;
          p.position.y += Math.random() * 0.03;
          p.position.z += (Math.random() - 0.5) * 0.05;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
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
      renderer.dispose();
    };
  }, [squeezingR, membranePotential, gcrPowerUw, isTransmuted]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-purple-500/30 relative bg-[#010205]">
      {/* Top Banner Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isTransmuted ? 'bg-red-500 animate-ping' : 'bg-purple-400 animate-pulse'}`} />
          <span>
            {isTransmuted
              ? 'ZEROIZED: SILICON TRANSMUTED TO INERT NOBLE GAS (<10ns SLA)'
              : 'NEXUS ARCHITECTURE — QUANTUM FIELD ENTANGLEMENT (EPR TMSV)'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-500/30 text-cyan-400">
            ION CHANNELS: 1,024
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/30 text-amber-400">
            GCR HARVEST: {gcrPowerUw.toFixed(1)} µW
          </div>
        </div>
      </div>

      {/* Squeezing and Membrane Potential Status Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded border border-purple-500/20">
          Squeezing <span className="text-purple-400 font-semibold">{squeezingR.toFixed(2)} dB</span> | Fidelity{' '}
          <span className="text-emerald-400 font-semibold">{isTransmuted ? '0.000' : '0.996'}</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded border border-cyan-500/20">
          Membrane Vm:{' '}
          <span className={`font-semibold ${membranePotential >= 30.0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {membranePotential.toFixed(1)} mV
          </span>{' '}
          {membranePotential >= 30.0 ? '(ACTION POTENTIAL SPIKE)' : '(RESTING)'}
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default QuantumBioNexusVisualizer;
