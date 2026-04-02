const fetch = require('node-fetch');

async function test() {
  const payload = {
    name: 'sagar',
    email: 'griffingamming199@gmail.com',
    subject: 'asdfas',
    message: 'asdfasfasdfaa'
  };

  try {
    const res = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
