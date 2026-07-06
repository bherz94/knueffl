import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  // Rendered instead of the children when a render error is caught.
  fallback: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Catches render-time errors in its subtree and shows `fallback` instead of
// letting the whole app unmount to a blank page. Used to guard rendering of
// persisted data (e.g. legacy scorecards) that may no longer match the current
// shape. Class component because error boundaries have no hook equivalent.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
