import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ForensicGrid3DProps {
  activePeersCount?: number;
  highlightPeerId?: string;
}

export const ForensicGrid3D: React.FC<ForensicGrid3DProps> = ({
  activePeersCount = 12,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Add Network Nodes (P2P Mesh Representation)
    const nodesGroup = new THREE.Group();
    const geometry = new THREE.SphereGeometry(0.75, 16, 16);
    const materialCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
    const materialPurple = new THREE.MeshBasicMaterial({ color: 0x8a2be2, wireframe: true });
    const materialEmerald = new THREE.MeshBasicMaterial({ color: 0x00e676, wireframe: true });

    const materials = [materialCyan, materialPurple, materialEmerald];
    const nodePositions: THREE.Vector3[] = [];

    const numNodes = Math.max(activePeersCount, 8);
    for (let i = 0; i < numNodes; i++) {
      const mesh = new THREE.Mesh(geometry, materials[i % materials.length]);
      const pos = new THREE.Vector3(
        (Math.sin((i / numNodes) * Math.PI * 2) * 12) + (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 8,
        (Math.cos((i / numNodes) * Math.PI * 2) * 12) + (Math.random() - 0.5) * 4
      );
      mesh.position.copy(pos);
      nodePositions.push(pos);
      nodesGroup.add(mesh);
    }

    // 3. Add Connecting Fiber Lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
    });

    const linePoints: THREE.Vector3[] = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 15) {
          linePoints.push(nodePositions[i], nodePositions[j]);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodesGroup.add(lines);

    // Center Core Globe
    const coreGeometry = new THREE.IcosahedronGeometry(3.5, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x1a365d, wireframe: true });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    nodesGroup.add(coreMesh);

    scene.add(nodesGroup);

    // 4. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      nodesGroup.rotation.y = elapsedTime * 0.12;
      coreMesh.rotation.x = elapsedTime * 0.08;
      coreMesh.rotation.z = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // 5. Handle Resize
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
      renderer.dispose();
      geometry.dispose();
      lineGeometry.dispose();
      coreGeometry.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [activePeersCount]);

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950/80 relative shadow-2xl shadow-cyan-950/30">
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur border border-cyan-500/40 px-3 py-1.5 rounded-lg text-cyan-400 text-xs font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>GLOBAL FORENSIC MESH — ACTIVE NODES: {activePeersCount}</span>
      </div>
      <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur border border-purple-500/40 px-3 py-1.5 rounded-lg text-purple-300 text-xs font-mono">
        PROTOCOL: libp2p / NOISE / IPFS DAG
      </div>
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[11px] font-mono text-slate-400">
        ROTATION: REAL-TIME WEBGL THREE.JS
      </div>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default ForensicGrid3D;
