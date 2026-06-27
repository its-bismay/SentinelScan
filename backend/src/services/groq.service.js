import Groq from 'groq-sdk';

// Lazy singleton — instantiated on first call so dotenv is guaranteed to have run
let _groq = null;
const getGroq = () => {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

export const analyzeWithGroq = async (scanData) => {
  const { targetUrl, score, grade, findings = [] } = scanData;

  const findingsSummary = findings
    .slice(0, 20)
    .map((f, i) => `${i + 1}. [${f.severity?.toUpperCase()}] ${f.title}: ${f.description?.substring(0, 150)}`)
    .join('\n');

  const prompt = `You are a cybersecurity expert assistant. Analyze the following web security scan results and provide a comprehensive, beginner-friendly report.

Target: ${targetUrl}
Security Score: ${score}/100 (Grade: ${grade})
Total Findings: ${findings.length}

Top Findings:
${findingsSummary}

Please provide:
1. **Executive Summary** (2-3 sentences for non-technical stakeholders)
2. **Critical Issues** (explain each critical/high finding in plain language)
3. **Business Impact** (what could go wrong if these aren't fixed)
4. **Attack Scenarios** (brief real-world examples of how attackers exploit these)
5. **Priority Fix List** (ordered by urgency with estimated effort)
6. **Quick Wins** (fixes that take less than 1 hour)
7. **Secure Code Examples** (for the top 2-3 issues where applicable)

Keep language clear for both technical and non-technical readers.`;

  const response = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || 'Analysis unavailable.';
};

export const chatAboutScan = async (scanData, question, chatHistory = []) => {
  const { targetUrl, score, grade, findings = [] } = scanData;

  const findingsSummary = findings
    .slice(0, 15)
    .map((f, i) => `${i + 1}. [${f.severity?.toUpperCase()}] ${f.title}: ${f.description?.substring(0, 100)}`)
    .join('\n');

  const systemPrompt = `You are SentinelScan Guard, a helpful AI Cybersecurity Security Analyst.
You are assisting a developer in understanding and remediating vulnerabilities from their scan.

Here is the context of the scanned application:
- Target URL: ${targetUrl}
- Safety Score: ${score}/100 (Grade: ${grade})
- Findings:
${findingsSummary}

Answer the user's question precisely and professionally, focusing on the details of their findings. Provide actual code remediations or configurations (like Nginx, Apache, Node.js headers) where applicable.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: question }
  ];

  const response = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.5,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || 'Unable to analyze.';
};

