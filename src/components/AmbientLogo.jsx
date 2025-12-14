import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const AmbientLogo = () => {
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2(0x000000, 0.03); // Setting fog to black matching background

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Sharpens text
        renderer.toneMapping = THREE.ReinhardToneMapping;

        // Append to ref
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // --- POST-PROCESSING ---
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6, 0.5, 0.1 // Softer bloom: Strength 0.6, Radius 0.5
        );

        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // --- MATERIALS ---
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.4, // Slightly rougher for softer reflections
            metalness: 0.6
        });

        const neonMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        // --- LOAD FONT ---
        const loader = new FontLoader();
        // Using a local or reliable URL for the font. 
        // Since we are in a React app, we can fetch from a CDN for simplicity as requested, 
        // or use a local asset if available. The snippet used unpkg.
        loader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            setLoading(false);

            const geometry = new TextGeometry('A', {
                font: font,
                size: 3,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });

            geometry.computeBoundingBox();
            const centerOffset = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            const centerOffsetY = - 0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
            geometry.translate(centerOffset, centerOffsetY, 0);

            const textMesh = new THREE.Mesh(geometry, baseMaterial);
            scene.add(textMesh);

            const wireframeMesh = new THREE.Mesh(geometry, neonMaterial);
            scene.add(wireframeMesh);
        });

        // --- ORBITALS ---
        const orbitGroup = new THREE.Group();
        scene.add(orbitGroup);

        const createOrb = (color) => {
            const geo = new THREE.SphereGeometry(0.1, 32, 32); // Smaller source
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const mesh = new THREE.Mesh(geo, mat);

            const light = new THREE.PointLight(color, 4, 15); // Much lower intensity (4), wider decay
            mesh.add(light);

            return mesh;
        };

        const orb1 = createOrb(0x00ffff); // Cyan
        const orb2 = createOrb(0xaa00ff); // Purple
        orbitGroup.add(orb1);
        orbitGroup.add(orb2);

        // --- PARTICLES ---
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 700;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // --- ANIMATION ---
        const clock = new THREE.Clock();
        let animationFrameId;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const time = clock.getElapsedTime();

            particlesMesh.rotation.y = time * 0.02; // Slower particles
            particlesMesh.rotation.x = time * 0.01;

            // Much slower, hypnotic orbits
            orb1.position.x = Math.sin(time * 0.3) * 4;
            orb1.position.z = Math.cos(time * 0.3) * 4;
            orb1.position.y = Math.sin(time * 0.5) * 1.5;

            orb2.position.x = Math.cos(time * 0.25) * 4.5;
            orb2.position.y = Math.sin(time * 0.2) * 2;
            orb2.position.z = Math.sin(time * 0.25) * 3;

            composer.render();
        };

        animate();

        // --- RESIZE ---
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // --- CLEANUP ---
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            composer.dispose();
        };
    }, []);

    return (
        <div ref={mountRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0, // Behind content
            background: '#000'
        }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'cyan',
                    fontFamily: 'sans-serif',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    zIndex: 10
                }}>
                    Loading 3D Model...
                </div>
            )}
        </div>
    );
};

export default AmbientLogo;
