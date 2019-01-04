# FROM node:8-alpine
FROM node:11.6-alpine
COPY . /home/node/app
WORKDIR /home/node/app
RUN npm install -g nodemon
# CMD ["sh", "-c", "export MONGODOMAIN='mongodb' && nodemon server.js"]
ENV MONGODOMAIN='mongodb'
CMD ["nodemon", "server.js"]
# EXPOSE 5000
