/**
 * Form Layout Tests
 * Tests for the form field order and layout in index.html
 */

const fs = require('fs').promises;
const path = require('path');

describe('Form Layout Tests', () => {
    const indexPath = path.join(__dirname, '../static/index.html');
    let htmlContent;

    beforeAll(async () => {
        htmlContent = await fs.readFile(indexPath, 'utf8');
    });

    test('should have form fields in correct order', () => {
        // Find all form groups in order, including those with data-env attribute
        const formGroupRegex = /<div class="form-group"(?: data-env="[^"]*")?>([\s\S]*?)<\/div>/g;
        const formGroups = [];
        let match;
        
        while ((match = formGroupRegex.exec(htmlContent)) !== null) {
            formGroups.push(match[1]);
        }

        // Extract the order of form elements
        const fieldOrder = [];
        formGroups.forEach(group => {
            if (group.includes('id="formula"')) fieldOrder.push('formula');
            else if (group.includes('name="graphType"')) fieldOrder.push('graphType');
            else if (group.includes('id="lineColor"')) fieldOrder.push('lineColor');
            else if (group.includes('id="previewBtn"')) fieldOrder.push('previewBtn');
            else if (group.includes('id="tagInput"')) fieldOrder.push('tags');
            else if (group.includes('id="title"')) fieldOrder.push('title');
            else if (group.includes('id="author"')) fieldOrder.push('author');
            else if (group.includes('type="submit"')) fieldOrder.push('saveBtn');
        });

        // Verify the order matches requirements
        expect(fieldOrder).toEqual([
            'formula',
            'graphType',
            'lineColor',
            'previewBtn',
            'tags',
            'title',
            'author',
            'saveBtn'
        ]);
    });

    test('should have formula field as first field', () => {
        const formulaIndex = htmlContent.indexOf('id="formula"');
        const graphTypeIndex = htmlContent.indexOf('name="graphType"');
        
        expect(formulaIndex).toBeLessThan(graphTypeIndex);
        expect(formulaIndex).toBeGreaterThan(-1);
    });

    test('should have graph type after formula', () => {
        const formulaIndex = htmlContent.indexOf('id="formula"');
        const graphTypeIndex = htmlContent.indexOf('name="graphType"');
        const lineColorIndex = htmlContent.indexOf('id="lineColor"');
        
        expect(graphTypeIndex).toBeGreaterThan(formulaIndex);
        expect(graphTypeIndex).toBeLessThan(lineColorIndex);
    });

    test('should have line color after graph type', () => {
        const graphTypeIndex = htmlContent.indexOf('name="graphType"');
        const lineColorIndex = htmlContent.indexOf('id="lineColor"');
        const previewBtnIndex = htmlContent.indexOf('id="previewBtn"');
        
        expect(lineColorIndex).toBeGreaterThan(graphTypeIndex);
        expect(lineColorIndex).toBeLessThan(previewBtnIndex);
    });

    test('should have preview button after line color', () => {
        const lineColorIndex = htmlContent.indexOf('id="lineColor"');
        const previewBtnIndex = htmlContent.indexOf('id="previewBtn"');
        const tagInputIndex = htmlContent.indexOf('id="tagInput"');
        
        expect(previewBtnIndex).toBeGreaterThan(lineColorIndex);
        expect(previewBtnIndex).toBeLessThan(tagInputIndex);
    });

    test('should have tags after preview button', () => {
        const previewBtnIndex = htmlContent.indexOf('id="previewBtn"');
        const tagInputIndex = htmlContent.indexOf('id="tagInput"');
        const titleIndex = htmlContent.indexOf('id="title"');
        
        expect(tagInputIndex).toBeGreaterThan(previewBtnIndex);
        expect(tagInputIndex).toBeLessThan(titleIndex);
    });

    test('should have title after tags', () => {
        const tagInputIndex = htmlContent.indexOf('id="tagInput"');
        const titleIndex = htmlContent.indexOf('id="title"');
        const authorIndex = htmlContent.indexOf('id="author"');
        
        expect(titleIndex).toBeGreaterThan(tagInputIndex);
        expect(titleIndex).toBeLessThan(authorIndex);
    });

    test('should have author after title', () => {
        const titleIndex = htmlContent.indexOf('id="title"');
        const authorIndex = htmlContent.indexOf('id="author"');
        const submitBtnIndex = htmlContent.indexOf('type="submit"');
        
        expect(authorIndex).toBeGreaterThan(titleIndex);
        expect(authorIndex).toBeLessThan(submitBtnIndex);
    });

    test('should have save button as last field', () => {
        const authorIndex = htmlContent.indexOf('id="author"');
        const submitBtnIndex = htmlContent.indexOf('type="submit"');
        
        expect(submitBtnIndex).toBeGreaterThan(authorIndex);
        expect(submitBtnIndex).toBeGreaterThan(-1);
    });

    test('should have preview button as block button', () => {
        const previewBtnMatch = htmlContent.match(/class="([^"]*)"([^>]*id="previewBtn")/);
        expect(previewBtnMatch).toBeTruthy();
        expect(previewBtnMatch[1]).toContain('btn-block');
    });

    test('should have save button as block button', () => {
        const submitBtnMatch = htmlContent.match(/type="submit"([^>]*class="([^"]*)")/);
        expect(submitBtnMatch).toBeTruthy();
        expect(submitBtnMatch[2]).toContain('btn-block');
    });

    test('should have all required form fields', () => {
        const requiredFields = [
            'id="formula"',
            'name="graphType"',
            'id="lineColor"',
            'id="previewBtn"',
            'id="tagInput"',
            'id="title"',
            'id="author"',
            'type="submit"'
        ];

        requiredFields.forEach(field => {
            expect(htmlContent).toContain(field);
        });
    });

    test('should maintain proper form structure', () => {
        expect(htmlContent).toContain('<form id="graphForm">');
        expect(htmlContent).toContain('</form>');
        expect(htmlContent).toContain('class="form-group"');
    });
});
