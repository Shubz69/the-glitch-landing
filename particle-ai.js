// ======= Particle AI Head =======
class ParticleAIHead {
    constructor() {
        this.container = document.getElementById('particleCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.points = null;
        this.uniforms = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.pulse = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        
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
        // ======= Particle head geometry =======
        const POINT_COUNT = 80000; // Reduced for better performance
        const positions = new Float32Array(POINT_COUNT * 3);
        const uvs = new Float32Array(POINT_COUNT * 2);

        // Sample points on an ellipsoid to mimic a face silhouette
        function sampleFacePoint(i) {
            // Spherical coords
            const t = Math.random() * Math.PI; // theta 0..pi
            const p = Math.random() * 2 * Math.PI; // phi 0..2pi
            // Bias theta to create flatter top and chin
            const theta = Math.pow(Math.random(), 0.9) * Math.PI;
            // Base radius varies with theta to create head silhouette
            const r = 1.0 + 0.07 * Math.cos(theta * 2.5) - 0.18 * Math.sin(theta * 0.7);
            // Ellipsoid scaling to look like a face
            const x = r * Math.sin(theta) * Math.cos(p) * 0.85;
            const y = r * Math.cos(theta) * 1.05 - 0.15; // shift down slightly
            const z = r * Math.sin(theta) * Math.sin(p) * 0.95;
            return [x, y, z];
        }

        for (let i = 0; i < POINT_COUNT; i++) {
            const [x, y, z] = sampleFacePoint(i);
            positions[3 * i] = x + (Math.random() - 0.5) * 0.02; // small jitter
            positions[3 * i + 1] = y + (Math.random() - 0.5) * 0.02;
            positions[3 * i + 2] = z + (Math.random() - 0.5) * 0.02;
            uvs[2 * i] = Math.random();
            uvs[2 * i + 1] = Math.random();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // ======= Shader material for glowing particles =======
        const vertexShader = `
            uniform float uTime;
            uniform float uMouseX; 
            uniform float uMouseY;
            uniform float uAudio;
            uniform float uPulse;
            attribute vec2 uv;
            varying float vIntensity;
            varying vec3 vColor;

            // Simple 3D noise
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            
            float noise(vec3 x) {
                vec3 p = floor(x);
                vec3 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                float n = mix(mix(mix(hash(p + vec3(0.0,0.0,0.0)), hash(p + vec3(1.0,0.0,0.0)), f.x),
                                mix(hash(p + vec3(0.0,1.0,0.0)), hash(p + vec3(1.0,1.0,0.0)), f.x), f.y),
                            mix(mix(hash(p + vec3(0.0,0.0,1.0)), hash(p + vec3(1.0,0.0,1.0)), f.x),
                                mix(hash(p + vec3(0.0,1.0,1.0)), hash(p + vec3(1.0,1.0,1.0)), f.x), f.y), f.z);
                return n;
            }

            void main() {
                vec3 pos = position;
                // Flow field deformation
                float n = noise(vec3(pos * 4.0 + uTime * 0.4));
                // Use mouse to tilt front-facing area
                vec2 mouse = vec2(uMouseX - 0.5, uMouseY - 0.5) * 2.0;
                float tilt = clamp(mouse.x * 0.7 + mouse.y * 0.6, -1.0, 1.0);
                // Push forward/back based on noise and audio
                float audioBoost = 1.0 + uAudio * 1.8 + uPulse * 1.2;
                pos += normalize(pos) * (n - 0.5) * 0.18 * audioBoost;
                pos.z += tilt * 0.18 * abs(pos.x);
                // Small breathing motion
                pos *= 1.0 + 0.02 * sin(uTime * 0.8 + length(position.xy) * 6.0);

                // Compute point size based on depth and audio
                float size = 2.0 + 10.0 * (0.45 + uAudio * 0.5) * (1.0 - pos.z * 0.12);
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;

                // Intensity for fragment shader
                vIntensity = smoothstep(0.0, 1.0, n + uAudio * 0.6);
                vColor = vec3(0.2 + 0.8 * vIntensity, 0.5 + 0.5 * vIntensity, 0.8 + 0.2 * vIntensity);
            }
        `;

        const fragmentShader = `
            precision mediump float;
            varying float vIntensity;
            varying vec3 vColor;
            
            void main() {
                // Circular soft particle
                vec2 c = gl_PointCoord - vec2(0.5);
                float r = length(c);
                float alpha = smoothstep(0.5, 0.0, r);
                // Add radial falloff for soft glow
                float glow = pow(1.0 - r, 2.0);
                vec3 col = vColor * (0.7 + 0.5 * vIntensity) + vec3(0.05, 0.02, 0.2) * vIntensity;
                gl_FragColor = vec4(col, alpha * glow);
            }
        `;

        this.uniforms = {
            uTime: { value: 0 },
            uMouseX: { value: 0.5 },
            uMouseY: { value: 0.5 },
            uAudio: { value: 0.0 },
            uPulse: { value: 0.0 }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: this.uniforms,
            transparent: true,
            depthTest: false,
            blending: THREE.AdditiveBlending
        });

        // Add error handling for shader compilation
        material.onBeforeCompile = (shader) => {
            console.log('Compiling shaders...');
        };

        // Check for shader compilation errors
        const checkShaderErrors = () => {
            if (material.program && material.program.program) {
                const gl = this.renderer.getContext();
                const program = material.program.program;
                
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error('Shader program failed to link:', gl.getProgramInfoLog(program));
                    console.error('Vertex shader log:', gl.getShaderInfoLog(material.program.vertexShader));
                    console.error('Fragment shader log:', gl.getShaderInfoLog(material.program.fragmentShader));
                }
            }
        };

        // Check after a short delay to allow compilation
        setTimeout(checkShaderErrors, 100);

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        // Fallback material if shader fails
        this.fallbackMaterial = new THREE.PointsMaterial({
            color: 0x00BFFF,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
    }

    createLights() {
        // Ambient light for subtle illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point light for glow effect
        const pointLight = new THREE.PointLight(0x00BFFF, 1, 10);
        pointLight.position.set(0, 0, 3);
        this.scene.add(pointLight);
    }

    addEventListeners() {
        // Mouse movement for head rotation
        this.container.addEventListener('pointermove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            this.uniforms.uMouseX.value = x;
            this.uniforms.uMouseY.value = 1.0 - y;
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
        
        const time = Date.now() * 0.001;
        this.uniforms.uTime.value = time;

        // Smooth camera/points rotation
        this.points.rotation.y += (this.targetRotationY - this.points.rotation.y) * 0.08;
        this.points.rotation.x += (this.targetRotationX - this.points.rotation.x) * 0.06;

        // Update audio uniform
        let audioLevel = 0.0;
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            // Compute average of mid frequencies
            let sum = 0;
            let count = 0;
            for (let i = 10; i < 90; i++) {
                sum += this.dataArray[i];
                count++;
            }
            audioLevel = (sum / count) / 255.0;
        }

        // Decay pulse
        this.pulse *= 0.92;
        this.uniforms.uAudio.value = audioLevel;
        this.uniforms.uPulse.value = this.pulse;

        // Small breathing of camera
        this.camera.position.z = 4.5 + Math.sin(time * 0.4) * 0.08 * (1.0 + audioLevel * 0.6);
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load
    const initParticleAI = () => {
        if (typeof THREE !== 'undefined') {
            try {
                new ParticleAIHead();
                console.log('Particle AI Head initialized successfully');
            } catch (error) {
                console.error('Error initializing Particle AI Head:', error);
            }
        } else {
            console.log('Three.js not loaded yet, retrying...');
            setTimeout(initParticleAI, 100);
        }
    };
    
    initParticleAI();
});
