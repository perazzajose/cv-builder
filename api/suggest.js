export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, type } = req.body;

  let prompt;

  if (type === 'parse') {
    prompt = `Extraé la información de este CV en base64 y devolvé ÚNICAMENTE un JSON válido sin texto adicional con esta estructura exacta: {"name":"","title":"","email":"","phone":"","location":"","summary":"","experience":"","education":"","skills":"","languages":""}. CV en base64: ${text}`;
  } else if (type === 'ats') {
    prompt = `Analizá este CV para sistemas ATS y devolvé:\nPUNTUACIÓN: [1-100]\nFORTALEZAS:\n- ...\nPROBLEMAS:\n- ...\nPALABRAS CLAVE FALTANTES:\n- ...\nRECOMENDACIONES:\n- ...\n\nCV:\n${text}`;
  } else {
    prompt = `Mejorá este texto de CV en español haciéndolo más impactante. Devolvé solo el texto mejorado sin explicaciones: "${text}"`;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
  res.status(200).json({ result });
}
