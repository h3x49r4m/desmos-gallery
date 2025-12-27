// Export GraphManager for testing
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment - export for testing
    class GraphManager {
        constructor() {
            this.currentCalculator = null;
            this.currentType = '2D';
            this.tags = [];
            this.init();
        }

        init() {
            this.initCalculator();
            this.initEventListeners();
        }

        initCalculator() {
            const calculatorElement = document.getElementById('calculator');
            calculatorElement.innerHTML = '';
            
            if (this.currentType === '2D') {
                this.currentCalculator = Desmos.Calculator(calculatorElement, {
                    keypad: false,
                    expressions: false,
                    settingsMenu: false,
                    zoomButtons: false,
                    expressionsTopbar: false,
                    border: false
                });
            } else {
                this.currentCalculator = Desmos.Calculator3D(calculatorElement, {
                    expressions: false,
                    settingsMenu: false,
                    zoomButtons: false,
                    expressionsTopbar: false,
                    border: false
                });
            }
        }

        initEventListeners() {
            // Graph type radio buttons
            document.querySelectorAll('input[name="graphType"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.currentType = e.target.value;
                    this.initCalculator();
                });
            });

            // Preview button
            document.getElementById('previewBtn').addEventListener('click', () => {
                this.previewGraph();
            });

            // Form submission
            document.getElementById('graphForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGraph();
            });

            // Tag input
            const tagInput = document.getElementById('tagInput');
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                }
            });

            // Formula input - live preview
            document.getElementById('formula').addEventListener('input', () => {
                this.previewGraph();
            });
        }

        addTag(tag) {
            if (tag && !this.tags.includes(tag)) {
                this.tags.push(tag);
                this.renderTags();
            }
        }

        removeTag(index) {
            this.tags.splice(index, 1);
            this.renderTags();
        }

        renderTags() {
            const container = document.getElementById('tagContainer');
            container.innerHTML = this.tags.map((tag, index) => `
                <span class="tag">
                    ${tag}
                    <span class="remove" onclick="graphManager.removeTag(${index})">×</span>
                </span>
            `).join('');
        }

        previewGraph() {
            const formula = document.getElementById('formula').value.trim();
            const lineColor = document.getElementById('lineColor').value;

            if (!formula) return;

            try {
                // Clear all previous expressions
                this.currentCalculator.setBlank();
                
                if (this.currentType === '2D') {
                    // For 2D graphs - use setExpression
                    let expression;
                    if (formula.includes('=')) {
                        // Equation format
                        expression = { 
                            latex: formula,
                            color: lineColor
                        };
                    } else {
                        // Function format
                        expression = { 
                            latex: `y=${formula}`,
                            color: lineColor
                        };
                    }
                    this.currentCalculator.setExpression(expression);
                } else {
                    // For 3D graphs - use setExpression
                    let expression;
                    if (formula.includes('=')) {
                        // Equation format
                        expression = { 
                            latex: formula,
                            color: lineColor
                        };
                    } else {
                        // Function format - assume z = formula
                        expression = { 
                            latex: `z=${formula}`,
                            color: lineColor
                        };
                    }
                    this.currentCalculator.setExpression(expression);
                }
            } catch (error) {
                console.error('Error plotting graph:', error);
            }
        }

        async saveGraph() {
            const title = document.getElementById('title').value.trim();
            const formula = document.getElementById('formula').value.trim();
            const author = document.getElementById('author').value.trim();
            const lineColor = document.getElementById('lineColor').value;

            if (!title || !formula) {
                alert('Please fill in both title and formula fields');
                return;
            }

            const graphData = {
                id: Date.now().toString(),
                title,
                formula,
                type: this.currentType,
                tags: this.tags,
                author,
                lineColor,
                createdAt: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/graphs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(graphData)
                });

                if (response.ok) {
                    alert('Graph saved successfully!');
                    this.resetForm();
                } else {
                    throw new Error('Failed to save graph');
                }
            } catch (error) {
                console.error('Error saving graph:', error);
                alert('Error saving graph. Please try again.');
            }
        }

        resetForm() {
            document.getElementById('graphForm').reset();
            this.tags = [];
            this.renderTags();
            this.initCalculator();
        }
    }

    module.exports = { GraphManager };
} else {
    // Browser environment - use the original implementation
    // The original code is already in the global scope
}