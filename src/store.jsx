import { createContext, useContext, useEffect, useState } from 'react'
const Ctx = createContext()
export const useApp = () => useContext(Ctx)

function usePersist(k, init) {
  const [v, s] = useState(() => {
    try { return JSON.parse(localStorage.getItem(k)) ?? init } catch { return init }
  })
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)) }, [k, v])
  return [v, s]
}

const DEMO = { name: 'Demo User', email: 'demo@hearth.org', password: 'Paws@123' }

export function Provider({ children }) {
  const [users, setUsers] = usePersist('hp_users', [DEMO])
  const [user, setUser] = usePersist('hp_user', null)
  const [favs, setFavs] = usePersist('hp_favs', [])
  const [apps, setApps] = usePersist('hp_apps', [])
  const [dons, setDons] = usePersist('hp_dons', [])
  const [dark, setDark] = usePersist('hp_dark', false)
  const [rsvps, setRsvps] = usePersist('hp_rsvps', [])
  const [myStories, setMyStories] = usePersist('hp_stories', [])
  const [toast, setToast] = useState('')
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 2500) }
  const login = (email, password) => {
    const u = users.find((x) => x.email === email && x.password === password)
    if (u) setUser({ name: u.name, email: u.email })
    return !!u
  }
  const signup = (name, email, password) => {
    if (users.some((x) => x.email === email)) return false
    setUsers([...users, { name, email, password }])
    setUser({ name, email })
    return true
  }
  const toggleFav = (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const toggleRsvp = (id) => setRsvps((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]))
  const addStory = (s) => setMyStories((m) => [{ id: Date.now(), ...s }, ...m])
  return (
    <Ctx.Provider value={{ user, setUser, login, signup, favs, toggleFav, apps, setApps, dons, setDons, dark, setDark, rsvps, toggleRsvp, myStories, addStory, say, toast }}>
      {children}
    </Ctx.Provider>
  )
}