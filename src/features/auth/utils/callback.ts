export interface CallbackParams {
  code: string | null
  state: string | null
  error: string | null
}

export function getCallbackParams(): CallbackParams {
  // Check for query parameters (authorization code flow)
  const queryParams = new URLSearchParams(window.location.search)

  return {
    code: queryParams.get('code'),
    state: queryParams.get('state'),
    error: queryParams.get('error'),
  }
}
