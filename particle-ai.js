import * as THREE from 'three';

// ======= Particle AI Head =======
class ParticleAIHead {
    constructor() {
        this.container = document.getElementById('particleCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.points = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.pulse = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.time = 0;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createParticleHead();
        this.createLights();
        this.addEventListeners();
        this.animate();
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
        // Main head shape - more human-like
        const POINT_COUNT = 30000;
        const positions = new Float32Array(POINT_COUNT * 3);
        const colors = new Float32Array(POINT_COUNT * 3);
        const sizes = new Float32Array(POINT_COUNT);

        for (let i = 0; i < POINT_COUNT; i++) {
            const i3 = i * 3;
            
            // Create realistic head shape
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            
            // Head shape - more oval, flatter back
            let r = 1.0;
            if (theta < Math.PI * 0.3) {
                // Top of head - flatter
                r = 0.8 + 0.2 * Math.cos(theta * 3);
            } else if (theta > Math.PI * 0.7) {
                // Chin area - more pointed
                r = 0.9 + 0.1 * Math.sin((theta - Math.PI * 0.7) * 2);
            } else {
                // Middle section - more rounded
                r = 1.0 + 0.1 * Math.cos(theta * 2);
            }
            
            // Flatten the back
            if (phi > Math.PI * 0.5 && phi < Math.PI * 1.5) {
                r *= 0.6;
            }
            
            // Position
            const x = r * Math.sin(theta) * Math.cos(phi) * 0.85;
            const y = r * Math.cos(theta) * 1.2 - 0.1;
            const z = r * Math.sin(theta) * Math.sin(phi) * 0.9;
            
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            // Colors - blue-cyan gradient
            const intensity = Math.random();
            colors[i3] = 0.1 + 0.9 * intensity;
            colors[i3 + 1] = 0.4 + 0.6 * intensity;
            colors[i3 + 2] = 0.8 + 0.2 * intensity;
            
            sizes[i] = Math.random() * 0.08 + 0.04;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.headPoints = new THREE.Points(geometry, material);
        this.scene.add(this.headPoints);
    }

    createEyes() {
        // Left eye
        const leftEyeGeometry = new THREE.BufferGeometry();
        const leftEyePositions = new Float32Array(2000 * 3);
        const leftEyeColors = new Float32Array(2000 * 3);
        
        for (let i = 0; i < 2000; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.15;
            
            leftEyePositions[i3] = -0.3 + Math.cos(angle) * radius;
            leftEyePositions[i3 + 1] = 0.2 + Math.sin(angle) * radius;
            leftEyePositions[i3 + 2] = 0.9;
            
            leftEyeColors[i3] = 0.0;
            leftEyeColors[i3 + 1] = 0.8;
            leftEyeColors[i3 + 2] = 1.0;
        }
        
        leftEyeGeometry.setAttribute('position', new THREE.BufferAttribute(leftEyePositions, 3));
        leftEyeGeometry.setAttribute('color', new THREE.BufferAttribute(leftEyeColors, 3));
        
        const leftEye = new THREE.Points(leftEyeGeometry, new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(leftEye);

        // Right eye
        const rightEyeGeometry = new THREE.BufferGeometry();
        const rightEyePositions = new Float32Array(2000 * 3);
        const rightEyeColors = new Float32Array(2000 * 3);
        
        for (let i = 0; i < 2000; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.15;
            
            rightEyePositions[i3] = 0.3 + Math.cos(angle) * radius;
            rightEyePositions[i3 + 1] = 0.2 + Math.sin(angle) * radius;
            rightEyePositions[i3 + 2] = 0.9;
            
            rightEyeColors[i3] = 0.0;
            rightEyeColors[i3 + 1] = 0.8;
            rightEyeColors[i3 + 2] = 1.0;
        }
        
        rightEyeGeometry.setAttribute('position', new THREE.BufferAttribute(rightEyePositions, 3));
        rightEyeGeometry.setAttribute('color', new THREE.BufferAttribute(rightEyeColors, 3));
        
        const rightEye = new THREE.Points(rightEyeGeometry, new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
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
            
            noseColors[i3] = 0.2;
            noseColors[i3 + 1] = 0.6;
            noseColors[i3 + 2] = 0.9;
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
            mouthColors[i3 + 1] = 0.9;
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
        // Add some random particles around the face for detail
        const detailGeometry = new THREE.BufferGeometry();
        const detailPositions = new Float32Array(5000 * 3);
        const detailColors = new Float32Array(5000 * 3);
        
        for (let i = 0; i < 5000; i++) {
            const i3 = i * 3;
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            const r = 0.8 + Math.random() * 0.4;
            
            detailPositions[i3] = r * Math.sin(theta) * Math.cos(phi) * 0.85;
            detailPositions[i3 + 1] = r * Math.cos(theta) * 1.2 - 0.1;
            detailPositions[i3 + 2] = r * Math.sin(theta) * Math.sin(phi) * 0.9;
            
            const intensity = Math.random() * 0.5;
            detailColors[i3] = 0.1 + intensity;
            detailColors[i3 + 1] = 0.3 + intensity;
            detailColors[i3 + 2] = 0.6 + intensity;
        }
        
        detailGeometry.setAttribute('position', new THREE.BufferAttribute(detailPositions, 3));
        detailGeometry.setAttribute('color', new THREE.BufferAttribute(detailColors, 3));
        
        const details = new THREE.Points(detailGeometry, new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(details);
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

        // Audio toggle
        const toggleAudioBtn = document.getElementById('toggleAudio');
        toggleAudioBtn.addEventListener('click', async () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const source = this.audioContext.createMediaStreamSource(stream);
                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 512;
                    source.connect(this.analyser);
                    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                    toggleAudioBtn.textContent = '🎤 Mic Enabled';
                    toggleAudioBtn.style.background = 'rgba(0, 191, 255, 0.2)';
                } catch (err) {
                    toggleAudioBtn.textContent = '🎤 Mic Denied';
                    console.warn('Microphone access denied:', err);
                }
            }
        });

        // Text input for pulse effect
        const textInput = document.getElementById('textInput');
        textInput.addEventListener('keydown', () => {
            this.pulse = 1.0;
        });

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

        // Smooth rotation for the main head
        if (this.headPoints) {
            this.headPoints.rotation.y += (this.targetRotationY - this.headPoints.rotation.y) * 0.08;
            this.headPoints.rotation.x += (this.targetRotationX - this.headPoints.rotation.x) * 0.06;
        }

        // Audio reactive scaling
        let audioLevel = 0.0;
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            let sum = 0;
            for (let i = 10; i < 90; i++) {
                sum += this.dataArray[i];
            }
            audioLevel = (sum / 80) / 255.0;
        }

        // Decay pulse
        this.pulse *= 0.92;

        // Apply audio and pulse effects to all head parts
        const scale = 1.0 + audioLevel * 0.3 + this.pulse * 0.2;
        this.scene.children.forEach(child => {
            if (child instanceof THREE.Points) {
                child.scale.setScalar(scale);
            }
        });

        // Breathing animation
        const breathing = 1.0 + Math.sin(this.time * 0.8) * 0.02;
        this.scene.children.forEach(child => {
            if (child instanceof THREE.Points) {
                child.scale.multiplyScalar(breathing);
            }
        });

        // Small camera movement
        this.camera.position.z = 4.5 + Math.sin(this.time * 0.4) * 0.1;
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