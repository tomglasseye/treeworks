import {useState} from 'react'
import type {ContactFormSection, SiteSettings} from '~/types'
import {Section as Wrapper, toneMuted} from '../ui/Section'
import {formatAddress} from './ContactDetails'
import {opt, optList} from '~/lib/stega'

/** Field ids here MUST match public/__forms.html. `npm run check:forms` enforces it. */
const FIELD_LABELS: Record<string, string> = {
  name: 'Your name',
  email: 'Email address',
  phone: 'Phone number',
  service: 'What do you need?',
  postcode: 'Postcode',
  message: 'Tell us about the job',
  source: 'How did you hear about us?',
}

const FIELD_TYPES: Record<string, string> = {
  name: 'text',
  email: 'email',
  phone: 'tel',
  postcode: 'text',
  source: 'text',
}

const inputBase =
  'w-full rounded-input border border-rule bg-bone px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-canopy'

export function ContactForm({section, settings}: {section: ContactFormSection; settings?: SiteSettings}) {
  const {
    heading,
    intro,
    formName = 'contact',
    submitLabel = 'Send enquiry',
    successMessage,
    consentText,
    showContactDetailsAlongside = true,
    appearance,
  } = section

  // GROQ sends null for absent arrays, so coalesce rather than default.
  // Cleaned: these drive .includes()/.filter() and become input name attributes.
  const fields = section.fields ? optList(section.fields) : ['name', 'email', 'phone', 'message']
  const serviceOptions = optList(section.serviceOptions)
  const netlifyFormName = opt(formName) ?? 'contact'

  const tone = opt(appearance?.tone)
  const onDark = tone === 'bark'
  const muted = toneMuted(tone)

  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    const form = event.currentTarget
    const data = new FormData(form)

    try {
      // Netlify Forms accepts an ordinary url-encoded POST to any path on the
      // site. `form-name` is what ties it to the hidden form in __forms.html.
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      })
      if (!response.ok) throw new Error(String(response.status))
      setState('sent')
      form.reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <Wrapper appearance={appearance} grainSeed={section._key}>
        <div className="mx-auto max-w-[52ch] rounded-panel bg-lichen p-10 text-center">
          <h2 className="u-h3 text-bark">Thank you</h2>
          <p className="mt-4 text-bark/80">
            {successMessage ?? 'We have got your message and will come back to you as soon as we can.'}
          </p>
          {settings?.phone ? (
            <p className="mt-6 text-sm text-bark/70">
              Need us urgently?{' '}
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-bark">
                Call {settings.phone}
              </a>
            </p>
          ) : null}
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper appearance={appearance} grainSeed={section._key}>
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          {heading ? (
            <h2 className={`u-h2 ${onDark ? 'text-bone' : 'text-bark'}`}>{heading}</h2>
          ) : null}
          {intro ? <p className={`mt-4 max-w-[52ch] text-lg ${muted}`}>{intro}</p> : null}

          <form
            name={netlifyFormName}
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="mt-10 grid gap-5"
          >
            <input type="hidden" name="form-name" value={netlifyFormName} />
            <p className="hidden">
              <label>
                Leave this field empty: <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {fields
                .filter((f) => ['name', 'email', 'phone', 'postcode'].includes(f))
                .map((field) => (
                  <label key={field} className="block">
                    <span className={`u-eyebrow mb-2 block ${muted}`}>
                      {FIELD_LABELS[field]}
                      {field === 'name' ? ' *' : ''}
                    </span>
                    <input
                      type={FIELD_TYPES[field] ?? 'text'}
                      name={field}
                      required={field === 'name'}
                      autoComplete={
                        field === 'name' ? 'name' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'postal-code'
                      }
                      className={inputBase}
                    />
                  </label>
                ))}
            </div>

            {fields.includes('service') ? (
              <label className="block">
                <span className={`u-eyebrow mb-2 block ${muted}`}>{FIELD_LABELS.service}</span>
                <select name="service" className={inputBase} defaultValue="">
                  <option value="" disabled>
                    Choose a service
                  </option>
                  {serviceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {fields.includes('message') ? (
              <label className="block">
                <span className={`u-eyebrow mb-2 block ${muted}`}>{FIELD_LABELS.message}</span>
                <textarea name="message" rows={6} className={inputBase} />
              </label>
            ) : null}

            {fields.includes('source') ? (
              <label className="block">
                <span className={`u-eyebrow mb-2 block ${muted}`}>{FIELD_LABELS.source}</span>
                <input type="text" name="source" className={inputBase} />
              </label>
            ) : null}

            {consentText ? <p className={`text-sm ${muted}`}>{consentText}</p> : null}

            {state === 'error' ? (
              <p role="alert" className="rounded-input bg-sap/10 px-4 py-3 text-sm text-sap-ink">
                Something went wrong sending that. Please try again, or call{' '}
                {settings?.phone ?? 'us'} instead.
              </p>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex items-center justify-center rounded-pill bg-bark px-8 py-3.5 text-bone transition-colors hover:bg-bark-soft disabled:opacity-60"
              >
                {state === 'sending' ? 'Sending…' : submitLabel}
              </button>
            </div>
          </form>
        </div>

        {showContactDetailsAlongside && settings ? (
          <aside className={`rounded-panel p-8 ${onDark ? 'bg-bone/10' : 'bg-lichen-soft'}`}>
            <h3 className={`u-eyebrow mb-6 ${muted}`}>Or reach us directly</h3>
            <dl className="space-y-6">
              {settings.phone ? (
                <div>
                  <dt className={`text-sm ${muted}`}>Phone</dt>
                  <dd>
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, '')}`}
                      className={`font-display text-xl no-underline ${onDark ? 'text-bone' : 'text-bark'}`}
                    >
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.email ? (
                <div>
                  <dt className={`text-sm ${muted}`}>Email</dt>
                  <dd>
                    <a
                      href={`mailto:${settings.email}`}
                      className={`break-words font-display text-lg no-underline ${onDark ? 'text-bone' : 'text-bark'}`}
                    >
                      {settings.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.address ? (
                <div>
                  <dt className={`text-sm ${muted}`}>Address</dt>
                  <dd className={onDark ? 'text-bone/85' : 'text-ink'}>
                    <address className="not-italic">{formatAddress(settings.address)}</address>
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        ) : null}
      </div>
    </Wrapper>
  )
}
