class GalleryManager {
    constructor() {
        this.graphs = [];
        this.filteredGraphs = [];
        this.currentFilter = 'all';
        this.currentTypeFilter = 'all';
        this.modalCalculator = null;
        this.selectedGraphs = new Set();
        this.currentEditingGraph = null;
        this.modalTags = new Set();
        this.init();
    }

    init() {
        this.loadGraphs();
        this.initEventListeners();
    }

    async loadGraphs() {
        try {
            const response = await fetch('/api/graphs');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const allGraphs = await response.json();
            
            // Ensure we have an array
            if (!Array.isArray(allGraphs)) {
                console.warn('API returned non-array data:', allGraphs);
                this.graphs = [];
            } else {
                // Filter out invalid graphs
                this.graphs = allGraphs.filter(graph => {
                    return graph && typeof graph === 'object' && 
                           graph.title && graph.formula && graph.type && 
                           ['2D', '3D'].includes(graph.type);
                });
            }
            
            this.filteredGraphs = [...this.graphs];
            this.extractAndRenderTags();
            this.renderGraphs();
        } catch (error) {
            console.error('Error loading graphs:', error);
            this.graphs = [];
            this.filteredGraphs = [];
            this.showError('Failed to load graphs');
        }
    }

    extractAndRenderTags() {
        const allTags = new Set();
        this.graphs.forEach(graph => {
            graph.tags.forEach(tag => allTags.add(tag));
        });

        const tagFilters = document.getElementById('tagFilters');
        tagFilters.innerHTML = '<span class="tag active" data-tag="all">All</span>';
        
        Array.from(allTags).sort().forEach(tag => {
            tagFilters.innerHTML += `<span class="tag" data-tag="${tag}">${tag}</span>`;
        });

        // Add click event to tag filters
        tagFilters.querySelectorAll('.tag').forEach(tagElement => {
            tagElement.addEventListener('click', () => {
                this.filterByTag(tagElement.dataset.tag);
            });
        });

        // Add click event to type filters
        const typeFilters = document.getElementById('typeFilters');
        if (typeFilters) {
            typeFilters.querySelectorAll('.filter-tag').forEach(typeElement => {
                typeElement.addEventListener('click', () => {
                    this.filterByType(typeElement.dataset.type);
                });
            });
        }
    }

    filterByTag(tag) {
        this.currentFilter = tag;
        this.applyFilters();
    }

    filterByType(type) {
        this.currentTypeFilter = type;
        this.applyFilters();
    }

    applyFilters() {
        // Update active state for tags
        document.querySelectorAll('.tag').forEach(tagElement => {
            tagElement.classList.remove('active');
            if (tagElement.dataset.tag === this.currentFilter) {
                tagElement.classList.add('active');
            }
        });

        // Update active state for types
        document.querySelectorAll('.filter-tag').forEach(typeElement => {
            typeElement.classList.remove('active');
            if (typeElement.dataset.type === this.currentTypeFilter) {
                typeElement.classList.add('active');
            }
        });

        // Apply both filters
        let filtered = [...this.graphs];
        
        // Filter by type
        if (this.currentTypeFilter !== 'all') {
            filtered = filtered.filter(graph => graph.type === this.currentTypeFilter);
        }
        
        // Filter by tag
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(graph => graph.tags.includes(this.currentFilter));
        }

        this.filteredGraphs = filtered;
        this.renderGraphs();
    }

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

        // Add click events to graph cards (but not on checkbox)
        container.querySelectorAll('.graph-card').forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('selection-checkbox')) {
                    this.showGraphModal(this.filteredGraphs[index]);
                }
            });
        });

        this.updateBatchControls();
        
        // Trigger mini preview rendering after a short delay
        setTimeout(() => {
            this.renderMiniPreviews();
        }, 100);
    }

    async renderMiniPreviews() {
        for (const graph of this.filteredGraphs) {
            const previewElement = document.getElementById(`preview-${graph.id}`);
            if (previewElement) {
                await this.renderMiniPreview(previewElement, graph);
            }
        }
    }

    toggleSelection(graphId, event) {
        event.stopPropagation();
        
        if (this.selectedGraphs.has(graphId)) {
            this.selectedGraphs.delete(graphId);
        } else {
            this.selectedGraphs.add(graphId);
        }
        
        this.updateGraphCardSelection(graphId);
        this.updateBatchControls();
    }

    updateGraphCardSelection(graphId) {
        const card = document.querySelector(`[data-graph-id="${graphId}"]`);
        if (card) {
            if (this.selectedGraphs.has(graphId)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    }

    updateBatchControls() {
        const batchControls = document.getElementById('batchControls');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedGraphs.size > 0) {
            batchControls.style.display = 'flex';
            selectedCount.textContent = this.selectedGraphs.size;
        } else {
            batchControls.style.display = 'none';
        }
    }

    clearSelection() {
        this.selectedGraphs.clear();
        document.querySelectorAll('.graph-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateBatchControls();
    }

    async deleteSelected() {
        if (this.selectedGraphs.size === 0) return;
        
        const confirmed = confirm(`Are you sure you want to delete ${this.selectedGraphs.size} graph(s)?`);
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
            console.log(`Successfully deleted ${results.length} graphs`);
            this.clearSelection();
            await this.loadGraphs();
        } catch (error) {
            console.error('Error deleting graphs:', error);
            alert(`Error deleting graphs: ${error.message}`);
        }
    }

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
    }

    async renderMiniPreviews() {
        for (const graph of this.filteredGraphs) {
            const previewElement = document.getElementById(`preview-${graph.id}`);
            if (previewElement) {
                await this.renderMiniPreview(previewElement, graph);
            }
        }
    }

    async renderMiniPreview(element, graph) {
        try {
            let calculator;
            if (graph.type === '2D') {
                calculator = Desmos.Calculator(element, {
                    keypad: false,
                    expressions: false,
                    settingsMenu: false,
                    zoomButtons: false,
                    expressionsTopbar: false,
                    border: false
                });
            } else {
                calculator = Desmos.Calculator3D(element, {
                    expressions: false,
                    settingsMenu: false,
                    zoomButtons: false,
                    expressionsTopbar: false,
                    border: false
                });
            }

            // Add the formula using setExpression
            calculator.setExpression({ 
                latex: graph.formula,
                color: graph.lineColor
            });

            // Small delay to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error('Error rendering mini preview:', error);
        }
    }

    showGraphModal(graph) {
        this.currentEditingGraph = graph;
        
        // Populate editable fields
        document.getElementById('modalTitleInput').value = graph.title || '';
        document.getElementById('modalAuthorInput').value = graph.author || '';
        document.getElementById('modalFormulaInput').value = graph.formula || '';
        document.getElementById('modalLineColorInput').value = graph.lineColor || '#2196F3';
        document.getElementById('modalColorPreview').textContent = graph.lineColor || '#2196F3';
        
        // Clear and populate tags
        const tagContainer = document.getElementById('modalTagContainer');
        tagContainer.innerHTML = '';
        this.modalTags.clear(); // Clear any existing tags
        if (graph.tags && Array.isArray(graph.tags)) {
            graph.tags.forEach(tag => {
                this.modalTags.add(tag);
                this.addModalTag(tag);
            });
        }
        
        
        const modalCalculatorElement = document.getElementById('modalCalculator');
        modalCalculatorElement.innerHTML = '';

        try {
            if (graph.type === '2D') {
                this.modalCalculator = Desmos.Calculator(modalCalculatorElement, {
                    keypad: false,
                    expressions: false,
                    settingsMenu: false,
                    zoomButtons: false,
                    expressionsTopbar: false,
                    border: false
                });
            } else {
                this.modalCalculator = Desmos.Calculator3D(modalCalculatorElement, {
                    expressions: false,
                    settingsMenu: false,
                    zoomButtons: false,
                    expressionsTopbar: false,
                    border: false
                });
            }

            this.modalCalculator.setExpression({ 
                latex: graph.formula,
                color: graph.lineColor
            });

            const modal = document.getElementById('graphModal');
            modal.classList.add('show');
        } catch (error) {
            console.error('Error showing graph modal:', error);
            this.showError('Failed to load graph preview');
        }
    }

    showError(message) {
        const container = document.getElementById('graphsContainer');
        container.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    initEventListeners() {
        // Modal close button
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        document.getElementById('graphModal').addEventListener('click', (e) => {
            if (e.target.id === 'graphModal') {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Modal edit controls
        document.getElementById('modalCancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalUpdateBtn').addEventListener('click', () => {
            this.updateGraph();
        });

        document.getElementById('modalDeleteBtn').addEventListener('click', () => {
            this.deleteGraph();
        });

        document.getElementById('modalDownloadBtn').addEventListener('click', () => {
            this.downloadGraph();
        });

        // Modal color picker
        document.getElementById('modalLineColorInput').addEventListener('input', (e) => {
            document.getElementById('modalColorPreview').textContent = e.target.value;
            if (this.modalCalculator && this.currentEditingGraph) {
                this.modalCalculator.setExpression({ 
                    latex: this.currentEditingGraph.formula,
                    color: e.target.value
                });
            }
        });

        // Modal formula input
        document.getElementById('modalFormulaInput').addEventListener('input', (e) => {
            if (this.modalCalculator) {
                this.modalCalculator.setExpression({ 
                    latex: e.target.value,
                    color: document.getElementById('modalLineColorInput').value
                });
            }
        });

        // Modal tag input
        document.getElementById('modalTagInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tagInput = e.target;
                const tag = tagInput.value.trim();
                if (tag && !this.modalTags.has(tag)) {
                    this.modalTags.add(tag);
                    
                    this.addModalTag(tag);
                    tagInput.value = '';
                }
            }
        });

        // Batch controls
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
            this.deleteSelected();
        });

        document.getElementById('clearSelectionBtn').addEventListener('click', () => {
            this.clearSelection();
        });
    }

    closeModal() {
        const modal = document.getElementById('graphModal');
        modal.classList.remove('show');
        this.modalCalculator = null;
        this.currentEditingGraph = null;
        this.modalTags.clear();
    }

    addModalTag(tag) {
        const tagContainer = document.getElementById('modalTagContainer');
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'tag-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            this.modalTags.delete(tag);
            tagElement.remove();
        };
        
        tagElement.appendChild(removeBtn);
        tagContainer.appendChild(tagElement);
    }

    async updateGraph() {
        if (!this.currentEditingGraph) return;
        
        // Ensure tags are properly collected from the modal
        const tagsArray = Array.from(this.modalTags);
        
        
        const updatedData = {
            title: document.getElementById('modalTitleInput').value,
            author: document.getElementById('modalAuthorInput').value,
            formula: document.getElementById('modalFormulaInput').value,
            lineColor: document.getElementById('modalLineColorInput').value,
            tags: tagsArray
        };

        

        try {
            const response = await fetch(`/api/graphs/${this.currentEditingGraph.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const updatedGraph = await response.json();
                
                
                // Update the graph in the local array
                const index = this.graphs.findIndex(g => g.id === updatedGraph.id);
                if (index !== -1) {
                    this.graphs[index] = updatedGraph;
                }
                
                // Re-render the gallery
                this.applyFilters();
                this.closeModal();
            } else {
                
                alert('Failed to update graph');
            }
        } catch (error) {
            console.error('Error updating graph:', error);
            alert('Error updating graph. Please try again.');
        }
    }

    async deleteGraph() {
        if (!this.currentEditingGraph) return;
        
        const confirmed = confirm(`Are you sure you want to delete "${this.currentEditingGraph.title}"?`);
        if (!confirmed) return;
        
        try {
            const response = await fetch(`/api/graphs/${this.currentEditingGraph.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove the graph from the local array
                const index = this.graphs.findIndex(g => g.id === this.currentEditingGraph.id);
                if (index !== -1) {
                    this.graphs.splice(index, 1);
                }
                
                // Re-render the gallery
                this.applyFilters();
                this.closeModal();
            } else {
                alert('Failed to delete graph');
            }
        } catch (error) {
            console.error('Error deleting graph:', error);
            alert('Error deleting graph. Please try again.');
        }
    }

    async downloadGraph() {
        if (!this.currentEditingGraph || !this.modalCalculator) {
            console.error('No graph to download');
            return;
        }

        try {
            // Get the calculator element
            const calculatorElement = document.getElementById('modalCalculator');
            if (!calculatorElement) {
                console.error('Calculator element not found');
                return;
            }

            // Create a canvas for the download
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size (larger for better quality)
            canvas.width = 1200;
            canvas.height = 800;
            
            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add title
            ctx.fillStyle = '#212121';
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentEditingGraph.title, canvas.width / 2, 50);
            
            // Add author and date
            ctx.font = '18px Inter, sans-serif';
            ctx.fillStyle = '#757575';
            const date = new Date(this.currentEditingGraph.createdAt).toLocaleDateString();
            ctx.fillText(`By ${this.currentEditingGraph.author} • ${date}`, canvas.width / 2, 85);
            
            // Add formula
            ctx.font = '24px Inter, sans-serif';
            ctx.fillStyle = '#212121';
            ctx.fillText(this.currentEditingGraph.formula, canvas.width / 2, 120);
            
            // Capture the calculator as an image
            const calculatorImage = await this.captureCalculator(calculatorElement);
            
            // Draw the calculator image
            if (calculatorImage) {
                const imgWidth = 800;
                const imgHeight = 500;
                const x = (canvas.width - imgWidth) / 2;
                const y = 150;
                
                // Add shadow for the calculator
                ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 5;
                
                // Draw white background for calculator
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 10, y - 10, imgWidth + 20, imgHeight + 20);
                
                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                // Draw the calculator image
                ctx.drawImage(calculatorImage, x, y, imgWidth, imgHeight);
            }
            
            // Add tags if any
            if (this.currentEditingGraph.tags && this.currentEditingGraph.tags.length > 0) {
                ctx.font = '16px Inter, sans-serif';
                ctx.fillStyle = '#757575';
                ctx.textAlign = 'center';
                ctx.fillText(`Tags: ${this.currentEditingGraph.tags.join(', ')}`, canvas.width / 2, 690);
            }
            
            // Add watermark
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
            ctx.textAlign = 'right';
            ctx.fillText('Generated by Desmos Gallery', canvas.width - 20, canvas.height - 20);
            
            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.currentEditingGraph.title.replace(/[^a-z0-9]/gi, '_')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png', 1.0);
            
        } catch (error) {
            console.error('Error downloading graph:', error);
            alert('Failed to download graph. Please try again.');
        }
    }

    async captureCalculator(element) {
        return new Promise((resolve) => {
            // For Desmos calculators, we need to use their API to get the image
            if (this.modalCalculator && this.modalCalculator.asyncScreenshot) {
                this.modalCalculator.asyncScreenshot((dataUrl) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                    img.src = dataUrl;
                });
            } else {
                // Fallback: use html2canvas or similar library
                // For now, we'll create a placeholder
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                // Create a simple placeholder
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 500;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f5f5f5';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#757575';
                ctx.font = '24px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Graph Preview', canvas.width / 2, canvas.height / 2);
                img.src = canvas.toDataURL();
            }
        });
    }
}

// Initialize the gallery manager when the page loads
let galleryManager;
document.addEventListener('DOMContentLoaded', () => {
    galleryManager = new GalleryManager();
    
    // Render mini previews after a short delay to ensure DOM is ready
    setTimeout(() => {
        galleryManager.renderMiniPreviews();
    }, 500);
});