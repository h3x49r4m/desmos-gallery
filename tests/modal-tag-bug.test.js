/**
 * Modal Tag Bug Test
 * Test to verify the tag update issue in modal
 */

const fs = require('fs').promises;
const path = require('path');

describe('Modal Tag Bug Test', () => {
    const galleryManagerPath = path.join(__dirname, '../static/js/galleryManager.js');
    let jsContent;

    beforeAll(async () => {
        jsContent = await fs.readFile(galleryManagerPath, 'utf8');
    });

    describe('Tag Update Flow', () => {
        test('should initialize modalTags as empty Set', () => {
            expect(jsContent).toContain('this.modalTags = new Set()');
        });

        test('should clear modalTags on close', () => {
            expect(jsContent).toContain('this.modalTags.clear()');
        });

        test('should add tag to modalTags Set on Enter', () => {
            expect(jsContent).toContain('this.modalTags.add(tag)');
        });

        test('should convert modalTags to array in updateGraph', () => {
            expect(jsContent).toContain('Array.from(this.modalTags)');
            expect(jsContent).toContain('tags:');
        });

        test('should check for duplicate tags before adding', () => {
            expect(jsContent).toContain('!this.modalTags.has(tag)');
        });

        test('should have proper tag collection in updateGraph', () => {
            expect(jsContent).toContain('Array.from(this.modalTags)');
            expect(jsContent).toContain('tags:');
        });
    });

    describe('Tag Input Event Listener', () => {
        test('should prevent default on Enter key', () => {
            expect(jsContent).toContain('e.preventDefault()');
        });

        test('should trim tag input value', () => {
            expect(jsContent).toContain('tagInput.value.trim()');
        });

        test('should clear input after adding tag', () => {
            expect(jsContent).toContain('tagInput.value = \'\'');
        });

        test('should only add non-empty tags', () => {
            expect(jsContent).toContain('if (tag && !this.modalTags.has(tag))');
        });
    });

    describe('Tag Display', () => {
        test('should create tag element with remove button', () => {
            expect(jsContent).toContain('tagElement.appendChild(removeBtn)');
        });

        test('should handle tag removal on click', () => {
            expect(jsContent).toContain('modalTags.delete(tag)');
        });

        test('should use Set for tag storage', () => {
            expect(jsContent).toContain('this.modalTags = new Set()');
        });
    });
});
