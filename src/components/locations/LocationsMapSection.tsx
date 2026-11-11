import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { karachiCenter, routeCasingLayerId, routeLayerId, routeSourceId, workHallLocations } from '../../data/siteContent'
import { createRouteData, formatDistance, getDistanceKm } from '../../lib/locationUtils'
import type { GeolocationStatus, UserCoordinates } from '../../types/site'
import { ArrowIcon, LocateIcon, SearchIcon } from '../shared/icons'
import { ShuffleText } from '../shared/ShuffleText'

const locationCardContent: Record<string, { label: string; headline: string; meta: string }> = {
  'shahrah-e-faisal': {
    label: 'Corporate Flow',
    headline: 'Fast access for polished business-corridor work.',
    meta: 'Karachi branch',
  },
  zamzama: {
    label: 'Neighbourhood Favorite',
    headline: 'A softer rhythm near cafes, retail, and DHA movement.',
    meta: 'Karachi branch',
  },
  'tipu-sultan': {
    label: 'Team Momentum',
    headline: 'Balanced for focused calls and reliable daily momentum.',
    meta: 'Karachi branch',
  },
  pechs: {
    label: 'Growth Pocket',
    headline: 'A practical city-core base for scaling businesses.',
    meta: 'Karachi branch',
  },
  gulshan: {
    label: 'East-Side Access',
    headline: 'A convenient east-side option near Gulshan routes.',
    meta: 'Karachi branch',
  },
}

function buildDirectionsUrl(userCoordinates: UserCoordinates | null, destination: [number, number], fallbackUrl: string) {
  if (!userCoordinates) return fallbackUrl

  const origin = `${userCoordinates.latitude},${userCoordinates.longitude}`
  const target = `${destination[1]},${destination[0]}`
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${target}&travelmode=driving`
}
// OpenFreeMap's light "positron" style: free, no API key, OpenStreetMap data (it carries its own
// attribution). This replaces CARTO's free raster tiles, which now return an "API KEY REQUIRED"
// watermark instead of a map. For heavy traffic, consider a paid plan or self-hosting.
export const workHallBaseMapStyle = 'https://tiles.openfreemap.org/styles/positron'
interface LocationsMapSectionProps {
  selectedLocationId?: string
  onSelectedLocationChange?: (locationId: string) => void
}

export function LocationsMapSection({
  selectedLocationId,
  onSelectedLocationChange,
}: LocationsMapSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const mapNodeRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const hasAutoRequestedLocationRef = useRef(false)
  const hasManualBranchSelectionRef = useRef(false)

  const [isMapReady, setIsMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [internalActiveLocationId, setInternalActiveLocationId] = useState(workHallLocations[0].id)
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false)
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle')
  const [geoMessage, setGeoMessage] = useState(
    'When this section enters view, your browser will ask for location access so we can start a route guide automatically.',
  )

  const activeLocationId = selectedLocationId ?? internalActiveLocationId
  const activeLocation = workHallLocations.find((location) => location.id === activeLocationId) ?? workHallLocations[0]
  const rankedLocations = workHallLocations
    .map((location) => ({
      location,
      distance: userCoordinates ? getDistanceKm(userCoordinates, location) : null,
    }))
    .sort((first, second) => {
      if (first.distance === null || second.distance === null) return 0
      return first.distance - second.distance
    })

  const nearestLocation = userCoordinates ? rankedLocations[0] : null
  const activeDistance = rankedLocations.find(({ location }) => location.id === activeLocationId)?.distance ?? null
  const directionsUrl = useMemo(
    () => buildDirectionsUrl(userCoordinates, activeLocation.coordinates, activeLocation.mapsUrl),
    [activeLocation.coordinates, activeLocation.mapsUrl, userCoordinates],
  )

  const setActiveLocationId = useCallback(
    (locationId: string, { manual = false }: { manual?: boolean } = {}) => {
      if (manual) hasManualBranchSelectionRef.current = true
      if (selectedLocationId === undefined) setInternalActiveLocationId(locationId)
      onSelectedLocationChange?.(locationId)
    },
    [onSelectedLocationChange, selectedLocationId],
  )

  const requestLocationAccess = useCallback(
    ({
      preferNearest,
      trigger,
    }: {
      preferNearest: boolean
      trigger: 'auto' | 'manual'
    }) => {
      if (geoStatus === 'loading') return

      if (!('geolocation' in navigator)) {
        setGeoStatus('unsupported')
        setGeoMessage('This browser does not support location detection. You can still pick a branch manually.')
        return
      }

      setGeoStatus('loading')
      setGeoMessage(
        trigger === 'auto'
          ? 'Your browser is asking for location access. If allowed, the route guide starts automatically.'
          : 'Asking your browser for permission and preparing the route guide...',
      )

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const nextCoordinates = {
            longitude: coords.longitude,
            latitude: coords.latitude,
          }
          const nearest = workHallLocations.reduce((closest, location) =>
            getDistanceKm(nextCoordinates, location) < getDistanceKm(nextCoordinates, closest) ? location : closest,
          )
          const selectedLocation =
            workHallLocations.find((location) => location.id === activeLocationId) ?? nearest
          const shouldSwitchToNearest =
            preferNearest && !hasManualBranchSelectionRef.current && selectedLocationId === undefined
          const routedLocation = shouldSwitchToNearest ? nearest : selectedLocation

          setUserCoordinates(nextCoordinates)
          if (shouldSwitchToNearest) setActiveLocationId(nearest.id)
          setGeoStatus('located')
          setGeoMessage(`${routedLocation.area} now has an active route guide from your location.`)
        },
        (error) => {
          setGeoStatus('blocked')
          setGeoMessage(
            error.code === error.PERMISSION_DENIED
              ? 'Location permission was blocked, so the route guide will not start automatically.'
              : 'We could not detect your location right now. The branch list is still available below.',
          )
        },
        {
          enableHighAccuracy: true,
          maximumAge: 300000,
          timeout: 12000,
        },
      )
    },
    [activeLocationId, geoStatus, selectedLocationId, setActiveLocationId],
  )

  useEffect(() => {
    const node = mapNodeRef.current
    if (!node || mapRef.current) return
    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: node,
        style: workHallBaseMapStyle,
        center: karachiCenter,
        zoom: 10.7,
        pitch: 18,
        bearing: -6,
        attributionControl: false,
      })
    } catch (error) {
      setMapError(error instanceof Error ? error.message : 'Map failed to initialize.')
      return
    }
    const resizeMap = () => {
      requestAnimationFrame(() => map.resize())
      window.setTimeout(() => map.resize(), 120)
      window.setTimeout(() => map.resize(), 420)
    }
    const loadTimeout = window.setTimeout(() => {
      setMapError('Map tiles are taking longer than expected to load.')
    }, 5000)

    const handleLoad = () => {
      window.clearTimeout(loadTimeout)
      setIsMapReady(true)
      setMapError(null)
      resizeMap()
    }

    const handleStyleData = () => {
      resizeMap()
    }
    const handleError = (event: { error?: Error }) => {
      const message = event?.error?.message ?? ''
      if (message) setMapError(message)
    }

    map.on('load', handleLoad)
    map.on('styledata', handleStyleData)
    map.on('error', handleError)
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map
    const handleWindowResize = () => resizeMap()
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.clearTimeout(loadTimeout)
      window.removeEventListener('resize', handleWindowResize)
      map.off('load', handleLoad)
      map.off('styledata', handleStyleData)
      map.off('error', handleError)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
      map.remove()
      mapRef.current = null
      setIsMapReady(false)
    }
  }, [])

  useEffect(() => {
    const sectionNode = sectionRef.current
    if (!sectionNode || geoStatus !== 'idle' || hasAutoRequestedLocationRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAutoRequestedLocationRef.current) return

        hasAutoRequestedLocationRef.current = true
        requestLocationAccess({
          preferNearest: true,
          trigger: 'auto',
        })
        observer.disconnect()
      },
      {
        threshold: 0.34,
        rootMargin: '0px 0px -18% 0px',
      },
    )

    observer.observe(sectionNode)
    return () => observer.disconnect()
  }, [geoStatus, requestLocationAccess])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = workHallLocations.map((location) => {
      const markerAnchor = document.createElement('div')
      const pinButton = document.createElement('button')

      markerAnchor.className = 'location-marker-anchor'
      pinButton.type = 'button'
      pinButton.className = [
        'location-map-pin',
        location.id === activeLocationId ? 'is-active' : '',
      ]
        .filter(Boolean)
        .join(' ')
      pinButton.setAttribute('aria-label', `View ${location.name}`)
      pinButton.addEventListener('click', () => {
        setActiveLocationId(location.id, { manual: true })
      })
      markerAnchor.append(pinButton)

      return new maplibregl.Marker({
        element: markerAnchor,
        anchor: 'bottom',
        offset: [0, 0],
      })
        .setLngLat(location.coordinates)
        .addTo(map)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [activeLocationId, isMapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    userMarkerRef.current?.remove()
    userMarkerRef.current = null

    if (!userCoordinates) return

    const markerElement = document.createElement('span')
    markerElement.className = 'user-location-pin'
    markerElement.setAttribute('aria-label', 'Your location')
    userMarkerRef.current = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center',
    })
      .setLngLat([userCoordinates.longitude, userCoordinates.latitude])
      .addTo(map)

    return () => {
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
    }
  }, [isMapReady, userCoordinates])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    if (!userCoordinates) {
      const source = map.getSource(routeSourceId) as maplibregl.GeoJSONSource | undefined
      source?.setData({
        type: 'FeatureCollection',
        features: [],
      })
      return
    }

    const routeData = createRouteData(userCoordinates, activeLocation)
    const existingSource = map.getSource(routeSourceId) as maplibregl.GeoJSONSource | undefined

    if (existingSource) {
      existingSource.setData(routeData)
      return
    }

    map.addSource(routeSourceId, {
      type: 'geojson',
      data: routeData,
      lineMetrics: true,
    })

    map.addLayer({
      id: routeCasingLayerId,
      type: 'line',
      source: routeSourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': 'rgba(255, 250, 240, 0.94)',
        'line-width': 10,
        'line-opacity': 0.95,
      },
    })

    map.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeSourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#321d32',
        'line-width': 5,
        'line-opacity': 0.92,
        'line-dasharray': [1, 1.25],
      },
    })
  }, [activeLocation, isMapReady, userCoordinates])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    if (userCoordinates) {
      const bounds = new maplibregl.LngLatBounds(
        [userCoordinates.longitude, userCoordinates.latitude],
        [userCoordinates.longitude, userCoordinates.latitude],
      )

      bounds.extend(activeLocation.coordinates)
      map.fitBounds(bounds, {
        padding: { top: 92, right: 96, bottom: 92, left: 96 },
        maxZoom: 13.8,
        duration: 1100,
        essential: true,
      })
      return
    }

    map.flyTo({
      center: activeLocation.coordinates,
      zoom: 12.4,
      duration: 900,
      essential: true,
    })
  }, [activeLocation, isMapReady, userCoordinates])

  const showAllBranches = () => {
    const map = mapRef.current
    if (!map) return

    const bounds = new maplibregl.LngLatBounds(workHallLocations[0].coordinates, workHallLocations[0].coordinates)
    workHallLocations.slice(1).forEach((location) => bounds.extend(location.coordinates))
    if (userCoordinates) bounds.extend([userCoordinates.longitude, userCoordinates.latitude])

    map.fitBounds(bounds, {
      padding: { top: 80, right: 80, bottom: 80, left: 80 },
      maxZoom: 11.4,
      duration: 950,
      essential: true,
    })
  }

  return (
    <section
      ref={sectionRef}
      className="location-band location-band--live"
      id="locations"
      aria-labelledby="locations-title"
    >
      <div className="location-copy">
        <div className="location-copy__intro">
          <div>
            <div className="section-kicker">Karachi network</div>
            <h2 id="locations-title"><ShuffleText text="Find The Nearest Work Hall." finalColor="#15110d" /></h2>
            <p>Pick a branch and open the fastest route.</p>
          </div>
        </div>

        <div className="location-copy__controls" aria-label="Location map controls">
          <button type="button" className="location-mini-control" onClick={showAllBranches}>
            View all
          </button>
          <button
            type="button"
            className="location-mini-control location-mini-control--icon"
            onClick={() => requestLocationAccess({ preferNearest: true, trigger: 'manual' })}
            disabled={geoStatus === 'loading'}
            aria-label={geoStatus === 'located' ? 'Refresh route' : 'Find nearest Work Hall'}
          >
            <LocateIcon />
          </button>
        </div>

        <div className="location-card-list" aria-label="Work Hall locations">
          {rankedLocations.map(({ location, distance }) => {
            const cardContent = locationCardContent[location.id]
            const isActive = location.id === activeLocationId
            const isNearest = geoStatus === 'located' && nearestLocation?.location.id === location.id

            return (
              <button
                type="button"
                key={location.id}
                className={isActive ? 'location-branch-card is-active' : 'location-branch-card'}
                onClick={() => setActiveLocationId(location.id, { manual: true })}
              >
                <div className="location-branch-card__visual" />

                <div className="location-branch-card__body">
                  <div className="location-branch-card__meta">
                    <span className="location-branch-card__pill">{cardContent.label}</span>
                  </div>

                  <h3>{location.area}</h3>

                  <p>{cardContent.headline}</p>

                  <div className="location-branch-card__footer">
                    <span>{cardContent.meta}</span>
                    <small>{isNearest ? `Closest • ${formatDistance(distance)}` : formatDistance(distance)}</small>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <a className="location-detail-link" href={`/locations/${activeLocation.id}`}>
          Explore the {activeLocation.area} branch
          <ArrowIcon />
        </a>
      </div>

      <div className="location-map-shell">
        <div className="location-map-header">
          <span>
            <small>Selected branch</small>
            <strong>{activeLocation.area}</strong>
            <small>{formatDistance(activeDistance)}</small>
          </span>
        </div>

        <div ref={mapNodeRef} className="workhall-map" aria-label="Interactive Work Hall locations map" />

        {mapError && <div className="location-map-error">Map tiles are having trouble loading right now. Try refreshing the route or the page.</div>}

        <div className="branch-drawer" aria-label="Work Hall branch selector">
          <div className="branch-drawer__lead">
            <span>Current pick</span>
            <strong>{activeLocation.area}</strong>
            <small>{activeLocation.address}</small>
          </div>

          <div className="branch-menu">
            <button
              type="button"
              className="branch-menu__field"
              aria-expanded={isBranchMenuOpen}
              onClick={() => setIsBranchMenuOpen((isOpen) => !isOpen)}
            >
              <span>
                <strong>Choose a Location</strong>
                <small>{activeLocation.area}</small>
              </span>
              <SearchIcon />
            </button>

            {isBranchMenuOpen && (
              <div className="branch-menu__panel">
                {rankedLocations.map(({ location, distance }) => (
                  <button
                    type="button"
                    key={location.id}
                    className={location.id === activeLocationId ? 'branch-option is-selected' : 'branch-option'}
                    onClick={() => {
                      setActiveLocationId(location.id, { manual: true })
                      setIsBranchMenuOpen(false)
                    }}
                  >
                    <span>
                      <strong>{location.area}</strong>
                      <small>{location.address}</small>
                    </span>
                    <em>{formatDistance(distance)}</em>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a className="map-directions-link" href={directionsUrl} target="_blank" rel="noreferrer">
            Open in Google Maps
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}




