/**
 * Batch Selection UI Tests
 * Tests for the gallery batch selection UI functionality
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('Batch Selection UI Tests', () => {
    let galleryManager;
    let mockGraphs;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock fetch responses
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                {
                    id: 'test-1',
                    title: 'Test Graph 1',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: 'test-2',
                    title: 'Test Graph 2',
                    formula: 'y=sin(x)',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#2196F3',
                    createdAt: '2023-01-01T00:00:01.000Z'
                },
                {
                    id: 'test-3',
                    title: 'Test Graph 3',
                    formula: 'y=x^3',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#4CAF50',
                    createdAt: '2023-01-01T00:00:02.000Z'
                }
            ])
        });

        // Setup DOM
        document.body.innerHTML = `
            <div id="graphsContainer"></div>
            <div id="tagFilters"></div>
            <div id="batchControls" style="display: none;">
                <span id="selectedCount">0</span>
                <button id="deleteSelectedBtn">Delete Selected</button>
                <button id="clearSelectionBtn">Clear Selection</button>
            </div>
            <div id="emptyState" style="display: none;"></div>
            <div id="graphModal"></div>
        `;

        // Create gallery manager with batch selection methods
        galleryManager = {
            graphs: [],
            filteredGraphs: [],
            selectedGraphs: new Set(),
            currentFilter: 'all',
            
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
                    this.updateBatchControls();
                    return;
                }

                emptyState.style.display = 'none';
                container.innerHTML = this.filteredGraphs.map(graph => this.createGraphCard(graph)).join('');
                
                this.updateBatchControls();
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
            
            toggleSelection(graphId, event) {
                event.stopPropagation();
                
                if (this.selectedGraphs.has(graphId)) {
                    this.selectedGraphs.delete(graphId);
                } else {
                    this.selectedGraphs.add(graphId);
                }
                
                this.updateGraphCardSelection(graphId);
                this.updateBatchControls();
            },
            
            updateGraphCardSelection(graphId) {
                const card = document.querySelector(`[data-graph-id="${graphId}"]`);
                if (card) {
                    if (this.selectedGraphs.has(graphId)) {
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                }
            },
            
            updateBatchControls() {
                const batchControls = document.getElementById('batchControls');
                const selectedCount = document.getElementById('selectedCount');
                
                if (this.selectedGraphs.size > 0) {
                    batchControls.style.display = 'flex';
                    selectedCount.textContent = this.selectedGraphs.size;
                } else {
                    batchControls.style.display = 'none';
                }
            },
            
            clearSelection() {
                this.selectedGraphs.clear();
                document.querySelectorAll('.graph-card.selected').forEach(card => {
                    card.classList.remove('selected');
                });
                this.updateBatchControls();
            },
            
            async deleteSelected() {
                if (this.selectedGraphs.size === 0) return;
                
                // Mock confirmation dialog
                const confirmed = true;
                if (!confirmed) return;
                
                const deletePromises = Array.from(this.selectedGraphs).map(graphId => 
                    fetch(`/api/graphs/${graphId}`, { method: 'DELETE' })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to delete graph ${graphId}: ${response.status}`);
                            }
                            return response.json();
                        })
                );
                
                try {
                    const results = await Promise.all(deletePromises);
                    this.clearSelection();
                    await this.loadGraphs();
                    return results;
                } catch (error) {
                    console.error('Error deleting graphs:', error);
                    throw error;
                }
            }
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Batch Selection UI', () => {
        test('should load graphs and render cards', async () => {
            await galleryManager.loadGraphs();
            
            expect(galleryManager.graphs).toHaveLength(3);
            expect(galleryManager.filteredGraphs).toHaveLength(3);
            
            const cards = document.querySelectorAll('.graph-card');
            expect(cards).toHaveLength(3);
        });

        test('should show selection checkboxes on cards', async () => {
            await galleryManager.loadGraphs();
            
            const checkboxes = document.querySelectorAll('.selection-checkbox');
            expect(checkboxes).toHaveLength(3);
        });

        test('should toggle graph selection when checkbox is clicked', async () => {
            await galleryManager.loadGraphs();
            
            const firstCheckbox = document.querySelector('.selection-checkbox');
            const clickEvent = { stopPropagation: jest.fn() };
            
            // Select first graph
            galleryManager.toggleSelection('test-1', clickEvent);
            
            expect(galleryManager.selectedGraphs.has('test-1')).toBe(true);
            expect(clickEvent.stopPropagation).toHaveBeenCalled();
            
            const firstCard = document.querySelector('[data-graph-id="test-1"]');
            expect(firstCard.classList.contains('selected')).toBe(true);
        });

        test('should deselect graph when clicked again', async () => {
            await galleryManager.loadGraphs();
            
            const clickEvent = { stopPropagation: jest.fn() };
            
            // Select then deselect
            galleryManager.toggleSelection('test-1', clickEvent);
            galleryManager.toggleSelection('test-1', clickEvent);
            
            expect(galleryManager.selectedGraphs.has('test-1')).toBe(false);
            
            const firstCard = document.querySelector('[data-graph-id="test-1"]');
            expect(firstCard.classList.contains('selected')).toBe(false);
        });

        test('should show batch controls when graphs are selected', async () => {
            await galleryManager.loadGraphs();
            
            const batchControls = document.getElementById('batchControls');
            expect(batchControls.style.display).toBe('none');
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            
            expect(batchControls.style.display).toBe('flex');
            
            const selectedCount = document.getElementById('selectedCount');
            expect(selectedCount.textContent).toBe('1');
        });

        test('should update selected count when multiple graphs selected', async () => {
            await galleryManager.loadGraphs();
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            galleryManager.toggleSelection('test-2', { stopPropagation: jest.fn() });
            
            const selectedCount = document.getElementById('selectedCount');
            expect(selectedCount.textContent).toBe('2');
        });

        test('should hide batch controls when selection is cleared', async () => {
            await galleryManager.loadGraphs();
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            galleryManager.clearSelection();
            
            const batchControls = document.getElementById('batchControls');
            expect(batchControls.style.display).toBe('none');
            expect(galleryManager.selectedGraphs.size).toBe(0);
        });

        test('should clear all selected graphs', async () => {
            await galleryManager.loadGraphs();
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            galleryManager.toggleSelection('test-2', { stopPropagation: jest.fn() });
            galleryManager.toggleSelection('test-3', { stopPropagation: jest.fn() });
            
            expect(galleryManager.selectedGraphs.size).toBe(3);
            
            galleryManager.clearSelection();
            
            expect(galleryManager.selectedGraphs.size).toBe(0);
            
            const selectedCards = document.querySelectorAll('.graph-card.selected');
            expect(selectedCards).toHaveLength(0);
        });
    });

    describe('Batch Deletion UI', () => {
        test('should delete selected graphs', async () => {
            await galleryManager.loadGraphs();
            
            // Select two graphs
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            galleryManager.toggleSelection('test-2', { stopPropagation: jest.fn() });
            
            // Mock successful deletion
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 'test-1' })
            });
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 'test-2' })
            });
            
            // Mock reload after deletion
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 'test-3',
                        title: 'Test Graph 3',
                        formula: 'y=x^3',
                        type: '2D',
                        tags: ['test'],
                        author: 'Test Author',
                        lineColor: '#4CAF50',
                        createdAt: '2023-01-01T00:00:02.000Z'
                    }
                ])
            });
            
            const results = await galleryManager.deleteSelected();
            
            expect(results).toHaveLength(2);
            expect(galleryManager.selectedGraphs.size).toBe(0);
        });

        test('should not delete when no graphs selected', async () => {
            await galleryManager.loadGraphs();
            
            const results = await galleryManager.deleteSelected();
            
            expect(results).toBeUndefined();
            expect(fetch).not.toHaveBeenCalledWith(
                expect.stringContaining('/api/graphs/'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        test('should handle deletion errors gracefully', async () => {
            await galleryManager.loadGraphs();
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            
            // Mock deletion error
            fetch.mockRejectedValueOnce(new Error('Network error'));
            
            await expect(galleryManager.deleteSelected()).rejects.toThrow('Network error');
        });

        test('should reload graphs after successful deletion', async () => {
            await galleryManager.loadGraphs();
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            
            // Mock successful deletion
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 'test-1' })
            });
            
            // Mock reload
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 'test-2',
                        title: 'Test Graph 2',
                        formula: 'y=sin(x)',
                        type: '2D',
                        tags: ['test'],
                        author: 'Test Author',
                        lineColor: '#2196F3',
                        createdAt: '2023-01-01T00:00:01.000Z'
                    },
                    {
                        id: 'test-3',
                        title: 'Test Graph 3',
                        formula: 'y=x^3',
                        type: '2D',
                        tags: ['test'],
                        author: 'Test Author',
                        lineColor: '#4CAF50',
                        createdAt: '2023-01-01T00:00:02.000Z'
                    }
                ])
            });
            
            await galleryManager.deleteSelected();
            
            // Verify fetch was called for reload
            expect(fetch).toHaveBeenCalledWith('/api/graphs');
            expect(galleryManager.graphs).toHaveLength(2);
        });
    });

    describe('Visual Feedback', () => {
        test('should add selected class to selected cards', async () => {
            await galleryManager.loadGraphs();
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            
            const selectedCard = document.querySelector('[data-graph-id="test-1"]');
            expect(selectedCard.classList.contains('selected')).toBe(true);
            
            const unselectedCard = document.querySelector('[data-graph-id="test-2"]');
            expect(unselectedCard.classList.contains('selected')).toBe(false);
        });

        test('should show correct count in batch controls', async () => {
            await galleryManager.loadGraphs();
            
            const selectedCount = document.getElementById('selectedCount');
            
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            expect(selectedCount.textContent).toBe('1');
            
            galleryManager.toggleSelection('test-2', { stopPropagation: jest.fn() });
            expect(selectedCount.textContent).toBe('2');
            
            galleryManager.toggleSelection('test-3', { stopPropagation: jest.fn() });
            expect(selectedCount.textContent).toBe('3');
        });

        test('should show empty state when all graphs deleted', async () => {
            await galleryManager.loadGraphs();
            
            // Select all graphs
            galleryManager.toggleSelection('test-1', { stopPropagation: jest.fn() });
            galleryManager.toggleSelection('test-2', { stopPropagation: jest.fn() });
            galleryManager.toggleSelection('test-3', { stopPropagation: jest.fn() });
            
            // Mock successful deletion of all graphs
            fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
            
            // Mock empty response after deletion
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            });
            
            await galleryManager.deleteSelected();
            
            const emptyState = document.getElementById('emptyState');
            expect(emptyState.style.display).toBe('block');
            
            const graphsContainer = document.getElementById('graphsContainer');
            expect(graphsContainer.innerHTML).toBe('');
        });
    });
});