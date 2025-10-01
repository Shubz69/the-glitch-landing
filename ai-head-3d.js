// 3D Interactive AI Head with Three.js
class AIHead3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.head = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.animationId = null;
        this.isHovered = false;
        
        this.init();
    }

    init() {
        console.log('Initializing 3D AI Head...');
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createHead();
        this.createLights();
        this.addEventListeners();
        this.animate();
        console.log('3D AI Head initialization complete');
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
    }

    createCamera() {
        const container = document.getElementById('ai-head-canvas').parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 3;
    }

    createRenderer() {
        const canvas = document.getElementById('ai-head-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true
        });
        
        const container = canvas.parentElement;
        if (!container) {
            throw new Error('Canvas container not found');
        }
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        console.log('Renderer created successfully');
    }

    createHead() {
        // Create head group
        this.head = new THREE.Group();

        // Create head geometry (sphere with modifications)
        const headGeometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Modify geometry to make it more head-like
        const positions = headGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Flatten the back and elongate the front
            if (z < 0) {
                positions.setZ(i, z * 0.7);
            } else {
                positions.setZ(i, z * 1.2);
            }
            
            // Make it more oval-shaped
            if (Math.abs(y) > 0.5) {
                positions.setY(i, y * 1.1);
            }
        }
        positions.needsUpdate = true;

        // Create wireframe material
        const wireframeMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vDistance;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vDistance = distance(position, vec3(0.0));
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vDistance;
                
                void main() {
                    vec3 color1 = vec3(0.0, 0.75, 1.0); // Bright blue
                    vec3 color2 = vec3(0.5, 0.0, 1.0);  // Purple
                    
                    float intensity = 1.0 - vDistance * 0.3;
                    intensity = pow(intensity, 2.0);
                    
                    vec3 finalColor = mix(color2, color1, intensity);
                    float alpha = 0.8 + intensity * 0.2;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Create wireframe head
        const headWireframe = new THREE.Mesh(headGeometry, wireframeMaterial);
        headWireframe.scale.set(1.2, 1.2, 1.2);
        this.head.add(headWireframe);

        // Create eyes
        this.createEyes();
        
        // Create facial features
        this.createFacialFeatures();
        
        // Create shoulders
        this.createShoulders();

        this.scene.add(this.head);
    }

    createEyes() {
        // Left eye
        const leftEyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const eyeMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    vec3 color = vec3(0.0, 1.0, 1.0); // Cyan
                    float intensity = 1.0 + dot(vNormal, vec3(0.0, 0.0, 1.0)) * 0.5;
                    gl_FragColor = vec4(color * intensity, 1.0);
                }
            `,
            transparent: true
        });

        const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.2, 0.8);
        this.head.add(leftEye);

        // Right eye
        const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.2, 0.8);
        this.head.add(rightEye);

        // Eye rings
        this.createEyeRings();
    }

    createEyeRings() {
        const ringGeometry = new THREE.RingGeometry(0.2, 0.25, 16);
        const ringMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    vec3 color = vec3(0.0, 0.5, 1.0);
                    gl_FragColor = vec4(color, 0.6);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Left eye ring
        const leftRing = new THREE.Mesh(ringGeometry, ringMaterial);
        leftRing.position.set(-0.3, 0.2, 0.85);
        leftRing.rotation.x = Math.PI / 2;
        this.head.add(leftRing);

        // Right eye ring
        const rightRing = new THREE.Mesh(ringGeometry, ringMaterial);
        rightRing.position.set(0.3, 0.2, 0.85);
        rightRing.rotation.x = Math.PI / 2;
        this.head.add(rightRing);
    }

    createFacialFeatures() {
        // Nose
        const noseGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
        const noseMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00BFFF, 
            transparent: true, 
            opacity: 0.7 
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0, 0.9);
        nose.rotation.x = Math.PI;
        this.head.add(nose);

        // Mouth
        const mouthGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI);
        const mouthMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00BFFF, 
            transparent: true, 
            opacity: 0.8 
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.3, 0.8);
        mouth.rotation.x = Math.PI;
        this.head.add(mouth);
    }

    createShoulders() {
        const shoulderGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const shoulderMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0080FF, 
            transparent: true, 
            opacity: 0.3,
            wireframe: true 
        });

        // Left shoulder
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.8, -0.8, 0);
        leftShoulder.scale.set(1, 0.6, 0.8);
        this.head.add(leftShoulder);

        // Right shoulder
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.8, -0.8, 0);
        rightShoulder.scale.set(1, 0.6, 0.8);
        this.head.add(rightShoulder);
    }

    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point light for glow effect
        const pointLight = new THREE.PointLight(0x00BFFF, 1, 10);
        pointLight.position.set(0, 0, 2);
        this.scene.add(pointLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0x00BFFF, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    addEventListeners() {
        const canvas = document.getElementById('ai-head-canvas');
        
        // Mouse move
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = (event.clientX - rect.left - rect.width / 2) / rect.width;
            this.mouseY = (event.clientY - rect.top - rect.height / 2) / rect.height;
            
            this.targetRotationY = this.mouseX * 0.5;
            this.targetRotationX = -this.mouseY * 0.3;
        });

        // Mouse enter
        canvas.addEventListener('mouseenter', () => {
            this.isHovered = true;
        });

        // Mouse leave
        canvas.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.targetRotationX = 0;
            this.targetRotationY = 0;
        });

        // Resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    onWindowResize() {
        const container = document.getElementById('ai-head-canvas').parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Smooth rotation interpolation
        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

        // Apply rotations
        this.head.rotation.x = this.currentRotationX;
        this.head.rotation.y = this.currentRotationY;

        // Add subtle breathing animation
        const time = Date.now() * 0.001;
        this.head.scale.setScalar(1 + Math.sin(time * 2) * 0.02);

        // Rotate eye rings
        this.head.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'RingGeometry') {
                child.rotation.z += 0.01;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize 3D AI Head when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load
    const initAIHead = () => {
        if (typeof THREE !== 'undefined') {
            try {
                const aiHead3D = new AIHead3D();
                window.aiHead3D = aiHead3D;
                console.log('3D AI Head initialized successfully');
            } catch (error) {
                console.error('Error initializing 3D AI Head:', error);
                // Fallback: create a simple static AI head
                createFallbackAIHead();
            }
        } else {
            console.log('Three.js not loaded yet, retrying...');
            setTimeout(initAIHead, 100);
        }
    };
    
    // Start initialization
    initAIHead();
});

// Fallback AI head if Three.js fails
function createFallbackAIHead() {
    const container = document.querySelector('.ai-head-3d-container');
    if (container) {
        container.innerHTML = `
            <div class="fallback-ai-head">
                <div class="ai-head-silhouette">
                    <div class="eye left-eye"></div>
                    <div class="eye right-eye"></div>
                    <div class="nose"></div>
                    <div class="mouth"></div>
                </div>
                <div class="glow-effect"></div>
            </div>
        `;
    }
}
