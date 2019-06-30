const routes = require('next-routes')();
routes
    .add('/videos/upload', '/videos/upload')
    .add('/videos/:hash', '/videos/show')
    .add('/profile/:address', '/profile')
    .add('/search/:input', '/search');
module.exports = routes;