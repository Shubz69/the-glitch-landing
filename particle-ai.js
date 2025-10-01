import * as THREE from 'three';

// ======= Particle AI Head =======
class ParticleAIHead {
    constructor() {
        this.container = document.getElementById('particleCanvas');
        this.particlesBackground = document.getElementById('particlesBackground');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.points = null;
        this.pulse = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.time = 0;
        this.isVisible = false;
        this.scrollProgress = 0;
        
        this.init();
        this.initScrollEffects();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createParticleHead();
        this.createLights();
        this.createFreeFlowingParticles();
        this.addEventListeners();
        this.animate();
    }

    initScrollEffects() {
        // Create intersection observer for scroll-based appearance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.isVisible = true;
                    this.fadeInParticles();
                } else {
                    this.isVisible = false;
                    this.fadeOutParticles();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(this.container);

        // Track scroll progress
        window.addEventListener('scroll', () => {
            const rect = this.container.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            this.scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
        });
    }

    createFreeFlowingParticles() {
        // Create free-flowing particles that move around the entire viewport
        for (let i = 0; i < 300; i++) {
            this.createFloatingParticle();
        }
    }

    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random position across entire viewport
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size and opacity
        const size = Math.random() * 6 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.opacity = Math.random() * 0.8 + 0.1;
        
        // Random animation duration and delay
        const duration = Math.random() * 25 + 15;
        const delay = Math.random() * 5;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
        
        // Random movement pattern
        const pattern = Math.random();
        if (pattern < 0.3) {
            particle.classList.add('float-horizontal');
        } else if (pattern < 0.6) {
            particle.classList.add('float-vertical');
        } else {
            particle.classList.add('float-circular');
        }
        
        this.particlesBackground.appendChild(particle);
        
        // Remove and recreate particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                this.createFloatingParticle();
            }
        }, (duration + delay) * 1000);
    }

    fadeInParticles() {
        if (this.points) {
            this.points.material.opacity = 0.8;
        }
        this.particlesBackground.style.opacity = '1';
    }

    fadeOutParticles() {
        if (this.points) {
            this.points.material.opacity = 0.2;
        }
        this.particlesBackground.style.opacity = '0.3';
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background
    }

    createCamera() {
        const rect = this.container.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
        this.camera.position.set(0, 0, 4.5);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            canvas: this.container
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const rect = this.container.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
    }

    createParticleHead() {
        // Create multiple particle systems for different parts of the head
        this.createHeadOutline();
        this.createEyes();
        this.createNose();
        this.createMouth();
        this.createFaceDetails();
    }

    createHeadOutline() {
        // Main head shape - more refined and human-like
        const POINT_COUNT = 40000;
        const positions = new Float32Array(POINT_COUNT * 3);
        const colors = new Float32Array(POINT_COUNT * 3);
        const sizes = new Float32Array(POINT_COUNT);

        for (let i = 0; i < POINT_COUNT; i++) {
            const i3 = i * 3;
            
            // Create more refined head shape
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            
            // More realistic head proportions
            let r = 1.0;
            if (theta < Math.PI * 0.25) {
                // Forehead - flatter, more refined
                r = 0.85 + 0.15 * Math.cos(theta * 4);
            } else if (theta > Math.PI * 0.75) {
                // Chin area - more defined
                r = 0.9 + 0.1 * Math.sin((theta - Math.PI * 0.75) * 3);
            } else {
                // Cheek area - fuller
                r = 1.0 + 0.15 * Math.cos(theta * 1.5);
            }
            
            // Flatten the back more
            if (phi > Math.PI * 0.4 && phi < Math.PI * 1.6) {
                r *= 0.5;
            }
            
            // Position with better proportions
            const x = r * Math.sin(theta) * Math.cos(phi) * 0.9;
            const y = r * Math.cos(theta) * 1.3 - 0.05;
            const z = r * Math.sin(theta) * Math.sin(phi) * 0.95;
            
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            // Clean blue gradient - bright cyan center, deeper blue edges
            const centerDistance = Math.sqrt(x*x + y*y + z*z);
            const intensity = Math.max(0.5, 1.0 - centerDistance * 0.3) * (0.9 + Math.random() * 0.1);
            
            // Clean blue colors like reference image
            colors[i3] = 0.1 + 0.3 * intensity; // Deep blue
            colors[i3 + 1] = 0.6 + 0.4 * intensity; // Bright cyan
            colors[i3 + 2] = 0.9 + 0.1 * intensity; // Bright cyan
            
            sizes[i] = Math.random() * 0.06 + 0.03; // Smaller, more refined particles
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.headPoints = new THREE.Points(geometry, material);
        this.scene.add(this.headPoints);
    }

    createEyes() {
        // Left eye - closed eyelid
        const leftEyeGeometry = new THREE.BufferGeometry();
        const leftEyePositions = new Float32Array(3000 * 3);
        const leftEyeColors = new Float32Array(3000 * 3);
        
        for (let i = 0; i < 3000; i++) {
            const i3 = i * 3;
            // Create closed eyelid shape - curved line
            const t = Math.random();
            const angle = Math.PI * 0.3 + Math.PI * 0.4 * t; // Curved eyelid
            const radius = 0.12 + Math.random() * 0.08;
            
            leftEyePositions[i3] = -0.3 + Math.cos(angle) * radius;
            leftEyePositions[i3 + 1] = 0.2 + Math.sin(angle) * radius * 0.3; // Flatter curve
            leftEyePositions[i3 + 2] = 0.92;
            
            // Clean bright blue for closed eyes
            leftEyeColors[i3] = 0.0;
            leftEyeColors[i3 + 1] = 0.8;
            leftEyeColors[i3 + 2] = 1.0;
        }
        
        leftEyeGeometry.setAttribute('position', new THREE.BufferAttribute(leftEyePositions, 3));
        leftEyeGeometry.setAttribute('color', new THREE.BufferAttribute(leftEyeColors, 3));
        
        const leftEye = new THREE.Points(leftEyeGeometry, new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(leftEye);

        // Right eye - closed eyelid
        const rightEyeGeometry = new THREE.BufferGeometry();
        const rightEyePositions = new Float32Array(3000 * 3);
        const rightEyeColors = new Float32Array(3000 * 3);
        
        for (let i = 0; i < 3000; i++) {
            const i3 = i * 3;
            // Create closed eyelid shape - curved line
            const t = Math.random();
            const angle = Math.PI * 0.3 + Math.PI * 0.4 * t; // Curved eyelid
            const radius = 0.12 + Math.random() * 0.08;
            
            rightEyePositions[i3] = 0.3 + Math.cos(angle) * radius;
            rightEyePositions[i3 + 1] = 0.2 + Math.sin(angle) * radius * 0.3; // Flatter curve
            rightEyePositions[i3 + 2] = 0.92;
            
            // Clean bright blue for closed eyes
            rightEyeColors[i3] = 0.0;
            rightEyeColors[i3 + 1] = 0.8;
            rightEyeColors[i3 + 2] = 1.0;
        }
        
        rightEyeGeometry.setAttribute('position', new THREE.BufferAttribute(rightEyePositions, 3));
        rightEyeGeometry.setAttribute('color', new THREE.BufferAttribute(rightEyeColors, 3));
        
        const rightEye = new THREE.Points(rightEyeGeometry, new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(rightEye);
    }

    createNose() {
        const noseGeometry = new THREE.BufferGeometry();
        const nosePositions = new Float32Array(1000 * 3);
        const noseColors = new Float32Array(1000 * 3);
        
        for (let i = 0; i < 1000; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.08;
            
            nosePositions[i3] = Math.cos(angle) * radius;
            nosePositions[i3 + 1] = 0.0 + Math.sin(angle) * radius;
            nosePositions[i3 + 2] = 0.95;
            
            noseColors[i3] = 0.0;
            noseColors[i3 + 1] = 0.7;
            noseColors[i3 + 2] = 1.0;
        }
        
        noseGeometry.setAttribute('position', new THREE.BufferAttribute(nosePositions, 3));
        noseGeometry.setAttribute('color', new THREE.BufferAttribute(noseColors, 3));
        
        const nose = new THREE.Points(noseGeometry, new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(nose);
    }

    createMouth() {
        const mouthGeometry = new THREE.BufferGeometry();
        const mouthPositions = new Float32Array(1500 * 3);
        const mouthColors = new Float32Array(1500 * 3);
        
        for (let i = 0; i < 1500; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI;
            const radius = Math.random() * 0.12;
            
            mouthPositions[i3] = Math.cos(angle) * radius;
            mouthPositions[i3 + 1] = -0.25 + Math.sin(angle) * radius * 0.5;
            mouthPositions[i3 + 2] = 0.88;
            
            mouthColors[i3] = 0.0;
            mouthColors[i3 + 1] = 0.7;
            mouthColors[i3 + 2] = 1.0;
        }
        
        mouthGeometry.setAttribute('position', new THREE.BufferAttribute(mouthPositions, 3));
        mouthGeometry.setAttribute('color', new THREE.BufferAttribute(mouthColors, 3));
        
        const mouth = new THREE.Points(mouthGeometry, new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(mouth);
    }

    createFaceDetails() {
        // Add flowing particle trails that fade naturally into background
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(12000 * 3);
        const trailColors = new Float32Array(12000 * 3);
        
        for (let i = 0; i < 12000; i++) {
            const i3 = i * 3;
            
            // Create flowing trails that extend much further out
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            const r = 1.5 + Math.random() * 2.0; // Much further out for natural fade
            
            // Add wave motion to create flowing effect
            const wave = Math.sin(phi * 4 + this.time * 1.5) * 0.3;
            const flow = Math.sin(theta * 3) * 0.4;
            
            trailPositions[i3] = r * Math.sin(theta) * Math.cos(phi) * 0.9 + wave;
            trailPositions[i3 + 1] = r * Math.cos(theta) * 1.6 - 0.2 + flow;
            trailPositions[i3 + 2] = r * Math.sin(theta) * Math.sin(phi) * 0.9 + wave * 0.3;
            
            // Natural fade to transparent - clean blue gradient
            const distance = Math.sqrt(trailPositions[i3]**2 + trailPositions[i3+1]**2 + trailPositions[i3+2]**2);
            const fade = Math.max(0.0, 1.0 - (distance - 1.5) * 0.4); // Fade to completely transparent
            
            trailColors[i3] = 0.0 + 0.2 * fade; // Clean blue
            trailColors[i3 + 1] = 0.4 + 0.4 * fade; // Cyan
            trailColors[i3 + 2] = 0.8 + 0.2 * fade; // Bright cyan
        }
        
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
        
        const trails = new THREE.Points(trailGeometry, new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(trails);
        
        // Store reference for animation
        this.trailPoints = trails;
    }

    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point light for glow
        const pointLight = new THREE.PointLight(0x00BFFF, 1, 10);
        pointLight.position.set(0, 0, 3);
        this.scene.add(pointLight);
    }

    addEventListeners() {
        // Mouse movement
        this.container.addEventListener('pointermove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            this.targetRotationY = (x - 0.5) * 0.6;
            this.targetRotationX = (y - 0.5) * 0.3;
        }, { passive: true });

        // Remove audio and text input controls - no longer needed

        // Window resize
        window.addEventListener('resize', () => {
            const rect = this.container.getBoundingClientRect();
            this.camera.aspect = rect.width / rect.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(rect.width, rect.height);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;

        // Only animate when visible
        if (!this.isVisible) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Smooth rotation for the main head
        if (this.headPoints) {
            this.headPoints.rotation.y += (this.targetRotationY - this.headPoints.rotation.y) * 0.08;
            this.headPoints.rotation.x += (this.targetRotationX - this.headPoints.rotation.x) * 0.06;
        }

        // Scale based on scroll progress
        const scale = 0.5 + this.scrollProgress * 0.5;
        this.scene.children.forEach(child => {
            if (child instanceof THREE.Points) {
                child.scale.setScalar(scale);
            }
        });

        // Breathing animation
        const breathing = 1.0 + Math.sin(this.time * 0.8) * 0.02;
        this.scene.children.forEach(child => {
            if (child instanceof THREE.Points && child !== this.trailPoints) {
                child.scale.multiplyScalar(breathing);
            }
        });

        // Animate flowing trails
        if (this.trailPoints) {
            const positions = this.trailPoints.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const phi = Math.atan2(positions[i + 2], positions[i]);
                const wave = Math.sin(phi * 3 + this.time * 2) * 0.1;
                positions[i] += wave * 0.01; // Gentle flowing motion
                positions[i + 2] += wave * 0.005;
            }
            this.trailPoints.geometry.attributes.position.needsUpdate = true;
        }

        // Camera movement based on scroll
        this.camera.position.z = 4.5 + Math.sin(this.time * 0.4) * 0.1 + this.scrollProgress * 0.5;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new ParticleAIHead();
        console.log('Particle AI Head initialized successfully');
    } catch (error) {
        console.error('Error initializing Particle AI Head:', error);
    }
});