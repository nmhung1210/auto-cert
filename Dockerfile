FROM certbot/certbot:v0.38.0

VOLUME /etc/letsencrypt /var/lib/letsencrypt
EXPOSE 80

WORKDIR /app

COPY . /app

RUN apk add --no-cache \
  nodejs \
  npm

RUN npm i

ENTRYPOINT [ "npm", "start" ]