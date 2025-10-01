// ========== SIMPLE AI HEAD INTERACTIONS ==========

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

// ========== SIMPLE AI HEAD INTERACTIONS ==========
// AI Head Core Click Effects
document.addEventListener('click', (e) => {
    const aiHeadCore = document.querySelector('.ai-head-core');
    if (aiHeadCore && aiHeadCore.contains(e.target)) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1000';
        
        const rect = aiHeadCore.getBoundingClientRect();
        ripple.style.left = rect.left + rect.width / 2 + 'px';
        ripple.style.top = rect.top + rect.height / 2 + 'px';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
    }
});

// Orbital Ring Interactions
document.querySelectorAll('.ring').forEach(ring => {
    ring.addEventListener('mouseenter', () => {
        ring.style.animationPlayState = 'paused';
        ring.style.transform = 'scale(1.1)';
        ring.style.opacity = '1';
    });
    
    ring.addEventListener('mouseleave', () => {
        ring.style.animationPlayState = 'running';
        ring.style.transform = 'scale(1)';
        ring.style.opacity = '0.6';
    });
});

console.log('🚀 THE GLITCH - AI Trading Platform Loaded');


