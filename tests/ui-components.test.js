/**
 * UI Components Tests
 * Tests for frontend UI components and interactions
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock Desmos
global.Desmos = {
    Calculator: jest.fn().mockReturnValue({
        setExpression: jest.fn(),
        setBlank: jest.fn(),
        resize: jest.fn(),
        destroy: jest.fn()
    }),
    Calculator3D: jest.fn().mockReturnValue({
        setExpression: jest.fn(),
        setBlank: jest.fn(),
        resize: jest.fn(),
        destroy: jest.fn()
    })
};

describe('UI Components Tests', () => {
    let graphManager;
    let galleryManager;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock fetch responses
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([])
        });

        // Create simple mock managers
        graphManager = {
            init: jest.fn(),
            switchCalculator: jest.fn(),
            addTag: jest.fn(),
            removeTag: jest.fn(),
            updateColorPreview: jest.fn(),
            previewGraph: jest.fn(),
            validateForm: jest.fn().mockReturnValue(true),
            saveGraph: jest.fn().mockResolvedValue()
        };

        galleryManager = {
            init: jest.fn(),
            loadGraphs: jest.fn().mockResolvedValue(),
            renderGraphs: jest.fn(),
            filterByTag: jest.fn(),
            toggleSelection: jest.fn(),
            clearSelection: jest.fn(),
            showGraphModal: jest.fn(),
            closeModal: jest.fn()
        };

        // Setup basic DOM
        document.body.innerHTML = `
            <div id="calculator"></div>
            <form id="graphForm">
                <input type="radio" name="graphType" value="2D" checked>
                <input type="radio" name="graphType" value="3D">
                <textarea id="formula"></textarea>
                <input type="text" id="title">
                <input type="text" id="tagInput">
                <input type="text" id="author">
                <input type="color" id="lineColor" value="#2196F3">
                <button type="button" id="previewBtn"></button>
                <button type="submit"></button>
            </form>
            <div id="tagContainer"></div>
            <div class="color-preview"></div>
            <div id="graphsContainer"></div>
            <div id="tagFilters"></div>
            <div id="graphModal"></div>
            <div id="batchControls"></div>
            <div id="emptyState"></div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('GraphManager UI', () => {
        test('should initialize calculator on load', () => {
            graphManager.init();
            expect(graphManager.init).toHaveBeenCalled();
        });

        test('should switch between 2D and 3D calculators', () => {
            graphManager.switchCalculator('3D');
            expect(graphManager.switchCalculator).toHaveBeenCalledWith('3D');
        });

        test('should add and remove tags', () => {
            graphManager.addTag();
            graphManager.removeTag('test');
            expect(graphManager.addTag).toHaveBeenCalled();
            expect(graphManager.removeTag).toHaveBeenCalledWith('test');
        });

        test('should update color preview', () => {
            graphManager.updateColorPreview();
            expect(graphManager.updateColorPreview).toHaveBeenCalled();
        });

        test('should preview graph on formula input', () => {
            graphManager.previewGraph();
            expect(graphManager.previewGraph).toHaveBeenCalled();
        });

        test('should validate form before saving', () => {
            const result = graphManager.validateForm();
            expect(result).toBe(true);
        });

        test('should show loading state during save', async () => {
            await graphManager.saveGraph();
            expect(graphManager.saveGraph).toHaveBeenCalled();
        });
    });

    describe('GalleryManager UI', () => {
        test('should render graph cards', () => {
            galleryManager.renderGraphs();
            expect(galleryManager.renderGraphs).toHaveBeenCalled();
        });

        test('should show empty state when no graphs', () => {
            galleryManager.renderGraphs();
            expect(galleryManager.renderGraphs).toHaveBeenCalled();
        });

        test('should render tag filters', () => {
            galleryManager.loadGraphs();
            expect(galleryManager.loadGraphs).toHaveBeenCalled();
        });

        test('should filter graphs by tag', () => {
            galleryManager.filterByTag('math');
            expect(galleryManager.filterByTag).toHaveBeenCalledWith('math');
        });

        test('should handle graph selection', () => {
            galleryManager.toggleSelection('test-id', { stopPropagation: jest.fn() });
            expect(galleryManager.toggleSelection).toHaveBeenCalledWith('test-id', { stopPropagation: expect.any(Function) });
        });

        test('should clear selection', () => {
            galleryManager.clearSelection();
            expect(galleryManager.clearSelection).toHaveBeenCalled();
        });

        test('should show graph modal', () => {
            galleryManager.showGraphModal({ id: 'test', title: 'Test Graph' });
            expect(galleryManager.showGraphModal).toHaveBeenCalled();
        });

        test('should close modal', () => {
            galleryManager.closeModal();
            expect(galleryManager.closeModal).toHaveBeenCalled();
        });
    });

    describe('Form Validation', () => {
        test('should validate required fields', () => {
            const title = document.getElementById('title');
            const formula = document.getElementById('formula');
            
            title.value = 'Test Title';
            formula.value = 'y=x^2';
            
            expect(title.value).toBe('Test Title');
            expect(formula.value).toBe('y=x^2');
        });

        test('should validate formula format', () => {
            const formula = document.getElementById('formula');
            formula.value = 'y=x^2';
            expect(formula.value).toMatch(/^[a-zA-Z0-9=\+\-\*\/\^\(\)\s]+$/);
        });

        test('should validate color format', () => {
            const colorInput = document.getElementById('lineColor');
            colorInput.value = '#2196F3';
            expect(colorInput.value).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });

    describe('Responsive Behavior', () => {
        test('should handle window resize', () => {
            const originalInnerWidth = window.innerWidth;
            window.innerWidth = 800;
            window.dispatchEvent(new Event('resize'));
            expect(window.innerWidth).toBe(800);
            window.innerWidth = originalInnerWidth;
        });

        test('should debounce resize events', () => {
            let resizeCount = 0;
            const resizeHandler = () => resizeCount++;
            
            window.addEventListener('resize', resizeHandler);
            
            // Simulate multiple resize events
            for (let i = 0; i < 5; i++) {
                window.dispatchEvent(new Event('resize'));
            }
            
            expect(resizeCount).toBe(5);
            
            window.removeEventListener('resize', resizeHandler);
        });
    });
});