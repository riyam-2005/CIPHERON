import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CFGNode, CFGEdge } from '../types';
import { Box, Eye, Layers, ShieldAlert, Cpu } from 'lucide-react';

interface ControlFlowGraph3DProps {
  nodes: CFGNode[];
  edges: CFGEdge[];
  onSelectNode?: (node: CFGNode) => void;
  selectedNodeId?: string | null;
}

export const ControlFlowGraph3D: React.FC<ControlFlowGraph3DProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<CFGNode | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  useEffect(() => {
    if (!mountRef.current || nodes.length === 0) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b14);

    // Subtle grid helper
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -6;
    scene.add(grid);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // 3. Node Meshes & Positions
    const nodeMeshes: { mesh: THREE.Mesh; node: CFGNode }[] = [];
    const nodePosMap = new Map<string, THREE.Vector3>();

    // Layout nodes along a vertical / helix tree
    const total = nodes.length;
    nodes.forEach((node, index) => {
      const angle = (index / Math.max(total - 1, 1)) * Math.PI * 3;
      const radius = 5.5;
      const x = Math.sin(angle) * radius;
      const y = 8 - (index / Math.max(total - 1, 1)) * 14;
      const z = Math.cos(angle) * (radius * 0.6);
      const pos = new THREE.Vector3(x, y, z);
      nodePosMap.set(node.id, pos);

      const isSelected = selectedNodeId === node.id;
      const hasCrypto = node.has_crypto;

      // Color coding: Red/Amber for crypto-containing basic block, Emerald for normal
      const color = hasCrypto
        ? 0xf43f5e
        : isSelected
        ? 0x38bdf8
        : 0x10b981;

      const geometry = new THREE.BoxGeometry(1.6, 0.9, 0.9);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: isSelected ? 0.6 : hasCrypto ? 0.4 : 0.15
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.userData = { node };
      scene.add(mesh);
      nodeMeshes.push({ mesh, node });

      // Add wireframe edge highlight
      const wireGeo = new THREE.EdgesGeometry(geometry);
      const wireMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0xffffff : 0x0284c7,
        linewidth: 1.5
      });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      mesh.add(wireframe);
    });

    // 4. Edges (Lines between basic blocks)
    edges.forEach((edge) => {
      const p1 = nodePosMap.get(edge.source);
      const p2 = nodePosMap.get(edge.target);
      if (!p1 || !p2) return;

      const points = [p1, p2];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const isCond = edge.type === 'COND_BRANCH';
      const lineMat = new THREE.LineBasicMaterial({
        color: isCond ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: isCond ? 0.85 : 0.5,
        linewidth: isCond ? 2 : 1
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });

    // 5. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map(m => m.mesh));
      if (intersects.length > 0) {
        const found = intersects[0].object.userData.node as CFGNode;
        setHoveredNode(found);
      } else {
        setHoveredNode(null);
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map(m => m.mesh));
      if (intersects.length > 0) {
        const found = intersects[0].object.userData.node as CFGNode;
        if (onSelectNode) onSelectNode(found);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 6. Animation Loop
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate) {
        angle += 0.006;
        camera.position.x = Math.sin(angle) * 16;
        camera.position.z = Math.cos(angle) * 16;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [nodes, edges, selectedNodeId, autoRotate, onSelectNode]);

  return (
    <div className="relative w-full h-[420px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-mono text-slate-300">WebGL 3D CFG</span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400 font-semibold">{nodes.length} Blocks</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400 font-semibold">{edges.length} Branches</span>
      </div>

      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {autoRotate ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-slate-400">Basic Block</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span className="text-slate-400">Crypto Primitive</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-0.5 bg-cyan-400" />
          <span className="text-slate-400">Fallthrough</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-0.5 bg-amber-400" />
          <span className="text-slate-400">Cond Branch</span>
        </div>
      </div>

      {/* Interactive Hover HUD */}
      {hoveredNode && (
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 shadow-lg text-xs max-w-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
            <span className="font-mono font-bold text-cyan-400">{hoveredNode.id}</span>
            <span className="font-mono text-slate-400">{hoveredNode.address}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500">Size: </span>
              <span className="font-mono">{hoveredNode.size_bytes}B</span>
            </div>
            <div>
              <span className="text-slate-500">Insts: </span>
              <span className="font-mono">{hoveredNode.instructions_count}</span>
            </div>
            <div>
              <span className="text-slate-500">Term: </span>
              <span className="font-mono text-amber-300">{hoveredNode.terminator}</span>
            </div>
            <div>
              <span className="text-slate-500">Crypto: </span>
              <span className={hoveredNode.has_crypto ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {hoveredNode.has_crypto ? 'DETECTED' : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
