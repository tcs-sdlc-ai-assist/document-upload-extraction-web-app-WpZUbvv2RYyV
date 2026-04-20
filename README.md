# doc-upload-extract

A modern web application for uploading documents, extracting text, and managing document processing workflows.

## Overview

**doc-upload-extract** enables users to:
- Upload documents (PDF, DOCX, etc.)
- Track the status of document processing (pending, processing, completed, error)
- View extracted text or error messages for each document
- Authenticate and manage sessions securely

## Tech Stack

- **Frontend:** React (TypeScript), Vite
- **Styling:** Tailwind CSS
- **State & Context:** React Context API
- **Testing:** @testing-library/react, Jest
- **Type Definitions:** See [`src/types.ts`](src/types.ts)

## Folder Structure

```
src/
  types.ts           # Shared TypeScript interfaces
  components/        # React UI components
  hooks/             # Custom React hooks
  context/           # Auth and app context providers
  pages/             # Page-level components/views
  utils/             # Utility functions
  services/          # API and business logic
  App.tsx            # Main app component (router lives here)
  main.tsx           # Entry point (renders <App />)
public/
  index.html
  ...
README.md
vite.config.ts
tsconfig.json
package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/your-org/doc-upload-extract.git
cd doc-upload-extract
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Sign In:** Log in with your credentials.
2. **Upload Document:** Use the upload interface to select and submit a document.
3. **Track Status:** Monitor processing status in the document list.
4. **View Results:** Click on a document to view extracted text or error details.

## Accessibility

- All interactive elements are keyboard accessible.
- Uses semantic HTML and ARIA attributes where appropriate.
- Color contrast meets WCAG AA standards (with Tailwind defaults).
- Screen reader-friendly labels and focus management.

## License

[MIT](LICENSE)

---

© 2024 doc-upload-extract contributors.