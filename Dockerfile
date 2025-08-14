FROM node:20-alpine AS frontend  

WORKDIR /app/frontend

# Copy package files
COPY ./frontend/package*.json ./

# Install dependencies as root (simpler)
RUN npm ci || npm install

# Copy source and build
COPY ./frontend/ ./
RUN npm run build || echo "Build failed, continuing..."

# Ensure static directory exists
RUN mkdir -p /app/static
RUN cp -r dist/* /app/static/ 2>/dev/null || echo "No build output to copy"

FROM python:3.11-alpine 

RUN apk add --no-cache --virtual .build-deps \  
    build-base \  
    libffi-dev \  
    openssl-dev \  
    curl \  
    && apk add --no-cache \  
    libpq 
  
COPY requirements.txt /usr/src/app/  
RUN pip install --no-cache-dir -r /usr/src/app/requirements.txt \  
    && rm -rf /root/.cache  
  
COPY . /usr/src/app/  
COPY --from=frontend /app/static /usr/src/app/static/

WORKDIR /usr/src/app  

# Azure App Service expects port 8000
EXPOSE 8000  

# Use port 8000 for gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
