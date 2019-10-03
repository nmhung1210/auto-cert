const express = require('express');
const exec = require('child_process').exec;

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

const initAWSHostname = async () => {
  try {
    const result = await fetch('http://169.254.169.254/latest/meta-data/public-hostname');
    const hostname = await result.text();
    const sslResult = await initSSL(hostname);
    console.log(`initAWSHostname ${hostname}=${sslResult}`);
  } catch (error) {
    console.log('Not a AWS instance!');
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

initAWSHostname();

app.listen(80);
