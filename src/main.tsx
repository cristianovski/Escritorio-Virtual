import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'

// Sentry (monitoramento de erros) - v8
import * as Sentry from "@sentry/react"
import { browserTracingIntegration } from "@sentry/react"

const sanitizePath = (path: string) => path
  .split('/')
  .map((segment) => (
    /^\d+$/.test(segment)
    || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)
      ? ':id'
      : segment
  ))
  .join('/')

const sanitizeUrl = (url?: string) => {
  if (!url) return url

  try {
    const parsedUrl = new URL(url, window.location.origin)
    parsedUrl.pathname = sanitizePath(parsedUrl.pathname)
    parsedUrl.search = ''
    parsedUrl.hash = ''
    return parsedUrl.toString()
  } catch {
    return sanitizePath(url.split(/[?#]/, 1)[0])
  }
}

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: false,
    
    // 👇 FILTRO DE RUÍDOS: Ignora falsos positivos de rede e navegação
    ignoreErrors: [
      "AbortError",
      "signal is aborted without reason",
      "Failed to fetch",
      "Network request failed"
    ],

    integrations: [
      browserTracingIntegration(),
    ],
    // Mantém uma amostra pequena de desempenho sem gravar sessões do usuário.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'console') return null

      for (const field of ['url', 'from', 'to']) {
        if (breadcrumb.data?.[field]) {
          breadcrumb.data[field] = sanitizeUrl(String(breadcrumb.data[field]))
        }
      }

      return breadcrumb
    },
    beforeSend(event) {
      // O produto trata documentos e dados pessoais: relatórios de erro não devem
      // carregar identidade, corpo de requisições, cookies ou cabeçalhos.
      delete event.user
      delete event.extra
      if (event.transaction) event.transaction = sanitizePath(event.transaction)

      if (event.request) {
        event.request.url = sanitizeUrl(event.request.url)
        delete event.request.data
        delete event.request.cookies
        delete event.request.headers
        delete event.request.query_string
      }

      return event
    },
    environment: import.meta.env.MODE, // 'development' ou 'production'
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
