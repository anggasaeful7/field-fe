# Stage 1: Build Vite React App
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=production

RUN npm run build

# Stage 2: Serve static build with Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Environment variables with defaults (overridable on Railway / VPS)
ENV BACKEND_URL=https://field-be-production.up.railway.app
ENV NGINX_ENVSUBST_FILTER="BACKEND_URL"

# Copy template for envsubst entrypoint and default fallback
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
