FROM node:16.12.0-buster-slim
RUN apt-get update && apt-get install -y python build-essential
RUN mkdir -p /app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "tsconfig.json", "/app/"]
WORKDIR /app
RUN npm install --production --silent
COPY ./src /app/src
RUN npm run clean
RUN npm run build
CMD ["node", "/app/build/server.js"]
