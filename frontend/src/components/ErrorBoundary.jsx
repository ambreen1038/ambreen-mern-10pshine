import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2em', color: 'red' }}>
          <h1>Something went wrong:</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
