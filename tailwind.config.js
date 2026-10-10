export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: {
    bg: 'var(--bg)', card: 'var(--card)', ink: 'var(--ink)',
    pri: 'var(--pri)', acc: 'var(--acc)', mut: 'var(--mut)' } } },
}