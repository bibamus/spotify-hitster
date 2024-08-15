const clientId = import.meta.env.VITE_CLIENT_ID;
console.log(clientId)
const redirectUri = 'http://localhost:5173/callback';

const scope = 'user-read-private user-read-email playlist-read-private';
const authUrl = new URL("https://accounts.spotify.com/authorize")
const tokenUrl = new URL("https://accounts.spotify.com/api/token")

/**
 * @param {number} size
 */
function randomBytes(size: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(size))
}

/**
 * @param {Uint8Array} bytes
 */
function base64url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

/**
 * https://tools.ietf.org/html/rfc7636#section-4.2
 * @param {string} code_verifier
 */
async function generateCodeChallenge(code_verifier: string) {
    const codeVerifierBytes = new TextEncoder().encode(code_verifier)
    const hashBuffer = await crypto.subtle.digest('SHA-256', codeVerifierBytes)
    return base64url(new Uint8Array(hashBuffer))
}

/**
 * @param {RequestInfo} input
 * @param {RequestInit} [init]
 */
async function fetchJSON(input: URL, init: RequestInit) {
    const response = await fetch(input, init)
    const body = await response.json()
    if (!response.ok) {
        throw new ErrorResponse(response)
    }
    return body
}

class ErrorResponse extends Error {
    // @ts-expect-error private field
    private response: Response;

    constructor(response: Response) {
        super(response.statusText)
        this.response = response
    }
}

export async function beginLogin() {
    const code_verifier = base64url(randomBytes(96))
    const state = base64url(randomBytes(96))

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        code_challenge_method: 'S256',
        code_challenge: await generateCodeChallenge(code_verifier),
        state: state,
        scope: scope,
    })

    sessionStorage.setItem('code_verifier', code_verifier)
    sessionStorage.setItem('state', state)

    location.href = `${authUrl}?${params}`
}

export async function completeLogin() {
    const code_verifier = sessionStorage.getItem('code_verifier')
    const state = sessionStorage.getItem('state')

    const params = new URLSearchParams(location.search)

    if (params.has('error')) {
        throw new Error(params.get('error') ?? "Unknown error")
    } else if (!params.has('state')) {
        throw new Error('State missing from response')
    } else if (params.get('state') !== state) {
        throw new Error('State mismatch')
    } else if (!params.has('code')) {
        throw new Error('Code missing from response')
    }

    await createAccessToken({
        grant_type: 'authorization_code',
        code: params.get('code') as string,
        redirect_uri: `${location.origin}/callback`,
        code_verifier: code_verifier as string,
    })
}

export function logout() {
    localStorage.removeItem('tokenSet')
}


/**
 * @param {Record<string, string>} params
 * @returns {Promise<string>}
 */
async function createAccessToken(params: Record<string, string>) {
    const response = await fetchJSON(tokenUrl, {
        method: 'POST',
        body: new URLSearchParams({
            client_id: clientId,
            ...params,
        }),
    })

    const accessToken = response.access_token
    const expires_at = Date.now() + 1000 * response.expires_in

    localStorage.setItem('tokenSet', JSON.stringify({...response, expires_at}))

    return accessToken
}

/**
 * @returns {Promise<string>}
 */
export async function getAccessToken(): Promise<string> {
    const tokenSetString = localStorage.getItem('tokenSet')
    if (!tokenSetString) {
        throw new Error('No token set')
    }
    let tokenSet = JSON.parse(tokenSetString)

    if (!tokenSet) {
        throw new Error('No token set')
    }

    if (tokenSet.expires_at < Date.now()) {
        tokenSet = await createAccessToken({
            grant_type: 'refresh_token',
            refresh_token: tokenSet.refresh_token,
        })
    }

    return tokenSet.access_token
}

export function isAuthenticated() {
    return !!localStorage.getItem('tokenSet')
}