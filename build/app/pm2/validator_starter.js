var pm2 = require('pm2');
var fs = require('fs');

const WORKDIR = process.env.WORKDIR || '/app';
const DATA_PATH = process.env.DATA_PATH || '/app/data';
const INTERVAL = 5000;
const PROCESS = 'validator';
const TLS_CERT = WORKDIR + '/ssl/ssl.crt'
const LOG = '/var/log/validator.log'
const EXTRA_OPTS = process.env.EXTRA_OPTS || '';
const VERBOSITY = process.env.VERBOSITY || 'info';
const KEYMANAGEROPTS = DATA_PATH + '/keymanager.json';
const BEACON_RPC_PROVIDER = 'prysm-beacon-chain.public.dappnode:4000';

// PM2 API docs: https://pm2.keymetrics.io/docs/usage/pm2-api/
pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.describe(PROCESS, async (err, data) => {
    if (err) {
      console.error(err);
      process.exit(2);
    }

    // Check if the PROCESS isn't running
    if (typeof data != "undefined" &&
      data != null &&
      data.length != null &&
      data.length == 0) {
      await waitForValidFile(KEYMANAGEROPTS, INTERVAL);
      startValidator();
    }
  });
});

// Wait until a valid file exists
function waitForValidFile(file, interval) {
  console.log('Waiting for: ', file);
  return new Promise(function(resolve) {
    // Check if we've a valid file every `interval`
    const timer = setInterval(function() {
      checkfile(file, resolve, timer);
    }, interval);
    // Check before the first interval happens
    checkfile(file, resolve, timer);
  });
}

// Check for a valid json file
function checkfile(file, resolve, timer) {
  if (fs.existsSync(file)) {
    // if it exists we read it
    fs.access(file, fs.constants.R_OK, function(err) {
      if (!err) {
        // Check if it has the expected structure
        // if so we crear the timeout and resolve the promise
        checkValidFile(file).then(function() {
          clearTimeout(timer);
          resolve();
        }).catch((err) => { console.log(err) });
      }
    });
  }
}


// Check if the file is a valid json file and 
// if it has at least one account
async function checkValidFile(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(new Error(KEYMANAGEROPTS + ' could not be read'));
      }
      try {
        let keymanager = JSON.parse(data);
        if (typeof keymanager.accounts != "undefined" &&
          keymanager.accounts != null &&
          keymanager.accounts.length != null &&
          keymanager.accounts.length > 0) {
          resolve();
        } else {
          reject(new Error('No accounts found in ' + KEYMANAGEROPTS));
        }
      } catch (e) {
        reject(e);
      }
    });
  });
}

function startValidator() {
  pm2.start({
    name: 'validator',
    script: 'validator',
    args: '--tls-cert=' + TLS_CERT
      + ' --beacon-rpc-provider=' + BEACON_RPC_PROVIDER
      + ' --keymanager=wallet --keymanageropts=' + KEYMANAGEROPTS
      + ' --verbosity=' + VERBOSITY
      + ' --log-file=' + LOG
      + ' ' + EXTRA_OPTS,
    watch: KEYMANAGEROPTS,
    watch_options: {
      usePolling: true
    }
  }, function(err, apps) {
    pm2.disconnect();
    if (err) throw err
  });
}
