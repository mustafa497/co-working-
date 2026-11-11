import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { locations } from '../../data/siteContent'
import type { BookingPanel } from '../../types/site'
import { ArrowIcon, CheckIcon, SearchIcon } from '../shared/icons'

function getSeatMessage(seats: number) {
  if (seats <= 1) return 'A focused solo setup with room to think, call, and move lightly through the day.'
  if (seats === 2) return 'A compact two-person setup for founders or partners who need easy alignment.'
  if (seats === 3) return 'A tight three-seat setup for a small team that works best in constant sync.'
  if (seats <= 4) return 'Enough room for a nimble working pod that needs shared focus without the noise.'
  if (seats <= 6) return 'A strong small-team footprint with enough space for rhythm, calls, and collaboration.'
  if (seats <= 8) return 'A growing team setup that gives everyone a seat without losing the sense of momentum.'
  if (seats <= 12) return 'A fuller team arrangement for people who need consistency, presence, and a real base.'
  if (seats <= 20) return 'A substantial team setup with room for structure, movement, and day-to-day coordination.'
  return 'A larger team footprint that likely needs a more tailored setup and a clearer planning conversation.'
}

interface BookingConciergeProps {
  variant?: 'section' | 'hero' | 'location-cta'
  fixedLocation?: string
  ctaClassName?: string
  ctaLabel?: string
  seatsLabel?: string
  submitLabel?: string
}

export function BookingConcierge({
  variant = 'section',
  fixedLocation,
  ctaClassName,
  ctaLabel = 'Book now',
  seatsLabel = 'How Many Seats?',
  submitLabel = 'Book My Tour',
}: BookingConciergeProps) {
  const conciergeRef = useRef<HTMLDivElement>(null)
  const [openPanel, setOpenPanel] = useState<BookingPanel | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(fixedLocation ?? null)
  const [seats, setSeats] = useState<number | null>(null)
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [isEnquirySent, setIsEnquirySent] = useState(false)
  const [hasTriedBooking, setHasTriedBooking] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })

  useEffect(() => {
    if (!openPanel) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!conciergeRef.current?.contains(event.target as Node)) setOpenPanel(null)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [openPanel])

  useEffect(() => {
    if (!isEnquiryOpen) return
    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsEnquiryOpen(false) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isEnquiryOpen])

  const togglePanel = (panel: BookingPanel) => setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel))
  const handleEnquirySubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setIsEnquirySent(true) }
  const closeEnquiryModal = () => { setIsEnquiryOpen(false); window.setTimeout(() => setIsEnquirySent(false), 240) }

  const selectedSummary = [
    selectedLocation ? { label: 'Location', value: selectedLocation } : null,
    seats ? { label: 'Seats', value: `${seats}` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>
  const isEnquiryReady = Boolean(selectedLocation && seats)
  const nextRequiredPanel: BookingPanel | null = !selectedLocation ? 'location' : !seats ? 'seats' : null
  const requiredHint = nextRequiredPanel === 'location'
    ? 'Choose a branch first so we know where to start the enquiry.'
    : nextRequiredPanel === 'seats'
      ? 'Add your team size so we know what kind of room to prepare.'
      : ''

  return (
    <>
      {variant === 'location-cta' ? (
        <button
          type="button"
          className={ctaClassName ?? 'primary-cta'}
          onClick={() => {
            setOpenPanel(null)
            setIsEnquiryOpen(true)
          }}
        >
          {ctaLabel}
          <ArrowIcon />
        </button>
      ) : (
      <div ref={conciergeRef} className={variant === 'hero' ? 'booking-console booking-console--hero' : 'booking-console'} aria-label="Book a Work Hall workspace">
        <div className="booking-fields booking-fields--compact">
          <div className="booking-popover booking-popover--location">
            <button type="button" className="booking-field" aria-expanded={openPanel === 'location'} onClick={() => togglePanel('location')}>
              <span>
                <strong>{selectedLocation ?? 'Choose a Location'}</strong>
                <small>{selectedLocation ?? 'Select a branch'}</small>
              </span>
              <SearchIcon />
            </button>
            {openPanel === 'location' && (
              <div className="booking-popover__panel booking-popover__panel--location">
                <div className="booking-popover__eyebrow">Choose the branch you want to visit</div>
                <div className="panel-grid panel-grid--stacked">
                  {locations.map((location) => (
                    <button
                      type="button"
                      key={location}
                      className={location === selectedLocation ? 'panel-option is-selected' : 'panel-option'}
                      onClick={() => {
                        setSelectedLocation(location)
                        setOpenPanel(null)
                      }}
                    >
                      <span>{location}</span>
                      {location === selectedLocation && <CheckIcon />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="booking-popover booking-popover--seats">
            <button type="button" className="booking-field booking-field--seats" aria-expanded={openPanel === 'seats'} onClick={() => togglePanel('seats')}>
              <span>
                <strong>{seatsLabel}</strong>
                <small>{seats ? (seats === 1 ? 'Solo workspace' : `${seats} people`) : 'Choose team size'}</small>
              </span>
              <span className="seat-stepper" aria-hidden="true">{String(seats ?? 3).padStart(2, '0')}</span>
            </button>
            {openPanel === 'seats' && (
              <div className="booking-popover__panel booking-popover__panel--seats">
                <div className="booking-popover__eyebrow">Set how many seats you need</div>
                <div className="seat-control seat-control--popover">
                  <button type="button" aria-label="Decrease seats" onClick={() => setSeats((currentSeats) => Math.max(1, (currentSeats ?? 1) - 1))}>-</button>
                  <strong>{seats ?? 1}</strong>
                  <button type="button" aria-label="Increase seats" onClick={() => setSeats((currentSeats) => Math.min(80, (currentSeats ?? 1) + 1))}>+</button>
                </div>
                <p className="booking-seat-story">{getSeatMessage(seats ?? 1)}</p>
                <div className="booking-seat-presets">
                  {[1, 3, 6, 12].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      className={seats === preset ? 'is-selected' : ''}
                      onClick={() => {
                        setSeats(preset)
                      }}
                    >
                      {preset === 1 ? 'Solo' : `${preset} seats`}
                    </button>
                  ))}
                </div>
                <div className="booking-seat-actions">
                  <button type="button" className="seat-confirm" onClick={() => setOpenPanel(null)}>Looks good</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="booking-action-row">
          <button
            type="button"
            className="primary-cta"
            aria-disabled={!isEnquiryReady}
            onClick={() => {
              if (!isEnquiryReady) {
                setHasTriedBooking(true)
                setOpenPanel(nextRequiredPanel)
                return
              }
              setOpenPanel(null)
              setIsEnquiryOpen(true)
            }}
          >
            {submitLabel}
            <ArrowIcon />
          </button>
          {variant !== 'hero' && <a href="#locations" className="ghost-cta">Explore Locations</a>}
        </div>
        {hasTriedBooking && !isEnquiryReady && <p className="booking-required-hint" role="status">{requiredHint}</p>}
      </div>
      )}
      {isEnquiryOpen && typeof document !== 'undefined' ? createPortal(
        <div className="enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
          <button type="button" className="enquiry-modal__backdrop" aria-label="Close enquiry form" onClick={closeEnquiryModal} />
          <article className="enquiry-modal__card">
            <button type="button" className="enquiry-modal__close" aria-label="Close enquiry form" onClick={closeEnquiryModal}>×</button>
            {!isEnquirySent ? (
              <>
                <div className="section-kicker">Workspace enquiry</div>
                <h3 id="enquiry-title">Tell us what kind of workspace you need.</h3>
                <p>Complete the enquiry with your details and we will match you to the right branch and seat count.</p>
                {selectedSummary.length > 0 && (
                  <div className="enquiry-modal__summary">
                    {selectedSummary.map((item) => (
                      <span key={item.label}>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
                <form className="enquiry-form" onSubmit={handleEnquirySubmit}>
                  <label className="enquiry-form__full"><span>Team size</span><select required value={seats ?? ''} onChange={(event) => setSeats(Number(event.target.value))}><option value="" disabled>Select team size</option>{[1, 2, 3, 4, 6, 8, 12, 20].map((seatCount) => <option key={seatCount} value={seatCount}>{seatCount === 1 ? '1 person' : `${seatCount} people`}</option>)}</select></label>
                  <label><span>Full name</span><input required type="text" value={enquiryForm.name} onChange={(event) => setEnquiryForm((currentForm) => ({ ...currentForm, name: event.target.value }))} /></label>
                  <label><span>Email address</span><input required type="email" value={enquiryForm.email} onChange={(event) => setEnquiryForm((currentForm) => ({ ...currentForm, email: event.target.value }))} /></label>
                  <label><span>Phone number</span><input type="tel" placeholder="Optional" value={enquiryForm.phone} onChange={(event) => setEnquiryForm((currentForm) => ({ ...currentForm, phone: event.target.value }))} /></label>
                  <label><span>Company or team name</span><input type="text" placeholder="Optional" value={enquiryForm.company} onChange={(event) => setEnquiryForm((currentForm) => ({ ...currentForm, company: event.target.value }))} /></label>
                  <label className="enquiry-form__full"><span>Anything we should know?</span><textarea rows={4} placeholder="Team size, preferred area, move-in timeline, or anything useful for the first recommendation." value={enquiryForm.notes} onChange={(event) => setEnquiryForm((currentForm) => ({ ...currentForm, notes: event.target.value }))} /></label>
                  <div className="enquiry-form__actions"><button type="submit" className="primary-cta">Send enquiry<ArrowIcon /></button><button type="button" className="ghost-cta" onClick={closeEnquiryModal}>Not now</button></div>
                </form>
              </>
            ) : (
              <div className="enquiry-success">
                <motion.div className="enquiry-success__mark" initial={{ scale: 0.72, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 18, stiffness: 260 }}>
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}>
                    <CheckIcon />
                  </motion.div>
                </motion.div>
                <div className="section-kicker">Enquiry sent</div>
                <h3 id="enquiry-title">Enquiry sent. One of our representatives will contact you within 24 hours.</h3>
                <p>We have your details. If you shared location or seats, we will use that to narrow the first recommendation.</p>
                <button type="button" className="primary-cta" onClick={closeEnquiryModal}>Close</button>
              </div>
            )}
          </article>
        </div>,
        document.body,
      ) : null}
    </>
  )
}
