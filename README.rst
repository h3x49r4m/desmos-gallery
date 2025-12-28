Desmos Gallery
==============

A modern web application for creating, saving, and browsing mathematical graphs using the Desmos API. Features both 2D and 3D graphing capabilities with an intuitive interface, comprehensive batch operations, and advanced formula rendering using KaTeX.

Features
--------

**Core Functionality**
- **2D & 3D Graph Support**: Create graphs using Desmos 2D and 3D calculators
- **Interactive Preview**: Real-time graph preview as you type formulas
- **Formula Rendering**: Mathematical formulas rendered with KaTeX for professional display
- **Tag System**: Organize graphs with custom tags for easy filtering
- **Type Filtering**: Filter graphs by type (2D or 3D) in the gallery
- **Gallery View**: Browse all saved graphs in a responsive card-based layout with formula display
- **Batch Selection & Deletion**: Select multiple graphs and delete them in bulk with pretty confirmations
- **Modal Editing**: Edit graph details (title, author, tags, formula, line color) in a modal
- **Download Functionality**: Download graphs as high-quality PNG images with metadata
- **Persistent Storage**: Graphs are saved to JSON file and persist between server restarts

**Advanced UI Features**
- **Modern UI**: Glass morphism design with smooth animations and micro-interactions
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices
- **Auto-fit Layout**: Graph and form automatically fit the screen height
- **Dense Form Design**: Compact input form with smaller fonts for efficient space usage
- **Animated Background**: Floating gradient patterns for visual appeal
- **Skeleton Loading**: Loading animations for better user experience
- **Custom Alerts**: Beautiful, site-consistent alert system replacing browser dialogs
- **Enhanced Cards**: Graph cards display formula between chart and title with elegant styling
- **Environment-Based UI**: Different UI elements shown based on deployment environment

**Gallery Enhancements**
- **Formula Display**: Mathematical formulas rendered beautifully in gallery cards
- **Centered Formulas**: Professional formula presentation with KaTeX rendering
- **Mini Previews**: Graph cards show miniature Desmos previews
- **Modal View**: Click any graph to see full-size preview
- **Empty States**: Helpful messages when no graphs exist
- **Visual Feedback**: Selection states, hover effects, and smooth transitions
- **Error Recovery**: Graceful handling of deletion errors with detailed feedback

**Development & Deployment**
- **Environment Builds**: Separate dev and prod build modes
- **Static Deployment**: Full GitHub Pages support with embedded data
- **CORS-Free Loading**: Works seamlessly when opening HTML files directly
- **Sample Data**: Automatic sample graph generation for demos
- **Build Scripts**: Easy deployment commands for different environments

Installation
------------

1. Clone the repository::

    git clone git@github.com:h3x49r4m/desmos-gallery.git
    cd desmos_gallery

2. Install dependencies::

    npm install

3. Development Mode::

    npm start

4. Open your browser and navigate to::

    http://localhost:3000

Building for Static Deployment
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

For GitHub Pages or static hosting::

    # Production build (hides dev-only features)
    npm run build:prod

    # Development build (shows all features)
    npm run build:dev

    # GitHub Pages build (default: production)
    npm run build:github-pages

The built site will be available in the ``_public/`` directory.

Usage
-----

Creating Graphs
~~~~~~~~~~~~~~~~

1. Navigate to the main page (``http://localhost:3000``)
2. Enter your formula in the text area (e.g., ``y=x^2`` for 2D or ``z=x^2+y^2`` for 3D)
3. Select graph type (2D or 3D)
4. Add a title, tags, and author name
5. Choose a line color
6. Click "Preview" to see the graph
7. Click "Save" to store the graph

Browsing Gallery
~~~~~~~~~~~~~~~~

1. Click "Gallery" in the navigation bar
2. Browse all saved graphs in card view with mini previews
3. Click on tags to filter graphs by category
4. Click on any graph card to see a larger preview in a modal

Batch Operations
~~~~~~~~~~~~~~~~

1. In the gallery, hover over graph cards to reveal selection checkboxes
2. Click checkboxes to select multiple graphs
3. Selected graphs show a blue border and selection count appears in batch controls
4. Use "Delete Selected" to remove multiple graphs at once
5. Confirm deletion in the beautiful custom confirmation dialog
6. View detailed deletion results with success/failure counts
7. Gallery automatically refreshes after successful deletion
8. Partial failures are handled gracefully with specific error messages

Supported Formulas
~~~~~~~~~~~~~~~~~~

**2D Graphs:**
- Functions: ``x^2``, ``sin(x)``, ``log(x)``
- Equations: ``y=x^2``, ``x^2+y^2=4``
- Parametric: ``(cos(t), sin(t))``

**3D Graphs:**
- Surfaces: ``z=x^2+y^2``, ``z=sin(x*y)``
- Parametric: ``(cos(u)*cos(v), cos(u)*sin(v), sin(u))``

Download Graphs
~~~~~~~~~~~~~~~

1. Click on any graph card in the gallery to open the modal
2. Click the "Download" button in the modal
3. Graphs are downloaded as high-quality PNG images with:
   - Mathematical formula rendered at the top
   - Graph visualization in the center
   - Metadata (title, author, date) at the bottom
   - Professional layout with proper spacing
   - Watermark with GitHub repository link

**Download Features**:
- **Formula Rendering**: Mathematical formulas rendered with KaTeX
- **High Resolution**: 1200x850px canvas with 2x pixel ratio
- **Professional Layout**: Clean, organized presentation
- **Metadata Included**: Title, author (if provided), and creation date
- **Smart Author Display**: Omits author field when empty (no orphaned separators)
- **3D Support**: Special handling for 3D graphs using synchronous screenshot API
- **Error Handling**: Graceful fallbacks for rendering issues

API Endpoints
-------------

- ``GET /api/graphs`` - Get all graphs
- ``POST /api/graphs`` - Create new graph
- ``GET /api/graphs/:id`` - Get specific graph
- ``PUT /api/graphs/:id`` - Update graph
- ``DELETE /api/graphs/:id`` - Delete graph
- ``GET /api/tags`` - Get all unique tags

Data Storage
------------

Graphs are stored in ``data/graphs.json`` in the following format::

    {
      "id": "1234567890",
      "title": "Parabola",
      "formula": "y=x^2",
      "type": "2D",
      "tags": ["parabola", "quadratic"],
      "author": "John Doe",
      "lineColor": "#2196F3",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }

Testing
-------

Run the test suite::

    npm test

Test Coverage:
- **231 tests** covering all functionality
- **Server Tests** (33 tests): API endpoints, static file serving, error handling, CORS, security
- **Data Manager Tests** (23 tests): File operations, validation, sanitization, data integrity
- **UI Component Tests** (12 tests): GraphManager, GalleryManager, form validation, responsive behavior
- **Batch Selection UI Tests** (16 tests): Checkbox selection, visual feedback, batch deletion
- **Batch Delete Tests** (8 tests): Server-side batch operations, error handling, performance
- **Modal Edit Tests** (29 tests): Modal editing functionality, form validation, error handling
- **Form Layout Tests** (13 tests): Form field order and structure validation
- **Modal Tag Bug Tests** (13 tests): Tag handling in modal editing
- **Type Filter Tests** (25 tests): Type filtering functionality and integration
- **Formula Rendering Tests** (20 tests): KaTeX formula rendering, error handling, styling validation
- **Download Feature Tests** (35 tests): Graph download functionality, canvas rendering, metadata layout
- **Simple Tests** (4 tests): Basic functionality validation

Test Categories:
- Data management functionality
- API endpoint testing
- Graph validation
- UI component interactions
- Batch selection and deletion
- Formula rendering and display
- Download functionality and image generation
- Error handling and edge cases
- Performance testing
- Cross-browser compatibility

Test Categories:
- Data management functionality
- API endpoint testing
- Graph validation
- UI component interactions
- Batch selection and deletion
- Error handling and edge cases
- Performance testing

Development
-----------

Project Structure
~~~~~~~~~~~~~~~~~

::

    desmos_gallery/
    ├── src/                   # Server-side code
    │   └── server.js          # Express server with API endpoints
    ├── static/                # Static files (client-side)
    │   ├── index.html         # Main graph creation page
    │   ├── gallery.html       # Gallery browsing page with batch selection
    │   ├── css/
    │   │   └── styles.css     # Modern CSS with glass morphism design
    │   ├── js/                # Client-side JavaScript
    │   │   ├── graphManager.js    # Graph creation and management
    │   │   └── galleryManager.js  # Gallery display and batch operations
    │   ├── calculator.js      # Desmos 2D calculator API
    │   ├── calculator3d.js    # Desmos 3D calculator API
    │   └── favicon.svg        # Site favicon
    ├── tests/                 # Test files
    │   ├── server.test.js           # Server and API tests
    │   ├── data-manager.test.js     # Data management tests
    │   ├── ui-components.test.js    # UI component tests
    │   ├── batch-selection-ui.test.js # Batch selection UI tests
    │   ├── batch-delete.test.js      # Batch delete API tests
    │   ├── modal-edit.test.js        # Modal editing tests
    │   ├── form-layout.test.js       # Form layout validation tests
    │   ├── modal-tag-bug.test.js     # Modal tag bug fix tests
    │   ├── type-filter.test.js       # Type filtering tests
    │   ├── simple.test.js           # Basic functionality tests
    │   └── setup.js                 # Test setup utilities
    ├── data/                 # JSON data storage (created automatically)
    │   ├── graphs.json        # Main data file
    │   └── graphs.json.backup # Backup file
    └── package.json

Scripts
~~~~~~~

- ``npm start`` - Start the development server
- ``npm test`` - Run the complete test suite (231 tests)
- ``npm run test:watch`` - Run tests in watch mode
- ``npm run test:coverage`` - Run tests with coverage report
- ``npm run build:github-pages`` - Build static site for GitHub Pages deployment (production mode)
- ``npm run build:prod`` - Build production static site (hides dev-only features)
- ``npm run build:dev`` - Build development static site (shows all features)

Dependencies
------------

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **jest**: Testing framework with comprehensive test coverage
- **supertest**: HTTP assertion testing
- **jsdom**: DOM environment for UI testing
- **babel**: JavaScript transpiler for modern syntax support

License
-------

Apache 2.0

Additional Features
------------------

**Gallery & Display**
- **Formula Rendering**: Mathematical formulas beautifully rendered with KaTeX in gallery cards
- **Mini Previews**: Graph cards show miniature Desmos previews
- **Modal View**: Click any graph to see full-size preview
- **Modal Editing**: Edit all graph properties in an interactive modal
- **Tag Filtering**: Dynamic filtering by graph tags
- **Type Filtering**: Filter graphs by 2D or 3D type
- **Empty State**: Helpful message when no graphs exist
- **Smart Author Display**: Omits author field when empty (no orphaned separators)

**User Interface**
- **Custom Alerts**: Beautiful, site-consistent alert system replacing browser dialogs
- **Enhanced Cards**: Graph cards display formula between chart and title with elegant styling
- **Environment-Based UI**: Different UI elements shown based on deployment environment
- **Glass Morphism UI**: Modern glass-like design with backdrop blur
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Responsive Grid**: Adaptive card layout for different screen sizes
- **Professional Typography**: Consistent font styling and text hierarchy

**Data Management**
- **Form Validation**: Real-time validation of graph inputs
- **Color Picker**: Visual color selection for graph lines
- **Author Attribution**: Track who created each graph
- **Timestamps**: Automatic creation timestamps for all graphs
- **Error Handling**: Comprehensive error handling with user feedback
- **Batch Operations**: Select and delete multiple graphs with detailed feedback
- **Idempotent Operations**: Graceful handling of duplicate deletion requests

**Download & Export**
- **High-Quality Downloads**: PNG images with professional layout
- **Formula Integration**: Mathematical formulas included in downloaded images
- **Metadata Preservation**: Title, author, and date included in downloads
- **3D Support**: Special handling for 3D graph downloads
- **Error Recovery**: Graceful fallbacks for rendering issues

**Technical Features**
- **Security Headers**: Built-in security headers for protection
- **CORS-Free Static Loading**: Works when opening HTML files directly
- **Embedded Data**: Static deployment includes all graph data
- **Sample Data Generation**: Automatic sample graphs for demos
- **Environment Builds**: Separate dev and prod build modes
- **Comprehensive Testing**: 231 tests covering all functionality

Technical Details
-----------------

- **Node.js**: Backend runtime environment
- **Express.js**: RESTful API server
- **Desmos API v1.12**: Graphing calculator integration
- **CSS Grid & Flexbox**: Modern responsive layout
- **Glass Morphism**: Modern UI design pattern
- **Debouncing**: Optimized input handling for performance
- **Set-based Selection**: Efficient batch selection using JavaScript Sets
- **JSON Persistence**: Simple and reliable data storage

GitHub Pages Deployment
------------------------

To deploy the application as a static site on GitHub Pages:

1. Build the static site::

    npm run build:github-pages

2. The static site will be generated in the ``_public/`` directory
3. Deploy the ``_public/`` directory to GitHub Pages using one of these methods:

   **Method 1: Using gh-pages branch**
   
   ::

       git subtree push --prefix _public origin gh-pages

   **Method 2: Using GitHub Actions**
   
   Create ``.github/workflows/deploy.yml`` with GitHub Actions workflow

   **Method 3: Manual deployment**
   
   - Copy contents of ``_public/`` to your repository root
   - Enable GitHub Pages in repository settings
   - Select source as "Deploy from a branch"

Environment-Based Builds
~~~~~~~~~~~~~~~~~~~~~~~

**Production Build (Default)**
::

    npm run build:prod
    # or
    npm run build:github-pages

Features in production mode:
- ✅ Gallery browsing with all graphs
- ✅ Graph filtering by tags and type
- ✅ Graph viewing in modal
- ✅ Formula rendering in cards
- ✅ Download functionality
- ✅ Responsive design
- ✅ All static assets (CSS, JS, images)
- ❌ Graph creation form fields (hidden)
- ❌ Graph editing/deletion buttons (hidden)
- ❌ Save functionality (requires server)
- ❌ Real-time graph preview (requires server)

**Development Build**
::

    npm run build:dev

Features in development mode:
- ✅ All production features
- ✅ Graph creation form fields (visible)
- ✅ Graph editing/deletion buttons (visible)
- ✅ Save functionality (with error messages for static deployment)
- ✅ Full functionality for local testing

Static Deployment Benefits
~~~~~~~~~~~~~~~~~~~~~~~~~~

- **CORS-Free Loading**: Works when opening HTML files directly (file:// protocol)
- **Embedded Data**: All graph data embedded in JavaScript, no external dependencies
- **Offline Capability**: Complete offline functionality
- **Fast Loading**: No network requests needed for initial data
- **Sample Data**: Automatically includes 8 sample graphs for demonstration
- **Professional Presentation**: Clean, production-ready interface

The static deployment is perfect for showcasing existing graphs and demonstrating the application without requiring a server backend.

Contributing
-----------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality (aim for 100% test coverage)
5. Run the test suite (all 231 tests must pass)
6. Submit a pull request

**Development Guidelines**
- Follow the existing code style and patterns
- Add comprehensive tests for new features
- Test both development and production builds
- Ensure formula rendering works correctly
- Verify responsive design on different screen sizes
- Test error handling and edge cases
