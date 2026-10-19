export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: "Use POST"});
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({error: "No message"});

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are HarvestChain AI, Kenyan farming expert for Kirinyaga, Mwea, Nakuru. Give short practical advice in KSh, mention M-Pesa, cooperatives, buyers. Friendly." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });
    const data = await groqRes.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({error: e.message});
  }
}
