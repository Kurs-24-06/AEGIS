export const environment = {
  production: true,
  apiUrl: 'https://api.aegis-security.com/api',
  simulationRefreshRate: 1000, // ms
  featureFlags: {
    enableExperimentalFeatures: false,
    enableDebugConsole: false,
    enablePerformanceMetrics: false,
  },
  auth: {
    clientId: 'aegis-production-client',
    authority: 'https://auth.aegis-security.com',
    redirectUri: 'https://aegis-security.com/auth-callback',
    silentRefreshUri: 'https://aegis-security.com/silent-refresh.html',
    scope: 'openid profile email aegis-api',
    autoLogin: true,
  },
  analytics: {
    enabled: true,
    trackingId: 'UA-PRODUCTION-ID',
  },
};
