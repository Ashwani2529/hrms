# Use node base image for build stage
FROM node:18 as build

# Install necessary packages for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    curl gnupg \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst \
    fonts-freefont-ttf --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Set the working directory
WORKDIR /usr/src/app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Generate Prisma client and build the application
RUN npx prisma generate
RUN npm run build

# Stage for production image
FROM node:18

RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends
RUN apt-get update && apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libgtk-3-0 libasound2 xdg-utils 

# Set the working directory
WORKDIR /usr/src/app

# Copy from the build stage
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/.env .env
COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/package-lock.json .

# Install production dependencies
RUN npm install --only=production --force
COPY --chown=node:node --from=build /usr/src/app/node_modules/.prisma/client  ./node_modules/.prisma/client

# Set environment variables
ENV NODE_ENV production

# Expose port
EXPOSE 3000

# Run the application
CMD ["dumb-init", "node", "dist/src/main"]