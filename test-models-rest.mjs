import https from 'https';

const API_KEY = process.env.GEMINI_API_KEY;

function getModels() {
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models?key=${API_KEY}`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      if (response.models) {
        response.models.filter(m => m.name.includes('imagen')).forEach(m => {
            console.log(m.name, m.supportedGenerationMethods);
        });
      } else {
        console.log("Error:", data);
      }
    });
  });

  req.on('error', (e) => console.error(e));
  req.end();
}

getModels();
