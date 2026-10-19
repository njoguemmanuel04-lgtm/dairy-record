// api/chat.js - Vercel Serverless Function - reads GROQ_API_KEY from Vercel Environment
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel env' });

  const { message, harvests } = req.body;
  
  const systemPrompt = `You are HarvestChain Kenya AI Buyer for 47 counties with real produce photos. Current listings: ${JSON.stringify(harvests||[]).slice(0,2000)}. You know: Mwea rice 170-195/kg, Meru potatoes 40-60, tomatoes 50-80, maize 50-65, avocado 25-120, cabbage 20-40. Transport: Meru->Nairobi 150 per 100kg, Kirinyaga->Nairobi 130, Turkana->Nairobi 400. M-Pesa escrow protected. Speak English with Swahili/Sheng mix. Professional, concise, like Twiga Foods.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 700
      })
    });

    const data = await groqRes.json();
    if (!groqRes.ok) return res.status(500).json({ error: data.error?.message || JSON.stringify(data).slice(0,500) });
    
    const reply = data.choices?.[0]?.message?.content || 'No reply';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
