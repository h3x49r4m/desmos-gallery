/**
 * Formula Rendering Tests
 * Tests for the new formula rendering feature in gallery cards
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

// Mock KaTeX
global.katex = {
    renderToString: jest.fn(),
    __parse: jest.fn()
};

describe('Formula Rendering Tests', () => {
    let galleryManager;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock fetch responses
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                {
                    id: 'test-graph-1',
                    title: 'Parabola',
                    author: 'Test Author',
                    formula: 'y = x^2',
                    type: '2D',
                    lineColor: '#2196F3',
                    tags: ['math', 'parabola'],
                    createdAt: '2023-01-01T00:00:00Z'
                },
                {
                    id: 'test-graph-2',
                    title: 'Sine Wave',
                    author: 'Test Author',
                    formula: 'y = \\sin(x)',
                    type: '2D',
                    lineColor: '#FF5722',
                    tags: ['trigonometry', 'wave'],
                    createdAt: '2023-01-02T00:00:00Z'
                }
            ])
        });

        // Mock KaTeX renderToString
        katex.renderToString.mockImplementation((formula, options) => {
            return `<span class="katex">${formula}</span>`;
        });

        // Setup basic DOM
        document.body.innerHTML = `
            <div id="graphsContainer"></div>
            <div id="tagFilters"></div>
            <div id="typeFilters"></div>
            <div id="batchControls"></div>
            <div id="emptyState"></div>
        `;

        // Create gallery manager with formula rendering methods
        galleryManager = {
            graphs: [],
            filteredGraphs: [],
            selectedGraphs: new Set(),
            currentFilter: 'all',
            currentTypeFilter: 'all',
            
            async loadGraphs() {
                try {
                    const response = await fetch('/api/graphs');
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const allGraphs = await response.json();
                    
                    if (!Array.isArray(allGraphs)) {
                        this.graphs = [];
                    } else {
                        this.graphs = allGraphs.filter(graph => {
                            return graph && typeof graph === 'object' && 
                                   graph.title && graph.formula && graph.type && 
                                   ['2D', '3D'].includes(graph.type);
                        });
                    }
                    
                    this.filteredGraphs = [...this.graphs];
                    this.renderGraphs();
                } catch (error) {
                    console.error('Error loading graphs:', error);
                    this.graphs = [];
                    this.filteredGraphs = [];
                }
            },
            
            renderGraphs() {
                const container = document.getElementById('graphsContainer');
                const emptyState = document.getElementById('emptyState');

                if (this.filteredGraphs.length === 0) {
                    container.innerHTML = '';
                    emptyState.style.display = 'block';
                    return;
                }

                emptyState.style.display = 'none';
                container.innerHTML = this.filteredGraphs.map(graph => this.createGraphCard(graph)).join('');
            },
            
            createGraphCard(graph) {
                const tagsHtml = graph.tags.map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join('');

                const createdDate = new Date(graph.createdAt).toLocaleDateString();
                const isSelected = this.selectedGraphs.has(graph.id);

                return `
                    <div class="graph-card ${isSelected ? 'selected' : ''}" data-graph-id="${graph.id}">
                        <div class="selection-checkbox" onclick="galleryManager.toggleSelection('${graph.id}', event)"></div>
                        <div class="graph-preview" id="preview-${graph.id}"></div>
                        <div class="graph-formula" id="formula-${graph.id}">
                            <div class="formula-content">
                                ${this.renderFormula(graph.formula)}
                            </div>
                        </div>
                        <div class="graph-details">
                            <div class="graph-title">${graph.title}</div>
                            <div class="graph-meta">
                                By ${graph.author || 'Anonymous'} • ${graph.type} • ${createdDate}
                            </div>
                            <div class="graph-tags">
                                ${tagsHtml}
                            </div>
                        </div>
                    </div>
                `;
            },
            
            renderFormula(formula) {
                try {
                    // Use KaTeX to render the formula
                    return katex.renderToString(formula, {
                        throwOnError: false,
                        displayMode: true,
                        output: 'html'
                    });
                } catch (error) {
                    console.error('Error rendering formula with KaTeX:', error);
                    // Fallback to plain text if KaTeX fails
                    return `<div class="formula-fallback">${formula}</div>`;
                }
            },
            
            filterByTag(tag) {
                this.currentFilter = tag;
                this.applyFilters();
            },
            
            filterByType(type) {
                this.currentTypeFilter = type;
                this.applyFilters();
            },
            
            applyFilters() {
                let filtered = [...this.graphs];
                
                if (this.currentTypeFilter !== 'all') {
                    filtered = filtered.filter(graph => graph.type === this.currentTypeFilter);
                }
                
                if (this.currentFilter !== 'all') {
                    filtered = filtered.filter(graph => graph.tags.includes(this.currentFilter));
                }

                this.filteredGraphs = filtered;
                this.renderGraphs();
            },
            
            toggleSelection(graphId, event) {
                event.stopPropagation();
                
                if (this.selectedGraphs.has(graphId)) {
                    this.selectedGraphs.delete(graphId);
                } else {
                    this.selectedGraphs.add(graphId);
                }
                
                // Update the DOM
                const card = document.querySelector(`[data-graph-id="${graphId}"]`);
                if (card) {
                    if (this.selectedGraphs.has(graphId)) {
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                }
            }
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('createGraphCard Formula Integration', () => {
        test('should include formula section in graph card', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            const graphCard = document.querySelector('.graph-card');
            expect(graphCard).toBeTruthy();
            
            const formulaSection = graphCard.querySelector('.graph-formula');
            expect(formulaSection).toBeTruthy();
            expect(formulaSection.id).toBe('formula-test-graph-1');
        });

        test('should render formula between chart and title', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            const graphCard = document.querySelector('.graph-card');
            const preview = graphCard.querySelector('.graph-preview');
            const formula = graphCard.querySelector('.graph-formula');
            const details = graphCard.querySelector('.graph-details');
            
            // Check order in DOM
            expect(preview.nextElementSibling).toBe(formula);
            expect(formula.nextElementSibling).toBe(details);
        });

        test('should render multiple formulas correctly', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            const graphCards = document.querySelectorAll('.graph-card');
            expect(graphCards.length).toBe(2);
            
            graphCards.forEach((card, index) => {
                const formulaSection = card.querySelector('.graph-formula');
                expect(formulaSection).toBeTruthy();
                expect(formulaSection.id).toBe(`formula-test-graph-${index + 1}`);
            });
        });
    });

    describe('renderFormula Method', () => {
        test('should render simple mathematical formulas', () => {
            const result = galleryManager.renderFormula('y = x^2');
            
            expect(katex.renderToString).toHaveBeenCalledWith('y = x^2', {
                throwOnError: false,
                displayMode: true,
                output: 'html'
            });
            expect(result).toContain('katex');
        });

        test('should render complex mathematical formulas with LaTeX', () => {
            const complexFormula = '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}';
            galleryManager.renderFormula(complexFormula);
            
            expect(katex.renderToString).toHaveBeenCalledWith(complexFormula, {
                throwOnError: false,
                displayMode: true,
                output: 'html'
            });
        });

        test('should handle KaTeX rendering errors gracefully', () => {
            katex.renderToString.mockImplementationOnce(() => {
                throw new Error('KaTeX parsing error');
            });
            
            const result = galleryManager.renderFormula('invalid formula');
            
            expect(result).toContain('formula-fallback');
            expect(result).toContain('invalid formula');
        });

        test('should use display mode for better formatting', () => {
            galleryManager.renderFormula('y = x^2');
            
            expect(katex.renderToString).toHaveBeenCalledWith('y = x^2', expect.objectContaining({
                displayMode: true
            }));
        });

        test('should not throw errors on invalid input', () => {
            expect(() => {
                galleryManager.renderFormula('');
                galleryManager.renderFormula(null);
                galleryManager.renderFormula(undefined);
            }).not.toThrow();
        });
    });

    describe('Formula Section Styling', () => {
        test('should apply correct CSS classes to formula section', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            const formulaSection = document.querySelector('.graph-formula');
            expect(formulaSection).toBeTruthy();
            expect(formulaSection.classList.contains('graph-formula')).toBe(true);
        });

        test('should wrap formula content in formula-content div', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            const formulaSection = document.querySelector('.graph-formula');
            const formulaContent = formulaSection.querySelector('.formula-content');
            expect(formulaContent).toBeTruthy();
        });

        test('should include KaTeX classes in rendered output', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            const formulaContent = document.querySelector('.formula-content');
            expect(formulaContent.innerHTML).toContain('katex');
        });
    });

    describe('Formula Display in Different Contexts', () => {
        test('should render formulas in filtered gallery view', async () => {
            await galleryManager.loadGraphs();
            
            // Filter by tag
            galleryManager.filterByTag('math');
            galleryManager.renderGraphs();
            
            const graphCards = document.querySelectorAll('.graph-card');
            expect(graphCards.length).toBe(1);
            
            const formulaSection = document.querySelector('.graph-formula');
            expect(formulaSection).toBeTruthy();
        });

        test('should render formulas in type-filtered view', async () => {
            await galleryManager.loadGraphs();
            
            // Filter by type
            galleryManager.filterByType('2D');
            galleryManager.renderGraphs();
            
            const graphCards = document.querySelectorAll('.graph-card');
            expect(graphCards.length).toBe(2);
            
            graphCards.forEach(card => {
                const formulaSection = card.querySelector('.graph-formula');
                expect(formulaSection).toBeTruthy();
            });
        });

        test('should maintain formulas during batch selection', async () => {
            await galleryManager.loadGraphs();
            galleryManager.renderGraphs();
            
            // Select a graph
            const graphCard = document.querySelector('.graph-card');
            const graphId = graphCard.dataset.graphId;
            
            galleryManager.toggleSelection(graphId, { stopPropagation: jest.fn() });
            
            const formulaSection = graphCard.querySelector('.graph-formula');
            expect(formulaSection).toBeTruthy();
            expect(graphCard.classList.contains('selected')).toBe(true);
        });
    });

    describe('Formula Content Validation', () => {
        test('should handle special characters in formulas', () => {
            const specialFormula = 'y = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}';
            const result = galleryManager.renderFormula(specialFormula);
            
            expect(katex.renderToString).toHaveBeenCalledWith(specialFormula, expect.any(Object));
            expect(result).toBeTruthy();
        });

        test('should handle unicode characters in formulas', () => {
            const unicodeFormula = 'θ = arctan(y/x)';
            const result = galleryManager.renderFormula(unicodeFormula);
            
            expect(result).toBeTruthy();
        });

        test('should handle very long formulas', () => {
            const longFormula = 'y = ' + 'x^'.repeat(20) + '2';
            const result = galleryManager.renderFormula(longFormula);
            
            expect(result).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        test('should log errors to console when KaTeX fails', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            katex.renderToString.mockImplementationOnce(() => {
                throw new Error('KaTeX error');
            });
            
            galleryManager.renderFormula('invalid');
            
            expect(consoleSpy).toHaveBeenCalledWith('Error rendering formula with KaTeX:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });

        test('should provide fallback when KaTeX is unavailable', () => {
            // Mock KaTeX as undefined
            const originalKatex = global.katex;
            global.katex = undefined;
            
            expect(() => {
                galleryManager.renderFormula('y = x^2');
            }).not.toThrow();
            
            // Restore KaTeX
            global.katex = originalKatex;
        });
    });
});