export function encodeShareData(trip, legs, expenses) {
  try {
    const payload = { trip, legs, expenses }
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
  } catch {
    return null
  }
}

export function decodeShareData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))))
  } catch {
    return null
  }
}

export function buildShareUrl(trip, legs, expenses) {
  const data = encodeShareData(trip, legs, expenses)
  const base = window.location.origin + window.location.pathname
  return `${base}#/import?data=${data}`
}
