Desmos Gallery
==============

A modern web application for creating, saving, and browsing mathematical graphs using the Desmos API. Features both 2D and 3D graphing capabilities with an intuitive interface and comprehensive batch operations.

Features
--------

- **2D & 3D Graph Support**: Create graphs using Desmos 2D and 3D calculators
- **Interactive Preview**: Real-time graph preview as you type formulas
- **Tag System**: Organize graphs with custom tags for easy filtering
- **Type Filtering**: Filter graphs by type (2D or 3D) in the gallery
- **Gallery View**: Browse all saved graphs in a responsive card-based layout
- **Batch Selection & Deletion**: Select multiple graphs and delete them in bulk
- **Modal Editing**: Edit graph details (title, author, tags, formula, line color) in a modal
- **Persistent Storage**: Graphs are saved to JSON file and persist between server restarts
- **Modern UI**: Glass morphism design with smooth animations and micro-interactions
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices
- **Auto-fit Layout**: Graph and form automatically fit the screen height
- **Dense Form Design**: Compact input form with smaller fonts for efficient space usage
- **Animated Background**: Floating gradient patterns for visual appeal
- **Skeleton Loading**: Loading animations for better user experience

Installation
------------

1. Clone the repository::

    git clone git@github.com:h3x49r4m/desmos-gallery.git
    cd desmos_gallery

2. Install dependencies::

    npm install

3. Start the server::

    npm start

4. Open your browser and navigate to::

    http://localhost:3000

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
3. Selected graphs show a blue border and selection count appears
4. Use "Delete Selected" to remove multiple graphs at once
5. Confirm deletion in the dialog box
6. Gallery automatically refreshes after successful deletion

Supported Formulas
~~~~~~~~~~~~~~~~~~

**2D Graphs:**
- Functions: ``x^2``, ``sin(x)``, ``log(x)``
- Equations: ``y=x^2``, ``x^2+y^2=4``
- Parametric: ``(cos(t), sin(t))``

**3D Graphs:**
- Surfaces: ``z=x^2+y^2``, ``z=sin(x*y)``
- Parametric: ``(cos(u)*cos(v), cos(u)*sin(v), sin(u))``

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
- **178 tests** covering all functionality
- **Server Tests** (33 tests): API endpoints, static file serving, error handling, CORS, security
- **Data Manager Tests** (23 tests): File operations, validation, sanitization, data integrity
- **UI Component Tests** (12 tests): GraphManager, GalleryManager, form validation, responsive behavior
- **Batch Selection UI Tests** (16 tests): Checkbox selection, visual feedback, batch deletion
- **Batch Delete Tests** (8 tests): Server-side batch operations, error handling, performance
- **Modal Edit Tests** (29 tests): Modal editing functionality, form validation, error handling
- **Form Layout Tests** (13 tests): Form field order and structure validation
- **Modal Tag Bug Tests** (13 tests): Tag handling in modal editing
- **Type Filter Tests** (25 tests): Type filtering functionality and integration
- **Simple Tests** (4 tests): Basic functionality validation

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
- ``npm test`` - Run the complete test suite (178 tests)
- ``npm run test:watch`` - Run tests in watch mode
- ``npm run test:coverage`` - Run tests with coverage report

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

- **Mini Previews**: Graph cards show miniature Desmos previews
- **Modal View**: Click any graph to see full-size preview
- **Modal Editing**: Edit all graph properties in an interactive modal
- **Tag Filtering**: Dynamic filtering by graph tags
- **Type Filtering**: Filter graphs by 2D or 3D type
- **Empty State**: Helpful message when no graphs exist
- **Form Validation**: Real-time validation of graph inputs
- **Color Picker**: Visual color selection for graph lines
- **Author Attribution**: Track who created each graph
- **Timestamps**: Automatic creation timestamps for all graphs
- **Error Handling**: Comprehensive error handling with user feedback
- **Security Headers**: Built-in security headers for protection
- **Glass Morphism UI**: Modern glass-like design with backdrop blur
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Responsive Grid**: Adaptive card layout for different screen sizes

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

Contributing
-----------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality (aim for 100% test coverage)
5. Run the test suite (all 178 tests must pass)
6. Submit a pull request
