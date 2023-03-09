FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8080

# RUN chmod 777 /usr/local/bin/docker-entrypoint.sh

CMD [ "npm", "start" ]