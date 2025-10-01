// Floating Particles Animation
document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles');
    
    if (particlesContainer) {
        // Create floating particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--delay', `${i * 0.1}s`);
            particle.style.setProperty('--x', `${Math.random() * 100}%`);
            particle.style.setProperty('--y', `${Math.random() * 100}%`);
            particlesContainer.appendChild(particle);
        }
    }

    // Neural Network Animation
    const neuralCanvas = document.getElementById('neuralCanvas');
    if (neuralCanvas) {
        const ctx = neuralCanvas.getContext('2d');
        let layers = [];
        let connections = [];
        const layerCount = 5;
        const nodesPerLayer = [12, 18, 15, 12, 8];

        // Initialize neural network
        function initNetwork() {
            for (let layer = 0; layer < layerCount; layer++) {
                const layerNodes = [];
                const layerWidth = neuralCanvas.width * 0.8;
                const layerHeight = neuralCanvas.height * 0.6;
                const startX = (neuralCanvas.width - layerWidth) / 2;
                const startY = (neuralCanvas.height - layerHeight) / 2;
                
                for (let i = 0; i < nodesPerLayer[layer]; i++) {
                    const x = startX + (i / (nodesPerLayer[layer] - 1)) * layerWidth;
                    const y = startY + (layer / (layerCount - 1)) * layerHeight + (Math.random() - 0.5) * 30;
                    
                    layerNodes.push({
                        x, y,
                        vx: (Math.random() - 0.5) * 0.4,
                        vy: (Math.random() - 0.5) * 0.4,
                        size: Math.random() * 5 + 3,
                        pulse: Math.random() * Math.PI * 2,
                        layer,
                        energy: Math.random() * 0.5 + 0.5,
                        type: Math.random() > 0.7 ? 'core' : 'regular'
                    });
                }
                layers.push(layerNodes);
            }

            // Create connections
            for (let layer = 0; layer < layerCount - 1; layer++) {
                const currentLayer = layers[layer];
                const nextLayer = layers[layer + 1];
                
                currentLayer.forEach(node => {
                    const connectionCount = Math.floor(Math.random() * 4) + 2;
                    for (let i = 0; i < connectionCount; i++) {
                        const targetNode = nextLayer[Math.floor(Math.random() * nextLayer.length)];
                        connections.push({
                            from: node,
                            to: targetNode,
                            strength: Math.random() * 0.6 + 0.2,
                            pulse: Math.random() * Math.PI * 2,
                            type: Math.random() > 0.8 ? 'primary' : 'secondary'
                        });
                    }
                });
            }
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);

            // Draw connections
            connections.forEach(conn => {
                const distance = Math.sqrt((conn.from.x - conn.to.x) ** 2 + (conn.from.y - conn.to.y) ** 2);
                const maxDistance = 150;
                
                if (distance < maxDistance) {
                    const alpha = conn.strength * (1 - distance / maxDistance);
                    const pulseEffect = Math.sin(conn.pulse) * 0.3 + 0.7;
                    
                    // Connection glow
                    ctx.beginPath();
                    ctx.moveTo(conn.from.x, conn.from.y);
                    ctx.lineTo(conn.to.x, conn.to.y);
                    ctx.strokeStyle = `rgba(30, 144, 255, ${alpha * 0.4})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    
                    // Connection core
                    ctx.beginPath();
                    ctx.moveTo(conn.from.x, conn.from.y);
                    ctx.lineTo(conn.to.x, conn.to.y);
                    ctx.strokeStyle = `rgba(30, 144, 255, ${alpha * pulseEffect})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    
                    conn.pulse += 0.12;
                }
            });

            // Draw nodes
            layers.forEach(layer => {
                layer.forEach(node => {
                    // Update node position
                    node.x += node.vx;
                    node.y += node.vy;
                    node.pulse += 0.08;

                    // Bounce off edges
                    if (node.x < 0 || node.x > neuralCanvas.width) node.vx *= -1;
                    if (node.y < 0 || node.y > neuralCanvas.height) node.vy *= -1;

                    const alpha = 0.5 + 0.3 * Math.sin(node.pulse);
                    
                    // Node glow
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.size + 8, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(30, 144, 255, ${alpha * 0.15})`;
                    ctx.fill();
                    
                    // Node core
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(30, 144, 255, ${alpha})`;
                    ctx.fill();
                    
                    // Node highlight
                    ctx.beginPath();
                    ctx.arc(node.x - node.size * 0.3, node.y - node.size * 0.3, node.size * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                    ctx.fill();

                    // Special effects for core nodes
                    if (node.type === 'core') {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.size * 1.5, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.6})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        }

        initNetwork();
        animate();
    }

    // Eye tracking mouse movement
    const eyes = document.querySelectorAll('.eye-iris');
    if (eyes.length > 0) {
        document.addEventListener('mousemove', (e) => {
            eyes.forEach(eye => {
                const rect = eye.getBoundingClientRect();
                const eyeCenterX = rect.left + rect.width / 2;
                const eyeCenterY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - eyeCenterX) / (window.innerWidth / 2);
                const deltaY = (e.clientY - eyeCenterY) / (window.innerHeight / 2);
                
                const moveX = Math.max(-8, Math.min(8, deltaX * 8));
                const moveY = Math.max(-8, Math.min(8, deltaY * 8));
                
                eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
});

