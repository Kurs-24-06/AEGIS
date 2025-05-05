// Generated for dev environment - Mon, May  5, 2025 11:14:33 AM
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  simulationRefreshRate: 2000, // ms
  featureFlags: {
    enableExperimentalFeatures: true,
    enableDebugConsole: true,
    enablePerformanceMetrics: true,
  },
  auth: {
    clientId: 'aegis-dev-client',
    authority: 'http://localhost:8080/auth',
    redirectUri: 'http://localhost:4200/auth-callback',
    silentRefreshUri: 'http://localhost:4200/silent-refresh.html',
    scope: 'openid profile email aegis-api',
    autoLogin: true,
  },
  analytics: {
    enabled: false,
    trackingId: '',
  },
};
