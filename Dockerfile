FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g pm2
EXPOSE 3000
CMD ["pm2-runtime", "dist/main.js"]