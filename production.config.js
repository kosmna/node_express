module.exports = {
  apps : [{
    name: 'Node-Express',
    script: 'app.js',
    log_file: '../log.log',
    time: true,

    args: '',
    instances: "1",
    autorestart: true,
    watch: false,
    max_memory_restart: '3800M',
    env: {
      NODE_ENV: 'development',
      DEVICE_VALIDATION_KEY: "",
      REQUIRE_ADMIN_LOGIN: "true",
      EMAIL_VALIDATION_REQUIRED: "yes",
      PORT: "443"
    },
    env_production: {
      NODE_ENV: 'production',
      DEVICE_VALIDATION_KEY: "",
      REQUIRE_ADMIN_LOGIN: "true",
      EMAIL_VALIDATION_REQUIRED: "yes",
      PORT: "443"
    }
  }],

  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'pm2 reload ecosystem.config.js --env production'
    }
  }
};
