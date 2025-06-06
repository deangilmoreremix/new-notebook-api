// Re-export the API functionality
// Provide both `autoContentApi` and the legacy `api` alias used
// throughout the tests and some components.
export { autoContentApi, autoContentApi as api } from './api/autocontent';

// Re-export types
export type { ProcessRequest, ProcessResponse, ContentStatus } from './types/api';