const express = require("express");
const exec = require("child_process").exec;

const app = express();
const tracks = {};

let renewsPid = 0;
const renews = () => {
  clearTimeout(renewsPid);
  exec(`certbot renew`);
  renewsPid = setTimeout(renews, 24 * 60 * 60 * 1000);
};

app.get("/.well-known/*", express.static("/tmp"));
app.use("/.ssl/init", function(req, res) {
  if (tracks[req.hostname]) {
    return req.send("ok");
  }
  try {
    exec(
      `certbot certonly --agree-tos --email=nmhung1210@gmail.com -n --webroot -w /tmp -d ${req.hostname}`,
      (err, stdout, stderr) => {
        if (err) {
          console.log({ err, stdout, stderr });
          res.send("error!");
        } else {
          renews();
          tracks[req.hostname] = Date.now();
          res.send("ok");
        }
      }
    );
  } catch (error) {
    res.send("error!");
  }
});

app.use((req, res) => {
  return res.redirect("https://" + req.headers.host + req.url);
});

app.listen(80);
