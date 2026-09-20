import { startLocalization } from './i18n/index.js';
import { createStandaloneApplication } from './standalone/application.js';
import { describeError } from './standalone/errors.js';

// Before the application boots, so a session that stored Traditional Chinese is
// already translated on its first paint rather than flashing English.
const localization = startLocalization();

const application = createStandaloneApplication({
  googleApiKey: import.meta.env.GOOGLE_MAPS_API_KEY,
  cesiumToken: import.meta.env.CESIUM_ION_TOKEN,
  allowQaRegistration: import.meta.env.DEV,
});

application.start().catch((error) => {
  console.error("God's Eye View initialization failed:", error);
  const loaderStatus = document.querySelector('#loading-screen .loader-status');
  loaderStatus.textContent = `Error: ${describeError(error)}`;
  loaderStatus.style.color = '#ff4444';
});

export { application, localization };
