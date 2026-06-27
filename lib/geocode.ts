const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'Vigil Civic Platform/1.0'

export interface GeocodeResult {
  address: string
  ward: string
  city: string
}

const DEBOUNCE_DELAY_MS = 500

let lastGeocodeTime = 0

export async function geocodeReverse(
  lat: number,
  lng: number
): Promise<GeocodeResult> {
  const now = Date.now()
  const timeSinceLast = now - lastGeocodeTime
  if (timeSinceLast < DEBOUNCE_DELAY_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, DEBOUNCE_DELAY_MS - timeSinceLast)
    )
  }
  lastGeocodeTime = Date.now()

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    format: 'json',
    addressdetails: '1',
  })

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`)
  }

  const data = await response.json()

  const address = data.display_name || ''
  const addressDetails = data.address || {}

  const ward =
    addressDetails.suburb ||
    addressDetails.neighbourhood ||
    addressDetails.quarter ||
    ''
  const city = addressDetails.city || addressDetails.town || addressDetails.village || ''

  return { address, ward, city }
}