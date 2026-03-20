import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Log to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div
          className={`flex flex-col items-center justify-center ${this.props.minimal ? "p-4 min-h-[200px]" : "min-h-screen"} bg-gradient-to-br from-red-50 to-pink-50`}
        >
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 4v2m0-14a9 9 0 110 18 9 9 0 010-18z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Quelque chose s'est mal passé
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {this.props.minimal
                ? "Une erreur s'est produite dans ce composant."
                : "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support."}
            </p>

            {/* Development Error Details */}
            {isDevelopment && this.state.error && (
              <div className="mb-6 p-4 bg-gray-900 rounded-lg overflow-auto max-h-48">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="text-gray-400 text-xs font-mono mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.resetError}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Réessayer
              </button>
              {!this.props.minimal && (
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Retour à l'accueil
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
