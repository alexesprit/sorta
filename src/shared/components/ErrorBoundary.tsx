import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error boundary caught an error:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-4">
                Something went wrong
              </h2>
              <p className="text-zinc-400 mb-6">
                An unexpected error occurred. Please refresh the page to try
                again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-spotify hover:bg-spotify-hover text-black font-bold rounded-md transition-colors"
              >
                Refresh Page
              </button>
              {/* biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures */}
              {process.env['NODE_ENV'] === 'development' &&
                this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-zinc-500 hover:text-zinc-400">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs text-zinc-600 bg-zinc-950 p-2 rounded overflow-auto">
                      {this.state.error.message}
                      {'\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
