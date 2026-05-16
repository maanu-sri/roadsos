export default async function handler(req, res) {
  const { message, nearbyList } = req.body;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are RoadSoS emergency assistant. Be short and direct. Nearby: ${nearbyList}\n\nUser: ${message}` }] }]
      })
    }
  );
  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Call 108 immediately.";
  res.json({ reply });
}