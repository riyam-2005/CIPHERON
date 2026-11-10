import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface OcularGazeTracker3DProps {
  gazeDirection?: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  pupilEntropy?: number;
  activeAoi?: number;
  pupilDiameterMm?: number;
  standingPotentialMv?: number;
}

export const OcularGazeTracker3D: React.FC<OcularGazeTracker3DProps> = ({
  gazeDirection = 'CENTER',
  pupilEntropy = 7.84,
  activeAoi = 0,
  pupilDiameterMm = 3.5,
  standingPotentialMv = 0.72
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyeGroupRef = useRef<THREE.Group | null>(null);
  const targetLineRef = useRef<THREE.Line | null>(null);
  const aoiMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 384;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Eyeball 3D Sphere Geometry
    const eyeGroup = new THREE.Group();
    eyeGroupRef.current = eyeGroup;

    // Sclera (wireframe outer eyeball)
    const scleraGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const scleraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const scleraMesh = new THREE.Mesh(scleraGeo, scleraMat);
    eyeGroup.add(scleraMesh);

    // Cornea/Iris Ring
    const irisGeo = new THREE.RingGeometry(0.8, 1.8, 32);
    const irisMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide
    });
    const irisMesh = new THREE.Mesh(irisGeo, irisMat);
    irisMesh.position.set(0, 0, 3.1);
    eyeGroup.add(irisMesh);

    // Pupil (dynamic dilation)
    const pupilRadius = 0.3 + (pupilDiameterMm / 10.0);
    const pupilGeo = new THREE.CircleGeometry(pupilRadius, 32);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
    pupilMesh.position.set(0, 0, 3.15);
    eyeGroup.add(pupilMesh);

    scene.add(eyeGroup);

    // 4 Areas of Interest (AOIs) target spheres
    const aoiPositions = [
      new THREE.Vector3(-6, 4, 2),  // AOI 0: Top-Left
      new THREE.Vector3(6, 4, 2),   // AOI 1: Top-Right
      new THREE.Vector3(6, -4, 2),  // AOI 2: Bottom-Right
      new THREE.Vector3(-6, -4, 2)  // AOI 3: Bottom-Left
    ];

    const aoiMeshes: THREE.Mesh[] = [];
    aoiPositions.forEach((pos, idx) => {
      const aoiGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const aoiMat = new THREE.MeshBasicMaterial({
        color: idx === activeAoi ? 0x38bdf8 : 0x1e293b,
        wireframe: true
      });
      const aoiMesh = new THREE.Mesh(aoiGeo, aoiMat);
      aoiMesh.position.copy(pos);
      scene.add(aoiMesh);
      aoiMeshes.push(aoiMesh);
    });
    aoiMeshesRef.current = aoiMeshes;

    // Gaze Vector Ray from eyeball to active AOI
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 3.15),
      aoiPositions[activeAoi % 4]
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.7
    });
    const targetLine = new THREE.Line(lineGeo, lineMat);
    targetLineRef.current = targetLine;
    scene.add(targetLine);

    // Ambient particles around the ocular field
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 24;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (eyeGroupRef.current) {
        // Target rotation based on gazeDirection
        let targetRotY = 0;
        let targetRotX = 0;

        switch (gazeDirection) {
          case 'LEFT': targetRotY = -0.45; break;
          case 'RIGHT': targetRotY = 0.45; break;
          case 'UP': targetRotX = -0.35; break;
          case 'DOWN': targetRotX = 0.35; break;
          case 'CENTER':
          default:
            targetRotY = Math.sin(Date.now() * 0.001) * 0.08;
            targetRotX = Math.cos(Date.now() * 0.001) * 0.04;
            break;
        }

        eyeGroupRef.current.rotation.y += (targetRotY - eyeGroupRef.current.rotation.y) * 0.1;
        eyeGroupRef.current.rotation.x += (targetRotX - eyeGroupRef.current.rotation.x) * 0.1;
      }

      particles.rotation.y += 0.001;
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
      renderer.dispose();
    };
  }, [gazeDirection, activeAoi, pupilDiameterMm]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-sky-500/30 relative bg-[#020617] shadow-lg shadow-sky-950/20">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-sky-500/20 text-sky-400 text-xs font-mono flex flex-col space-y-1">
        <div className="font-bold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>OCULAR SYSTEM V21.0 — EOG BIOSIGNAL: ACTIVE</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          GAZE: <span className="text-sky-300 font-bold">{gazeDirection}</span> | PUPIL ENTROPY: <span className="text-emerald-400 font-bold">{pupilEntropy.toFixed(2)} BITS/BYTE</span>
        </div>
        <div className="text-slate-500 text-[10px]">
          CORNEO-RETINAL STANDING DIPOLE: {standingPotentialMv.toFixed(2)} mV | ACTIVE AOI: #{activeAoi}
        </div>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default OcularGazeTracker3D;
