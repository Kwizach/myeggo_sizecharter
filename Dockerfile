FROM node:latest

WORKDIR /usr/src/app/

COPY package*.json ./

# Building code for production
# RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY ./dist/src ./dist/src
COPY ./dist/lib ./dist/lib

CMD [ "npm", "start" ]