describe('GraphManager', () => {
    let graphManager;
    let mockCalculator;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="calculator"></div>
            <form id="graphForm">
                <input type="text" id="formula" />
                <input type="radio" name="graphType" value="2D" checked />
                <input type="radio" name="graphType" value="3D" />
                <input type="text" id="title" />
                <input type="text" id="tagInput" />
                <div id="tagContainer"></div>
                <input type="text" id="author" />
                <input type="color" id="lineColor" value="#2196F3" />
                <button type="button" id="previewBtn">Preview</button>
            </form>
        `;

        // Mock Desmos API
        mockCalculator = {
            setExpression: jest.fn(),
            setBlank: jest.fn()
        };
        
        global.Desmos = {
            Calculator: jest.fn(() => mockCalculator),
            Calculator3D: jest.fn(() => mockCalculator)
        };

        // Mock fetch
        global.fetch = jest.fn();

        // Load GraphManager
        delete require.cache[require.resolve('../public/src/graphManager.js')];
        const GraphManager = require('../public/src/graphManager.js').GraphManager;
        graphManager = new GraphManager();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize with 2D calculator by default', () => {
            expect(Desmos.Calculator).toHaveBeenCalled();
            expect(Desmos.Calculator3D).not.toHaveBeenCalled();
        });

        test('should set up event listeners', () => {
            const formulaInput = document.getElementById('formula');
            const previewBtn = document.getElementById('previewBtn');
            
            expect(formulaInput.oninput).toBeDefined();
            expect(previewBtn.onclick).toBeDefined();
        });
    });

    describe('Graph Type Switching', () => {
        test('should switch to 3D calculator when 3D is selected', () => {
            const radio3D = document.querySelector('input[value="3D"]');
            radio3D.checked = true;
            radio3D.dispatchEvent(new Event('change'));

            expect(Desmos.Calculator3D).toHaveBeenCalled();
        });

        test('should switch back to 2D calculator when 2D is selected', () => {
            const radio3D = document.querySelector('input[value="3D"]');
            const radio2D = document.querySelector('input[value="2D"]');
            
            // Switch to 3D first
            radio3D.checked = true;
            radio3D.dispatchEvent(new Event('change'));
            
            // Clear mocks
            Desmos.Calculator.mockClear();
            Desmos.Calculator3D.mockClear();
            
            // Switch back to 2D
            radio2D.checked = true;
            radio2D.dispatchEvent(new Event('change'));

            expect(Desmos.Calculator).toHaveBeenCalled();
            expect(Desmos.Calculator3D).not.toHaveBeenCalled();
        });
    });

    describe('Tag Management', () => {
        test('should add tag when Enter is pressed', () => {
            const tagInput = document.getElementById('tagInput');
            tagInput.value = 'test-tag';
            tagInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

            expect(tagInput.value).toBe('');
            expect(graphManager.tags).toContain('test-tag');
        });

        test('should not add empty tag', () => {
            const tagInput = document.getElementById('tagInput');
            tagInput.value = '';
            tagInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

            expect(graphManager.tags).toHaveLength(0);
        });

        test('should not add duplicate tags', () => {
            const tagInput = document.getElementById('tagInput');
            tagInput.value = 'duplicate';
            tagInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));
            tagInput.value = 'duplicate';
            tagInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

            expect(graphManager.tags.filter(tag => tag === 'duplicate')).toHaveLength(1);
        });

        test('should remove tag when remove button is clicked', () => {
            // Add a tag first
            graphManager.tags = ['tag1', 'tag2', 'tag3'];
            graphManager.renderTags();

            // Click remove button for second tag
            const removeButtons = document.querySelectorAll('.tag .remove');
            removeButtons[1].click();

            expect(graphManager.tags).toEqual(['tag1', 'tag3']);
        });
    });

    describe('Graph Preview', () => {
        test('should preview 2D function correctly', () => {
            const formulaInput = document.getElementById('formula');
            formulaInput.value = 'x^2';
            
            graphManager.previewGraph();

            expect(mockCalculator.setBlank).toHaveBeenCalled();
            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'y=x^2',
                color: '#2196F3'
            });
        });

        test('should preview 2D equation correctly', () => {
            const formulaInput = document.getElementById('formula');
            formulaInput.value = 'x^2 + y^2 = 4';
            
            graphManager.previewGraph();

            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'x^2 + y^2 = 4',
                color: '#2196F3'
            });
        });

        test('should preview 3D function correctly', () => {
            // Switch to 3D mode
            graphManager.currentType = '3D';
            
            const formulaInput = document.getElementById('formula');
            formulaInput.value = 'x^2 + y^2';
            
            graphManager.previewGraph();

            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'z=x^2 + y^2',
                color: '#2196F3'
            });
        });

        test('should preview 3D equation correctly', () => {
            // Switch to 3D mode
            graphManager.currentType = '3D';
            
            const formulaInput = document.getElementById('formula');
            formulaInput.value = 'x^2 + y^2 + z^2 = 1';
            
            graphManager.previewGraph();

            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'x^2 + y^2 + z^2 = 1',
                color: '#2196F3'
            });
        });

        test('should not preview empty formula', () => {
            const formulaInput = document.getElementById('formula');
            formulaInput.value = '';
            
            graphManager.previewGraph();

            expect(mockCalculator.setExpression).not.toHaveBeenCalled();
        });

        test('should use custom line color', () => {
            const lineColorInput = document.getElementById('lineColor');
            lineColorInput.value = '#FF0000';
            
            const formulaInput = document.getElementById('formula');
            formulaInput.value = 'x^2';
            
            graphManager.previewGraph();

            expect(mockCalculator.setExpression).toHaveBeenCalledWith({
                latex: 'y=x^2',
                color: '#FF0000'
            });
        });
    });

    describe('Graph Saving', () => {
        test('should save graph with all required data', async () => {
            // Mock successful fetch response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: '123', title: 'Test Graph' })
            });

            // Fill form
            document.getElementById('title').value = 'Test Graph';
            document.getElementById('formula').value = 'y=x^2';
            document.getElementById('author').value = 'Test Author';
            graphManager.tags = ['test-tag'];

            // Mock alert
            global.alert = jest.fn();

            // Submit form
            const form = document.getElementById('graphForm');
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(fetch).toHaveBeenCalledWith('/api/graphs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: expect.stringContaining('Test Graph')
            });

            expect(global.alert).toHaveBeenCalledWith('Graph saved successfully!');
        });

        test('should validate required fields', async () => {
            global.alert = jest.fn();

            // Submit form without title and formula
            const form = document.getElementById('graphForm');
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);

            expect(global.alert).toHaveBeenCalledWith('Please fill in both title and formula fields');
            expect(fetch).not.toHaveBeenCalled();
        });

        test('should handle save errors', async () => {
            // Mock failed fetch response
            fetch.mockResolvedValueOnce({
                ok: false
            });

            global.alert = jest.fn();

            // Fill form
            document.getElementById('title').value = 'Test Graph';
            document.getElementById('formula').value = 'y=x^2';

            // Submit form
            const form = document.getElementById('graphForm');
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(global.alert).toHaveBeenCalledWith('Error saving graph. Please try again.');
        });
    });

    describe('Form Reset', () => {
        test('should reset form and calculator', () => {
            // Set some values
            document.getElementById('title').value = 'Test Title';
            document.getElementById('formula').value = 'y=x^2';
            document.getElementById('author').value = 'Test Author';
            graphManager.tags = ['tag1', 'tag2'];

            graphManager.resetForm();

            expect(document.getElementById('title').value).toBe('');
            expect(document.getElementById('formula').value).toBe('');
            expect(document.getElementById('author').value).toBe('');
            expect(graphManager.tags).toHaveLength(0);
            expect(mockCalculator.setBlank).toHaveBeenCalled();
        });
    });
});