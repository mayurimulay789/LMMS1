module.exports = {
  apps: [{
    name: 'ryma-academy',
    script: './server/src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 2000
    },
    error_file: '/var/log/rymaacademy/err.log',
    out_file: '/var/log/rymaacademy/out.log',
    log_file: '/var/log/rymaacademy/combined.log',
    merge_logs: true,
    time: true
  }]
}