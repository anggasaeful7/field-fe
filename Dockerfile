FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL="https://field-be-production.up.railway.app"
ENV VITE_API_URL=$VITE_API_URL
ENV PORT=5173

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
