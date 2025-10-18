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
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <h3 className="font-semibold text-red-800 dark:text-red-200">Error en el panel de administración</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">Ha ocurrido un error al renderizar el panel. Revisa la consola para más detalles.</p>
          {this.state.error ? (
            <pre className="mt-3 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-64">{String(this.state.error.stack || this.state.error.message)}</pre>
          ) : null}
        </div>
      );
    }
    return this.props.children as JSX.Element;
  }
}
