// Export the API functionality
// The main API implementation lives in `autocontent.ts`.  Several tests
// import a named export called `api`, so provide that alias here.
import { autoContentApi } from './autocontent';

export { autoContentApi };

// Alias used throughout the codebase and in the test suite.
export const api = autoContentApi;

// Re-export types
export type { ProcessRequest, ProcessResponse, ContentStatus } from '../types/api';