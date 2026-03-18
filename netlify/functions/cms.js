const https = require('https');

const COLLECTIONS = {
  turniri: '69b3c3bffdbbfa488f4236c0',
  shop: '69b3c3ccd7f81bd5773081fd'
};

exports.handler = async (event) => {
  const collection = event.queryStringParameters && event.queryStringParameters.collection;

  if (!collection || !COLLECTIONS[collection]) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid or missing collection parameter' })
    };
  }

  const token = process.env.WEBFLOW_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing WEBFLOW_TOKEN environment variable' })
    };
  }

  const collectionId = COLLECTIONS[collection];
  const url = `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`;

  try {
    const data = await new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept-version': '2.0.0'
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error('Failed to parse response')); }
        });
      });
      req.on('error', reject);
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to fetch from Webflow' })
    };
  }
};
