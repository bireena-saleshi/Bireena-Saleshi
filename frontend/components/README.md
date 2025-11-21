# Login Page Component

A beautiful, modern login page with neon gradient effects, glass morphism, and smooth animations. This component combines the centered layout from reference Image A with the vibrant purple/pink neon color palette from Image B.

## 🎨 Design Features

- **Full-screen hero background** with radial/linear purple-pink gradients
- **Top navigation bar** with centered menu items and login button
- **Centered glass-morphism card** with neon glow effects
- **Smooth animations** including gradient shifts and hover effects
- **Fully responsive** design for desktop, tablet, and mobile
- **Accessibility-friendly** with proper ARIA labels and keyboard navigation

## 📦 Files Included

1. **LoginPage.jsx** - React functional component (default export)
2. **login.css** - Plain CSS fallback styles
3. **LoginPage.tailwind.css** - Tailwind utility classes and examples
4. **tailwind.config.js** - Tailwind configuration with custom theme
5. **index.html** - Standalone demo (optional)

## 🚀 Quick Start

### Option 1: Using Plain CSS

1. **Copy files to your React project:**
   ```
   src/
   ├── components/
   │   ├── LoginPage.jsx
   │   └── login.css
   ```

2. **Import the component:**
   ```jsx
   import LoginPage from './components/LoginPage';
   
   function App() {
     return <LoginPage />;
   }
   ```

3. **Add Google Fonts to your `index.html`:**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
   ```

4. **Done!** The CSS is already imported in the component.

### Option 2: Using Tailwind CSS

1. **Copy files to your project:**
   ```
   src/
   ├── components/
   │   ├── LoginPage.jsx
   │   └── LoginPage.tailwind.css
   ```

2. **Merge `tailwind.config.js` with your existing config:**
   - Copy the custom colors, fonts, and animations from the provided config
   - Or replace your entire `tailwind.config.js` with the provided one

3. **Update your main CSS file** (e.g., `src/index.css`):
   ```css
   @import 'tailwindcss/base';
   @import 'tailwindcss/components';
   @import 'tailwindcss/utilities';
   @import './components/LoginPage.tailwind.css';
   ```

4. **Update `LoginPage.jsx` imports:**
   ```jsx
   // Change this line:
   import './login.css';
   
   // To this:
   import './LoginPage.tailwind.css';
   ```

5. **Add Google Fonts to your `index.html`** (same as Option 1, step 3)

## 🎯 Component Props & Customization

The component currently has built-in state management. To integrate with your authentication system:

```jsx
const LoginPage = ({ onLogin, onForgotPassword }) => {
  // ... existing code
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Call your authentication API
      await onLogin(formData.email, formData.password);
    } else {
      setErrors(newErrors);
    }
  };
  
  // ...
};
```

### Example usage with custom handlers:

```jsx
<LoginPage 
  onLogin={(email, password) => {
    // Your authentication logic
    console.log('Logging in:', email, password);
  }}
  onForgotPassword={() => {
    // Navigate to forgot password page
    navigate('/forgot-password');
  }}
/>
```

## 🎨 Color Palette

The design uses a neon purple/pink gradient theme:

- **Primary Purple:** `#7c3aed`, `#9333ea`
- **Secondary Pink:** `#ec4899`, `#f472b6`
- **Accent Cyan/Turquoise:** `#06b6d4`, `#22d3ee`
- **Dark Background:** `#0f0318`, `#1a0b2e`

## 📱 Responsive Breakpoints

- **Desktop:** Full layout with side-by-side elements
- **Tablet (≤1024px):** Adjusted spacing and font sizes
- **Mobile (≤768px):** Stacked navigation, full-width card
- **Small Mobile (≤480px):** Compact layout

## ✨ Features

### Accessibility
- ✅ Proper `<label>` associations for all inputs
- ✅ ARIA labels and attributes
- ✅ Keyboard-focus visible states
- ✅ Reduced motion support for users with motion sensitivities

### Form Validation
- ✅ Email format validation
- ✅ Required field checking
- ✅ Real-time error display
- ✅ Error clearing on user input

### User Experience
- ✅ Password visibility toggle
- ✅ Smooth hover and focus animations
- ✅ Loading states (can be added)
- ✅ "Forgot password" link

## 🛠️ Customization Tips

### Change the site title:
```jsx
<div className="site-title">
  YOUR BRAND<span className="gradient-text">NAME</span>
</div>
```

### Modify navigation links:
```jsx
<nav className="nav-menu">
  <a href="#home" className="nav-link">Home</a>
  <a href="#about" className="nav-link">About</a>
  {/* Add or remove links as needed */}
</nav>
```

### Adjust colors in CSS:
```css
:root {
  --primary-purple: #7c3aed;  /* Change to your brand color */
  --accent-cyan: #06b6d4;     /* Change to your accent color */
  /* ... */
}
```

### Adjust colors in Tailwind config:
```js
colors: {
  neon: {
    purple: { DEFAULT: '#7c3aed' },  // Your brand color
    cyan: { DEFAULT: '#06b6d4' },    // Your accent color
  }
}
```

## 🐛 Troubleshooting

### Fonts not loading?
Make sure you've added the Google Fonts link to your `index.html` or imported it in your main CSS file.

### Styles not applying?
- **Plain CSS:** Check that `import './login.css'` is in `LoginPage.jsx`
- **Tailwind:** Ensure Tailwind is properly configured and the CSS file is imported

### Blur effect not working?
The `backdrop-filter` property requires browser support. It works in modern browsers but may need fallbacks for older ones.

## 📄 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (limited - no backdrop-filter, custom properties)

## 📝 License

Free to use in your projects. Attribution appreciated but not required.

## 🎉 Credits

Design inspired by modern neon UI trends and glass morphism aesthetics.

---

**Enjoy your new login page! 🚀**

For questions or issues, refer to the inline code comments in `LoginPage.jsx` for detailed explanations of each section.
