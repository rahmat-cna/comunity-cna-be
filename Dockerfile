# Gunakan Node versi stabil yang didukung NestJS
FROM node:20-alpine

# Set working directory di dalam container
WORKDIR /usr/src/app

# Copy package.json & package-lock.json dulu
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

# Expose port NestJS (default 3000)
EXPOSE 5000

# Jalankan NestJS pakai npm run start:dev (hot reload)
CMD ["npm", "run", "start:dev"]

