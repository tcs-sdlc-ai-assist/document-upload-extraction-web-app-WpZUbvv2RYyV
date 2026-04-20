# Changelog

## [1.0.0] - 2024-06-10

### Added

- Initial project setup with Vite, React, and TypeScript.
- Defined core types: `User`, `Session`, `DocumentEntry`, `AuthContextType` in `src/types.ts`.
- Document upload and extraction workflow:
  - Upload documents with metadata (filename, uploader, status).
  - Track processing status: pending, processing, completed, error.
  - Store extracted text and error messages.
- Basic authentication context and session management types.
- Project structure and initial configuration.