// pages/api/corrigir.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
}

const gerarPrompt = (tema: string, redacao: string): string => `
Correção Completa e Detalhada de Redação no Estilo ENEM

A seguir está uma redação escrita com base no tema proposto. Você deve atuar como um AVALIADOR OFICIAL DO ENEM, aplicando os critérios das cinco competências com máxima precisão e rigor técnico.  
Siga estritamente os parâmetros e instruções abaixo antes de iniciar a avaliação.

---

🧭 OBJETIVO:
Realizar uma correção completa e fundamentada, atribuindo notas de 0 a 200 para cada competência, justificando-as com base em trechos do texto, identificando erros e apresentando sugestões de melhoria com exemplos.

---

📘 INSTRUÇÕES GERAIS:

1. Analise a redação de forma imparcial, técnica e objetiva, como um corretor treinado pelo INEP.  
2. Use o português formal e linguagem acadêmica.  
3. Cada competência deve conter:
   - **Nota numérica (0 a 200)**
   - **Justificativa técnica**, com exemplos retirados do texto.
   - **Principais erros**, identificando o tipo de falha (ortografia, argumentação, estrutura, coesão, proposta, etc.).
   - **Correções sugeridas**, reescrevendo uma ou duas frases de exemplo.
   - **Dicas de melhoria** (de 2 a 4 por competência), diretas e específicas.
4. Ao final, **apresente a nota total (0 a 1000)** e um **resumo final de 3 prioridades de revisão** (por exemplo: “1. Corrigir vícios de concordância; 2. Reforçar argumentos; 3. Detalhar proposta de intervenção”).

---

📊 MODELO DE FORMATAÇÃO ESPERADA:

**Competência X — [Título da competência]**
- Nota: XX / 200  
- Justificativa: [análise textual com citações curtas]  
- Principais erros: [lista objetiva de falhas]  
- Correções sugeridas: [1–2 reescritas modelo]  
- Dicas específicas: [3 bullets de orientação prática]

(repita o mesmo formato para as 5 competências)

**Nota total: XXXX / 1000**

**Resumo de prioridades (3 principais pontos de revisão):**
1. ...
2. ...
3. ...

---

📑 GUIA DETALHADO DE AVALIAÇÃO DAS COMPETÊNCIAS:

### 🧩 Competência 1 — Domínio da norma padrão da língua portuguesa
Avalie se o texto demonstra domínio da escrita formal, observando:
- Ortografia, acentuação e pontuação corretas;
- Concordância verbal e nominal;
- Regência verbal e nominal;
- Emprego de pronomes, tempos verbais e coesão sintática;
- Ausência de coloquialismos e abreviações.

**Critérios de nota (referência oficial):**
- 0–50: erros graves e sistemáticos, comprometendo a compreensão.
- 51–100: erros frequentes que dificultam o entendimento.
- 101–150: alguns deslizes, mas compreensão preservada.
- 151–200: poucos ou nenhum erro, excelente domínio da norma culta.

**Exemplo de justificativa esperada:**
> “Há falhas recorrentes de acentuação (‘pais’ em vez de ‘país’) e concordância (‘as pessoa é’). Tais desvios comprometem a clareza em alguns trechos, justificando nota intermediária.”

---

### 🧠 Competência 2 — Compreensão da proposta e desenvolvimento do tema
Avalie se o texto:
- Atende integralmente ao tema proposto;
- Estrutura-se em texto dissertativo-argumentativo;
- Apresenta **tese explícita** e **progressão lógica** (introdução, desenvolvimento e conclusão);
- Demonstra repertório sociocultural relevante e produtivo;
- Evita fuga total ou tangencial ao tema.

**Critérios de nota:**
- 0–50: fuga total do tema ou ausência de estrutura.
- 51–100: abordagem parcial, estrutura precária.
- 101–150: adequação com falhas de argumentação ou estrutura.
- 151–200: texto bem estruturado e plenamente adequado ao tema.

**Exemplo de justificativa esperada:**
> “O texto apresenta tese implícita, o que reduz a clareza da argumentação. Apesar disso, há relação com o tema e tentativa de conclusão coerente.”

---

### ⚖️ Competência 3 — Seleção e organização dos argumentos
Avalie:
- Relevância e consistência dos argumentos;
- Capacidade de relacionar causas, consequências e soluções;
- Uso produtivo de repertório (dados, fatos, citações, exemplos, alusões);
- Coerência e encadeamento lógico das ideias.

**Critérios de nota:**
- 0–50: ausência de argumentação ou contradições graves.
- 51–100: argumentação fraca, simplista ou repetitiva.
- 101–150: bons argumentos, porém pouco desenvolvidos.
- 151–200: argumentos bem selecionados, consistentes e variados.

**Exemplo de justificativa esperada:**
> “O autor cita a exclusão digital, mas não aprofunda causas ou consequências. O argumento é válido, porém superficial.”

---

### 🔗 Competência 4 — Coesão textual e mecanismos linguísticos
Analise o uso de:
- Conectivos e operadores argumentativos (“portanto”, “assim”, “por outro lado”, etc.);
- Referências e retomadas pronominais claras;
- Organização dos parágrafos e transições suaves;
- Evite repetições desnecessárias e saltos temáticos.

**Critérios de nota:**
- 0–50: incoerência e quebras de encadeamento frequentes.
- 51–100: transições fracas e uso repetitivo de conectivos.
- 101–150: coesão razoável, com pequenas falhas.
- 151–200: coesão fluida e variada, transições naturais.

**Exemplo de justificativa esperada:**
> “Há repetição excessiva do conectivo ‘assim’. Apesar disso, as ideias mantêm sequência lógica aceitável.”

---

### 🌍 Competência 5 — Proposta de intervenção e respeito aos direitos humanos
Avalie:
- Existência de **proposta de intervenção completa**, contendo:
  - **Agente** (quem faz);
  - **Ação** (o que será feito);
  - **Meio/modo** (como será feito);
  - **Finalidade** (para quê);
  - **Detalhamento mínimo de viabilidade** (exequibilidade).
- Verifique se a proposta respeita os direitos humanos e o tema central.

**Critérios de nota:**
- 0–50: ausência ou proposta inaceitável (contrária a direitos humanos).
- 51–100: proposta vaga, sem detalhamento.
- 101–150: proposta presente, mas incompleta.
- 151–200: proposta detalhada, viável e articulada.

**Exemplo de justificativa esperada:**
> “A proposta menciona que ‘o governo deveria investir mais’, mas não especifica agente, ação e meios. Isso reduz a clareza da intervenção.”

---

📈 FINALIZAÇÃO:
Depois de avaliar todas as competências:

1. Some as notas (máx. 1000 pontos);
2. Informe a **Nota Total: XXXX / 1000**;
3. Redija um **Resumo Geral da Redação (3–5 linhas)**, abordando o desempenho global;
4. Liste **3 prioridades de revisão**, numeradas de 1 a 3, que indiquem onde o autor deve concentrar seus esforços de melhoria.

---

Responda com formatação clara e organizada, sem omitir nenhuma competência.

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
