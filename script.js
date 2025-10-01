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

// ========== FUTURISTIC FEMALE AI HEAD INTERACTIONS ==========
// Beautiful Female AI Eye Tracking
document.addEventListener('mousemove', (e) => {
    const aiHead = document.querySelector('.ai-head');
    if (!aiHead) return;

    const rect = aiHead.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 100); // Max eye movement

    const eyeX = Math.cos(angle) * distance * 0.06; // Subtle, elegant movement
    const eyeY = Math.sin(angle) * distance * 0.06;

    // Track eye codes with smooth movement
    document.querySelectorAll('.eye-code').forEach(eyeCode => {
        eyeCode.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
    });

    // Make code characters react to mouse proximity
    const codeChars = document.querySelectorAll('.code-char');
    codeChars.forEach(char => {
        const charRect = char.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2;
        const charCenterY = charRect.top + charRect.height / 2;
        
        const charDistance = Math.sqrt(
            Math.pow(e.clientX - charCenterX, 2) + 
            Math.pow(e.clientY - charCenterY, 2)
        );
        
        if (charDistance < 60) {
            const intensity = (60 - charDistance) / 60;
            char.style.transform = `scale(${1 + intensity * 0.4})`;
            char.style.filter = `brightness(${1 + intensity * 0.8})`;
            char.style.textShadow = `0 0 ${15 + intensity * 20}px rgba(0, 191, 255, 1)`;
        } else {
            char.style.transform = 'scale(1)';
            char.style.filter = 'brightness(1)';
            char.style.textShadow = '0 0 15px rgba(0, 191, 255, 1)';
        }
    });

    // Make code lines react to mouse proximity
    const codeLines = document.querySelectorAll('.code-line');
    codeLines.forEach(line => {
        const lineRect = line.getBoundingClientRect();
        const lineCenterX = lineRect.left + lineRect.width / 2;
        const lineCenterY = lineRect.top + lineRect.height / 2;
        
        const lineDistance = Math.sqrt(
            Math.pow(e.clientX - lineCenterX, 2) + 
            Math.pow(e.clientY - lineCenterY, 2)
        );
        
        if (lineDistance < 120) {
            const intensity = (120 - lineDistance) / 120;
            line.style.textShadow = `0 0 ${10 + intensity * 15}px rgba(0, 191, 255, ${0.8 + intensity * 0.2})`;
            line.style.opacity = 0.8 + intensity * 0.2;
        } else {
            line.style.textShadow = '0 0 10px rgba(0, 191, 255, 0.8)';
            line.style.opacity = 0.8;
        }
    });

    // Make hair strands react to mouse proximity
    const hairStrands = document.querySelectorAll('.hair-strand');
    hairStrands.forEach(strand => {
        const strandRect = strand.getBoundingClientRect();
        const strandCenterX = strandRect.left + strandRect.width / 2;
        const strandCenterY = strandRect.top + strandRect.height / 2;
        
        const strandDistance = Math.sqrt(
            Math.pow(e.clientX - strandCenterX, 2) + 
            Math.pow(e.clientY - strandCenterY, 2)
        );
        
        if (strandDistance < 100) {
            const intensity = (100 - strandDistance) / 100;
            strand.style.transform = `rotate(var(--rotation, 0deg)) scaleY(${1 + intensity * 0.2})`;
            strand.style.boxShadow = `0 0 ${15 + intensity * 15}px rgba(99, 102, 241, 1)`;
        } else {
            strand.style.transform = 'rotate(var(--rotation, 0deg)) scaleY(1)';
            strand.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.8)';
        }
    });
});

// Code-Based Click Effects
document.querySelectorAll('.code-char, .code-line, .eye-code').forEach(element => {
    element.addEventListener('click', () => {
        element.style.animation = 'none';
        element.style.transform = 'scale(1.2)';
        element.style.filter = 'brightness(1.5)';
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1000';
        
        const rect = element.getBoundingClientRect();
        ripple.style.left = rect.left + rect.width / 2 + 'px';
        ripple.style.top = rect.top + rect.height / 2 + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
        
        setTimeout(() => {
            element.style.animation = '';
            element.style.transform = 'scale(1)';
            element.style.filter = 'brightness(1)';
        }, 300);
    });
});

// Hair Strand Click Effects
document.querySelectorAll('.hair-strand').forEach(strand => {
    strand.addEventListener('click', () => {
        strand.style.animation = 'none';
        strand.style.transform = 'rotate(var(--rotation, 0deg)) scaleY(1.3)';
        strand.style.boxShadow = '0 0 25px rgba(99, 102, 241, 1)';
        
        setTimeout(() => {
            strand.style.animation = 'hairFlow 4s ease-in-out infinite';
            strand.style.transform = 'rotate(var(--rotation, 0deg)) scaleY(1)';
            strand.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.8)';
        }, 500);
    });
});

// Human-like AI Head Breathing Animation
setInterval(() => {
    const faceStructure = document.querySelector('.face-structure');
    if (faceStructure) {
        faceStructure.style.animation = 'none';
        faceStructure.style.transform = 'perspective(1500px) rotateX(-3deg) rotateY(2deg) scale(1.02)';
        setTimeout(() => {
            faceStructure.style.animation = '';
            faceStructure.style.transform = 'perspective(1500px) rotateX(-3deg) rotateY(2deg) scale(1)';
        }, 2000);
    }
}, 5000); // Breathe every 5 seconds

// Blinking Animation
setInterval(() => {
    const eyeLashes = document.querySelectorAll('.lash');
    eyeLashes.forEach(lash => {
        lash.style.animation = 'none';
        setTimeout(() => {
            lash.style.animation = 'lashFlutter 3s ease-in-out infinite';
        }, 50);
    });
}, 4000); // Blink every 4 seconds

// Random Particle Generation
setInterval(() => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        if (Math.random() > 0.7) {
            particle.style.animation = 'none';
            setTimeout(() => {
                particle.style.animation = 'particleFloat 3s ease-in-out infinite';
            }, 100);
        }
    });
}, 2000);

console.log('🚀 THE GLITCH - AI Trading Platform Loaded');


