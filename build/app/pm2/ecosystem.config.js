const WORKDIR = process.env.WORKDIR || '/app';

module.exports = {
  apps: [{
    script: '/app/server/index.js',
    name: 'server',
  },{
    name: 'validator_starter',
    script: WORKDIR + '/pm2/validator_starter.js',
    autorestart : false,
    env: {
      "NODE_PATH": "/usr/lib/node_modules",
    }
  }]
};