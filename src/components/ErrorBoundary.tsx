import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gold/20">
              <span className="text-5xl">🙏</span>
            </div>
            <h2 className="font-display text-2xl text-maroon mb-3">Something went wrong</h2>
            <p className="text-brown/60 text-sm mb-6">
              We apologize for the inconvenience. Please try again or return to the home page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-maroon transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="rounded-full border border-gold px-6 py-3 text-sm font-semibold text-maroon hover:bg-gold/10 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
