import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

beforeEach(() => localStorage.clear())
const go = (p) => render(<MemoryRouter initialEntries={[p]}><App /></MemoryRouter>)

test('login shows errors on empty form', () => {
  go('/login')
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
})

test('search filters pets', () => {
  go('/adopt')
  fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'mango' } })
  expect(screen.getByText('Mango')).toBeInTheDocument()
  expect(screen.queryByText('Luna')).toBeNull()
})

test('favourite persists', () => {
  go('/adopt')
  fireEvent.click(screen.getByLabelText('Save Mango'))
  expect(screen.getByLabelText('Unsave Mango')).toHaveAttribute('aria-pressed', 'true')
  expect(JSON.parse(localStorage.getItem('hp_favs'))).toContain(1)
})

test('dashboard redirects when signed out', () => {
  go('/dashboard')
  expect(screen.getByText('Welcome back')).toBeInTheDocument()
})

test('events RSVP redirects to login when signed out', () => {
  go('/events')
  fireEvent.click(screen.getAllByRole('button', { name: 'RSVP' })[0])
  expect(screen.getByText('Welcome back')).toBeInTheDocument()
})

test('story form validates', () => {
  go('/stories')
  fireEvent.click(screen.getByRole('button', { name: 'Share' }))
  expect(screen.getAllByRole('alert').length).toBe(3)
})