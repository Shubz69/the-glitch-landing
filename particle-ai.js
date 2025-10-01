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
        // Create particle geometry
        const POINT_COUNT = 50000; // Reduced for better performance
        const positions = new Float32Array(POINT_COUNT * 3);
        const colors = new Float32Array(POINT_COUNT * 3);
        const sizes = new Float32Array(POINT_COUNT);

        // Sample points on a head-like shape
        for (let i = 0; i < POINT_COUNT; i++) {
            const i3 = i * 3;
            
            // Create head-like distribution
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            
            // Head shape parameters
            const r = 1.0 + 0.1 * Math.cos(theta * 2) - 0.2 * Math.sin(theta);
            
            // Position
            const x = r * Math.sin(theta) * Math.cos(phi) * 0.8;
            const y = r * Math.cos(theta) * 1.1 - 0.1;
            const z = r * Math.sin(theta) * Math.sin(phi) * 0.9;
            
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            // Colors (blue-cyan gradient)
            const intensity = Math.random();
            colors[i3] = 0.2 + 0.8 * intensity; // R
            colors[i3 + 1] = 0.5 + 0.5 * intensity; // G
            colors[i3 + 2] = 0.8 + 0.2 * intensity; // B
            
            // Sizes
            sizes[i] = Math.random() * 0.1 + 0.05;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Simple material that will definitely work
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
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

        // Smooth rotation
        this.points.rotation.y += (this.targetRotationY - this.points.rotation.y) * 0.08;
        this.points.rotation.x += (this.targetRotationX - this.points.rotation.x) * 0.06;

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

        // Apply audio and pulse effects
        const scale = 1.0 + audioLevel * 0.3 + this.pulse * 0.2;
        this.points.scale.setScalar(scale);

        // Breathing animation
        const breathing = 1.0 + Math.sin(this.time * 0.8) * 0.02;
        this.points.scale.multiplyScalar(breathing);

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