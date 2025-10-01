# THE GLITCH - Landing Page

A futuristic AI-themed landing page and contact form inspired by The Glitch trading platform.

## Features

### Landing Page (`index.html`)
- **Futuristic AI Head**: Animated neural network visualization with glowing effects
- **Hero Section**: Large title with glitch effects and smooth animations
- **Description Text**: Key features highlighting AI-powered trading
- **Stats Section**: Display platform metrics with hover effects
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Contact Page (`contact.html`)
- **Contact Form**: Name, Email, and Message fields
- **Working Email**: Automatically sends form submissions to `Platform@theglitch.com`
- **Real-time Validation**: Form validation before submission
- **Success/Error Messages**: User feedback after form submission
- **Contact Information**: Display contact details and working hours

## Design Elements

### Color Scheme
- **Primary Blue**: `#1E90FF` (Dodger Blue)
- **Secondary Blue**: `#00CED1` (Dark Turquoise)
- **Background**: Dark gradient (`#0a0a0a` to `#1a1a1a`)
- **Text**: Blue tones for a futuristic AI aesthetic

### Typography
- **Font Family**: `'Courier New', 'Monaco', monospace`
- **Uppercase Titles**: For a tech/AI feel
- **Letter Spacing**: Wide spacing for emphasis

### Effects
- Glowing text and borders
- Animated neural network
- Floating particles
- Grid overlay backgrounds
- Pulsing animations
- Mouse-tracking eye movement

## Files Structure

```
Landing page/
├── index.html          # Main landing page
├── contact.html        # Contact us page
├── styles.css          # All styling (shared between pages)
├── script.js           # Neural network animation & particles
├── contact.js          # Email form functionality
└── README.md           # This file
```

## How to Use

1. **Open the landing page**: Simply open `index.html` in your web browser
2. **Navigate to contact**: Click "Contact Us" in the navigation or "Get Started" button
3. **Test the form**: Fill out the contact form and click "Send Message"

## Email Functionality

The contact form uses [FormSubmit.co](https://formsubmit.co/) - a free form submission service that sends emails without requiring a backend server.

### Email Configuration
- **Recipient**: `platform@theglitch.online`
- **Subject**: "New Contact Form Submission - THE GLITCH"
- **Format**: Table format for easy reading

### Important Notes
1. **First Submission**: The first time someone submits the form, FormSubmit will send a confirmation email to `platform@theglitch.online`. You must click the confirmation link to activate the form.
2. **Alternative**: If you prefer a different email service, you can:
   - Replace FormSubmit with EmailJS
   - Set up your own backend API
   - Use another form service like Formspree

## Customization

### Change Email Address
Edit `contact.js` line 30:
```javascript
const response = await fetch('https://formsubmit.co/YOUR-EMAIL@domain.com', {
```

### Modify Colors
Edit `styles.css` and replace all instances of:
- `#1E90FF` (primary blue)
- `#00CED1` (secondary blue)

### Adjust Text Content
Edit the HTML files directly to change:
- Hero title and description
- Contact page text
- Stats numbers
- Footer text

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Responsive Breakpoints

- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## Performance Optimizations

- CSS animations use `transform` for GPU acceleration
- Canvas-based neural network for smooth performance
- Minimal JavaScript for faster load times
- No external dependencies or frameworks

## Credits

Design inspired by [The Glitch](https://github.com/Shubz69/The-Glitch) trading platform with a focus on AI and futuristic aesthetics.

---

© 2025 THE GLITCH. All rights reserved.

