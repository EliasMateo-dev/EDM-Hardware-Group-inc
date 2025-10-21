import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error; info?: React.ErrorInfo };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Registramos en consola por ahora — se puede conectar a un servicio de telemetría luego
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ error, info });
  }

  render() {
    return this.props.children as JSX.Element;
  }
}
