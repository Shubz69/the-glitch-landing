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
        this.scene.background = null; // Transparent background
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

        // Create CLEAR human head shape - much more recognizable
        const headGeometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Modify geometry to look like an actual human head
        const positions = headGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Create clear head shape - flat back, extended front
            if (z < 0) {
                positions.setZ(i, z * 0.3); // Very flat back
            } else {
                positions.setZ(i, z * 1.8); // Extended face area
            }
            
            // Make it clearly oval (taller than wide)
            if (Math.abs(y) > 0.2) {
                positions.setY(i, y * 1.6);
            }
            
            // Narrow the sides for human proportions
            if (Math.abs(x) > 0.5) {
                positions.setX(i, x * 0.8);
            }
        }
        positions.needsUpdate = true;

        // Create CLEAR wireframe material - no confusing shaders
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00BFFF, // Bright blue
            wireframe: true,
            transparent: true,
            opacity: 0.9
        });

        // Create the main head wireframe
        const headWireframe = new THREE.Mesh(headGeometry, wireframeMaterial);
        headWireframe.scale.set(1.8, 1.8, 1.8);
        this.head.add(headWireframe);

        // Create additional wireframe layers for depth
        this.createWireframeLayers();
        
        // Create CLEAR, recognizable eyes
        this.createEyes();
        
        // Create CLEAR facial features
        this.createFacialFeatures();
        
        // Create shoulders for context
        this.createShoulders();

        this.scene.add(this.head);
    }

    createWireframeLayers() {
        // Create multiple wireframe layers for depth effect
        const headGeometry = new THREE.SphereGeometry(1, 16, 16);
        
        // Outer layer - darker blue
        const outerWireframe = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial({
            color: 0x0080FF, // Darker blue
            wireframe: true,
            transparent: true,
            opacity: 0.4
        }));
        outerWireframe.scale.set(2.0, 2.0, 2.0);
        this.head.add(outerWireframe);

        // Inner layer - medium blue
        const innerWireframe = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial({
            color: 0x40BFFF, // Medium blue
            wireframe: true,
            transparent: true,
            opacity: 0.6
        }));
        innerWireframe.scale.set(1.6, 1.6, 1.6);
        this.head.add(innerWireframe);
    }

    createEnergyField() {
        // Create energy field around the head
        const energyGeometry = new THREE.SphereGeometry(2.2, 32, 32);
        const energyMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 color = vec3(0.0, 0.8, 1.0);
                    float intensity = 1.0 - length(vPosition) * 0.3;
                    intensity = pow(intensity, 3.0);
                    
                    float alpha = intensity * 0.1;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const energyField = new THREE.Mesh(energyGeometry, energyMaterial);
        this.head.add(energyField);
    }

    createEyes() {
        // Create CLEAR, recognizable eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        
        // Simple, bright eye material
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF, // Bright cyan
            transparent: true,
            opacity: 0.9
        });

        // Left eye
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.2, 0.9);
        this.head.add(leftEye);

        // Right eye
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.2, 0.9);
        this.head.add(rightEye);

        // Add pupils for clarity
        this.createPupils();
        
        // Store references for animation
        this.leftEye = leftEye;
        this.rightEye = rightEye;
    }

    createPupils() {
        const pupilGeometry = new THREE.SphereGeometry(0.05, 12, 12);
        const pupilMaterial = new THREE.MeshBasicMaterial({
            color: 0x000080, // Dark blue
            transparent: true,
            opacity: 0.9
        });

        // Left pupil
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.3, 0.2, 0.92);
        this.head.add(leftPupil);

        // Right pupil
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.3, 0.2, 0.92);
        this.head.add(rightPupil);
    }

    createEyeGlowRings() {
        // Create multiple glowing rings around each eye
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(0.25 + i * 0.1, 0.3 + i * 0.1, 32);
            const ringMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;
                    void main() {
                        float dist = distance(vUv, vec2(0.5));
                        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                        alpha *= 0.3;
                        
                        vec3 color = vec3(0.0, 0.8, 1.0);
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            // Left eye ring
            const leftRing = new THREE.Mesh(ringGeometry, ringMaterial);
            leftRing.position.set(-0.35, 0.25, 0.9);
            leftRing.rotation.x = Math.PI / 2;
            this.head.add(leftRing);

            // Right eye ring
            const rightRing = new THREE.Mesh(ringGeometry, ringMaterial);
            rightRing.position.set(0.35, 0.25, 0.9);
            rightRing.rotation.x = Math.PI / 2;
            this.head.add(rightRing);
        }
    }

    createEyeRings() {
        const ringGeometry = new THREE.RingGeometry(0.22, 0.28, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x7C3AED, // Purple
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });

        // Left eye ring
        const leftRing = new THREE.Mesh(ringGeometry, ringMaterial);
        leftRing.position.set(-0.32, 0.22, 0.88);
        leftRing.rotation.x = Math.PI / 2;
        this.head.add(leftRing);

        // Right eye ring
        const rightRing = new THREE.Mesh(ringGeometry, ringMaterial);
        rightRing.position.set(0.32, 0.22, 0.88);
        rightRing.rotation.x = Math.PI / 2;
        this.head.add(rightRing);
    }

    createFacialFeatures() {
        // Create CLEAR, recognizable facial features
        
        // Nose - simple wireframe cone
        const noseGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
        const noseMaterial = new THREE.MeshBasicMaterial({
            color: 0x00BFFF, // Blue
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.05, 0.95);
        nose.rotation.x = Math.PI;
        this.head.add(nose);

        // Mouth - simple wireframe curve
        const mouthGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 16, Math.PI);
        const mouthMaterial = new THREE.MeshBasicMaterial({
            color: 0x00BFFF, // Blue
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.2, 0.88);
        mouth.rotation.x = Math.PI;
        this.head.add(mouth);
    }

    createEnergyCircuits() {
        // Create energy circuit lines across the face
        const circuitGeometry = new THREE.BufferGeometry();
        const points = [];
        
        // Create circuit paths
        for (let i = 0; i < 20; i++) {
            const t = i / 19;
            const x = (Math.random() - 0.5) * 0.6;
            const y = (Math.random() - 0.5) * 0.8 + 0.1;
            const z = 0.95 + Math.random() * 0.05;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        circuitGeometry.setFromPoints(points);
        
        const circuitMaterial = new THREE.LineBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        const circuit = new THREE.Line(circuitGeometry, circuitMaterial);
        this.head.add(circuit);
        
        // Store for animation
        this.energyCircuits = circuit;
    }

    createShoulders() {
        const shoulderGeometry = new THREE.SphereGeometry(0.3, 12, 12);
        const shoulderMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0080FF, // Blue
            wireframe: true,
            transparent: true, 
            opacity: 0.5
        });

        // Left shoulder
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.7, -0.8, 0);
        leftShoulder.scale.set(1.0, 0.6, 0.8);
        this.head.add(leftShoulder);

        // Right shoulder
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.7, -0.8, 0);
        rightShoulder.scale.set(1.0, 0.6, 0.8);
        this.head.add(rightShoulder);
    }

    createLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x2D1B69, 0.6); // Purple ambient
        this.scene.add(ambientLight);

        // Point light for glow effect - purple
        const pointLight = new THREE.PointLight(0x8B5CF6, 2.5, 15); // Purple glow
        pointLight.position.set(0, 0, 3);
        this.scene.add(pointLight);

        // Additional point light for more glow - blue-purple
        const pointLight2 = new THREE.PointLight(0x6B46C1, 2, 12); // Blue-purple
        pointLight2.position.set(2, 2, 2);
        this.scene.add(pointLight2);

        // Directional light - purple
        const directionalLight = new THREE.DirectionalLight(0x7C3AED, 1); // Purple
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

        const time = Date.now() * 0.001;

        // Smooth rotation interpolation
        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

        // Apply rotations
        this.head.rotation.x = this.currentRotationX;
        this.head.rotation.y = this.currentRotationY;

        // Add subtle breathing animation
        this.head.scale.setScalar(1 + Math.sin(time * 2) * 0.02);

        // Update shader uniforms
        this.head.traverse((child) => {
            if (child.material && child.material.uniforms && child.material.uniforms.time) {
                child.material.uniforms.time.value = time;
            }
        });

        // Animate neural particles
        if (this.neuralParticles) {
            this.neuralParticles.rotation.y += 0.001;
            this.neuralParticles.rotation.x += 0.0005;
        }

        // Animate energy circuits
        if (this.energyCircuits) {
            this.energyCircuits.rotation.z += 0.002;
        }

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
