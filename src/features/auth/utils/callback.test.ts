import { getCallbackParams } from '@/features/auth/utils/callback'

describe('getCallbackParams', () => {
  // Store original location to restore after tests
  const originalLocation = window.location

  beforeEach(() => {
    // Mock window.location with a configurable URL
    Object.defineProperty(window, 'location', {
      value: { search: '' } as Location,
      writable: true,
    })
  })

  afterEach(() => {
    // Restore original location
    window.location = originalLocation
  })

  describe('successful authorization flow', () => {
    test('should extract code and state from query params', () => {
      window.location.search = '?code=test_code&state=test_state'

      const result = getCallbackParams()

      expect(result.code).toBe('test_code')
      expect(result.state).toBe('test_state')
      expect(result.error).toBeNull()
    })

    test('should handle code without state', () => {
      window.location.search = '?code=test_code'

      const result = getCallbackParams()

      expect(result.code).toBe('test_code')
      expect(result.state).toBeNull()
      expect(result.error).toBeNull()
    })

    test('should handle special characters in code (URL encoded)', () => {
      window.location.search = '?code=abc%2Bdef%2Fghi%3D&state=xyz'

      const result = getCallbackParams()

      expect(result.code).toBe('abc+def/ghi=')
      expect(result.state).toBe('xyz')
      expect(result.error).toBeNull()
    })

    test('should handle special characters in state (URL encoded)', () => {
      window.location.search = '?code=test&state=abc%2Bdef%2Fghi%3D'

      const result = getCallbackParams()

      expect(result.code).toBe('test')
      expect(result.state).toBe('abc+def/ghi=')
      expect(result.error).toBeNull()
    })

    test('should handle spaces encoded as plus signs', () => {
      window.location.search = '?code=test+code&state=test+state'

      const result = getCallbackParams()

      expect(result.code).toBe('test code')
      expect(result.state).toBe('test state')
      expect(result.error).toBeNull()
    })

    test('should handle very long parameter values', () => {
      const longCode = 'a'.repeat(1000)
      const longState = 'b'.repeat(500)

      window.location.search = `?code=${longCode}&state=${longState}`

      const result = getCallbackParams()

      expect(result.code).toBe(longCode)
      expect(result.state).toBe(longState)
      expect(result.error).toBeNull()
    })

    test('should handle unicode characters in parameters', () => {
      window.location.search = '?code=test&state=%E2%9C%93%E2%9C%94'

      const result = getCallbackParams()

      expect(result.code).toBe('test')
      expect(result.state).toBe('✓✔')
      expect(result.error).toBeNull()
    })

    test('should handle mixed case in parameter values', () => {
      window.location.search = '?code=TeSt_CoDe&state=XyZ'

      const result = getCallbackParams()

      expect(result.code).toBe('TeSt_CoDe')
      expect(result.state).toBe('XyZ')
      expect(result.error).toBeNull()
    })
  })

  describe('error flow', () => {
    test('should extract error from query params', () => {
      window.location.search = '?error=access_denied'

      const result = getCallbackParams()

      expect(result.code).toBeNull()
      expect(result.state).toBeNull()
      expect(result.error).toBe('access_denied')
    })

    test('should extract error with state', () => {
      window.location.search = '?error=access_denied&state=test_state'

      const result = getCallbackParams()

      expect(result.code).toBeNull()
      expect(result.state).toBe('test_state')
      expect(result.error).toBe('access_denied')
    })

    test('should handle special characters in error (URL encoded)', () => {
      window.location.search = '?error=access_denied%20reason'

      const result = getCallbackParams()

      expect(result.code).toBeNull()
      expect(result.state).toBeNull()
      expect(result.error).toBe('access_denied reason')
    })

    test('should handle common OAuth error codes', () => {
      const errorCodes = [
        'access_denied',
        'unauthorized_client',
        'invalid_request',
        'invalid_scope',
        'server_error',
        'temporarily_unavailable',
      ]

      for (const errorCode of errorCodes) {
        window.location.search = `?error=${errorCode}`

        const result = getCallbackParams()

        expect(result.code).toBeNull()
        expect(result.state).toBeNull()
        expect(result.error).toBe(errorCode)
      }
    })

    test('should handle both code and error (returns both)', () => {
      window.location.search = '?code=test_code&error=access_denied'

      const result = getCallbackParams()

      expect(result.code).toBe('test_code')
      expect(result.state).toBeNull()
      expect(result.error).toBe('access_denied')
    })

    test('should handle all three parameters together', () => {
      window.location.search =
        '?code=test_code&state=test_state&error=test_error'

      const result = getCallbackParams()

      expect(result.code).toBe('test_code')
      expect(result.state).toBe('test_state')
      expect(result.error).toBe('test_error')
    })
  })

  describe('empty or invalid params', () => {
    test('should return empty object when no params', () => {
      window.location.search = ''

      const result = getCallbackParams()

      expect(result).toEqual({ code: null, state: null, error: null })
    })

    test('should return empty object with unrelated params', () => {
      window.location.search = '?foo=bar&baz=qux'

      const result = getCallbackParams()

      expect(result).toEqual({ code: null, state: null, error: null })
    })

    test('should return state when only state is present', () => {
      window.location.search = '?state=test_state'

      const result = getCallbackParams()

      // State is still returned even if code/error are not present
      expect(result).toEqual({ code: null, state: 'test_state', error: null })
    })

    test('should return empty object for ampersand-only query string', () => {
      window.location.search = '?&&&'

      const result = getCallbackParams()

      expect(result).toEqual({ code: null, state: null, error: null })
    })

    test('should return empty object for case-sensitive mismatch', () => {
      // URLSearchParams is case-sensitive, so CODE !== code
      window.location.search = '?CODE=test&STATE=xyz'

      const result = getCallbackParams()

      expect(result).toEqual({ code: null, state: null, error: null })
    })
  })

  describe('malformed query strings', () => {
    test('should handle malformed query string with param but no value', () => {
      window.location.search = '?code'

      const result = getCallbackParams()

      expect(result.code).toBe('')
      expect(result.state).toBeNull()
      expect(result.error).toBeNull()
    })

    test('should handle malformed query string with equals but no value', () => {
      window.location.search = '?code='

      const result = getCallbackParams()

      expect(result.code).toBe('')
      expect(result.state).toBeNull()
      expect(result.error).toBeNull()
    })

    test('should handle query string without leading question mark', () => {
      // URLSearchParams handles this gracefully
      window.location.search = 'code=test&state=xyz'

      const result = getCallbackParams()

      expect(result.code).toBe('test')
      expect(result.state).toBe('xyz')
      expect(result.error).toBeNull()
    })

    test('should handle multiple error parameters (takes first)', () => {
      window.location.search = '?error=first&error=second'

      const result = getCallbackParams()

      expect(result.code).toBeNull()
      expect(result.state).toBeNull()
      expect(result.error).toBe('first')
    })

    test('should handle multiple code parameters (takes first)', () => {
      window.location.search = '?code=first&code=second&state=test'

      const result = getCallbackParams()

      expect(result.code).toBe('first')
      expect(result.state).toBe('test')
      expect(result.error).toBeNull()
    })
  })

  describe('edge cases and security considerations', () => {
    test('should handle error with error_description parameter', () => {
      window.location.search =
        '?error=access_denied&error_description=User+cancelled'

      const result = getCallbackParams()

      // Note: error_description is not captured by getCallbackParams
      // This test documents current behavior
      expect(result.code).toBeNull()
      expect(result.state).toBeNull()
      expect(result.error).toBe('access_denied')
    })

    test('should handle CSRF-like state values', () => {
      // State should be treated as opaque string, not validated
      const csrfState = 'a1b2c3d4e5f6g7h8i9j0'

      window.location.search = `?code=test&state=${csrfState}`

      const result = getCallbackParams()

      expect(result.code).toBe('test')
      expect(result.state).toBe(csrfState)
      expect(result.error).toBeNull()
    })

    test('should handle empty string code value', () => {
      window.location.search = '?code=&state=test'

      const result = getCallbackParams()

      expect(result.code).toBe('')
      expect(result.state).toBe('test')
      expect(result.error).toBeNull()
    })

    test('should handle empty string error value', () => {
      window.location.search = '?error=&state=test'

      const result = getCallbackParams()

      expect(result.code).toBeNull()
      expect(result.state).toBe('test')
      expect(result.error).toBe('')
    })

    test('should not include accessToken in result when not present', () => {
      window.location.search = '?code=test&state=xyz'

      const result = getCallbackParams()

      expect(result).not.toHaveProperty('accessToken')
    })

    test('should handle parameter pollution attempts', () => {
      // Multiple parameters should be handled by URLSearchParams (takes first)
      window.location.search = '?code=malicious&code=legitimate&state=test'

      const result = getCallbackParams()

      expect(result.code).toBe('malicious')
      expect(result.state).toBe('test')
    })

    test('should handle extremely long URLs without crashing', () => {
      const extremelyLongCode = 'x'.repeat(10000)

      window.location.search = `?code=${extremelyLongCode}`

      const result = getCallbackParams()

      expect(result.code).toBe(extremelyLongCode)
      expect(result.code?.length).toBe(10000)
    })

    test('should preserve exact parameter values without modification', () => {
      const codeWithSpecialChars = 'abc-123_xyz.ABC~'

      window.location.search = `?code=${codeWithSpecialChars}&state=test`

      const result = getCallbackParams()

      expect(result.code).toBe(codeWithSpecialChars)
    })
  })
})
