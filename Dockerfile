FROM node:14.4
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
RUN mkdir src
COPY ./src ./src/
CMD ["npm", "start"]