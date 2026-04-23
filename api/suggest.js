export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, type } = req.body;

  let messages;

  if (type === 'parse') {
    messages = [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: text }
        },
        {
          type: 'text',
          text: 'Extraé la información de este CV y devolvé ÚNICAMENTE un JSON válido sin texto adicional con esta estructura: {"name":"","title":"","email":"","phone":"","location":"","summary":"","experience":"","education":"","skills":"","languages":""}'
        }
      ]
    }];
  } else {
    const prompts = {
      improve: `Mejorá este texto de CV en español haciéndolo más impactante. Devolvé solo el texto mejorado sin explicaciones: "${text}"`,
      ats: `Analizá este CV para sistemas ATS y devolvé:\nPUNTUACIÓN: [1-100]\nFORTALEZAS:\n- ...\nPROBLEMAS:\n- ...\nPALABRAS CLAVE FALTANTES:\n- ...\nRECOMENDACIONES:\n- ...\n\nCV:\n${text}`
    };
    messages = [{ role: 'user', content: prompts[type] }];
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages
    })
  });

  const data = await response.json();
  res.status(200).json({ result: data.content[0].text });
}
