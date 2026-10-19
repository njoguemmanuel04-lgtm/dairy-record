export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: "Use POST"});
  
  const { message } = req.body;
  if (!message) return res.status(400).json({error: "No message"});
  if (!process.env.GROQ_API_KEY) return res.status(500).json({error: "GROQ_API_KEY missing in Vercel env"});

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // <-- FIXED MODEL
        messages: [
          { role: "system", content: "You are HarvestChain AI, Kenyan farming expert for Kirinyaga, Mwea, Nakuru. Give short practical advice in KSh, M-Pesa, cooperatives, buyers. Max 4 lines." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    const data = await groqRes.json();
    
    if (!groqRes.ok) {
      console.error("Groq error:", data);
      return res.status(groqRes.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({error: e.message});
  }
}
