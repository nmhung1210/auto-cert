const express = require('express');
const execSync = require('child_process').execSync;

const app = express();
const tracks = {};

let renewsPid = 0;
const renews = () => {
  clearTimeout(renewsPid);
  execSync(`certbot renew`);
  renewsPid = setTimeout(renews, 24 * 60 * 60 * 1000);
};

app.all('/.well-known/*', express.static('/tmp'));
app.use('/.ssl/init', function(req, res) {
  if (tracks[req.hostname]) {
    return req.send('ok');
  }
  try {
    execSync(
      `certbot certonly --agree-tos --email=nmhung1210@gmail.com -n --webroot -w /tmp -d ${req.hostname}`,
      {
        stdio: 'inherit'
      }
    );
    renews();
    tracks[req.hostname] = Date.now();
    res.send('ok');
  } catch (error) {
    res.send('error!');
  }
});
app.use(function(req, res) {
  return res.redirect('https://' + req.headers.host + req.url);
});

app.listen(80);
