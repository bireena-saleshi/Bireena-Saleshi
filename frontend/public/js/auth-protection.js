/**
 * Auth Protection Script
 * Prevents accessing cached authenticated pages after logout
 * using browser back button
 */

(function() {
    'use strict';
    
    // Check if user is on an authenticated page
    const isAuthPage = document.body.dataset.requiresAuth === 'true';
    
    if (isAuthPage) {
        // Detect if page was loaded from cache (back/forward button)
        window.addEventListener('pageshow', function(event) {
            // If page is from cache (persisted), force reload
            if (event.persisted) {
                window.location.reload();
            }
        });
        
        // Prevent page from being cached
        window.addEventListener('beforeunload', function() {
            // Replace current state to prevent back button caching
            if (window.history.replaceState) {
                window.history.replaceState(null, null, window.location.href);
            }
        });
        
        // Additional check: verify session is still valid
        checkAuthStatus();
    }
    
    /**
     * Verify authentication status with server
     */
    function checkAuthStatus() {
        // Check if session exists by making a quick API call
        fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok || response.status === 401) {
                // Session invalid - redirect to login
                window.location.replace('/login');
            }
        })
        .catch(error => {
            // On error, redirect to login for safety
            window.location.replace('/login');
        });
    }
})();
