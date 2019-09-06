# auto-cert

Docker image source for generating/renewing ssl cert for your own server.
It's a standalone http server that handling letsencrypt challenging and forward all http traffic to your own https server.

## Scripts usage (at your server)

```
docker run -d -v /etc/letsencrypt:/etc/letsencrypt /var/lib/letsencrypt:/var/lib/letsencrypt -p 80:80 nmhung1210/auto-cert
```

## To init cert for a domain

1. map a domain (like aaa.com) point to your server
2. browse to `http://<your domain>/.ssl/init`
3. your certs will be available at `/etc/letsencrypt` (or your custom path) and it would auto renew.
