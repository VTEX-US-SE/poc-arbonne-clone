import { useState, type FormEvent } from 'react'
import { Loader } from '@faststore/ui'

import { RichText } from 'src/components/ui/RichText'
import { useCart } from 'src/sdk/cart'
import { redirectToCheckout } from 'src/sdk/cart/redirectToCheckout'

import useAddRegistration from '../../hooks/useAddRegistration'

import styles from './JoinForm.module.scss'
import type { JoinFormProps } from './JoinForm.types'

const MIN_AGE = 18

/** Validated controls in DOM order -- the first failure is the one to focus. */
const FIELD_ORDER = ['birthDate', 'consultant', 'privacy', 'terms'] as const

interface Values {
  birthDate: string
  consultant: string
  consultantComms: boolean
  textMarketing: boolean
  privacy: boolean
  terms: boolean
}

type Errors = Partial<Record<keyof Values, string>>

const EMPTY: Values = {
  birthDate: '',
  consultant: '',
  consultantComms: false,
  textMarketing: false,
  privacy: false,
  terms: false,
}

/**
 * Filled info glyph. The `Info` symbol in the icon sprite is an outline drawn
 * on a 24x24 grid, and `Icon` emits no `viewBox` -- so it crops rather than
 * scales at any size below 24, and has no filled weight to match production.
 */
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="12" cy="7.75" r="1.25" fill="#fff" />
      <rect x="11" y="10.5" width="2" height="6.5" rx="1" fill="#fff" />
    </svg>
  )
}

/** Prod's error marker: outlined circle, exclamation inside. */
function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect x="11" y="6.5" width="2" height="7" rx="1" fill="currentColor" />
      <circle cx="12" cy="16.75" r="1.25" fill="currentColor" />
    </svg>
  )
}

function ErrorMessage({
  id,
  role,
  children,
}: {
  id?: string
  role?: string
  children: string
}) {
  return (
    <p id={id} role={role} className={styles.joinForm__error}>
      <WarningIcon />
      {children}
    </p>
  )
}

function yearsSince(date: string) {
  const birth = new Date(date)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())

  return beforeBirthday ? years - 1 : years
}

function validate(values: Values, requiredMessage: string): Errors {
  const errors: Errors = {}

  // Not a required-field failure -- the field is optional and filled, just with
  // a date that fails the age gate, so the shared message would be misleading.
  if (values.birthDate && yearsSince(values.birthDate) < MIN_AGE) {
    errors.birthDate = `You must be at least ${MIN_AGE} years old to proceed`
  }

  if (!values.consultant.trim()) {
    errors.consultant = requiredMessage
  }

  if (!values.privacy) {
    errors.privacy = requiredMessage
  }

  if (!values.terms) {
    errors.terms = requiredMessage
  }

  return errors
}

/**
 * Preferred Client registration form. Production collects this inside its own
 * checkout; VTEX checkout v6 cannot host it, so it moves to a landing page of
 * ours ahead of the cart.
 *
 * Only carries what checkout cannot: name, email, address, phone and password
 * are all either collected by checkout v6 or impossible here (VTEX ID needs an
 * emailed access key before a password can be set). Identity reaches the
 * enrollment record from the order's own `clientProfileData`.
 */
export default function JoinForm({
  requiredNote = '* indicates a required field',
  requiredMessage = 'This field is required',
  skuId = '9048',
  customerType = 'preferredClient',
  consultantCommsLabel = 'Yes, I want to receive communications from an Independent Consultant.',
  textMarketingLabel = 'Yes, I want to opt in to Arbonne Text Marketing Communications.',
  consultantCommsTooltip = 'Yes, allow my Consultant to contact me via phone, email, text, and social media messenger. I understand I can opt out at any time.',
  smsDisclaimer = 'By checking this box AND OPTING IN, you agree to receive recurring promotional text messages (SMS/MMS) from Arbonne, including recurring SMS/Text messages sent using an automatic telephone dialing system, at the mobile number provided. Message and data rates may apply, and message frequency may vary. Reply STOP to 258323 to opt out or HELP for assistance. See our Terms & Conditions and Privacy Policy.',
  privacyNoticeText = 'Our Privacy Notice Explains What Personal Information We Collect, Process, Store, Disclose to Third Parties, and The Associated Purpose. Please Click To Acknowledge That You Have Read And Understand The Privacy Notice, And That You Have Read, Understand, And Agree To Be Bound By The Website Terms of Use and Terms and Conditions for the Supply of Goods.',
  termsPrintUrl,
  termsText = '<p>Please read the Arbonne Customer Program Terms and Conditions, which contains an Arbitration Agreement and waiver of certain rights, including the right to a jury trial. You must accept these Terms and Conditions before you may join the Program. Your acceptance of these Terms and Conditions creates a binding and enforceable agreement between you and Arbonne.</p><p>If you sign this contract you have 30 days in which to get your money back.</p><p>By checking the box you confirm that you have read and agree to the Terms and Conditions of the Program.</p>',
  ctaLabel = 'PROCEED TO CHECKOUT',
}: JoinFormProps) {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const { id: orderFormId } = useCart()
  const { addRegistration, adding, error: submitError } = useAddRegistration()

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors(({ [key]: _cleared, ...rest }) => rest)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validate(values, requiredMessage)

    setErrors(found)

    const firstInvalid = FIELD_ORDER.find((key) => found[key])

    if (firstInvalid) {
      // The submit bar is pinned to the viewport, so a failure above the fold
      // is otherwise invisible and the button reads as dead.
      document.getElementById(`join-${firstInvalid}`)?.focus()

      return
    }

    const cartId = await addRegistration({
      skuId,
      customerType,
      // The Print-a-copy document is the agreement -- its URL identifies the
      // exact revision accepted, where a hand-kept version string drifts the
      // moment someone edits the terms without bumping it.
      agreementVersion: termsPrintUrl,
      sponsorId: values.consultant.trim(),
      birthDate: values.birthDate,
      consultantComms: values.consultantComms,
      textMarketing: values.textMarketing,
      orderFormId: orderFormId || undefined,
    })

    if (cartId) {
      redirectToCheckout(cartId)
    }
  }

  const optIns: Array<{
    name: 'consultantComms' | 'textMarketing'
    label: string
    tooltip?: string
  }> = [
    {
      name: 'consultantComms',
      label: consultantCommsLabel,
      tooltip: consultantCommsTooltip,
    },
    { name: 'textMarketing', label: textMarketingLabel },
  ]

  return (
    <form
      className={styles.joinForm}
      onSubmit={handleSubmit}
      noValidate
      data-arb-join-form
    >
      <div className={styles.joinForm__inner}>
        <p className={styles.joinForm__requiredNote}>{requiredNote}</p>

        <h2 className={styles.joinForm__sectionTitle}>Account Information</h2>
        <div className={styles.joinForm__card}>
          <div className={styles.joinForm__optIns}>
            {optIns.map(({ name, label, tooltip }) => (
              <div key={name} className={styles.joinForm__check}>
                <input
                  id={`join-${name}`}
                  className={styles.joinForm__checkbox}
                  type="checkbox"
                  checked={values[name]}
                  onChange={(event) => set(name, event.target.checked)}
                />
                <label
                  className={styles.joinForm__checkLabel}
                  htmlFor={`join-${name}`}
                >
                  {label}
                </label>
                {tooltip && (
                  <span className={styles.joinForm__tooltip}>
                    <button
                      type="button"
                      className={styles.joinForm__tooltipTrigger}
                      aria-label={tooltip}
                    >
                      <InfoIcon />
                    </button>
                    <span
                      className={styles.joinForm__tooltipBubble}
                      aria-hidden="true"
                    >
                      {tooltip}
                    </span>
                  </span>
                )}
              </div>
            ))}
            <RichText
              className={styles.joinForm__disclaimer}
              content={smsDisclaimer}
            />
          </div>
        </div>

        <h2 className={styles.joinForm__sectionTitle}>Personal Information</h2>
        <div className={styles.joinForm__card}>
          <div className={styles.joinForm__grid}>
            <div className={styles.joinForm__field}>
              <label
                className={styles.joinForm__label}
                htmlFor="join-birthDate"
              >
                Birth Date
              </label>
              <input
                id="join-birthDate"
                className={styles.joinForm__input}
                type="date"
                value={values.birthDate}
                onChange={(event) => set('birthDate', event.target.value)}
                aria-invalid={Boolean(errors.birthDate)}
                aria-describedby={
                  errors.birthDate ? 'join-birthDate-error' : undefined
                }
              />
              {errors.birthDate && (
                <ErrorMessage id="join-birthDate-error">
                  {errors.birthDate}
                </ErrorMessage>
              )}
            </div>
          </div>
        </div>

        <h2
          className={`${styles.joinForm__sectionTitle} ${styles['joinForm__sectionTitle--lead']}`}
        >
          Your Arbonne Independent Consultant
        </h2>
        <div className={styles.joinForm__group}>
          <div className={styles.joinForm__card}>
            {/* ponytail: mocked -- a plain id field until referral-link vs.
                search-picker is decided, then this becomes the real selector. */}
            <label
              className={styles.joinForm__srOnly}
              htmlFor="join-consultant"
            >
              Choose Consultant
            </label>
            <input
              id="join-consultant"
              className={styles.joinForm__consultant}
              type="text"
              placeholder="Choose Consultant"
              value={values.consultant}
              onChange={(event) => set('consultant', event.target.value)}
              aria-invalid={Boolean(errors.consultant)}
              aria-describedby={
                errors.consultant ? 'join-consultant-error' : undefined
              }
            />
          </div>
          {errors.consultant && (
            <ErrorMessage id="join-consultant-error">
              {errors.consultant}
            </ErrorMessage>
          )}
        </div>

        <h2 className={styles.joinForm__sectionTitle}>Privacy Notice</h2>
        <div className={styles.joinForm__group}>
          <div className={styles.joinForm__agreement}>
            <div className={styles.joinForm__check}>
              <input
                id="join-privacy"
                className={styles.joinForm__checkbox}
                type="checkbox"
                checked={values.privacy}
                onChange={(event) => set('privacy', event.target.checked)}
                aria-label="I acknowledge the Privacy Notice"
                aria-invalid={Boolean(errors.privacy)}
                aria-describedby={
                  errors.privacy ? 'join-privacy-error' : undefined
                }
              />
              <RichText
                className={styles.joinForm__agreementText}
                content={privacyNoticeText}
              />
            </div>
          </div>
          {errors.privacy && (
            <ErrorMessage id="join-privacy-error">
              {errors.privacy}
            </ErrorMessage>
          )}
        </div>

        <div className={styles.joinForm__termsHeader}>
          <h2 className={styles.joinForm__sectionTitle}>
            Terms &amp; Conditions
          </h2>
          {termsPrintUrl && (
            <a
              className={styles.joinForm__print}
              href={termsPrintUrl}
              target="_blank"
              rel="noreferrer"
            >
              Print a copy
            </a>
          )}
        </div>
        <div className={styles.joinForm__group}>
          <div className={styles.joinForm__agreement}>
            <div className={styles.joinForm__check}>
              <input
                id="join-terms"
                className={styles.joinForm__checkbox}
                type="checkbox"
                checked={values.terms}
                onChange={(event) => set('terms', event.target.checked)}
                aria-label="I accept the Terms & Conditions"
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? 'join-terms-error' : undefined}
              />
              <RichText
                className={styles.joinForm__agreementText}
                content={termsText}
              />
            </div>
          </div>
          {errors.terms && (
            <ErrorMessage id="join-terms-error">{errors.terms}</ErrorMessage>
          )}
        </div>
      </div>

      <div className={styles.joinForm__bar}>
        {submitError && <ErrorMessage role="alert">{submitError}</ErrorMessage>}
        <button
          className={styles.joinForm__submit}
          type="submit"
          disabled={adding}
          aria-label={ctaLabel}
          aria-busy={adding}
        >
          {adding ? <Loader variant="light" /> : ctaLabel}
        </button>
      </div>
    </form>
  )
}
