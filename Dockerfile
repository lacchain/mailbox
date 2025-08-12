FROM node:14.17
WORKDIR /app
COPY ./package*.json ./
RUN yarn install
RUN mkdir src
COPY ./src ./src/
CMD ["npm", "start"]

# docker build -t  gcr.io/lacchain-bid/mailbox-dev:1.0.0 -f Dockerfile .
# docker push  gcr.io/lacchain-bid/mailbox-dev:1.0.0