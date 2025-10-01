// Contact Form Email Functionality
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            // Disable submit button
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnIcon.textContent = '⌛';

            try {
                // Using FormSubmit.co - a free form submission service
                // This will send the form data to platform@theglitch.online
                const response = await fetch('https://formsubmit.co/platform@theglitch.online', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        message: formData.message,
                        _subject: 'New Contact Form Submission - THE GLITCH',
                        _template: 'table',
                        _captcha: 'false'
                    })
                });

                if (response.ok) {
                    // Success
                    statusMessage.textContent = 'Your message has been sent successfully! We will contact you soon.';
                    statusMessage.className = 'success-message success';
                    statusMessage.style.display = 'block';
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        btnText.textContent = 'Send Message';
                        btnIcon.textContent = '✉';
                        submitBtn.disabled = false;
                    }, 2000);
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 5000);
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                statusMessage.textContent = 'There was a problem sending your message. Please try again or email us directly.';
                statusMessage.className = 'success-message error';
                statusMessage.style.display = 'block';
                
                // Reset button
                btnText.textContent = 'Send Message';
                btnIcon.textContent = '✉';
                submitBtn.disabled = false;
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 5000);
            }
        });
    }
});

