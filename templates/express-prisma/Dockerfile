# Dockerfile for AuthKit Express/Prisma template
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/src/app.js"]
