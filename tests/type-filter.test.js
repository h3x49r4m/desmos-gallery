/**
 * Type Filter Tests
 * Tests for the graph type filtering functionality in gallery.html
 */

const fs = require('fs').promises;
const path = require('path');

describe('Type Filter Tests', () => {
    const galleryPath = path.join(__dirname, '../static/gallery.html');
    const galleryManagerPath = path.join(__dirname, '../static/js/galleryManager.js');
    let htmlContent;
    let jsContent;

    beforeAll(async () => {
        htmlContent = await fs.readFile(galleryPath, 'utf8');
        jsContent = await fs.readFile(galleryManagerPath, 'utf8');
    });

    describe('Type Filter HTML Structure', () => {
        test('should have type filters section', () => {
            expect(htmlContent).toContain('type-filters');
            expect(htmlContent).toContain('id="typeFilters"');
        });

        test('should have all filter options', () => {
            expect(htmlContent).toContain('data-type="all"');
            expect(htmlContent).toContain('data-type="2D"');
            expect(htmlContent).toContain('data-type="3D"');
        });

        test('should have filter-tag class for type filters', () => {
            expect(htmlContent).toMatch(/<span[^>]*class="filter-tag"[^>]*data-type=/);
        });

        test('should have filter-section layout', () => {
            expect(htmlContent).toContain('filter-section');
            expect(htmlContent).toContain('type-filters');
            expect(htmlContent).toContain('tag-filters');
        });
    });

    describe('Type Filter JavaScript Functionality', () => {
        test('should have currentTypeFilter property', () => {
            expect(jsContent).toContain('this.currentTypeFilter = \'all\'');
        });

        test('should have filterByType method', () => {
            expect(jsContent).toContain('filterByType(type)');
        });

        test('should have applyFilters method', () => {
            expect(jsContent).toContain('applyFilters()');
        });

        test('should filterByType call applyFilters', () => {
            expect(jsContent).toContain('this.currentTypeFilter = type');
            expect(jsContent).toContain('this.applyFilters();');
        });

        test('should filterByTag call applyFilters', () => {
            expect(jsContent).toContain('this.currentFilter = tag');
            expect(jsContent).toContain('this.applyFilters();');
        });

        test('should update active state for type filters', () => {
            expect(jsContent).toContain('typeElement.dataset.type === this.currentTypeFilter');
            expect(jsContent).toContain('typeElement.classList.add(\'active\')');
        });

        test('should filter graphs by type when type is not "all"', () => {
            expect(jsContent).toContain('filtered = filtered.filter(graph => graph.type === this.currentTypeFilter)');
        });

        test('should not filter when type is "all"', () => {
            expect(jsContent).toContain('if (this.currentTypeFilter !== \'all\')');
        });

        test('should apply both type and tag filters', () => {
            expect(jsContent).toContain('Apply both filters');
            expect(jsContent).toContain('if (this.currentTypeFilter !== \'all\')');
            expect(jsContent).toContain('if (this.currentFilter !== \'all\')');
        });
    });

    describe('Type Filter Event Listeners', () => {
        test('should add click event listeners to type filters', () => {
            expect(jsContent).toContain('typeElement.addEventListener(\'click\'');
            expect(jsContent).toContain('this.filterByType(typeElement.dataset.type)');
        });

        test('should add click event listeners in extractAndRenderTags', () => {
            expect(jsContent).toContain('typeFilters.querySelectorAll(\'.filter-tag\')');
        });
    });

    describe('Type Filter Integration', () => {
        test('should work with existing tag filtering', () => {
            expect(jsContent).toContain('extractAndRenderTags');
            expect(jsContent).toContain('Add click event to type filters');
        });

        test('should maintain existing tag functionality', () => {
            expect(jsContent).toContain('tagFilters.querySelectorAll(\'.tag\')');
            expect(jsContent).toContain('tagElement.addEventListener(\'click\'');
        });

        test('should update both filter states in applyFilters', () => {
            expect(jsContent).toContain('Update active state for tags');
            expect(jsContent).toContain('Update active state for types');
        });
    });

    describe('Type Filter Logic', () => {
        test('should correctly handle "all" type filter', () => {
            expect(jsContent).toContain('if (this.currentTypeFilter !== \'all\')');
            expect(jsContent).toContain('this.currentTypeFilter = \'all\'');
        });

        test('should correctly handle "2D" type filter', () => {
            expect(jsContent).toContain('graph.type === \'2D\'');
        });

        test('should correctly handle "3D" type filter', () => {
            expect(jsContent).toContain('graph.type === this.currentTypeFilter');
        });

        test('should preserve original graphs array', () => {
            expect(jsContent).toContain('let filtered = [...this.graphs];');
        });
    });

    describe('Type Filter UI Updates', () => {
        test('should update graph cards after filtering', () => {
            expect(jsContent).toContain('this.renderGraphs()');
            expect(jsContent).toContain('this.filteredGraphs = filtered');
        });

        test('should update mini previews after filtering', () => {
            expect(jsContent).toContain('this.renderMiniPreviews()');
        });

        test('should update batch controls after filtering', () => {
            expect(jsContent).toContain('this.updateBatchControls()');
        });
    });
});
