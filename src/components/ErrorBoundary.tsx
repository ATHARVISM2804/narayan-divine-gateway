import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "@/i18n";

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
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h2 className="mb-2 text-xl font-bold text-ink">{i18n.t("co_err_generic")}</h2>
            <p className="mb-6 text-[15px] text-ink-muted">{i18n.t("contact_err_generic")}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => this.setState({ hasError: false })} className="btn-primary">
                {i18n.t("btn_retry")}
              </button>
              {/* A full reload on purpose: it clears whatever state broke the page. */}
              <a href="/" className="btn-secondary">
                {i18n.t("nf_back")}
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
