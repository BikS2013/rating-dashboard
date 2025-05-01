#!/bin/sh

# Set up environment variables for the application
ENV_FILE="/usr/share/nginx/html/env-config.js"

# Create a JavaScript file that will override the environment variables
cat > $ENV_FILE << EOL
// Runtime environment configuration
window.env = {
  VITE_JSON_URL: '/sample-ratings.json',
  VITE_API_URL: '/sample-ratings.json',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_DETAILED_LOGGING: 'false'
};

// Override fetch to intercept API calls to production URL
(function() {
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('api.production.com/v1')) {
      console.log('Intercepting API call to:', url);
      console.log('Redirecting to: /sample-ratings.json');
      return originalFetch('/sample-ratings.json', options);
    }
    return originalFetch(url, options);
  };
})();
EOL

# Make sure the file is accessible
chmod 644 $ENV_FILE

echo "Generated environment configuration at $ENV_FILE"

# Start nginx
nginx -g 'daemon off;'