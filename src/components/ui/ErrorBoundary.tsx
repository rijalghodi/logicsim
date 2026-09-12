import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
            color: "var(--fg)",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "var(--danger)", marginBottom: "16px" }}>Something went wrong.</h2>
          <pre
            style={{
              background: "var(--bg)",
              padding: "16px",
              borderRadius: "8px",
              maxWidth: "80%",
              overflowX: "auto",
              color: "var(--danger)",
              marginBottom: "24px",
              textAlign: "left",
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
          >
            {this.state.error?.toString()}
          </pre>
          <button className="btn-primary" onClick={this.handleReset}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
