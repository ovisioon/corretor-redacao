import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData
} from "firebase/firestore"

export default function NotificacoesPage() {
  const [nome, setNome] = useState("") // nome do usuário logado
  const [notificacoes, setNotificacoes] = useState<DocumentData[]>([])

  useEffect(() => {
    if (!nome) return

    const ref = collection(db, "notificacoes")
    const q = query(ref, where("para", "==", nome), orderBy("horario", "desc"))

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setNotificacoes(lista)
    })

    return () => unsub()
  }, [nome])

  return (
    <div>
      <h1>🔔 Notificações</h1>
      <ul>
        {notificacoes.map((n) => (
          <li key={n.id}>
            <strong>{n.por}</strong> {n.tipo === "curtida" ? "curtiu" : "comentou"} seu post
          </li>
        ))}
      </ul>
    </div>
  )
}
