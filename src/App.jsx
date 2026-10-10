import { useState } from 'react'
import { Routes, Route, Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { Moon, Sun, Menu, PawPrint } from 'lucide-react'
import { Provider, useApp } from './store'
import { Home, Adopt, Pet, Apply, Volunteer, Donate, About, Login, Dashboard, Stories, Events } from './pages'

function Layout() {
  const { user, setUser, dark, setDark, toast } = useApp()
  const [open, setOpen] = useState(false)
  const links = [['/', 'Home'], ['/adopt', 'Adopt'], ['/stories', 'Stories'], ['/events', 'Events'], ['/volunteer', 'Volunteer'], ['/donate', 'Donate'], ['/about', 'About']]
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only p-2">Skip to content</a>
      <header className="sticky top-0 z-10 bg-card border-b border-black/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between p-4" aria-label="Main">
          <Link to="/" className="flex items-center gap-2 font-bold text-pri text-xl"><PawPrint /> Hearth &amp; Paw</Link>
          <button className="lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><Menu /></button>
          <div onClick={() => setOpen(false)}
            className={`${open ? 'flex' : 'hidden'} lg:flex absolute lg:static top-full left-0 right-0 bg-card lg:bg-transparent flex-col lg:flex-row items-start lg:items-center gap-4 p-4 lg:p-0`}>
            {links.map(([to, t]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'font-bold text-pri' : '')}>{t}</NavLink>
            ))}
            <button aria-label="Toggle dark mode" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</button>
            {user ? (
              <>
                <Link to="/dashboard" className="btn">{user.name.split(' ')[0]}</Link>
                <button onClick={() => setUser(null)}>Log out</button>
              </>
            ) : (
              <Link to="/login" className="btn">Log in</Link>
            )}
          </div>
        </nav>
      </header>
      <main id="main" className="max-w-6xl mx-auto p-4 min-h-[70vh]"><Outlet /></main>
      <footer className="text-center text-mut p-8">© 2026 Hearth &amp; Paw. Demo project.</footer>
      {toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-ink text-bg px-4 py-2 rounded-xl">{toast}</div>}
    </>
  )
}

function Guard({ children }) {
  const { user } = useApp()
  const loc = useLocation()
  return user ? children : <Navigate to="/login" replace state={{ from: loc.pathname }} />
}

export default function App() {
  return (
    <Provider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/pet/:id" element={<Pet />} />
          <Route path="/apply/:id" element={<Guard><Apply /></Guard>} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Route>
      </Routes>
    </Provider>
  )
}