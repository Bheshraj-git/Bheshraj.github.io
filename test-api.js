const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log('Response:', data));
});

req.write(JSON.stringify({
    name: "sagar test ui",
    email: "griffingamming199@gmail.com",
    subject: "asdfas",
    message: "asdfasfasdfaa"
}));
req.end();
