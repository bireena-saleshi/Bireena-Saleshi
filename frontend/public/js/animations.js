// Enhanced Animations for Bireena Bakery Management System
document.addEventListener('DOMContentLoaded', function() {
    
    // Page Transition Animation
    document.body.classList.add('page-transition');
    
    // Fade in elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);

    // Add fade-in-up class to cards and apply observer
    document.querySelectorAll('.card, .stat-card').forEach(card => {
        card.classList.add('fade-in-up');
        observer.observe(card);
    });

    // Counter animation for statistics
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-card h2, .stat-card h3');
        counters.forEach(counter => {
            const target = parseFloat(counter.textContent.replace(/[₹,]/g, ''));
            if (isNaN(target)) return;
            
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Format the number appropriately
                if (counter.textContent.includes('₹')) {
                    counter.textContent = '₹' + current.toFixed(2);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 30);
        });
    }

    // Start counter animation when stats are visible
    const statsCards = document.querySelectorAll('.stat-card');
    if (statsCards.length > 0) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(animateCounters, 200);
                    statsObserver.unobserve(entry.target);
                }
            });
        });
        
        statsCards.forEach(card => statsObserver.observe(card));
    }

    // Enhanced button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Table row hover animation
    document.querySelectorAll('.table tbody tr').forEach(row => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        // Stagger the animation
        const delay = Array.from(row.parentNode.children).indexOf(row) * 100;
        
        setTimeout(() => {
            row.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, delay);
    });

    // Enhanced navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 30%, rgba(236, 72, 153, 0.95) 70%, rgba(249, 115, 22, 0.95) 100%)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #ec4899 70%, #f97316 100%)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Card hover glow effect
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow-glow-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-glow-hover');
        });
    });

    // Loading overlay for form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            showLoadingOverlay();
        });
    });

    // Enhanced alert auto-dismiss
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        if (alert.classList.contains('alert-success')) {
            setTimeout(() => {
                alert.style.transition = 'all 0.5s ease';
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-20px)';
                setTimeout(() => alert.remove(), 500);
            }, 3000);
        }
    });

    // Icon hover animations
    document.querySelectorAll('i[class*="bi-"]').forEach(icon => {
        icon.classList.add('icon-hover');
    });

    // Floating animation for certain elements
    document.querySelectorAll('.navbar-brand i').forEach(icon => {
        icon.classList.add('floating');
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
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

    // Dynamic gradient background animation
    const body = document.body;
    let hue = 0;
    
    setInterval(() => {
        hue = (hue + 1) % 360;
        const lightness = 97; // Keep it very light
        body.style.background = `
            linear-gradient(135deg, 
                hsl(${hue}, 20%, ${lightness}%) 0%, 
                hsl(${(hue + 30) % 360}, 25%, ${lightness - 2}%) 50%, 
                hsl(${(hue + 60) % 360}, 20%, ${lightness}%) 100%
            )
        `;
    }, 100);

    // Enhanced form validation feedback
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('filled');
            } else {
                this.parentElement.classList.remove('filled');
            }
        });
    });
});

// Loading overlay function
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
    }, 5000); // Remove after 5 seconds as failsafe
}

// Success notification function
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideInBounce 0.6s ease;
    `;
    notification.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Error notification function
function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger position-fixed';
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideInBounce 0.6s ease;
    `;
    notification.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Typing effect for page headers
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect on page headers
document.addEventListener('DOMContentLoaded', function() {
    const pageHeaders = document.querySelectorAll('.page-header h2');
    pageHeaders.forEach(header => {
        const originalText = header.textContent;
        setTimeout(() => {
            typeWriter(header, originalText, 50);
        }, 500);
    });
});

// Parallax effect for hero sections
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.page-header');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Enhanced ripple effect for buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            ripple.style.cssText += `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});