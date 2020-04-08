import { production } from './config'

export function extractPosition(p) {
  const [lng, lat] = p.location.coordinates
  return Object.assign(p, { pos: { lat, lng } })
}

export function endPoint(p) {
  if (production) {
    return `http://m4nhs.fezz.in:3000/${p}`
  }
  return `http://localhost:5001/meals4nhs/europe-west2/api/${p}`
}
