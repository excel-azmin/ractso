FROM node:20 AS base

WORKDIR /workspace

RUN npm install -g pnpm
COPY package*.json ./
RUN pnpm install

COPY . .

EXPOSE 3001

CMD ["pnpm", "run", "start:dev"]