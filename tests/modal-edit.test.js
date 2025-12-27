/**
 * Modal Edit Tests
 * Tests for the modal editing functionality in gallery.html
 */

const fs = require('fs').promises;
const path = require('path');

describe('Modal Edit Tests', () => {
    const galleryPath = path.join(__dirname, '../public/gallery.html');
    const galleryManagerPath = path.join(__dirname, '../public/src/galleryManager.js');
    let htmlContent;
    let jsContent;

    beforeAll(async () => {
        htmlContent = await fs.readFile(galleryPath, 'utf8');
        jsContent = await fs.readFile(galleryManagerPath, 'utf8');
    });

    describe('Modal HTML Structure', () => {
        test('should have modal edit form fields', () => {
            const requiredFields = [
                'modalTitleInput',
                'modalAuthorInput',
                'modalFormulaInput',
                'modalLineColorInput',
                'modalTagInput',
                'modalTagContainer'
            ];

            requiredFields.forEach(fieldId => {
                expect(htmlContent).toContain(`id="${fieldId}"`);
            });
        });

        test('should have modal action buttons', () => {
            const requiredButtons = [
                'modalCancelBtn',
                'modalUpdateBtn',
                'modalDeleteBtn'
            ];

            requiredButtons.forEach(buttonId => {
                expect(htmlContent).toContain(`id="${buttonId}"`);
            });
        });

        test('should have modal layout structure', () => {
            expect(htmlContent).toContain('modal-layout');
            expect(htmlContent).toContain('modal-left');
            expect(htmlContent).toContain('modal-right');
            expect(htmlContent).toContain('modalEditForm');
        });

        test('should have color preview element', () => {
            expect(htmlContent).toContain('id="modalColorPreview"');
        });
    });

    describe('Modal JavaScript Functionality', () => {
        test('should have currentEditingGraph property', () => {
            expect(jsContent).toContain('this.currentEditingGraph');
        });

        test('should have modalTags Set property', () => {
            expect(jsContent).toContain('this.modalTags = new Set()');
        });

        test('should have updateGraph method', () => {
            expect(jsContent).toContain('async updateGraph()');
        });

        test('should have deleteGraph method', () => {
            expect(jsContent).toContain('async deleteGraph()');
        });

        test('should have addModalTag method', () => {
            expect(jsContent).toContain('addModalTag(tag)');
        });

        test('should have PUT request for updating', () => {
            expect(jsContent).toContain('method: \'PUT\'');
            expect(jsContent).toContain('/api/graphs/${this.currentEditingGraph.id}');
        });

        test('should have DELETE request for deletion', () => {
            expect(jsContent).toContain('method: \'DELETE\'');
        });

        test('should populate modal fields in showGraphModal', () => {
            expect(jsContent).toContain('document.getElementById(\'modalTitleInput\').value');
            expect(jsContent).toContain('document.getElementById(\'modalAuthorInput\').value');
            expect(jsContent).toContain('document.getElementById(\'modalFormulaInput\').value');
            expect(jsContent).toContain('document.getElementById(\'modalLineColorInput\').value');
        });

        test('should handle tag input in modal', () => {
            expect(jsContent).toContain('modalTagInput');
            expect(jsContent).toContain('addEventListener(\'keydown\'');
            expect(jsContent).toContain('e.key === \'Enter\'');
        });

        test('should handle color change in modal', () => {
            expect(jsContent).toContain('modalLineColorInput');
            expect(jsContent).toContain('addEventListener(\'input\'');
            expect(jsContent).toContain('modalColorPreview');
        });

        test('should handle formula change in modal', () => {
            expect(jsContent).toContain('modalFormulaInput');
            expect(jsContent).toContain('addEventListener(\'input\'');
        });

        test('should clear modal state on close', () => {
            expect(jsContent).toContain('this.currentEditingGraph = null');
            expect(jsContent).toContain('this.modalTags.clear()');
        });
    });

    describe('Modal Event Listeners', () => {
        test('should have update button event listener', () => {
            expect(jsContent).toContain('modalUpdateBtn');
            expect(jsContent).toContain('addEventListener(\'click\'');
            expect(jsContent).toContain('this.updateGraph()');
        });

        test('should have delete button event listener', () => {
            expect(jsContent).toContain('modalDeleteBtn');
            expect(jsContent).toContain('addEventListener(\'click\'');
            expect(jsContent).toContain('this.deleteGraph()');
        });

        test('should have cancel button event listener', () => {
            expect(jsContent).toContain('modalCancelBtn');
            expect(jsContent).toContain('addEventListener(\'click\'');
            expect(jsContent).toContain('this.closeModal()');
        });
    });

    describe('Modal Form Validation', () => {
        test('should validate required fields before update', () => {
            // Check if title and formula fields are present in the update
            expect(jsContent).toContain('title: document.getElementById(\'modalTitleInput\').value');
            expect(jsContent).toContain('formula: document.getElementById(\'modalFormulaInput\').value');
        });

        test('should handle empty tags array', () => {
            expect(jsContent).toContain('Array.from(this.modalTags)');
        });

        test('should confirm before deletion', () => {
            expect(jsContent).toContain('confirm(');
            expect(jsContent).toContain('Are you sure you want to delete');
        });
    });

    describe('Modal Error Handling', () => {
        test('should handle update errors gracefully', () => {
            expect(jsContent).toContain('try {');
            expect(jsContent).toContain('catch (error)');
            expect(jsContent).toContain('console.error');
        });

        test('should show error message on update failure', () => {
            expect(jsContent).toContain('alert(\'Failed to update graph\')');
        });

        test('should show error message on delete failure', () => {
            expect(jsContent).toContain('alert(\'Failed to delete graph\')');
        });
    });

    describe('Modal UI Updates', () => {
        test('should update graph in local array after successful update', () => {
            expect(jsContent).toContain('this.graphs.findIndex');
            expect(jsContent).toContain('this.graphs[index] = updatedGraph');
        });

        test('should remove graph from local array after successful delete', () => {
            expect(jsContent).toContain('this.graphs.splice(index, 1)');
        });

        test('should re-render gallery after update or delete', () => {
            expect(jsContent).toContain('this.filterByTag(this.currentFilter)');
        });
    });
});
