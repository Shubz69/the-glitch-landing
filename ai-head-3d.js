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

        // Create sophisticated head geometry
        const headGeometry = new THREE.SphereGeometry(1, 48, 48);
        
        // Modify geometry for realistic head proportions
        const positions = headGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Create realistic head shape
            if (z < 0) {
                positions.setZ(i, z * 0.5); // Flatten back
            } else {
                positions.setZ(i, z * 1.4); // Extend front
            }
            
            // Make it more oval-shaped
            if (Math.abs(y) > 0.3) {
                positions.setY(i, y * 1.3);
            }
            
            // Slightly narrow the sides
            if (Math.abs(x) > 0.7) {
                positions.setX(i, x * 0.9);
            }
        }
        positions.needsUpdate = true;

        // Create stunning holographic material
        const holographicMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    // Create holographic colors
                    vec3 color1 = vec3(0.0, 0.8, 1.0); // Electric blue
                    vec3 color2 = vec3(0.4, 0.0, 1.0); // Deep purple
                    vec3 color3 = vec3(1.0, 0.0, 0.8); // Hot pink
                    
                    // Calculate intensity
                    float intensity = 1.0 - length(vPosition) * 0.3;
                    intensity = pow(intensity, 1.5);
                    
                    // Create scan lines
                    float scanLines = sin(vUv.y * 40.0 + time * 2.0) * 0.1 + 0.9;
                    
                    // Create energy waves
                    float energy = sin(vUv.x * 25.0 + vUv.y * 15.0 + time * 1.5) * 0.4 + 0.6;
                    
                    // Mix colors
                    vec3 finalColor = mix(color2, color1, intensity);
                    finalColor = mix(finalColor, color3, energy * 0.3);
                    finalColor *= scanLines;
                    
                    // Add glow
                    float glow = pow(intensity, 0.8);
                    finalColor += glow * 0.2;
                    
                    // Create wireframe effect
                    float wireframe = 1.0 - smoothstep(0.0, 0.015, abs(sin(vUv.x * 80.0)) * abs(sin(vUv.y * 80.0)));
                    finalColor = mix(finalColor, vec3(1.0), wireframe * 0.9);
                    
                    float alpha = 0.7 + intensity * 0.3;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0.0 }
            }
        });

        // Create holographic head
        const headMesh = new THREE.Mesh(headGeometry, holographicMaterial);
        headMesh.scale.set(1.6, 1.6, 1.6);
        this.head.add(headMesh);

        // Create neural network overlay
        this.createNeuralNetwork();
        
        // Create stunning eyes
        this.createEyes();
        
        // Create facial features
        this.createFacialFeatures();
        
        // Create energy field
        this.createEnergyField();

        this.scene.add(this.head);
    }

    createNeuralNetwork() {
        // Create neural network particles
        const particleCount = 150;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position particles around the head
            const radius = 2.0 + Math.random() * 1.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.cos(phi);
            positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Random colors
            colors[i3] = Math.random() * 0.3 + 0.7; // R
            colors[i3 + 1] = Math.random() * 0.5 + 0.5; // G
            colors[i3 + 2] = Math.random() * 0.3 + 0.7; // B
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.03,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.head.add(particleSystem);
        
        // Store reference for animation
        this.neuralParticles = particleSystem;
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
        // Create stunning glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.18, 24, 24);
        
        // Create eye material with custom shader
        const eyeMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    // Create iris pattern
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    
                    // Create concentric circles
                    float rings = sin(dist * 15.0 + time * 1.5) * 0.5 + 0.5;
                    
                    // Create radial lines
                    float angle = atan(vUv.y - center.y, vUv.x - center.x);
                    float radial = sin(angle * 6.0 + time * 2.0) * 0.3 + 0.7;
                    
                    // Create pupil
                    float pupil = 1.0 - smoothstep(0.0, 0.25, dist);
                    
                    // Mix colors
                    vec3 irisColor = vec3(0.0, 0.9, 1.0);
                    vec3 pupilColor = vec3(0.0, 0.0, 0.1);
                    vec3 glowColor = vec3(0.8, 1.0, 1.0);
                    
                    vec3 finalColor = mix(irisColor, pupilColor, pupil);
                    finalColor = mix(finalColor, glowColor, rings * radial);
                    
                    // Add intense glow
                    float glow = 1.0 - dist;
                    glow = pow(glow, 1.5);
                    finalColor += glow * 0.6;
                    
                    float alpha = 0.95 + glow * 0.05;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            uniforms: {
                time: { value: 0.0 }
            }
        });

        // Left eye
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.32, 0.25, 0.92);
        this.head.add(leftEye);

        // Right eye
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.32, 0.25, 0.92);
        this.head.add(rightEye);

        // Create eye glow rings
        this.createEyeGlowRings();
        
        // Store references for animation
        this.leftEye = leftEye;
        this.rightEye = rightEye;
    }

    createEyeGlowRings() {
        // Create multiple glowing rings around each eye
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(0.2 + i * 0.08, 0.25 + i * 0.08, 24);
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
                        alpha *= 0.4;
                        
                        vec3 color = vec3(0.0, 0.8, 1.0);
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            // Left eye ring
            const leftRing = new THREE.Mesh(ringGeometry, ringMaterial);
            leftRing.position.set(-0.32, 0.25, 0.88);
            leftRing.rotation.x = Math.PI / 2;
            this.head.add(leftRing);

            // Right eye ring
            const rightRing = new THREE.Mesh(ringGeometry, ringMaterial);
            rightRing.position.set(0.32, 0.25, 0.88);
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
        // Create futuristic facial features
        
        // Nose - sleek geometric shape
        const noseGeometry = new THREE.ConeGeometry(0.06, 0.18, 12);
        const noseMaterial = new THREE.ShaderMaterial({
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
                    vec3 color = vec3(0.0, 0.8, 1.0);
                    float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
                    intensity = pow(intensity, 2.0);
                    
                    gl_FragColor = vec4(color, intensity * 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.08, 0.96);
        nose.rotation.x = Math.PI;
        this.head.add(nose);

        // Mouth - energy line
        const mouthGeometry = new THREE.TorusGeometry(0.16, 0.02, 8, 24, Math.PI);
        const mouthMaterial = new THREE.ShaderMaterial({
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
                    vec3 color = vec3(0.0, 1.0, 0.8);
                    float alpha = sin(vUv.x * 15.0 + time * 3.0) * 0.5 + 0.5;
                    alpha *= 0.8;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            uniforms: {
                time: { value: 0.0 }
            }
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.22, 0.88);
        mouth.rotation.x = Math.PI;
        this.head.add(mouth);

        // Create energy circuits
        this.createEnergyCircuits();
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
