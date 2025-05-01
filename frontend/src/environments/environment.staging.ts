// frontend/src/environments/environment.staging.ts
export const environment = {
  production: true,
  apiUrl: 'https://api-staging.aegis-security.com/api',
  simulationRefreshRate: 1000, // ms
  featureFlags: {
    enableExperimentalFeatures: true,
    enableDebugConsole: false,
    enablePerformanceMetrics: true,
  },
  auth: {
    clientId: 'aegis-staging-client',
    authority: 'https://auth-staging.aegis-security.com',
    redirectUri: 'https://staging.aegis-security.com/auth-callback',
    silentRefreshUri: 'https://staging.aegis-security.com/silent-refresh.html',
    scope: 'openid profile email aegis-api',
    autoLogin: true,
  },
  analytics: {
    enabled: true,
    trackingId: 'UA-STAGING-ID',
  },
};
