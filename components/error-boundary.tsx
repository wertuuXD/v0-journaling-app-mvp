"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Show user-friendly toast notification
    toast.error('Something went wrong. Please try refreshing the page.')
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Your journal data is safe and has been preserved.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-xl border border-border/20 bg-secondary/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error Details (Development Only)
                </summary>
                <div className="mt-3 rounded-lg bg-muted/50 p-4 text-xs font-mono text-muted-foreground">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div className="whitespace-pre-wrap">
                    <strong>Stack:</strong> {this.state.error.stack}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2 whitespace-pre-wrap">
                      <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to use error boundaries
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error('Error handled by useErrorHandler:', error, context)
    toast.error(`Something went wrong${context ? ` in ${context}` : ''}. Please try again.`)
  }

  return { handleError }
}
