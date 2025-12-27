Desmos Gallery
==============

A web application for creating, saving, and browsing mathematical graphs using the Desmos API. Supports both 2D and 3D graphing with tag-based organization.

Features
--------

- **2D & 3D Graph Support**: Create graphs using Desmos 2D and 3D calculators
- **Interactive Preview**: Real-time graph preview as you type formulas
- **Tag System**: Organize graphs with custom tags for easy filtering
- **Gallery View**: Browse all saved graphs in a card-based layout
- **Persistent Storage**: Graphs are saved to JSON file and persist between server restarts
- **Responsive Design**: Works on desktop and mobile devices

Installation
------------

1. Clone the repository::

    git clone <repository-url>
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
2. Browse all saved graphs in card view
3. Click on tags to filter graphs by category
4. Click on any graph card to see a larger preview

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

Tests include:
- Data management functionality
- API endpoint testing
- Graph validation

Development
-----------

Project Structure
~~~~~~~~~~~~~~~~~

::

    desmos_gallery/
    ├── public/                 # Static files
    │   ├── index.html         # Main graph creation page
    │   ├── gallery.html       # Gallery browsing page
    │   └── src/               # Client-side JavaScript
    │       ├── graphManager.js
    │       └── galleryManager.js
    ├── src/
    │   └── server.js          # Express server
    ├── tests/                 # Test files
    ├── data/                  # JSON data storage (created automatically)
    └── package.json

Scripts
~~~~~~~

- ``npm start`` - Start the development server
- ``npm test`` - Run the test suite

Dependencies
------------

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **jest**: Testing framework
- **supertest**: HTTP assertion testing

License
-------

ISC

Contributing
-----------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request