// ========== NEURAL NETWORK ANIMATION ==========
const neuralCanvas = document.getElementById('neuralCanvas');
if (neuralCanvas) {
    const ctx = neuralCanvas.getContext('2d');
    neuralCanvas.width = 800;
    neuralCanvas.height = 800;
    
    let particles = [];
    let connections = [];
    
    // Create particles
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * neuralCanvas.width,
            y: Math.random() * neuralCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 4 + 2,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    function drawNeuralNetwork() {
        ctx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > neuralCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > neuralCanvas.height) p.vy *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
            ctx.fill();
            
            // Draw glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size + 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity * 0.2})`;
            ctx.fill();
        });
        
        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(drawNeuralNetwork);
    }
    
    drawNeuralNetwork();
}

// ========== EYE TRACKING ==========
const eyes = document.querySelectorAll('.eye-iris');
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateEyes() {
    eyes.forEach(eye => {
        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        
        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2) / 50, 8);
        
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        
        eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    requestAnimationFrame(animateEyes);
}

animateEyes();

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in-up, .fade-in-scale, .fade-in-left, .fade-in-right').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// ========== NUMBER COUNTER ANIMATION ==========
function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (target < 10) {
            element.textContent = current.toFixed(2);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Observe stat numbers
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== CONTACT FORM ==========
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-button');
        const btnText = document.getElementById('btnText');
        const btnIcon = document.getElementById('btnIcon');
        const statusMessage = document.getElementById('statusMessage');
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        btnIcon.textContent = '⌛';
        
        try {
            const response = await fetch('https://formsubmit.co/platform@theglitch.online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    _subject: 'New Trading Inquiry - THE GLITCH',
                    _template: 'table',
                    _captcha: 'false'
                })
            });
            
            if (response.ok) {
                statusMessage.textContent = 'Message sent successfully! We\'ll contact you soon.';
                statusMessage.className = 'status-message success';
                statusMessage.style.display = 'block';
                contactForm.reset();
                
                setTimeout(() => {
                    btnText.textContent = 'Send Message';
                    btnIcon.textContent = '📧';
                    submitBtn.disabled = false;
                }, 2000);
                
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 5000);
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            statusMessage.textContent = 'Error sending message. Please email us directly.';
            statusMessage.className = 'status-message error';
            statusMessage.style.display = 'block';
            
            btnText.textContent = 'Send Message';
            btnIcon.textContent = '📧';
            submitBtn.disabled = false;
            
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    });
}

// ========== PARALLAX EFFECT ==========
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.ai-container');
    
    parallaxElements.forEach(el => {
        const speed = 0.3;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ========== AI HEAD INTERACTION ==========
const aiHead = document.querySelector('.ai-head');
if (aiHead) {
    aiHead.addEventListener('mouseenter', () => {
        aiHead.style.transform = 'scale(1.05)';
        aiHead.style.transition = 'transform 0.3s ease';
    });
    
    aiHead.addEventListener('mouseleave', () => {
        aiHead.style.transform = 'scale(1)';
    });
}

// ========== RANDOM GLITCH TRIGGER ==========
setInterval(() => {
    const glitchElements = document.querySelectorAll('.glitch-text');
    glitchElements.forEach(el => {
        if (Math.random() > 0.7) {
            el.style.animation = 'none';
            setTimeout(() => {
                el.style.animation = 'glitch-pulse 8s ease-in-out infinite';
            }, 10);
        }
    });
}, 5000);

// ========== VOXEL AI HEAD INTERACTIONS ==========
// Voxel AI Head Eye Tracking
document.addEventListener('mousemove', (e) => {
    const aiHead = document.querySelector('.ai-head');
    if (!aiHead) return;

    const rect = aiHead.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 50); // Max eye movement

    const eyeX = Math.cos(angle) * distance * 0.15; // Reduced movement for subtlety
    const eyeY = Math.sin(angle) * distance * 0.15;

    // Track eyes
    document.querySelectorAll('.eye-iris').forEach(iris => {
        iris.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
    });

    // Make voxels react to mouse proximity
    const voxels = document.querySelectorAll('.voxel');
    voxels.forEach(voxel => {
        const voxelRect = voxel.getBoundingClientRect();
        const voxelCenterX = voxelRect.left + voxelRect.width / 2;
        const voxelCenterY = voxelRect.top + voxelRect.height / 2;
        
        const voxelDistance = Math.sqrt(
            Math.pow(e.clientX - voxelCenterX, 2) + 
            Math.pow(e.clientY - voxelCenterY, 2)
        );
        
        if (voxelDistance < 100) {
            const intensity = (100 - voxelDistance) / 100;
            voxel.style.transform = `translateZ(${intensity * 15}px) scale(${1 + intensity * 0.2})`;
            voxel.style.boxShadow = `
                0 0 ${20 + intensity * 20}px rgba(99, 102, 241, ${0.8 + intensity * 0.2}),
                inset 0 0 ${5 + intensity * 5}px rgba(255, 255, 255, ${0.3 + intensity * 0.2})
            `;
        } else {
            voxel.style.transform = 'translateZ(0px) scale(1)';
            voxel.style.boxShadow = `
                0 0 10px rgba(99, 102, 241, 0.8),
                inset 0 0 5px rgba(255, 255, 255, 0.3)
            `;
        }
    });
});

// Voxel Click Effects
document.querySelectorAll('.voxel').forEach(voxel => {
    voxel.addEventListener('click', () => {
        voxel.style.animation = 'none';
        voxel.style.transform = 'translateZ(20px) scale(1.3)';
        voxel.style.boxShadow = '0 0 30px rgba(99, 102, 241, 1), inset 0 0 15px rgba(255, 255, 255, 0.8)';
        
        setTimeout(() => {
            voxel.style.animation = 'voxelGlow 3s ease-in-out infinite';
            voxel.style.transform = 'translateZ(0px) scale(1)';
            voxel.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.3)';
        }, 500);
    });
});

console.log('🚀 THE GLITCH - AI Trading Platform Loaded');

