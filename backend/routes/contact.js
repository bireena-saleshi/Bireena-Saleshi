const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact - Handle contact form submissions
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Log the contact form submission
        console.log('=== New Contact Form Submission ===');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Subject:', subject);
        console.log('Message:', message);
        console.log('===================================');

        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
            process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.warn('Email not configured. Contact details logged above.');
            return res.json({
                success: true,
                message: 'Message received! (Email service not configured - message logged to console)'
            });
        }

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '') // Remove any spaces
            }
        });

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('Email transporter verified successfully');
        } catch (verifyError) {
            console.error('Email configuration error:', verifyError.message);
            console.error('Contact details have been logged above. Please check your EMAIL_USER and EMAIL_PASSWORD.');
            return res.json({
                success: true,
                message: 'Message received! (Email delivery pending - details logged)'
            });
        }

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: 'roybabu1452@gmail.com',
            subject: `New contact message from Bireena Salesi [${subject}]`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                    <div style="background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                        <h2 style="color: white; margin: 0;">New Contact Message</h2>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">From Bireena Salesi Website</p>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h3 style="color: #7c3aed; margin-top: 0;">Contact Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #06b6d4;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${subject}</td>
                            </tr>
                        </table>
                        <h3 style="color: #7c3aed; margin-top: 30px;">Message</h3>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4;">
                            <p style="margin: 0; line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                            <p>This email was sent from the Bireena Salesi contact form</p>
                        </div>
                    </div>
                </div>
            `,
            replyTo: email
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Message sent successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        
        // Provide specific error messages
        let errorMessage = 'Failed to send message. Please try again later.';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Email service authentication failed. Please contact the administrator.';
            console.error('Email auth failed. Please check EMAIL_USER and EMAIL_PASSWORD in .env file.');
            console.error('Make sure you are using a Gmail App Password, not your regular password.');
            console.error('Visit: https://myaccount.google.com/apppasswords to create one.');
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

module.exports = router;
