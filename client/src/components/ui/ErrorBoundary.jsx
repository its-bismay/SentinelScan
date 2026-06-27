import React, { Component } from 'react';
import { AlertOctagon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-base-100 rounded-2xl border border-error/20">
          <div className="p-4 bg-error/10 text-error rounded-full mb-4">
            <AlertOctagon className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-base-content font-display">Something went wrong</h3>
          <p className="text-sm text-base-content/60 max-w-md mt-2 mb-6">
            An unexpected client-side error occurred. Try refreshing the page or navigating back.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-error text-error-content"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
