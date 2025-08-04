import { useState } from 'react'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import styles from '../styles/editor.module.css'

export default function Editor() {
  const [tema, setTema] = useState('')
  const [redacao, setRedacao] = useState('')
  const [resposta, setResposta] = useState('')
  const [carregando, setCarregando] = useState(false)

  const corrigirRedacao = async () => {
    if (!tema || !redacao) return alert('Preencha o tema e a redação.')
    setCarregando(true)
    try {
      const res = await fetch('/api/corrigir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, redacao }),
      })
      const data = await res.json()
      setResposta(data.resposta || 'Não houve resposta da IA.')
    } catch (err) {
      console.error(err)
      setResposta('Erro ao comunicar com a IA.')
    }
    setCarregando(false)
  }

  return (
    <>
      <Head>
        <title>Editor de Redação</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.editorBox}>
          <h2 className={styles.title}>📝 Editor de Redação ENEM</h2>

          <label className={styles.label}>Tema:</label>
          <input
            type="text"
            className={styles.input}
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ex: Desafios da educação digital no Brasil"
          />

          <label className={styles.label}>Redação:</label>
          <textarea
            className={styles.textarea}
            value={redacao}
            onChange={(e) => setRedacao(e.target.value)}
            placeholder="Escreva seu texto aqui..."
          />

          <button
            className={styles.button}
            onClick={corrigirRedacao}
            disabled={carregando}
          >
            {carregando ? 'Corrigindo...' : 'Corrigir Redação'}
          </button>

          {resposta && (
            <div className={styles.resultado}>
              <h3>🔍 Correção da Redação:</h3>
              <div className={styles.resultado}>
                <ReactMarkdown>
                  {resposta}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
