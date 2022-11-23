FROM node:lts-slim
ADD ./ /app
WORKDIR /app
RUN npm config set registry https://registry.npm.taobao.org
RUN yarn --ignore-engines
RUN npm run build



FROM nginx:stable
COPY --from=0 /app/dist/ /dist
ADD dashboard.nginx.conf /etc/nginx/conf.d/default.conf

