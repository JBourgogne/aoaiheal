FROM node:20-alpine AS frontend  

# Create app directory and set permissions
WORKDIR /home/node/app
RUN chown -R node:node /home/node/app

# Switch to node user BEFORE copying files
USER node

# Copy package files first for better caching
COPY --chown=node:node ./frontend/package*.json ./frontend/

# Change to frontend directory and install dependencies
WORKDIR /home/node/app/frontend
RUN npm ci || npm install

# Copy frontend source code
COPY --chown=node:node ./frontend/ ./

# Build frontend
RUN npm run build || (echo "Frontend build failed, creating empty dist" && mkdir -p dist)

# Create static directory and copy build output
RUN mkdir -p ../static && (cp -r dist/* ../static/ 2>/dev/null || echo "No dist files to copy")

FROM python:3.11-alpine 

# Install system dependencies
RUN apk add --no-cache --virtual .build-deps \  
    build-base \  
    libffi-dev \  
    openssl-dev \  
    curl \  
    && apk add --no-cache \  
    libpq 
  
# Install Python dependencies
COPY requirements.txt /usr/src/app/  
RUN pip install --no-cache-dir -r /usr/src/app/requirements.txt \  
    && rm -rf /root/.cache  
  
# Copy application code
COPY . /usr/src/app/  

# Copy built frontend static files
COPY --from=frontend /home/node/app/static /usr/src/app/static/

WORKDIR /usr/src/app  
EXPOSE 80  

CMD ["gunicorn", "-b", "0.0.0.0:80", "app:app"]
