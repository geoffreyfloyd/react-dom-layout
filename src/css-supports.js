/**
 *  CSS.supports() Polyfill - Adapted from https://gist.github.com/codler/03a0995195aa2859465f
 */

if (window) {
    if (!('CSS' in window)) {
        window.CSS = {};
    }

    if (!('supports' in window.CSS)) {
        window.CSS._cacheSupports = {};
        window.CSS.supports = function (propertyName, value) {
            var key = [propertyName, value].toString();

            // Return cached value if exists
            if (key in window.CSS._cacheSupports) {
                return window.CSS._cacheSupports[key];
            }

            // Check if propertyName/value combo is supported
            var supported = cssSupports(propertyName, value);

            // Assign to cache
            window.CSS._cacheSupports[key] = supported;

            // Return value
            return supported;
        };
    }

    module.exports = exports = window.CSS;
}
else {
    module.exports = exports = {
        supports: function () {
            console.error('Not supported outside of DOM');
        }
    };
}

function cssSupports (propertyName, value) {
    var style = document.createElement('div').style;

    // 1 argument
    if (value === undefined) {
        // The regex will do this '( a:b ) or ( c:d )' => ["( a:b ", ")", "(", " c:d )"]
        var arrOr = mergeOdd(propertyName, /([)])\s*or\s*([(])/gi);
        if (arrOr) {
            return arrOr.some(function (supportsCondition) { return window.CSS.supports(supportsCondition); });
        }
        var arrAnd = mergeOdd(propertyName, /([)])\s*and\s*([(])/gi);
        if (arrAnd) {
            return arrAnd.every(function (supportsCondition) { return window.CSS.supports(supportsCondition); });
        }

        // Remove the first and last parentheses
        style.cssText = propertyName.replace('(', '').replace(/[)]$/, '');
        // 2 arguments
    }
    else {
        style.cssText = propertyName + ':' + value;
    }

    return !!style.length;
}

function mergeOdd (propertyName, reg) {
    var arr = propertyName.split(reg);

    if (arr.length > 1) {
        return arr.map(function (value, index, arr2) {
            return (index % 2 === 0) ? value + arr2[index + 1] : '';
        }).filter(Boolean);
    }
}
