const express = require('express');
const router = express.Router();

// Contact page route
router.get('/', (req, res) => {
    res.render('contact', {
        title: 'Contact Us - Bireena Saleshi'
    });
});

// Handle contact form submission
router.post('/send', async (req, res) => {
    try {
        const { name, email, phone, message, topic } = req.body;
        
        // Here you can add logic to save to database or send email
        console.log('Contact Form Submission:', {
            name,
            email,
            phone,
            message,
            topic,
            timestamp: new Date()
        });

        req.flash('success_msg', 'Thank you for contacting us! We will get back to you soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Contact form error:', error);
        req.flash('error_msg', 'Failed to send message. Please try again.');
        res.redirect('/contact');
    }
});

module.exports = router;
