
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import emailjs from '@emailjs/browser'
import { profile } from '../data/profile'
import { GlassPanel } from './GlassPanel'

type Field = 'name' | 'email' | 'message'
type Errors = Partial<Record<Field, string>>

type Status = {
  type: 'success' | 'error'
  text: string
} | null

const ORDER: Field[] = ['name', 'email', 'message']

const EMAILJS_SERVICE_ID = 'service_jnukhpi'
const EMAILJS_TEMPLATE_ID = 'template_nclsi0d'
const EMAILJS_PUBLIC_KEY = 'ymjhO3hn4zQg7lspM'

function validate(v: Record<Field, string>): Errors {
  const e: Errors = {}

  if (!v.name.trim()) {
    e.name = 'Enter your name.'
  }

  if (!v.email.trim()) {
    e.email = 'Enter your email so I can reply.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) {
    e.email = 'That email address looks incomplete. Check it and try again.'
  }

  if (v.message.trim().length < 10) {
    e.message = 'Write at least a sentence (10 characters) so I know how to help.'
  }

  return e
}

function Row({
  id,
  label,
  error,
  children,
}: {
  id: Field
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <label
        htmlFor={`contact-${id}`}
        className="pt-2.5 font-mono text-sm text-cyan-neon"
      >
        <span aria-hidden="true" className="mr-2 text-ok">
          $
        </span>
        {label}
      </label>

      <div>
        {children}
        {error && (
          <p id={`contact-${id}-error`} className="mt-2 text-sm text-warn">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border bg-void/70 px-4 py-2.5 font-mono text-base text-ink caret-cyan-neon outline-none transition-colors placeholder:text-slate-mute/60 focus:border-cyan-neon sm:text-sm'

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>(null)
  const [isSending, setIsSending] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSending) return

    const data = new FormData(e.currentTarget)

    const values: Record<Field, string> = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    }

    const found = validate(values)

    setErrors(found)
    setStatus(null)

    const first = ORDER.find((k) => found[k])

    if (first) {
      ;(formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }

    setIsSending(true)

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          title: `Portfolio enquiry from ${values.name.trim()}`,
          name: values.name.trim(),
          time: new Date().toLocaleString(),
          from_email: values.email.trim(),
          message: values.message.trim(),
          email: profile.email,
        },
        {
          publicKey: EMAILJS_PUBLIC_KEY,
        },
      )

      setStatus({
        type: 'success',
        text: 'Message sent successfully! Thank you for reaching out.',
      })

      formRef.current?.reset()
      setErrors({})
    } catch (error) {
      console.error('EmailJS send failed:', error)

      setStatus({
        type: 'error',
        text: `Message could not be sent. Please try again or email ${profile.email} directly.`,
      })
    } finally {
      setIsSending(false)
    }
  }

  const describedBy = (k: Field) =>
    errors[k] ? `contact-${k}-error` : undefined

  const border = (k: Field) =>
    errors[k] ? 'border-warn' : 'border-slate-line'

  return (
    <section id="message" aria-labelledby="message-title" className="relative pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <GlassPanel className="max-w-2xl overflow-hidden rounded-3xl">
          <div className="border-b border-slate-line px-6 py-4 md:px-8">
            <h2 id="message-title" className="font-mono text-base font-medium text-ink">
              Send a message
            </h2>

            <p className="mt-1 text-sm text-slate-mute">
              Send me a message directly through this form. I’ll get back to you as soon as I can.
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 px-6 py-6 md:px-8 md:py-8"
          >
            <Row id="name" label="name" error={errors.name}>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                aria-invalid={!!errors.name}
                aria-describedby={describedBy('name')}
                placeholder="Ada Lovelace"
                className={`${inputClass} ${border('name')}`}
                disabled={isSending}
              />
            </Row>

            <Row id="email" label="email" error={errors.email}>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
                aria-invalid={!!errors.email}
                aria-describedby={describedBy('email')}
                placeholder="ada@example.com"
                className={`${inputClass} ${border('email')}`}
                disabled={isSending}
              />
            </Row>

            <Row id="message" label="message" error={errors.message}>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                minLength={10}
                maxLength={5000}
                required
                aria-invalid={!!errors.message}
                aria-describedby={describedBy('message')}
                placeholder="What are you building, and where is it hurting?"
                className={`${inputClass} resize-y ${border('message')}`}
                disabled={isSending}
              />
            </Row>

            <div className="flex flex-wrap items-center gap-4 sm:pl-[8rem]">
              <button
                type="submit"
                disabled={isSending}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? 'Sending...' : 'Send message'}
              </button>

              <p
                role="status"
                aria-live="polite"
                className={`text-sm ${
                  status?.type === 'error' ? 'text-warn' : 'text-ok'
                }`}
              >
                {status?.text ?? ''}
              </p>
            </div>
          </form>
        </GlassPanel>
      </div>
    </section>
  )
}
