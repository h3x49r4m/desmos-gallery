Desmos Gallery
==============

A modern web application for creating, saving, and browsing mathematical graphs using the Desmos API. Features both 2D and 3D graphing capabilities with an intuitive interface, comprehensive batch operations, and professional formula rendering using KaTeX.

Features
--------

**Core Functionality**
- **2D & 3D Graph Support**: Create graphs using Desmos 2D and 3D calculators
- **Interactive Preview**: Real-time graph preview as you type formulas
- **Formula Rendering**: Mathematical formulas rendered with KaTeX for professional display
- **Tag System**: Organize graphs with custom tags for easy filtering
- **Type Filtering**: Filter graphs by type (2D or 3D) in the gallery
- **Gallery View**: Browse saved graphs in a responsive card-based layout
- **Batch Operations**: Select and delete multiple graphs with detailed feedback
- **Modal Editing**: Edit graph details (title, author, tags, formula, line color)
- **Download Functionality**: Export graphs as high-quality PNG images with metadata
- **Persistent Storage**: Graphs saved to JSON file with automatic backup

**User Interface**
- **Modern Design**: Glass morphism UI with smooth animations and micro-interactions
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Custom Alerts**: Beautiful, site-consistent alert system replacing browser dialogs
- **Environment-Based UI**: Different features shown based on deployment mode

**Development & Deployment**
- **Static Deployment**: Full GitHub Pages support with embedded data
- **Environment Builds**: Separate development and production build modes
- **Sample Data**: Automatic sample graph generation for demonstrations

Installation
------------

1. Clone the repository::

    git clone git@github.com:h3x49r4m/desmos-gallery.git
    cd desmos_gallery

2. Install dependencies::

    npm install

3. Start the development server::

    npm start

4. Open your browser to::

    http://localhost:3000

Static Deployment
~~~~~~~~~~~~~~~~~

For GitHub Pages or static hosting::

    # Production build (hides dev-only features)
    npm run build:prod

    # Development build (shows all features)
    npm run build:dev

    # GitHub Pages build (default: production)
    npm run build:github-pages

The built site is available in the ``_public/`` directory.

Usage
-----

**Creating Graphs**
1. Navigate to the main page (``http://localhost:3000``)
2. Enter your formula (e.g., ``y=x^2`` for 2D or ``z=x^2+y^2`` for 3D)
3. Select graph type, add title, tags, author, and choose line color
4. Click "Preview" to see the graph, then "Save" to store it

**Browsing Gallery**
1. Click "Gallery" in the navigation bar
2. Browse graphs in card view with mini previews
3. Filter by tags or graph type (2D/3D)
4. Click any graph card to see full-size preview in modal

**Batch Operations**
1. In the gallery, hover over cards to reveal selection checkboxes
2. Select multiple graphs and use "Delete Selected" for bulk deletion
3. Confirm deletion in the custom dialog with detailed feedback

**Supported Formulas**

*2D Graphs:*
- Functions: ``x^2``, ``sin(x)``, ``log(x)``
- Equations: ``y=x^2``, ``x^2+y^2=4``
- Parametric: ``(cos(t), sin(t))``

*3D Graphs:*
- Surfaces: ``z=x^2+y^2``, ``z=sin(x*y)``
- Parametric: ``(cos(u)*cos(v), cos(u)*sin(v), sin(u))``

Download Graphs
~~~~~~~~~~~~~~~

1. Click any graph card in the gallery to open the modal
2. Click the "Download" button to export as PNG

**Download Features:**
- High-quality PNG (1200x850px) with formula rendering
- Professional layout with metadata (title, author, date)
- Smart author display (omits empty author field)
- Special handling for 3D graphs
- Graceful error handling for rendering issues

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

**Test Coverage (231 tests):**
- Server Tests (33): API endpoints, static file serving, error handling, CORS, security
- Data Manager Tests (23): File operations, validation, sanitization, data integrity
- UI Component Tests (12): GraphManager, GalleryManager, form validation, responsive behavior
- Batch Selection UI Tests (16): Checkbox selection, visual feedback, batch deletion
- Batch Delete Tests (8): Server-side batch operations, error handling, performance
- Modal Edit Tests (29): Modal editing functionality, form validation, error handling
- Form Layout Tests (13): Form field order and structure validation
- Modal Tag Bug Tests (13): Tag handling in modal editing
- Type Filter Tests (25): Type filtering functionality and integration
- Formula Rendering Tests (20): KaTeX formula rendering, error handling, styling validation
- Download Feature Tests (35): Graph download functionality, canvas rendering, metadata layout
- Simple Tests (4): Basic functionality validation

**Test Categories:**
- Data management and API endpoints
- Graph validation and UI components
- Batch operations and formula rendering
- Download functionality and error handling
- Performance and cross-browser compatibility

Development
-----------

**Project Structure**

::

    desmos_gallery/
    ├── src/                   # Server-side code
    │   └── server.js          # Express server with API endpoints
    ├── static/                # Client-side files
    │   ├── index.html         # Graph creation page
    │   ├── gallery.html       # Gallery browsing page
    │   ├── css/styles.css     # Modern CSS with glass morphism design
    │   ├── js/
    │   │   ├── graphManager.js    # Graph creation and management
    │   │   └── galleryManager.js  # Gallery display and operations
    │   ├── calculator.js      # Desmos 2D calculator API
    │   ├── calculator3d.js    # Desmos 3D calculator API
    │   └── favicon.svg        # Site favicon
    ├── tests/                 # Test files (231 tests total)
    ├── data/                  # JSON data storage (auto-created)
    └── package.json

**Scripts**

- ``npm start`` - Start development server
- ``npm test`` - Run test suite (231 tests)
- ``npm run test:watch`` - Run tests in watch mode
- ``npm run test:coverage`` - Run tests with coverage report
- ``npm run build:github-pages`` - Build for GitHub Pages (production)
- ``npm run build:prod`` - Build production static site
- ``npm run build:dev`` - Build development static site

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
- Formula rendering with KaTeX in gallery cards
- Mini previews and full-size modal viewing
- Interactive modal editing for all graph properties
- Dynamic tag and type filtering
- Smart author display (omits empty fields)

**Data Management**
- Real-time form validation and color picker
- Automatic timestamps and author attribution
- Comprehensive error handling with user feedback
- Idempotent operations (graceful duplicate handling)

**Technical Features**
- Built-in security headers and CORS-free static loading
- Embedded data for static deployment
- Automatic sample data generation
- Comprehensive test coverage (231 tests)

Technical Details
-----------------

- **Node.js** + **Express.js**: Backend runtime and RESTful API server
- **Desmos API v1.12**: Graphing calculator integration
- **CSS Grid & Flexbox**: Modern responsive layout
- **Glass Morphism**: Modern UI design pattern
- **Debouncing**: Optimized input handling
- **Set-based Selection**: Efficient batch operations
- **JSON Persistence**: Simple and reliable data storage

GitHub Pages Deployment
------------------------

1. Build the static site::

    npm run build:github-pages

2. Deploy the ``_public/`` directory using one of these methods:

   **Method 1: gh-pages branch**
   
   ::

       git subtree push --prefix _public origin gh-pages

   **Method 2: GitHub Actions**
   
   Create ``.github/workflows/deploy.yml`` with deployment workflow

   **Method 3: Manual deployment**
   
   - Copy ``_public/`` contents to repository root
   - Enable GitHub Pages in repository settings

**Environment Builds**

*Production Build* (``npm run build:prod`` or ``npm run build:github-pages``):
- Gallery browsing, filtering, and viewing
- Formula rendering and downloads
- Responsive design and static assets
- Graph creation/editing hidden

*Development Build* (``npm run build:dev``):
- All production features plus
- Graph creation/editing visible
- Full functionality for local testing

**Static Deployment Benefits**
- CORS-free loading (works with file:// protocol)
- Embedded data with offline capability
- Fast loading with sample graphs included
- Professional presentation without server backend

Contributing
-----------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality (100% coverage goal)
5. Run the test suite (all 231 tests must pass)
6. Submit a pull request

**Development Guidelines**
- Follow existing code style and patterns
- Test both development and production builds
- Ensure formula rendering and responsive design work correctly
- Test error handling and edge cases
