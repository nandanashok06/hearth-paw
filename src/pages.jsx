import { useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { pets, stories, events } from './data'
import { useApp } from './store'

const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e)

function Field({ label, error, as: T = 'input', ...p }) {
  const id = 'f-' + label.replace(/\W/g, '')
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block font-semibold mb-1">{label}</label>
      <T id={id} className="input" aria-invalid={!!error} aria-describedby={error ? id + '-e' : undefined} {...p} />
      {error && <p id={id + '-e'} role="alert" className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}

function PetCard({ p }) {
  const { favs, toggleFav } = useApp()
  const on = favs.includes(p.id)
  return (
    <article className="card overflow-hidden">
      <div className="h-36 grid place-items-center text-6xl bg-pri/10 relative" role="img" aria-label={`${p.species} illustration`}>
        {p.emoji}
        <button className="absolute top-2 right-2 bg-card rounded-full p-2" aria-pressed={on}
          aria-label={`${on ? 'Unsave' : 'Save'} ${p.name}`} onClick={() => toggleFav(p.id)}>
          <Heart size={18} fill={on ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold">{p.name}</h3>
        <p className="text-mut">{p.breed} · {p.age} · {p.size}</p>
        <Link to={`/pet/${p.id}`} className="btn mt-3">Meet {p.name}</Link>
      </div>
    </article>
  )
}

export function Home() {
  return (
    <>
      <section className="grid md:grid-cols-2 gap-8 items-center py-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold">Find your fur-ever family.</h1>
          <p className="text-mut my-4">Meet dogs, cats and rabbits waiting for a home. Adopt, volunteer or donate today.</p>
          <Link to="/adopt" className="btn">Meet our pets</Link>{' '}
          <Link to="/donate" className="btn-o">Donate</Link>
        </div>
        <div className="text-8xl text-center" aria-hidden="true">🐶🐱</div>
      </section>
      <section className="grid grid-cols-3 gap-4 text-center card p-6">
        {[['312', 'Adopted'], ['48', 'In our care'], ['120', 'Volunteers']].map(([n, l]) => (
          <div key={l}><p className="text-3xl font-bold text-pri">{n}</p><p className="text-mut">{l}</p></div>
        ))}
      </section>
      <h2 className="text-2xl font-bold mt-12 mb-4">Featured pets</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{pets.slice(0, 3).map((p) => <PetCard key={p.id} p={p} />)}</div>
    </>
  )
}

export function Adopt() {
  const [q, setQ] = useState('')
  const [sp, setSp] = useState('All')
  const [age, setAge] = useState('All')
  const list = pets.filter((p) =>
    (sp === 'All' || p.species === sp) && (age === 'All' || p.age === age) &&
    (p.name + p.breed).toLowerCase().includes(q.toLowerCase()))
  const reset = () => { setQ(''); setSp('All'); setAge('All') }
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Adopt a pet</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input flex-1 min-w-[200px]" placeholder="Search name or breed" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-auto" aria-label="Species" value={sp} onChange={(e) => setSp(e.target.value)}>
          {['All', 'Dog', 'Cat', 'Rabbit'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="input w-auto" aria-label="Age" value={age} onChange={(e) => setAge(e.target.value)}>
          {['All', 'Puppy', 'Young', 'Adult', 'Senior'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <p className="text-mut mb-3">{list.length} found</p>
      {list.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{list.map((p) => <PetCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="card p-8 text-center"><p>No pets match.</p><button className="btn mt-3" onClick={reset}>Reset filters</button></div>
      )}
    </>
  )
}

export function Pet() {
  const p = pets.find((x) => x.id == useParams().id)
  if (!p) return <p>Pet not found.</p>
  return (
    <div className="grid md:grid-cols-2 gap-8 py-6">
      <div className="card h-72 grid place-items-center text-9xl bg-pri/10" role="img" aria-label={`${p.species} illustration`}>{p.emoji}</div>
      <div>
        <h1 className="text-4xl font-bold">{p.name}</h1>
        <p className="text-mut my-2">{p.species} · {p.breed} · {p.age} · {p.size}</p>
        <p className="my-4">{p.story}</p>
        <p className="mb-4">✅ Vaccinated · ✅ Neutered · ✅ Health checked</p>
        <Link to={`/apply/${p.id}`} className="btn">Apply to adopt</Link>
      </div>
    </div>
  )
}

export function Apply() {
  const pet = pets.find((x) => x.id == useParams().id)
  const { user, apps, setApps, say } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [d, setD] = useState({ name: user?.name || '', phone: '', home: '', exp: '' })
  const [err, setErr] = useState({})
  if (!pet) return <p>Pet not found.</p>
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const check = () => {
    const e = {}
    if (step === 0) {
      if (d.name.trim().length < 2) e.name = 'Enter your full name.'
      if (!/^\d{10}$/.test(d.phone)) e.phone = 'Enter a 10-digit phone number.'
    }
    if (step === 1 && !d.home) e.home = 'Choose your home type.'
    if (step === 2 && (d.exp.length < 20 || d.exp.length > 300)) e.exp = 'Write 20 to 300 characters.'
    setErr(e)
    return !Object.keys(e).length
  }
  const submit = () => {
    setApps([...apps, { id: Date.now(), petId: pet.id, status: 'Submitted', ...d }])
    say('Application sent!')
    nav('/dashboard')
  }
  const titles = ['About you', 'Your home', 'Experience', 'Review']
  return (
    <div className="max-w-xl mx-auto card p-6 mt-6">
      <h1 className="text-2xl font-bold">Apply for {pet.name}</h1>
      <p className="text-mut mb-3">Step {step + 1} of 4: {titles[step]}</p>
      <div className="h-2 bg-black/10 rounded mb-4"><div className="h-2 bg-pri rounded" style={{ width: `${(step + 1) * 25}%` }} /></div>
      {step === 0 && <><Field label="Full name" value={d.name} onChange={set('name')} error={err.name} /><Field label="Phone" value={d.phone} onChange={set('phone')} error={err.phone} inputMode="numeric" /></>}
      {step === 1 && (
        <Field label="Home type" as="select" value={d.home} onChange={set('home')} error={err.home}>
          <option value="">Select</option><option>Apartment</option><option>House with yard</option><option>Hostel or shared</option>
        </Field>
      )}
      {step === 2 && <Field label="Pet experience" as="textarea" rows={4} value={d.exp} onChange={set('exp')} error={err.exp} />}
      {step === 3 && <ul className="mb-4 space-y-1"><li>Name: {d.name}</li><li>Phone: {d.phone}</li><li>Home: {d.home}</li><li>Experience: {d.exp}</li></ul>}
      <div className="flex justify-between">
        <button className="btn-o" disabled={!step} onClick={() => setStep(step - 1)}>Back</button>
        {step < 3 ? <button className="btn" onClick={() => check() && setStep(step + 1)}>Continue</button> : <button className="btn" onClick={submit}>Submit</button>}
      </div>
    </div>
  )
}

export function Volunteer() {
  const [d, setD] = useState({ name: '', email: '', role: '' })
  const [err, setErr] = useState({})
  const [done, setDone] = useState(false)
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const go = () => {
    const e = {}
    if (d.name.trim().length < 2) e.name = 'Enter your name.'
    if (!emailOk(d.email)) e.email = 'Enter a valid email.'
    if (!d.role) e.role = 'Pick a role.'
    setErr(e)
    if (!Object.keys(e).length) setDone(true)
  }
  if (done) return <div className="card p-8 text-center mt-6"><h1 className="text-2xl font-bold">Thank you, {d.name}!</h1><p>We will email you shift details.</p></div>
  return (
    <div className="max-w-xl mx-auto card p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">Volunteer with us</h1>
      <Field label="Name" value={d.name} onChange={set('name')} error={err.name} />
      <Field label="Email" value={d.email} onChange={set('email')} error={err.email} />
      <Field label="Role" as="select" value={d.role} onChange={set('role')} error={err.role}>
        <option value="">Select</option><option>Dog walking</option><option>Cat socialising</option><option>Events</option><option>Transport</option>
      </Field>
      <button className="btn" onClick={go}>Sign up</button>
    </div>
  )
}

export function Donate() {
  const { dons, setDons, say } = useApp()
  const [amt, setAmt] = useState('')
  const [monthly, setMonthly] = useState(false)
  const [err, setErr] = useState('')
  const raised = 62000 + dons.reduce((s, x) => s + x.amt, 0)
  const give = () => {
    const n = Number(amt)
    if (!amt || isNaN(n) || n < 1 || n > 100000) return setErr('Enter an amount from 1 to 1,00,000.')
    setErr(''); setDons([...dons, { id: Date.now(), amt: n, monthly }]); setAmt('')
    say('Thank you! (Demo: no payment taken)')
  }
  return (
    <div className="max-w-xl mx-auto card p-6 mt-6">
      <h1 className="text-2xl font-bold">Donate</h1>
      <p className="text-mut mb-2">₹{raised.toLocaleString('en-IN')} of ₹1,00,000 raised</p>
      <div className="h-3 bg-black/10 rounded mb-4" role="progressbar" aria-valuenow={Math.min(100, raised / 1000)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-3 bg-acc rounded" style={{ width: `${Math.min(100, raised / 1000)}%` }} />
      </div>
      <div className="flex gap-2 mb-3">{[500, 1000, 2500].map((a) => <button key={a} className="btn-o" onClick={() => setAmt(String(a))}>₹{a}</button>)}</div>
      <Field label="Amount (₹)" value={amt} onChange={(e) => setAmt(e.target.value)} error={err} inputMode="numeric" />
      <label className="flex gap-2 mb-4"><input type="checkbox" checked={monthly} onChange={(e) => setMonthly(e.target.checked)} /> Make it monthly</label>
      <button className="btn" onClick={give}>Donate</button>
    </div>
  )
}

export function About() {
  const [open, setOpen] = useState(-1)
  const [d, setD] = useState({ email: '', msg: '' })
  const [err, setErr] = useState({})
  const { say } = useApp()
  const faqs = [['Is adoption free?', 'We ask a small fee to cover vaccines.'], ['Can I visit first?', 'Yes. Visit daily, 10am to 5pm.'], ['Do you take strays?', 'Yes. Call us for rescue help.']]
  const send = () => {
    const e = {}
    if (!emailOk(d.email)) e.email = 'Enter a valid email.'
    if (d.msg.trim().length < 10) e.msg = 'Write at least 10 characters.'
    setErr(e)
    if (!Object.keys(e).length) { say('Message sent!'); setD({ email: '', msg: '' }) }
  }
  return (
    <div className="grid md:grid-cols-2 gap-8 mt-6">
      <div>
        <h1 className="text-3xl font-bold mb-3">About us</h1>
        <p className="mb-6 text-mut">We rescue, heal and rehome animals. Every pet leaves vaccinated, neutered and loved.</p>
        {faqs.map(([q, a], i) => (
          <div key={q} className="card mb-2">
            <button className="w-full text-left p-3 font-bold" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}</button>
            {open === i && <p className="px-3 pb-3">{a}</p>}
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-3">Contact us</h2>
        <Field label="Your email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} error={err.email} />
        <Field label="Message" as="textarea" rows={4} value={d.msg} onChange={(e) => setD({ ...d, msg: e.target.value })} error={err.msg} />
        <button className="btn" onClick={send}>Send</button>
      </div>
    </div>
  )
}

export function Login() {
  const { login, signup } = useApp()
  const nav = useNavigate()
  const from = useLocation().state?.from || '/dashboard'
  const [mode, setMode] = useState('login')
  const [d, setD] = useState({ name: '', email: '', pw: '' })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const go = () => {
    const e = {}
    if (mode === 'signup' && d.name.trim().length < 2) e.name = 'Enter your name.'
    if (!emailOk(d.email)) e.email = 'Enter a valid email.'
    if (mode === 'signup' ? !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(d.pw) : d.pw.length < 6)
      e.pw = mode === 'signup' ? 'Use 8+ characters with letters and numbers.' : 'Password must be 6+ characters.'
    if (!Object.keys(e).length) {
      if (mode === 'login' && !login(d.email, d.pw)) e.form = 'Wrong email or password.'
      if (mode === 'signup' && !signup(d.name, d.email, d.pw)) e.email = 'Email already registered.'
    }
    setErr(e)
    if (!Object.keys(e).length) nav(from, { replace: true })
  }
  return (
    <div className="max-w-sm mx-auto card p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Welcome back' : 'Join Hearth & Paw'}</h1>
      {err.form && <p role="alert" className="text-red-600 mb-3">{err.form}</p>}
      {mode === 'signup' && <Field label="Name" value={d.name} onChange={set('name')} error={err.name} />}
      <Field label="Email" value={d.email} onChange={set('email')} error={err.email} />
      <Field label="Password" type="password" value={d.pw} onChange={set('pw')} error={err.pw} />
      <button className="btn w-full" onClick={go}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      {mode === 'login' && <button className="btn-o w-full mt-2" onClick={() => setD({ ...d, email: 'demo@hearth.org', pw: 'Paws@123' })}>Fill demo account</button>}
      <button className="mt-3 text-pri underline" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr({}) }}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
      </button>
    </div>
  )
}

export function Dashboard() {
  const { user, apps, setApps, favs, dons, rsvps } = useApp()
  const mine = apps.filter((a) => a.name)
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Hello, {user.name.split(' ')[0]}</h1>
      <h2 className="text-xl font-bold mb-2">Your applications</h2>
      {mine.length ? mine.map((a) => (
        <div key={a.id} className="card p-4 mb-2 flex justify-between items-center">
          <span>{pets.find((p) => p.id === a.petId)?.name} · <b>{a.status}</b></span>
          <button className="btn-o" onClick={() => setApps(apps.filter((x) => x.id !== a.id))}>Withdraw</button>
        </div>
      )) : <p className="text-mut">None yet. <Link to="/adopt" className="underline">Browse pets</Link></p>}
      <h2 className="text-xl font-bold mt-8 mb-2">Saved pets</h2>
      {favs.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{pets.filter((p) => favs.includes(p.id)).map((p) => <PetCard key={p.id} p={p} />)}</div> : <p className="text-mut">Tap a heart to save a pet.</p>}
      <h2 className="text-xl font-bold mt-8 mb-2">Your donations</h2>
      {dons.length ? dons.map((x) => <p key={x.id}>₹{x.amt} {x.monthly && '(monthly)'}</p>) : <p className="text-mut">No donations yet.</p>}
      <h2 className="text-xl font-bold mt-8 mb-2">Your events</h2>
      {rsvps.length ? events.filter((e) => rsvps.includes(e.id)).map((e) => <p key={e.id}>{e.emoji} {e.title} · {e.date}</p>) : <p className="text-mut">No RSVPs yet.</p>}
    </>
  )
}

export function Stories() {
  const { myStories, addStory, say } = useApp()
  const [d, setD] = useState({ owner: '', pet: '', text: '' })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const share = () => {
    const e = {}
    if (d.owner.trim().length < 2) e.owner = 'Enter your name.'
    if (d.pet.trim().length < 2) e.pet = 'Enter your pet\'s name.'
    if (d.text.length < 20 || d.text.length > 300) e.text = 'Write 20 to 300 characters.'
    setErr(e)
    if (Object.keys(e).length) return
    addStory({ ...d, emoji: '💛' })
    setD({ owner: '', pet: '', text: '' })
    say('Story shared!')
  }
  const all = [...myStories, ...stories]
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Success stories</h1>
      <p className="text-mut mb-6">Happy endings from our adopters.</p>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {all.map((s) => (
          <article key={s.id} className="card p-5">
            <p className="text-4xl mb-2" aria-hidden="true">{s.emoji}</p>
            <h2 className="text-xl font-bold">{s.pet}</h2>
            <p className="my-2">{s.text}</p>
            <p className="text-mut text-sm">{s.owner}</p>
          </article>
        ))}
      </div>
      <div className="max-w-xl card p-6">
        <h2 className="text-xl font-bold mb-3">Share your story</h2>
        <Field label="Your name" value={d.owner} onChange={set('owner')} error={err.owner} />
        <Field label="Pet's name" value={d.pet} onChange={set('pet')} error={err.pet} />
        <Field label="Your story" as="textarea" rows={4} value={d.text} onChange={set('text')} error={err.text} />
        <button className="btn" onClick={share}>Share</button>
      </div>
    </>
  )
}

export function Events() {
  const { user, rsvps, toggleRsvp, say } = useApp()
  const nav = useNavigate()
  const go = (id) => {
    if (!user) return nav('/login', { state: { from: '/events' } })
    say(rsvps.includes(id) ? 'RSVP cancelled' : 'You are going!')
    toggleRsvp(id)
  }
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Upcoming events</h1>
      <p className="text-mut mb-6">Log in to RSVP.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {events.map((e) => {
          const on = rsvps.includes(e.id)
          return (
            <article key={e.id} className="card p-5 flex gap-4">
              <div className="text-5xl" aria-hidden="true">{e.emoji}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{e.title}</h2>
                <p className="text-pri font-semibold">
                  {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {e.time}
                </p>
                <p className="text-mut">{e.place}</p>
                <p className="my-2">{e.desc}</p>
                <button className={on ? 'btn-o' : 'btn'} aria-pressed={on} onClick={() => go(e.id)}>
                  {on ? 'Going ✓ (cancel)' : 'RSVP'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}