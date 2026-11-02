# Asset Studio

A browser-based asset extraction utility designed to
simplify creative operations and Google Ads workflows.

Asset Studio extracts embedded Base64 assets from
HTML and PHP source files and allows users to preview,
filter, and download them individually or as ZIP archives.

## Features

### File Upload
- HTML file support (.html, .htm)
- PHP source file support (.php)
- Drag-and-drop upload
- Maximum file size: 50 MB
- Local browser processing

### Asset Extraction
- Base64 image extraction
- SVG extraction
- Video extraction
- Audio extraction
- Font extraction
- Other supported MIME types
- MIME type identification
- File extension identification

### Asset Management
- Asset preview
- Individual downloads
- Bulk ZIP downloads
- Asset search
- File-type filtering
- File size information
- Extraction statistics

### User Interface
- Dark mode
- Light mode
- Persistent theme preference
- Responsive dashboard
- Drag-and-drop interface
- Empty state for files without Base64 assets
- No-results state for search and filtering
- Error notifications

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- JSZip
- Lucide React

## Requirements

- Node.js 20.9 or newer
- npm

## Installation

Clone the repository:

    git clone YOUR_REPOSITORY_URL

Navigate into the project:

    cd asset-studio

Install dependencies:

    npm install

Start development server:

    npm run dev

Open:

    http://localhost:3000

## Production Build

Build the application:

    npm run build

Start production server:

    npm run start

## How It Works

1. The user uploads an HTML or PHP source file.
2. The browser reads the file as text.
3. The extraction engine searches for embedded
   Base64 data URIs.
4. Base64 content is decoded into binary data.
5. Binary data is converted into Blob objects.
6. Assets are classified by MIME type.
7. Extracted assets are displayed in the dashboard.
8. Users can preview and download individual files.
9. JSZip generates an archive for bulk downloads.

## PHP File Handling

PHP files are treated as plain source text.

Asset Studio does not execute PHP code.

Only embedded assets present in the uploaded
source text can be extracted.

Dynamically generated PHP assets are not available
unless their resulting data is present in the file.

## Privacy

Asset extraction and ZIP generation happen locally
inside the browser.

Uploaded source files are not sent to an application
server by the extraction workflow.

## Current Limitations

- External image URLs are not downloaded.
- JavaScript-generated assets may not be detected.
- Large files can consume significant browser memory.
- PHP and JavaScript code are not executed.
- Some unusual CSS and Base64 formats may require
  additional extraction support.

## Future Improvements

- Multiple file uploads
- Duplicate asset detection
- Asset renaming
- Advanced asset filtering
- Separate ZIP folders by asset type
- Extraction progress indicators
- Improved CSS asset detection
- Batch processing
- Extraction history

## Copyright

© Pranoy Acharyya. All rights reserved.