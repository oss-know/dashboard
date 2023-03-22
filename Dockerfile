FROM node:lts-slim

ADD ./config /app/config
ADD ./public /app/public
ADD ./src /app/src
ADD ./jest.config.js /app/jest.config.js
ADD ./jsconfig.json /app/jsconfig.json
ADD ./package.json /app/package.json
ADD ./playwright.config.ts /app/playwright.config.ts
ADD ./tsconfig.json /app/tsconfig.json
ADD ./yarn.lock /app/yarn.lock


WORKDIR /app
RUN npm config set registry https://registry.npm.taobao.org
RUN yarn --ignore-engines
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build



FROM nginx:stable
COPY --from=0 /app/dist/ /dist
ADD dashboard.nginx.conf /etc/nginx/conf.d/default.conf

