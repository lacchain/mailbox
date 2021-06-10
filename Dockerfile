FROM node:14.4
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY *.js ./
CMD ["npm", "start"]