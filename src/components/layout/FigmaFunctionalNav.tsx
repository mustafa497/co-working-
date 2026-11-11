import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { navGroups } from '../../data/siteContent'
import type { NavFeature, NavGroup } from '../../types/site'
import { ArrowIcon, NavGlyph } from '../shared/icons'
import workhallOrange from '../../assets/workhall-orange.svg'
import { useLocation } from 'react-router-dom'

type FigmaNavGroup = NavGroup & { visualLabel: string }

const spacesGroup = navGroups.find((group) => group.id === 'spaces')
const locationsGroup = navGroups.find((group) => group.id === 'locations')
const companyGroup = navGroups.find((group) => group.id === 'company')
const contactGroup = navGroups.find((group) => group.id === 'contact')

if (!spacesGroup || !locationsGroup || !companyGroup || !contactGroup) {
  throw new Error('Required nav groups are missing.')
}

const communityItems = companyGroup.items.filter((item) =>
  ['Community', 'Workspace Services', 'Partners', 'Events', 'Support', 'Privacy Policy'].includes(item.title),
)

const whyWorkHallItems = companyGroup.items.filter((item) =>
  ['Why Work Hall', 'Workspace Services', 'Community', 'Events', 'Partners', 'Support'].includes(item.title),
)

const membersItems = contactGroup.items.filter((item) =>
  ["Member's Lounge", 'Help and FAQs', 'Quick call', 'Email the team', 'Contact Us', 'Partner With Us'].includes(item.title),
)

const figmaNavGroups: FigmaNavGroup[] = [
  { ...spacesGroup, visualLabel: 'Plans' },
  { ...locationsGroup, visualLabel: 'Locations' },
  {
    ...companyGroup,
    id: 'community-visual',
    visualLabel: 'Community',
    featured: communityItems[0] ?? companyGroup.featured,
    items: communityItems,
  },
  {
    ...companyGroup,
    id: 'why-visual',
    visualLabel: 'Why WorkHall',
    featured: companyGroup.items.find((item) => item.title === 'Why Work Hall') ?? companyGroup.featured,
    items: whyWorkHallItems,
  },
  { ...contactGroup, id: 'contact-visual', visualLabel: 'Contact Us' },
  {
    ...contactGroup,
    id: 'members-visual',
    visualLabel: "Member's Lounge",
    featured: contactGroup.items.find((item) => item.title === "Member's Lounge") ?? contactGroup.featured,
    items: membersItems,
  },
]

// Docking: the bar docks once the page is scrolled past DOCK_ON, and undocks back above DOCK_OFF.
// Two different values stop it flickering right at the edge.
const DOCK_ON = 90
const DOCK_OFF = 40
// Where the docked bar rests: distance from the top and right edges of the screen, in px.
const DOCK_TOP = 16
const DOCK_MARGIN = 24
// The full nav bar only shows from this width up; below it the compact bar is used.
const FULL_NAV_QUERY = '(min-width: 1281px)'

function DownArrowBadge() {
  return (
    <span className="figma-nav__badge" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M12 5v14" />
        <path d="m7 14 5 5 5-5" />
      </svg>
    </span>
  )
}

const resolveSiteHref = (href: string, pathname: string) =>
  href.startsWith('#') && pathname !== '/' ? `/${href}` : href

function FigmaFeatureCard({ feature, variant, onClick, pathname }: { feature: NavFeature; variant: 'hero' | 'large' | 'small' | 'rail'; onClick: () => void; pathname: string }) {
  return (
    <a href={resolveSiteHref(feature.href, pathname)} className={`figma-feature-card figma-feature-card--${variant}`} style={{ '--nav-image-position': feature.imagePosition ?? 'center' } as CSSProperties} onClick={onClick}>
      <span className="figma-feature-card__image" aria-hidden="true" />
      <span className="figma-feature-card__content">
        <span className="figma-feature-card__top">
          <NavGlyph name={feature.icon} />
          {feature.meta && <em>{feature.meta}</em>}
        </span>
        <strong>{feature.title}</strong>
        <small>{feature.detail}</small>
      </span>
      {variant !== 'rail' && <span className="figma-feature-card__arrow" aria-hidden="true"><ArrowIcon /></span>}
    </a>
  )
}

export function FigmaFunctionalNav({ isLoaded }: { isLoaded: boolean }) {
  const { pathname } = useLocation()
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [dropdownLeft, setDropdownLeft] = useState(0)
  // Sliding highlight: follows the hovered item, and rests on the open menu's item.
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null)
  const activeGroupId = hoveredGroupId ?? openGroupId
  const gliderRef = useRef<HTMLSpanElement>(null)
  const isGliderShown = useRef(false)
  // Docked = the page has been scrolled a little: the bar glides to the top-right and stays there.
  const [isDocked, setIsDocked] = useState(() => typeof window !== 'undefined' && window.scrollY > DOCK_ON)
  const dockedRef = useRef(isDocked)
  const tourRef = useRef<HTMLAnchorElement>(null)

  const activeGroup = useMemo(
    () => figmaNavGroups.find((group) => group.id === openGroupId) ?? null,
    [openGroupId],
  )

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroupId(null)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenGroupId(null)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useLayoutEffect(() => {
    if (!openGroupId || !navRef.current || !dropdownRef.current) return

    const navBounds = navRef.current.getBoundingClientRect()
    const trigger = triggerRefs.current[openGroupId]
    if (!trigger) return

    const triggerBounds = trigger.getBoundingClientRect()
    const dropdownWidth = dropdownRef.current.offsetWidth
    const idealLeft = triggerBounds.left - navBounds.left

    if (isDocked) {
      // Docked at the right edge: slide the panel left as far as needed to keep it all on screen.
      const viewportWidth = document.documentElement.clientWidth
      const minLeft = DOCK_MARGIN - navBounds.left
      const maxLeft = viewportWidth - DOCK_MARGIN - dropdownWidth - navBounds.left
      setDropdownLeft(Math.min(Math.max(idealLeft, minLeft), maxLeft))
      return
    }

    const maxLeft = Math.max(0, navBounds.width - dropdownWidth)
    setDropdownLeft(Math.min(Math.max(0, idealLeft), maxLeft))
  }, [openGroupId, isDocked])

  // Dock after a little scrolling. Checked at most once per frame.
  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      const next = dockedRef.current ? y > DOCK_OFF : y > DOCK_ON
      if (next === dockedRef.current) return

      dockedRef.current = next
      setIsDocked(next)
      // An open dropdown would be left behind while the bar moves, so close it.
      if (window.matchMedia(FULL_NAV_QUERY).matches) setOpenGroupId(null)
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  // How far the bar travels to reach the top-right corner. Written straight to CSS variables,
  // so scrolling never re-renders the nav, and the move itself is a transform (smooth on the GPU).
  useLayoutEffect(() => {
    const layer = navRef.current
    if (!layer) return

    const measure = () => {
      const tour = tourRef.current
      const top = parseFloat(getComputedStyle(layer).top) || 0
      // Right edge of the bar plus its Virtual Tour button, measured from the bar's left edge.
      const groupRight = tour && tour.offsetWidth > 0 ? tour.offsetLeft + tour.offsetWidth : layer.offsetWidth
      const dockX = document.documentElement.clientWidth / 2 - DOCK_MARGIN - groupRight + layer.offsetWidth / 2
      layer.style.setProperty('--nav-dock-x', `${Math.round(dockX)}px`)
      layer.style.setProperty('--nav-dock-y', `${Math.round(DOCK_TOP - top)}px`)
    }

    measure()
    window.addEventListener('resize', measure)
    // Fonts change the bar's width once they load.
    void document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useLayoutEffect(() => {
    const glider = gliderRef.current
    if (!glider) return

    const trigger = activeGroupId ? triggerRefs.current[activeGroupId] : null
    if (!trigger) {
      glider.dataset.visible = 'false'
      isGliderShown.current = false
      return
    }

    const place = () => {
      glider.style.width = `${trigger.offsetWidth}px`
      glider.style.transform = `translateX(${trigger.offsetLeft}px)`
    }

    if (isGliderShown.current) {
      place()
    } else {
      // Appearing: jump straight to the item instead of sliding in from the last spot.
      glider.style.transition = 'none'
      place()
      void glider.offsetWidth
      glider.style.transition = ''
    }

    glider.dataset.visible = 'true'
    isGliderShown.current = true

    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [activeGroupId])

  return (
    <header
      ref={navRef}
      className={['figma-nav-layer', isLoaded && 'is-loaded', isDocked && 'is-docked'].filter(Boolean).join(' ')}
      aria-label="Main navigation"
    >
      <div className="figma-nav__mobile-bar">
        <a href={pathname === '/' ? '#top' : '/'} className="figma-nav__mobile-brand" aria-label="WorkHall home">
          <img src={workhallOrange} alt="WorkHall" />
        </a>
        <button
          type="button"
          className={isMobileMenuOpen ? 'figma-nav__mobile-toggle is-open' : 'figma-nav__mobile-toggle'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="figma-mobile-nav"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className="figma-nav navbar" aria-label="Primary" onMouseLeave={() => setHoveredGroupId(null)}>
        <span ref={gliderRef} className="figma-nav__glider" data-visible="false" aria-hidden="true" />
        {figmaNavGroups.map((group) => {
          const classes = ['figma-nav__item', 'nav-pill']
          if (openGroupId === group.id) classes.push('is-open')
          if (activeGroupId === group.id) classes.push('is-active')

          return (
            <button
              key={group.id}
              type="button"
              className={classes.join(' ')}
              aria-expanded={openGroupId === group.id}
              ref={(node) => {
                triggerRefs.current[group.id] = node
              }}
              onMouseEnter={() => setHoveredGroupId(group.id)}
              onFocus={() => setHoveredGroupId(group.id)}
              onBlur={() => setHoveredGroupId(null)}
              onClick={() => setOpenGroupId((current) => (current === group.id ? null : group.id))}
            >
              <span>{group.visualLabel}</span>
              <DownArrowBadge />
            </button>
          )
        })}
      </nav>
      <a ref={tourRef} href={resolveSiteHref('#virtual-tour', pathname)} className="figma-nav__tour virtual-tour-btn">
        <span className="figma-nav__tour-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 7.2v9.6a.6.6 0 0 0 .9.52l7.6-4.8a.6.6 0 0 0 0-1.04l-7.6-4.8A.6.6 0 0 0 9 7.2Z" />
          </svg>
        </span>
        Virtual Tour
      </a>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="figma-mobile-nav"
            className="figma-nav__mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="figma-nav__mobile-list">
              {figmaNavGroups.map((group) => (
                <div key={group.id} className="figma-nav__mobile-group">
                  <button
                    type="button"
                    className={openGroupId === group.id ? 'figma-nav__mobile-item is-open' : 'figma-nav__mobile-item'}
                    aria-expanded={openGroupId === group.id}
                    onClick={() => setOpenGroupId((current) => (current === group.id ? null : group.id))}
                  >
                    <span>{group.visualLabel}</span>
                    <DownArrowBadge />
                  </button>
                  <AnimatePresence initial={false}>
                    {openGroupId === group.id && (
                      <motion.div
                        className="figma-nav__mobile-submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        {[group.featured, ...group.items].slice(0, 6).map((item) => (
                          <a
                            key={`${group.id}-${item.title}`}
                            href={resolveSiteHref(item.href, pathname)}
                            className="figma-nav__mobile-link"
                            onClick={() => {
                              setIsMobileMenuOpen(false)
                              setOpenGroupId(null)
                            }}
                          >
                            <strong>{item.title}</strong>
                            <small>{item.detail}</small>
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <a
              href={resolveSiteHref('#virtual-tour', pathname)}
              className="figma-nav__mobile-tour"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Virtual Tour
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeGroup && (
          <motion.div
            ref={dropdownRef}
            key={activeGroup.id}
            className="figma-nav__dropdown"
            style={{ left: dropdownLeft }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="figma-nav__main-panel">
              <FigmaFeatureCard feature={activeGroup.featured} variant="hero" pathname={pathname} onClick={() => setOpenGroupId(null)} />
              {activeGroup.items.slice(0, 1).map((item) => (
                <FigmaFeatureCard key={item.title} feature={item} variant="large" pathname={pathname} onClick={() => setOpenGroupId(null)} />
              ))}
              <div className="figma-nav__small-row">
                {activeGroup.items.slice(1, 4).map((item) => (
                  <FigmaFeatureCard key={item.title} feature={item} variant="small" pathname={pathname} onClick={() => setOpenGroupId(null)} />
                ))}
              </div>
            </div>
            <aside className="figma-nav__rail" aria-label={`${activeGroup.visualLabel} quick links`}>
              {activeGroup.items.slice(4, 7).map((item) => (
                <FigmaFeatureCard key={item.title} feature={item} variant="rail" pathname={pathname} onClick={() => setOpenGroupId(null)} />
              ))}
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
