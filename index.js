const express = require('express');
const exec = require('child_process').exec;
const fetch = require('node-fetch');

const app = express();
const tracks = {};

let renewsPid = 0;
const renews = () => {
  clearTimeout(renewsPid);
  exec(`certbot renew`);
  renewsPid = setTimeout(renews, 24 * 60 * 60 * 1000);
};

const initSSL = async hostname => {
  if (tracks[hostname]) {
    return 'OK';
  }
  return new Promise((resolve, reject) => {
    try {
      exec(
        `certbot certonly --agree-tos --email=nmhung1210@gmail.com -n --webroot -w /tmp -d ${hostname}`,
        (err, stdout, stderr) => {
          if (err) {
            console.log({ err, stdout, stderr });
            reject('failed!');
          } else {
            renews();
            tracks[hostname] = Date.now();
            resolve('OK');
          }
        }
      );
    } catch (error) {
      reject('failed!');
    }
  });
};

const initPublicHostname = async () => {
  try {
    const result = await fetch('https://us-central1-freedomain.cloudfunctions.net/domain');
    const hostname = await result.text();
    console.log({ hostname });
    const sslResult = await initSSL(hostname);
    console.log(`initPublicHostname ${hostname}=${sslResult}`);
  } catch (error) {
    console.log('initPublicHostname error!', error);
  }
};

app.get('/.well-known/*', express.static('/tmp'));
app.use('/.ssl/init', async (req, res) => {
  try {
    const result = await initSSL(req.hostname);
    res.send(result);
  } catch (error) {
    res.send('Failed!');
  }
});

app.use((req, res) => {
  return res.redirect('https://' + req.headers.host + req.url);
});

initPublicHostname();

app.listen(80);
