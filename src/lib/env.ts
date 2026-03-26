const FALLBACK_ENV_ALIASES: Record<string, string[]> = {
  BALLDONTLIE_API_KEY: ['BALDONTLIE_API_KEY'],
}

function readFirstAvailableEnv(name: string, aliases: string[] = []) {
  const candidates = [name, ...aliases]

  for (const candidate of candidates) {
    const value = process.env[candidate]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return null
}

export function getServerEnv(name: string, aliases: string[] = []) {
  return readFirstAvailableEnv(name, [...(FALLBACK_ENV_ALIASES[name] || []), ...aliases])
}

export function requireServerEnv(name: string, aliases: string[] = []) {
  const value = getServerEnv(name, aliases)

  if (!value) {
    throw new Error(`${name} mancante`)
  }

  return value
}
