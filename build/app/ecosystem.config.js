module.exports = {
  apps: [{
    script: 'sleep 123456',
    name: 'dashboard',
  },{
    name: 'validator_starter',
    script: '/usr/src/app/validator_starter.js',
    autorestart : false,
    env: {
      "NODE_PATH": "/usr/lib/node_modules",
    }
  }]
};