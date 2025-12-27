describe('GalleryManager', () => {
    let galleryManager;
    let mockCalculator;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="graphsContainer"></div>
            <div id="tagFilters"></div>
            <div id="emptyState" style="display: none;"></div>
            <div class="modal" id="graphModal">
                <div class="modal-title" id="modalTitle"></div>
                <div id="modalCalculator"></div>
            </div>
        `;

        // Mock Desmos API
        mockCalculator = {
            setExpression: jest.fn()
        };
        
        global.Desmos = {
            Calculator: jest.fn(() => mockCalculator),
            Calculator3D: jest.fn(() => mockCalculator)
        };

        // Mock Bootstrap Modal
        global.bootstrap = {
            Modal: jest.fn().mockImplementation(() => ({
                show: jest.fn()
            }))
        };

        // Mock fetch
        global.fetch = jest.fn();

        // Load GalleryManager
        delete require.cache[require.resolve('../public/src/galleryManager.js')];
        const GalleryManager = require('../public/src/galleryManager.js').GalleryManager;
        galleryManager = new GalleryManager();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Loading Graphs', () => {
        test('should load graphs from API', async () => {
            const mockGraphs = [
                {
                    id: '1',
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['parabola'],
                    author: 'Test Author',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockGraphs
            });

            await galleryManager.loadGraphs();

            expect(galleryManager.graphs).toEqual(mockGraphs);
            expect(galleryManager.filteredGraphs).toEqual(mockGraphs);
        });

        test('should handle load errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await galleryManager.loadGraphs();

            expect(galleryManager.showError).toHaveBeenCalledWith('Failed to load graphs');
        });
    });

    describe('Tag Management', () => {
        test('should extract and render unique tags', async () => {
            const mockGraphs = [
                {
                    id: '1',
                    title: 'Graph 1',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['parabola', 'quadratic'],
                    author: 'Author 1',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: '2',
                    title: 'Graph 2',
                    formula: 'y=x^3',
                    type: '2D',
                    tags: ['cubic', 'polynomial'],
                    author: 'Author 2',
                    lineColor: '#00FF00',
                    createdAt: '2023-01-02T00:00:00.000Z'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockGraphs
            });

            await galleryManager.loadGraphs();

            const tagFilters = document.getElementById('tagFilters');
            expect(tagFilters.innerHTML).toContain('data-tag="all"');
            expect(tagFilters.innerHTML).toContain('data-tag="parabola"');
            expect(tagFilters.innerHTML).toContain('data-tag="quadratic"');
            expect(tagFilters.innerHTML).toContain('data-tag="cubic"');
            expect(tagFilters.innerHTML).toContain('data-tag="polynomial"');
        });

        test('should filter graphs by tag', async () => {
            const mockGraphs = [
                {
                    id: '1',
                    title: 'Parabola',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['parabola', 'quadratic'],
                    author: 'Author 1',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: '2',
                    title: 'Cubic',
                    formula: 'y=x^3',
                    type: '2D',
                    tags: ['cubic', 'polynomial'],
                    author: 'Author 2',
                    lineColor: '#00FF00',
                    createdAt: '2023-01-02T00:00:00.000Z'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockGraphs
            });

            await galleryManager.loadGraphs();

            // Filter by 'parabola' tag
            galleryManager.filterByTag('parabola');

            expect(galleryManager.filteredGraphs).toHaveLength(1);
            expect(galleryManager.filteredGraphs[0].title).toBe('Parabola');
        });

        test('should show all graphs when "all" tag is selected', async () => {
            const mockGraphs = [
                {
                    id: '1',
                    title: 'Graph 1',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['tag1'],
                    author: 'Author 1',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: '2',
                    title: 'Graph 2',
                    formula: 'y=x^3',
                    type: '2D',
                    tags: ['tag2'],
                    author: 'Author 2',
                    lineColor: '#00FF00',
                    createdAt: '2023-01-02T00:00:00.000Z'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockGraphs
            });

            await galleryManager.loadGraphs();

            // Filter by 'tag1'
            galleryManager.filterByTag('tag1');
            expect(galleryManager.filteredGraphs).toHaveLength(1);

            // Filter by 'all'
            galleryManager.filterByTag('all');
            expect(galleryManager.filteredGraphs).toHaveLength(2);
        });
    });

    describe('Graph Rendering', () => {
        test('should create graph card HTML', () => {
            const graph = {
                id: '1',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['parabola', 'test'],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            const cardHTML = galleryManager.createGraphCard(graph);

            expect(cardHTML).toContain('Test Graph');
            expect(cardHTML).toContain('Test Author');
            expect(cardHTML).toContain('2D');
            expect(cardHTML).toContain('parabola');
            expect(cardHTML).toContain('test');
            expect(cardHTML).toContain('preview-1');
        });

        test('should render mini preview for 2D graph', async () => {
            const graph = {
                id: '1',
                title: '2D Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test'],
                author: 'Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            const element = document.createElement('div');
            element.id = 'preview-1';

            await galleryManager.renderMiniPreview(element, graph);

            expect(Desmos.Calculator).toHaveBeenCalledWith(element, expect.any(Object));
            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'y=x^2',
                color: '#FF0000'
            });
        });

        test('should render mini preview for 3D graph', async () => {
            const graph = {
                id: '1',
                title: '3D Graph',
                formula: 'z=x^2+y^2',
                type: '3D',
                tags: ['test'],
                author: 'Author',
                lineColor: '#00FF00',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            const element = document.createElement('div');
            element.id = 'preview-1';

            await galleryManager.renderMiniPreview(element, graph);

            expect(Desmos.Calculator3D).toHaveBeenCalledWith(element, expect.any(Object));
            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'z=x^2+y^2',
                color: '#00FF00'
            });
        });
    });

    describe('Modal Display', () => {
        test('should show graph modal for 2D graph', () => {
            const graph = {
                id: '1',
                title: 'Modal Test',
                formula: 'y=sin(x)',
                type: '2D',
                tags: ['test'],
                author: 'Author',
                lineColor: '#0000FF',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            galleryManager.showGraphModal(graph);

            expect(document.getElementById('modalTitle').textContent).toBe('Modal Test');
            expect(Desmos.Calculator).toHaveBeenCalled();
            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'y=sin(x)',
                color: '#0000FF'
            });
            expect(bootstrap.Modal).toHaveBeenCalled();
        });

        test('should show graph modal for 3D graph', () => {
            const graph = {
                id: '1',
                title: '3D Modal Test',
                formula: 'z=x^2+y^2',
                type: '3D',
                tags: ['test'],
                author: 'Author',
                lineColor: '#FF00FF',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            galleryManager.showGraphModal(graph);

            expect(document.getElementById('modalTitle').textContent).toBe('3D Modal Test');
            expect(Desmos.Calculator3D).toHaveBeenCalled();
            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'z=x^2+y^2',
                color: '#FF00FF'
            });
        });

        test('should handle modal errors', () => {
            galleryManager.showError = jest.fn();

            // Mock Desmos to throw error
            Desmos.Calculator.mockImplementation(() => {
                throw new Error('Calculator error');
            });

            const graph = {
                id: '1',
                title: 'Error Test',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test'],
                author: 'Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            galleryManager.showGraphModal(graph);

            expect(galleryManager.showError).toHaveBeenCalledWith('Failed to load graph preview');
        });
    });

    describe('Empty State', () => {
        test('should show empty state when no graphs', () => {
            galleryManager.filteredGraphs = [];
            galleryManager.renderGraphs();

            const container = document.getElementById('graphsContainer');
            const emptyState = document.getElementById('emptyState');

            expect(container.innerHTML).toBe('');
            expect(emptyState.style.display).toBe('block');
        });

        test('should hide empty state when graphs exist', () => {
            galleryManager.filteredGraphs = [
                {
                    id: '1',
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Author',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];
            galleryManager.renderGraphs();

            const container = document.getElementById('graphsContainer');
            const emptyState = document.getElementById('emptyState');

            expect(container.innerHTML).toContain('Test Graph');
            expect(emptyState.style.display).toBe('none');
        });
    });

    describe('Error Handling', () => {
        test('should show error message', () => {
            galleryManager.showError('Test error message');

            const container = document.getElementById('graphsContainer');
            expect(container.innerHTML).toContain('Test error message');
            expect(container.innerHTML).toContain('alert alert-danger');
        });
    });
});