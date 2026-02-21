// Vercel serverless function to proxy Oura API requests (avoids CORS)
// Endpoint: GET /api/oura?endpoint=daily_sleep&start_date=2024-01-01&end_date=2024-01-01

export default async function handler(req, res) {
  const OURA_TOKEN = process.env.VITE_OURA_TOKEN;

  if (!OURA_TOKEN) {
    return res.status(500).json({ error: 'VITE_OURA_TOKEN not configured' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, start_date, end_date } = req.query;

  if (!endpoint || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required params: endpoint, start_date, end_date' });
  }

  const allowedEndpoints = ['daily_sleep', 'daily_readiness', 'sleep'];
  if (!allowedEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: `Invalid endpoint. Allowed: ${allowedEndpoints.join(', ')}` });
  }

  try {
    const url = `https://api.ouraring.com/v2/usercollection/${endpoint}?start_date=${start_date}&end_date=${end_date}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${OURA_TOKEN}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Oura API error: ${response.status}`, details: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch from Oura API', details: err.message });
  }
}
