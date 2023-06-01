FROM node:16-slim
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
RUN apt-get update && apt-get install -y openssl libssl-dev
CMD ["yarn", "start", "consent-manager"]