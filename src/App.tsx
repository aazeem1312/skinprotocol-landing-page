import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
type FormState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

interface SubmitPayload {
  name: string
  email: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSource(): string {
  try {
    return new URLSearchParams(window.location.search).get('source') || 'direct'
  } catch {
    return 'direct'
  }
}

const SOURCE = getSource()
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter() {
  const [count, setCount] = useState<number | undefined>(undefined)

  useEffect(() => {
    async function fetchCount() {
      const { count: exactCount } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
      
      if (exactCount !== null) {
        setCount(exactCount)
      }
    }
    fetchCount()
  }, [])

  if (count === undefined) {
    return (
      <p className="text-[12px] text-[#888888] tracking-[0.05em] animate-counter-pulse">
        — people already waiting
      </p>
    )
  }

  return (
    <p className="text-[12px] text-[#888888] tracking-[0.05em]">
      <span className="font-semibold text-[#F5F0E8]">{count.toLocaleString()}</span>{' '}
      people already waiting
    </p>
  )
}

// ─── WaitlistForm ─────────────────────────────────────────────────────────────
interface WaitlistFormProps {
  formId: string
  emailId: string
  btnId: string
  formState: FormState
  errorMessage: string
  onSubmit: (payload: SubmitPayload) => Promise<void>
  onInputFocus: () => void
}

function WaitlistForm({
  formId,
  emailId,
  btnId,
  formState,
  errorMessage,
  onSubmit,
  onInputFocus,
}: WaitlistFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const isLocked = formState === 'success' || formState === 'duplicate'
  const isLoading = formState === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, email })
  }

  const btnLabel = () => {
    if (formState === 'success') return 'You are on the list ✓'
    if (formState === 'duplicate') return 'Already registered'
    if (formState === 'loading') return 'Joining…'
    return 'Join the waitlist'
  }

  const btnClass = () => {
    const base = 'w-full font-bold text-sm py-[14px] rounded-lg transition-all duration-200'
    if (formState === 'success')
      return `${base} bg-[#141414] text-[#4CAF50] border border-[#2A2A2A] cursor-not-allowed`
    if (formState === 'duplicate')
      return `${base} bg-[#141414] text-[#888888] border border-[#2A2A2A] cursor-not-allowed`
    if (formState === 'loading')
      return `${base} bg-[#F5F0E8] text-[#0A0A0A] opacity-60 cursor-not-allowed`
    return `${base} bg-[#F5F0E8] text-[#0A0A0A] hover:opacity-90 active:opacity-70 cursor-pointer`
  }

  return (
    <form id={formId} className="w-full flex flex-col gap-3" onSubmit={handleSubmit} noValidate>

      {/* Name input */}
      <label htmlFor={`${formId}-name`} className="sr-only">Full name</label>
      <input
        id={`${formId}-name`}
        type="text"
        autoComplete="name"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={onInputFocus}
        disabled={isLocked || isLoading}
        className="w-full bg-[#141414] border border-[#2A2A2A] text-[#F5F0E8] text-sm py-[14px] px-4 rounded-lg focus:border-[#F5F0E8] focus:ring-0 outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      />

      {/* Email input */}
      <label htmlFor={emailId} className="sr-only">
        Email address
      </label>
      <input
        id={emailId}
        type="email"
        autoComplete="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={onInputFocus}
        disabled={isLocked || isLoading}
        className="w-full bg-[#141414] border border-[#2A2A2A] text-[#F5F0E8] text-sm py-[14px] px-4 rounded-lg focus:border-[#F5F0E8] focus:ring-0 outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      />
      <button
        id={btnId}
        type="submit"
        disabled={isLocked || isLoading}
        className={btnClass()}
      >
        {btnLabel()}
      </button>

      {formState === 'error' && (
        <p className="text-[11px] text-center text-[#e57373]" role="alert">
          {errorMessage}
        </p>
      )}

      <p className="text-[11px] text-[#555555] text-center mt-2">
        No spam. Just a launch notification.
      </p>
    </form>
  )
}

// ─── Problem cards data ───────────────────────────────────────────────────────
const PROBLEMS = [
  {
    title: 'Scanned Minimalist. Product not found.',
    body: '70% scan failure for Indian and Asian brands.',
  },
  {
    title: 'Mystery scores. Zero sources.',
    body: 'No explanation for why an ingredient is flagged.',
  },
  {
    title: "Can't find the cancel button.",
    body: 'OnSkin charges $6.99 a week and hides the exit.',
  },
]

const FEATURES = [
  '500+ Indian and Asian brands at launch',
  'Every flagged ingredient shows its source',
  'Melanin-aware skin profile scoring',
  'Cancel anytime. Always visible. Always 2 taps.',
]

const PILLS = ['500M+ underserved users', '70%+ scan fail rate', '$0 billing tricks']

// ─── Section divider ──────────────────────────────────────────────────────────
const Divider = () => <div className="border-t border-[#2A2A2A]" />

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputFocus = () => {
    if (formState === 'error') setFormState('idle')
  }

  const handleSubmit = async ({ name, email }: SubmitPayload) => {
    if (!name || name.trim().length < 2) {
      setErrorMessage('Please enter your name.')
      setFormState('error')
      return
    }
    
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      setFormState('error')
      return
    }

    setFormState('loading')

    try {
      const formattedEmail = email.trim().toLowerCase();
      
      // 1. Check for duplicates
      const { data: existingUser } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', formattedEmail)
        .single()

      if (existingUser) {
        setFormState('duplicate')
        return
      }
      
      // We can ignore the case where searchError throws a PGRST116 (No rows found), 
      // which is expected when the user doesn't exist.

      // 2. Insert new user
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([
          { name: name.trim(), email: formattedEmail, source: SOURCE },
        ])

      if (insertError) {
        if (insertError.code === '23505') { // Postgres unique violation code
          setFormState('duplicate')
        } else {
          console.error(insertError)
          setErrorMessage('Something went wrong. Please try again.')
          setFormState('error')
        }
        return
      }

      setFormState('success')
    } catch (err) {
      console.error(err)
      setErrorMessage('Connection error. Please try again.')
      setFormState('error')
    }
  }

  const sharedFormProps = {
    formState,
    errorMessage,
    onSubmit: handleSubmit,
    onInputFocus: handleInputFocus,
  }

  return (
    <main className="max-w-[480px] mx-auto min-h-screen bg-[#0A0A0A]">

      {/* ── HEADER ── */}
      <header className="flex flex-col items-center pt-12 pb-10">
        <h1 className="text-lg font-bold tracking-[0.35em] text-[#F5F0E8] leading-none">
          SKINPROTOCOL
        </h1>
        <p className="text-[11px] tracking-[0.5em] text-[#888888] uppercase mt-3">
          ingredient intelligence
        </p>
      </header>

      <Divider />

      {/* ── HERO ── */}
      <section className="flex flex-col items-center text-center px-6 py-[60px]">
        <span className="text-[10px] uppercase tracking-widest text-[#555555] mb-4">
          Protocol V.01
        </span>
        <h2 className="text-[28px] font-bold text-[#F5F0E8] leading-[1.3] max-w-[380px]">
          Finally. A skincare scanner built for your skin.
        </h2>
        <p className="text-sm leading-[1.6] text-[#888888] mt-6 px-4">
          Indian, Korean and Gulf brands. Transparent safety scores. No alarmism. No billing traps.
          Launching 2026.
        </p>
      </section>

      <Divider />

      {/* ── LIVE COUNTER + FORM 1 ── */}
      <section className="px-6 py-[60px]">
        <div className="flex flex-col items-center gap-6">
          <Counter />
          <WaitlistForm
            formId="form1"
            emailId="email1"
            btnId="btn1"
            {...sharedFormProps}
          />
        </div>
      </section>

      <Divider />

      {/* ── SOCIAL PROOF PILLS ── */}
      <section className="px-6 py-[60px]">
        <div className="flex flex-wrap justify-center gap-2">
          {PILLS.map((pill) => (
            <span
              key={pill}
              className="bg-[#141414] border border-[#2A2A2A] text-[#F5F0E8] text-[11px] py-1.5 px-3.5 rounded-full whitespace-nowrap"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── PROBLEM ── */}
      <section className="px-6 py-[60px]">
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-8">
          Your skincare app doesn't know you exist.
        </h2>
        <div className="flex flex-col gap-3">
          {PROBLEMS.map(({ title, body }) => (
            <article
              key={title}
              className="bg-[#141414] border border-[#2A2A2A] p-4 rounded-xl"
            >
              <h3 className="text-sm font-bold text-[#F5F0E8] mb-1">{title}</h3>
              <p className="text-[13px] leading-[1.5] text-[#888888]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── FEATURES ── */}
      <section className="px-6 py-[60px]">
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-8">
          Built different. From the ground up.
        </h2>
        <div className="flex flex-col gap-6">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-[14px]">
              <div className="w-1 h-6 bg-[#F5F0E8] flex-shrink-0" aria-hidden="true" />
              <p className="text-sm leading-[1.4] text-[#F5F0E8]">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── SECOND CTA ── */}
      <section className="px-6 py-[60px]">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-xl font-bold text-[#F5F0E8] text-center leading-snug">
            Be first to know when we launch.
          </h2>
          <WaitlistForm
            formId="form2"
            emailId="email2"
            btnId="btn2"
            {...sharedFormProps}
          />
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ── */}
      <footer className="flex flex-col items-center px-6 pt-[60px] pb-12 text-center">
        <p className="text-[12px] text-[#888888] tracking-wider mb-2">SkinProtocol — 2026</p>
        <p className="text-[11px] text-[#555555] max-w-[280px]">
          Built for the 500 million skincare users apps forgot.
        </p>
      </footer>

    </main>
  )
}
