const fs = require('fs').promises;
const path = require('path');

describe('Download Feature Tests', () => {
    const galleryPath = path.join(__dirname, '../static/gallery.html');
    const galleryManagerPath = path.join(__dirname, '../static/js/galleryManager.js');

    describe('Download Button HTML Structure', () => {
        test('should have download button in gallery.html', async () => {
            const html = await fs.readFile(galleryPath, 'utf8');
            expect(html).toContain('modalDownloadBtn');
            expect(html).toContain('Download');
            expect(html).toContain('btn-success');
        });

        test('should have download button in modal button group', async () => {
            const html = await fs.readFile(galleryPath, 'utf8');
            const btnGroupMatch = html.match(/<div class="btn-group">([\s\S]*?)<\/div>/);
            expect(btnGroupMatch).toBeTruthy();
            expect(btnGroupMatch[1]).toContain('modalDownloadBtn');
        });
    });

    describe('Download Method Implementation', () => {
        test('should have downloadGraph method in galleryManager.js', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('downloadGraph()');
            expect(jsCode).toContain('async downloadGraph');
        });

        test('should have captureCalculator method', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('captureCalculator');
            expect(jsCode).toContain('async captureCalculator');
        });

        test('should handle canvas creation for download', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('createElement(\'canvas\')');
            expect(jsCode).toContain('canvas.width = 1200');
            expect(jsCode).toContain('canvas.height = 850');
        });

        test('should draw title on canvas', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('ctx.fillText(this.currentEditingGraph.title, currentX, metadataY)');
        });

        test('should draw author and date on canvas', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('ctx.fillText(this.currentEditingGraph.author, currentX, metadataY)');
            expect(jsCode).toContain('ctx.fillText(date, currentX, metadataY)');
        });

        test('should draw combined metadata in one row', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('ctx.fillStyle = \'#9E9E9E\'');
            expect(jsCode).toContain('ctx.font = \'bold 18px Inter, sans-serif\'');
            expect(jsCode).toContain('ctx.fillText(this.currentEditingGraph.title, currentX, metadataY)');
            expect(jsCode).toContain('ctx.font = \'18px Inter, sans-serif\'');
            expect(jsCode).toContain('ctx.fillText(this.currentEditingGraph.author, currentX, metadataY)');
            expect(jsCode).toContain('ctx.fillText(this.currentEditingGraph.author, currentX, metadataY)');
            expect(jsCode).toContain('ctx.fillText(date, currentX, metadataY)');
            expect(jsCode).toContain('ctx.fillText(\' • \', currentX, metadataY)');
        });

        test('should draw formula on canvas', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('renderMathFormula');
        });

test('should draw watermark', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('Desmos Gallery @ https://github.com/h3x49r4m/desmos-gallery');
            expect(jsCode).toContain('ctx.textAlign = \'right\'');
            expect(jsCode).toContain('ctx.font = \'14px Inter, sans-serif\'');
            expect(jsCode).toContain('ctx.fillStyle = \'#9E9E9E\'');
            expect(jsCode).not.toContain('Watermark removed - no longer displayed');
        });

        test('should handle tags in download', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            // Tags are no longer included in the metadata format, but still available in the graph object
            expect(jsCode).toContain('ctx.font = \'bold 18px Inter, sans-serif\'');
            expect(jsCode).toContain('ctx.font = \'18px Inter, sans-serif\'');
            expect(jsCode).toContain('ctx.fillText(\' • \', currentX, metadataY)');
            expect(jsCode).toContain('ctx.fillText(this.currentEditingGraph.author, currentX, metadataY)');
            expect(jsCode).toContain('ctx.fillText(date, currentX, metadataY)');
        });

        test('should handle error cases', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('No graph to download');
            expect(jsCode).toContain('Calculator element not found');
            expect(jsCode).toContain('Failed to download graph');
        });

        test('should sanitize filename', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('replace(/[^a-z0-9]/gi, \'_\')');
        });
    });

    describe('Download Event Listener', () => {
        test('should add click event listener to download button', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('modalDownloadBtn\').addEventListener(\'click\'');
            expect(jsCode).toContain('this.downloadGraph()');
        });
    });

    describe('Download Button Styling', () => {
        test('should have success button styling', async () => {
            const cssPath = path.join(__dirname, '../static/css/styles.css');
            const css = await fs.readFile(cssPath, 'utf8');
            expect(css).toContain('.btn-success');
        });
    });

    describe('Math Rendering Implementation', () => {
        test('should have renderMathFormula method', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('renderMathFormula(');
            expect(jsCode).toContain('async renderMathFormula');
        });

        test('should have convertToLatex method', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('convertToLatex(');
            expect(jsCode).toContain('\\sin');
            expect(jsCode).toContain('\\cos');
            expect(jsCode).toContain('\\log');
            expect(jsCode).toContain('\\frac');
        });

        test('should have createSVGFromElement method', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('createSVGFromElement(');
            expect(jsCode).toContain('<svg xmlns=');
            expect(jsCode).toContain('<foreignObject');
        });

        test('should convert Desmos functions to LaTeX', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('sin/g, \'\\\\sin\'');
            expect(jsCode).toContain('cos/g, \'\\\\cos\'');
            expect(jsCode).toContain('tan/g, \'\\\\tan\'');
            expect(jsCode).toContain('sqrt/g, \'\\\\sqrt\'');
        });

        test('should handle powers and subscripts', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('_([a-zA-Z0-9]+)/g, \'_{$1}\'');
            expect(jsCode).toContain('frac{$1}{$2}');
        });

        test('should have KaTeX integration', async () => {
            const html = await fs.readFile(galleryPath, 'utf8');
            expect(html).toContain('katex.min.css');
            expect(html).toContain('katex.min.js');
            expect(html).toContain('auto-render.min.js');
        });

        test('should handle KaTeX rendering fallback', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('typeof katex !== \'undefined\'');
            expect(jsCode).toContain('katex.render');
        });
    });

    describe('Download Implementation Details', () => {
        test('should use Desmos asyncScreenshot API', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('asyncScreenshot');
        });

        test('should handle image download with blob', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('toBlob');
            expect(jsCode).toContain('URL.createObjectURL');
            expect(jsCode).toContain('URL.revokeObjectURL');
        });

        test('should arrange layout with combined metadata row', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('Row 3: All metadata on same row (10% of content height at bottom)');
        });

        test('should position formula at top', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('await this.renderMathFormula(ctx, this.currentEditingGraph.formula, contentCenterX, formulaY, \'#424242\')');
        });

        test('should position chart after formula', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('const y = contentTop + formulaHeight; // Position after formula');
        });

        test('should position combined metadata on same row', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('const metadataY = contentTop + formulaHeight + imgHeight + metadataSpacing + metadataHeight / 2; // Center in metadata area with spacing');
        });

        test('should use proper percentage-based layout with 3% padding', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('const topPad = Math.floor(canvas.height * 0.03)');
            expect(jsCode).toContain('const bottomPad = Math.floor(canvas.height * 0.03)');
            expect(jsCode).toContain('const leftPad = Math.floor(canvas.width * 0.03)');
            expect(jsCode).toContain('const rightPad = Math.floor(canvas.width * 0.03)');
            expect(jsCode).toContain('const contentHeight = canvas.height - topPad - bottomPad');
            expect(jsCode).toContain('const contentWidth = canvas.width - leftPad - rightPad');
            expect(jsCode).toContain('const formulaHeight = Math.floor(contentHeight * 0.10)');
            expect(jsCode).toContain('let imgHeight = Math.floor(contentHeight * 0.80)');
            expect(jsCode).toContain('const imgWidth = contentWidth');
        });

test('should use highlighted title and consistent font size', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('ctx.fillStyle = \'#9E9E9E\'');
            expect(jsCode).toContain('ctx.font = \'bold 18px Inter, sans-serif\'');
            expect(jsCode).toContain('ctx.font = \'18px Inter, sans-serif\'');
        });

        test('should use smaller gray font for tags', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('ctx.font = \'18px Inter, sans-serif\';');  // Metadata font size
            expect(jsCode).toContain('ctx.fillStyle = \'#9E9E9E\';');
            expect(jsCode).toContain('ctx.font = \'14px Inter, sans-serif\';');  // Watermark font size
        });

        test('should create download link element', async () => {
            const jsCode = await fs.readFile(galleryManagerPath, 'utf8');
            expect(jsCode).toContain('createElement(\'a\')');
            expect(jsCode).toContain('document.body.appendChild');
            expect(jsCode).toContain('document.body.removeChild');
        });
    });
});