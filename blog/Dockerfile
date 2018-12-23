FROM node:8-alpine
COPY . /home/node/app
WORKDIR /home/node/app
RUN npm install -g nodemon
CMD ["nodemon", "server.js"]
# EXPOSE 5000
