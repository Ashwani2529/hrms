FROM node:18-slim

WORKDIR /usr/src/app

RUN mkdir -p ./prisma
COPY prisma/schema.prisma ./prisma
COPY .env .

RUN npm install prisma --save-dev
RUN npm init -y

EXPOSE 5555
CMD [ "npx", "prisma", "studio" ]