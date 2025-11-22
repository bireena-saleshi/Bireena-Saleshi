# Contact Form Email Setup Guide

## Setting up Gmail for Contact Form

To enable the contact form to send emails, you need to configure Gmail with an App Password:

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Select "Security" from the left menu
3. Under "Signing in to Google", select "2-Step Verification"
4. Follow the steps to enable it

### Step 2: Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" for app type
3. Select "Other" for device and name it "Bireena Salesi"
4. Click "Generate"
5. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
Open the `.env` file and update these values:

```
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Example:
```
EMAIL_USER=johndoe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Note:** Remove all spaces from the app password when pasting it in the .env file.

## Testing the Contact Form

1. Start the server: `npm start`
2. Visit: http://localhost:3000
3. Scroll to the "Get in Touch" section
4. Fill out the form and click "Send Message"
5. Check roybabu1452@gmail.com for the email

## Contact Form Features

- ✅ Full form validation (name, email, subject, message)
- ✅ Email format validation
- ✅ Loading state while sending
- ✅ Success/error messages
- ✅ Form auto-clears on success
- ✅ Beautiful HTML email template
- ✅ Reply-to address set to user's email
- ✅ Responsive design matching Bireena Salesi theme

## Troubleshooting

**Email not sending?**
- Check that EMAIL_USER and EMAIL_PASSWORD are set correctly in .env
- Ensure 2-Step Verification is enabled on your Google account
- Make sure you're using an App Password, not your regular password
- Check server console for error messages

**Getting "Less secure app" error?**
- Use App Password instead (see steps above)
- Do not use "Allow less secure apps" option

## Security Notes

- Never commit .env file to git (it's already in .gitignore)
- App passwords are safer than regular passwords
- Each app password can be revoked individually
- Emails are sent from your Gmail account to roybabu1452@gmail.com
