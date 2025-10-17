// pages/api/corrigir.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
}

const gerarPrompt = (tema: string, redacao: string): string => `
Correção completa de redação ENEM

Avalie a redação abaixo com base nos critérios oficiais do ENEM, seguindo as cinco competências. Para cada uma:

1. Dê uma nota de 0 a 200 com justificativa.
2. Explique os principais erros (gramática, estrutura, argumentação).
3. Dê dicas específicas para melhorar.
4. Informe a nota total (0 a 1000).

Seja claro, direto e didático como um avaliador experiente. Responda em português formal.

---

Tema: ${tema}

Redação:
${redacao}
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { tema, redacao } = req.body as { tema: string; redacao: string }
  if (!tema || !redacao) {
    return res.status(400).json({ error: 'Tema e redação são obrigatórios.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  console.log('🔑 Chave de API usada:', apiKey)

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'Chave da API Gemini não configurada.' })
  }

  const prompt = gerarPrompt(tema, redacao)
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })
    const json = await response.json()
    if (!response.ok) {
      console.error('Erro da API Gemini:', response.status, json)
      return res
        .status(500)
        .json({ error: 'Falha ao comunicar com a IA', detalhes: json })
    }
    const texto =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'A IA não respondeu.'
    return res.status(200).json({ resposta: texto.trim() })
  } catch (e: any) {
    console.error('Erro geral ao conectar com IA:', e)
    return res
      .status(500)
      .json({ error: 'Erro de conexão com a IA', detalhes: e.message })
  }
}
