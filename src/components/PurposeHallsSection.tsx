import { useEffect, useMemo, useRef, useState } from 'react'
import './PurposeHallsSection.css'
import { ShuffleText } from './shared/ShuffleText'

const TRANSITION_MS = 700
const WHEEL_THRESHOLD = 5
const SWIPE_THRESHOLD = 44
const SCROLL_BUDGET = (4 - 1) * TRANSITION_MS
const INDICATOR_SIZE = 16
const DESKTOP_MEDIA_QUERY = '(min-width: 1025px)'

const pad = (value: number) => String(value).padStart(2, '0')

const steps = [
  {
    title: 'Meeting Rooms',
    tag: 'By the hour or day',
    body: 'Bookable by the hour or day. Free for members, available to everyone',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85',
    imagePosition: 'center center',
  },
  {
    title: 'Studios',
    tag: 'Production & recording',
    body: 'Fully equipped spaces for production, presentations, and recordings',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
    imagePosition: 'center center',
  },
  {
    title: 'Weekend/Day Pass',
    tag: 'Any day of the week',
    body: 'Full access to our shared spaces and all amenities any day of the week.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85',
    imagePosition: 'center center',
  },
  {
    title: 'Virtual Office',
    tag: 'Address & mail, no desk',
    body: 'Real business address, mail handling, meeting room access without a full-time desk',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
    imagePosition: 'center center',
  },
] as const

type Direction = 1 | -1

export default function PurposeHallsSection() {
  const outerRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([])
  const touchStartYRef = useRef<number | null>(null)
  const animationTimeoutRef = useRef<number | null>(null)
  const lastScrollYRef = useRef(0)
  const boundaryReleasedRef = useRef(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [previousStep, setPreviousStep] = useState(0)
  const [direction, setDirection] = useState<Direction>(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isEngaged, setIsEngaged] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [indicatorY, setIndicatorY] = useState(0)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  )

  const currentStepRef = useRef(currentStep)
  const isAnimatingRef = useRef(isAnimating)
  const isEngagedRef = useRef(isEngaged)
  const prefersReducedMotionRef = useRef(prefersReducedMotion)

  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])

  useEffect(() => {
    isAnimatingRef.current = isAnimating
  }, [isAnimating])

  useEffect(() => {
    isEngagedRef.current = isEngaged
  }, [isEngaged])

  useEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion
  }, [prefersReducedMotion])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)

    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const updateDesktop = () => setIsDesktop(mediaQuery.matches)

    updateDesktop()
    mediaQuery.addEventListener('change', updateDesktop)

    return () => mediaQuery.removeEventListener('change', updateDesktop)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateIndicator = () => {
      const listNode = listRef.current
      const titleNode = titleRefs.current[currentStep]
      if (!listNode || !titleNode) return

      const listRect = listNode.getBoundingClientRect()
      const titleRect = titleNode.getBoundingClientRect()
      const nextY = titleRect.top - listRect.top + titleRect.height / 2 - INDICATOR_SIZE / 2
      setIndicatorY(nextY)
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)

    return () => window.removeEventListener('resize', updateIndicator)
  }, [currentStep, prefersReducedMotion])

  const clearAnimationTimeout = () => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
  }

  const finishAnimation = (nextStep: number) => {
    clearAnimationTimeout()
    animationTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false)
      setPreviousStep(nextStep)
      animationTimeoutRef.current = null
    }, TRANSITION_MS)
  }

  const releaseEngagement = () => {
    boundaryReleasedRef.current = true
    setIsEngaged(false)
    touchStartYRef.current = null
  }

  const releaseToBoundary = (nextDirection: Direction) => {
    const outer = outerRef.current
    releaseEngagement()

    if (!outer || typeof window === 'undefined') return

    const outerTop = outer.getBoundingClientRect().top + window.scrollY
    const exitScrollY =
      nextDirection === 1
        ? outerTop + outer.offsetHeight - window.innerHeight + 2
        : Math.max(0, outerTop - 2)

    window.scrollTo({
      top: exitScrollY,
      behavior: 'auto',
    })
  }

  const goToStep = (nextStep: number, nextDirection: Direction) => {
    setDirection(nextDirection)
    setPreviousStep(currentStepRef.current)
    setCurrentStep(nextStep)
    setIsAnimating(true)
    finishAnimation(nextStep)
  }

  useEffect(() => {
    if (prefersReducedMotion || !isDesktop) {
      releaseEngagement()
      clearAnimationTimeout()
      setIsAnimating(false)
      setCurrentStep(0)
      setPreviousStep(0)
      return
    }

    if (typeof window !== 'undefined') {
      lastScrollYRef.current = window.scrollY
    }

    const handleScroll = () => {
      const outer = outerRef.current
      if (!outer || prefersReducedMotionRef.current || !isDesktop) return

      const rect = outer.getBoundingClientRect()
      const isPinned = rect.top <= 0 && rect.bottom >= window.innerHeight
      const currentScrollY = window.scrollY
      const enteringFromAbove = currentScrollY >= lastScrollYRef.current

      if (!isPinned) {
        boundaryReleasedRef.current = false
      }

      if (isPinned && !isEngagedRef.current && !boundaryReleasedRef.current) {
        const entryStep = enteringFromAbove ? 0 : steps.length - 1
        setIsEngaged(true)
        setCurrentStep(entryStep)
        setPreviousStep(entryStep)
        setDirection(enteringFromAbove ? 1 : -1)
        clearAnimationTimeout()
        setIsAnimating(false)
      } else if (!isPinned && isEngagedRef.current && !isAnimatingRef.current) {
        releaseEngagement()
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isDesktop, prefersReducedMotion])

  useEffect(() => {
    if (!isEngaged || prefersReducedMotion || !isDesktop) return

    const onWheel = (event: WheelEvent) => {
      if (!isEngagedRef.current) return

      const delta = event.deltaY
      const atFirstStep = currentStepRef.current === 0
      const atLastStep = currentStepRef.current === steps.length - 1

      if (isAnimatingRef.current) {
        event.preventDefault()
        return
      }

      if (delta > WHEEL_THRESHOLD && atLastStep) {
        releaseToBoundary(1)
        return
      }

      if (delta < -WHEEL_THRESHOLD && atFirstStep) {
        releaseToBoundary(-1)
        return
      }

      event.preventDefault()

      if (delta > WHEEL_THRESHOLD && !atLastStep) {
        goToStep(currentStepRef.current + 1, 1)
        return
      }

      if (delta < -WHEEL_THRESHOLD && !atFirstStep) {
        goToStep(currentStepRef.current - 1, -1)
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!isEngagedRef.current) return

      const startY = touchStartYRef.current
      const currentY = event.touches[0]?.clientY

      if (startY == null || currentY == null) return

      const delta = startY - currentY
      const atFirstStep = currentStepRef.current === 0
      const atLastStep = currentStepRef.current === steps.length - 1

      if (isAnimatingRef.current) {
        event.preventDefault()
        return
      }

      if (delta > SWIPE_THRESHOLD && atLastStep) {
        touchStartYRef.current = null
        releaseToBoundary(1)
        return
      }

      if (delta < -SWIPE_THRESHOLD && atFirstStep) {
        touchStartYRef.current = null
        releaseToBoundary(-1)
        return
      }

      event.preventDefault()

      if (delta > SWIPE_THRESHOLD && !atLastStep) {
        touchStartYRef.current = null
        goToStep(currentStepRef.current + 1, 1)
        return
      }

      if (delta < -SWIPE_THRESHOLD && !atFirstStep) {
        touchStartYRef.current = null
        goToStep(currentStepRef.current - 1, -1)
      }
    }

    const onTouchEnd = () => {
      touchStartYRef.current = null
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDesktop, isEngaged, prefersReducedMotion])

  useEffect(() => () => clearAnimationTimeout(), [])

  const visualState = useMemo(
    () =>
      steps.map((step, index) => ({
        ...step,
        isActive: !isDesktop || prefersReducedMotion || index === currentStep,
      })),
    [currentStep, isDesktop, prefersReducedMotion]
  )

  const getSlideClassName = (index: number) => {
    if (prefersReducedMotion) {
      return 'ph-clean-frame-layer is-active'
    }

    if (isAnimating && index === previousStep && previousStep !== currentStep) {
      return direction === 1
        ? 'ph-clean-frame-layer is-exiting-forward'
        : 'ph-clean-frame-layer is-exiting-backward'
    }

    if (index === currentStep) {
      return isAnimating && previousStep !== currentStep
        ? direction === 1
          ? 'ph-clean-frame-layer is-entering-forward'
          : 'ph-clean-frame-layer is-entering-backward'
        : 'ph-clean-frame-layer is-active'
    }

    return index > currentStep ? 'ph-clean-frame-layer is-future' : 'ph-clean-frame-layer is-past'
  }

  const isStaticLayout = prefersReducedMotion || !isDesktop

  return (
    <section
      ref={outerRef}
      className={isStaticLayout ? 'ph-clean-section is-reduced-motion is-mobile-static' : 'ph-clean-section'}
      style={isStaticLayout ? undefined : { height: `calc(100vh + ${SCROLL_BUDGET}px)` }}
      aria-labelledby="purpose-halls-title"
    >
      <svg className="ph-clean-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter id="ph-clean-vertical-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0 6" />
          </filter>
        </defs>
      </svg>

      <div className="ph-clean-sticky">
        <div className="ph-clean-sticky-content">
          <header className="ph-clean-header">
            <div className="ph-clean-kicker">
              <span className="ph-clean-kicker-square" aria-hidden="true" />
              <span>Purpose Halls</span>
            </div>

            <div className="ph-clean-heading" id="purpose-halls-title">
              <span><ShuffleText text="and because work isn't" finalColor="#15110d" /></span>
              <span className="is-accent"><ShuffleText text="always just a desk:" startDelay={120} finalColor="#15110d" /></span>
            </div>
          </header>

          <div className="ph-clean-body">
            <div ref={listRef} className="ph-clean-list-rail" aria-label="Purpose halls">
              {isDesktop && !prefersReducedMotion && (
                <span
                  className="ph-clean-indicator"
                  style={{ transform: `translateY(${indicatorY}px) rotate(${currentStep * 90}deg)` }}
                  aria-hidden="true"
                />
              )}

              <div className="ph-clean-list">
                {visualState.map((step, index) => (
                  <article
                    key={step.title}
                    className={step.isActive ? 'ph-clean-item is-active' : 'ph-clean-item'}
                    aria-current={index === currentStep ? 'true' : undefined}
                    onClick={isStaticLayout ? () => setCurrentStep(index) : undefined}
                  >
                    <div className="ph-clean-item-copy">
                      <span className="ph-clean-item-meta">
                        <span className="ph-clean-item-index">{pad(index + 1)}</span>
                        <span className="ph-clean-item-tag">{step.tag}</span>
                      </span>
                      <h3
                        ref={(node) => {
                          titleRefs.current[index] = node
                        }}
                      >
                        {step.title}
                      </h3>
                      <p>{step.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="ph-clean-visual" aria-hidden="true">
              <div className="ph-clean-frame">
                {isStaticLayout ? (
                  <div className="ph-clean-frame-layer is-active">
                    <img src={steps[currentStep].image} alt="" style={{ objectPosition: steps[currentStep].imagePosition }} />
                    <div className="ph-clean-frame-overlay" />
                    <span className="ph-clean-frame-caption">
                      <b>{pad(currentStep + 1)} / {pad(steps.length)}</b>
                      <i>{steps[currentStep].title}</i>
                    </span>
                  </div>
                ) : (
                  steps.map((step, index) => (
                    <div key={step.title} className={getSlideClassName(index)}>
                      <img src={step.image} alt="" style={{ objectPosition: step.imagePosition }} />
                      <div className="ph-clean-frame-overlay" />
                      <span className="ph-clean-frame-caption">
                        <b>{pad(index + 1)} / {pad(steps.length)}</b>
                        <i>{step.title}</i>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
