async function callGroq(promptText) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: promptText }],
      temperature: 0.3
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error('Groq API error (' + response.status + '): ' + errText);
  }
  const data = await response.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { question, context, billSummary } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing question' });

    // The "R" in RAG: we don't send the whole knowledge base — only the
    // chunks the client already retrieved as relevant to this question,
    // plus the user's own computed numbers, so the model is grounded in
    // real facts instead of guessing.
    const contextBlock = (context || []).map((c, i) => (i + 1) + '. ' + c).join('\n');

    const prompt =
      'You are BijliCheck\'s bill assistant. Answer the user\'s question about their electricity bill ' +
      'using ONLY the reference facts and their own bill numbers below — do not invent tariff figures ' +
      'that aren\'t given to you. Keep the answer to 3-4 sentences, plain and direct, no headers or markdown.\n\n' +
      'Reference facts:\n' + (contextBlock || '(none retrieved)') + '\n\n' +
      'This user\'s computed bill numbers:\n' + (billSummary || '(not calculated yet)') + '\n\n' +
      'Question: ' + question;

    const answer = await callGroq(prompt);
    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
