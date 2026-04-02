const fs = require('fs');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const keys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'];

for (const key of keys) {
    if (envConfig[key]) {
        fs.writeFileSync('temp_val.txt', envConfig[key].trim(), 'utf8');
        console.log(`Uploading ${key}...`);
        try {
            execSync(`npx vercel env rm ${key} production preview development -y`, { stdio: 'ignore' });
        } catch (e) {}
        execSync(`npx vercel env add ${key} production,preview,development < temp_val.txt`, { stdio: 'inherit' });
    }
}

if (fs.existsSync('temp_val.txt')) {
    fs.unlinkSync('temp_val.txt');
}
console.log('Environment variables uploaded. Triggering a fresh deploy...');
execSync('npx vercel --prod -y', { stdio: 'inherit' });
console.log('Done!');
