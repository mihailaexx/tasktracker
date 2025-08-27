# Use the official Nginx image
FROM nginx:1.29.1-alpine

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy frontend static files (if any)
# COPY ../frontend/dist/task-tracker-frontend /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]