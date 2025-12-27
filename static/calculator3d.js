// Calculator3D is included in the main calculator.js file
// This file ensures Calculator3D is available when loaded separately
if (typeof Desmos !== 'undefined' && Desmos.Calculator3D) {
    // Calculator3D is already available from calculator.js
    console.log('Desmos Calculator3D loaded from main API');
} else {
    // Fallback if Calculator3D is not available
    console.warn('Desmos Calculator3D not available. Using fallback.');
    window.Desmos = window.Desmos || {};
    window.Desmos.Calculator3D = function(element, options) {
        element.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center; padding: 20px;"><div style="font-size: 18px; margin-bottom: 10px;">3D Graphing</div><div style="font-size: 14px;">Calculator3D requires full Desmos API</div></div>';
        return {
            HelperExpression: function(params) {
                console.log('3D expression (fallback):', params);
            },
            resize: function() {
                // Placeholder resize function
            }
        };
    };
}