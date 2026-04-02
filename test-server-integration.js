const http = require('http');
const app = require('./server'); // Assuming module.exports = app;

const server = http.createServer(app);
server.listen(3000, async () => {
    console.log('Server started for testing...');
    
    // Dynamic import for node-fetch if it's typical ESM or just use http.request
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/contact',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('StatusCode:', res.statusCode);
            console.log('Body:', data);
            server.close();
            process.exit(0);
        });
    });
    
    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        server.close();
        process.exit(1);
    });
    
    const payload = JSON.stringify({
        name: 'sagar',
        email: 'griffingamming199@gmail.com',
        subject: 'asdfas',
        message: 'asdfasfasdfaa'
    });
    req.write(payload);
    req.end();
});
