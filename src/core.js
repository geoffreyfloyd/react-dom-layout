(function (factory) {
    module.exports = exports = factory(
        require('./css-supports')
    );
}(function (CSS) {

    // Local variables
    var fontSizeBase, getRootLayoutContext;
    var DIMENSIONS = ['height', 'width'];
    var INNER_MODIFIERS = ['border', 'padding'];
    var OUTER_MODIFIERS = ['margin'];
    var SIDES = ['Top', 'Right', 'Bottom', 'Left'];
    var SCROLLBAR_WIDTH = 22;
    var FLEX = ['flex', '-webkit-flex;', '-ms-flexbox', '-moz-box', '-webkit-box'];

    /**
     * Convert various measurements to 
     */
    function convertToPixels(str, context, dim) {
        if (isNumber(str)) {
            return str;
        }

        var unit = getUnit(str);
        if (unit === 'rem') {
            return parseFloat(str) * getFontSizeBase();
        }
        else if (unit === 'em') {
            if (!context || !context.fontSize) {
                console.warn('em used root font size (body), because it was not supplied the scoped font size.');
            }
            return parseFloat(str) * (context ? (context.fontSize || getFontSizeBase()) : getFontSizeBase());
        }
        else if (unit === 'vh') {
            return getRootLayoutContext().height * (parseFloat(str) / 100);
        }
        else if (unit === 'vw') {
            return getRootLayoutContext().width * (parseFloat(str) / 100);
        }
        else if (unit === '%' || unit === '%h' || unit === '%w') {
            if (context === undefined || context === null) {
                return NaN;
            }
            else {
                var compareDim = dim;
                if (unit === '%h') {
                    compareDim = 'height';
                }
                else if (unit === '%w') {
                    compareDim = 'width';
                }
                if (!compareDim) {
                    return NaN;
                }
                return context[compareDim] * (parseFloat(str) / 100);
            }
        }
        else {
            return parseFloat(str);
        }
    }

    /**
     * Return single object of layout properties from 
     * all matching breakpoints for a given component.
     * Properties that require processing of measurement units
     * use the given context object to resolve relative measurements.
     * This object is expected to have a property named either 'parent' or 'self'
     * in order to define the relation that the context has to the component.
     */
    function getBreakpointLayout(component, context) {
        
        var layoutProps = {};

        // apply breakpoint layout
        if (component.props && component.props.layoutBreakpoints && component.props.layoutBreakpoints.length && context !== undefined && context !== null) {

            // Find the context relationship
            var contextRelation = '';
            for (var prop in context) {  
                if (context.hasOwnProperty(prop)) {
                    contextRelation = prop;
                    break;
                }
            }

            // Iterate through a filtered array of breakpoints that reference the passed in context relation: parent or self
            component.props.layoutBreakpoints.map(parseBreakpointCondition).filter(function (bp) { return bp.ctx === contextRelation; }).forEach(function (breakpoint) {

                // Test the condition
                var test = false;
                switch (breakpoint.eq) {
                    case '=':
                    case '==':
                    case '===':
                        test = context[contextRelation][breakpoint.prop] === convertToPixels(breakpoint.val, context[contextName], breakpoint.prop);
                        break;
                    case '<':
                        test = context[contextName][breakpoint.prop] < convertToPixels(breakpoint.val, context[contextName], breakpoint.prop);
                        break;
                    case '>':
                        test = context[contextName][breakpoint.prop] > convertToPixels(breakpoint.val, context[contextName], breakpoint.prop);
                        break;
                    case '<=':
                        test = context[contextName][breakpoint.prop] <= convertToPixels(breakpoint.val, context[contextName], breakpoint.prop);
                        break;
                    case '>=':
                        test = context[contextName][breakpoint.prop] >= convertToPixels(breakpoint.val, context[contextName], breakpoint.prop);
                        break;
                    case '><':
                        test = context[contextName][breakpoint.prop] > convertToPixels(breakpoint.val.split(':')[0], context[contextName], breakpoint.prop) && context[contextName][breakpoint.prop] < convertToPixels(breakpoint.val.split(':')[1], context[contextName], breakpoint.prop);
                        break;
                    case '>=<':
                    case '>==<':
                        test = context[contextName][breakpoint.prop] >= convertToPixels(breakpoint.val.split(':')[0], context[contextName], breakpoint.prop) && context[contextName][breakpoint.prop] <= convertToPixels(breakpoint.val.split(':')[1], context[contextName], breakpoint.prop);
                        break;
                }

                // test range of breakpoint
                if (test) {
                    // apply pixel conversions if context target is self
                    if (contextName === 'self') {
                        DIMENSIONS.forEach(function (prop) {
                            if (breakpoint.then.hasOwnProperty(prop)) {
                                breakpoint.then[prop] = convertToPixels(breakpoint.then[prop], context, breakpoint.prop);
                            }
                        });
                    }

                    // apply breakpoint to layout context
                    Object.assign(layoutProps, breakpoint.then);
                }
            });
        }
        return layoutProps;
    }

    function getFontSizeBase() {
        if (fontSizeBase) {
            return fontSizeBase;
        }
        else {
            try {
                var element = document.body;
                var measure = document.createElement('div');
                measure.style.height = '1em';
                element.appendChild(measure);
                var size = measure.offsetHeight / 1;
                element.removeChild(measure);
                fontSizeBase = size;
            }
            catch (e) {
                fontSizeBase = 16;
            }
        }
        return fontSizeBase;
    }

    /**
     * Return an options object for a layout component
     */
    function getLayoutOptions(component, context) {
        // Default option values
        var defaults = {
            allowScrollbar: true,
            allowFlex: true,
            allowFlexWrap: true
        };

        // Overwrite options with layoutOptions property (if exists)
        if (component.props && component.props.layoutOptions) {
            Object.assign(defaults, component.props.layoutOptions);
        }

        // Overwrite options with applied breakpoints that contains an options
        if (context !== undefined && component.props && component.props.layoutBreakpoints) {
            var breakpointLayout = getBreakpointLayout(component, { self: context });

            if (breakpointLayout.options) {
                Object.assign(defaults, breakpointLayout.options);
            }
        }

        return defaults;
    }

    function getSizeModifiers(style, props, context) {
        var size = {
            height: 0,
            width: 0
        };
        props.forEach(function (prop) {
            var sides = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };
            //var top = 0, right = 0, bottom = 0, left = 0;

            if (style.hasOwnProperty(prop)) {
                var mod = style[prop].split(' ');

                if (prop === 'border') {
                    sides.top = sides.right = sides.bottom = sides.left = convertToPixels(mod[0], context, '*');
                }
                else { //padding, margin
                    if (mod.length > 2) {
                        sides.top = convertToPixels(mod[0], context, 'height');
                        sides.bottom = convertToPixels(mod[2], context, 'height');
                    }
                    else {
                        sides.top = sides.right = sides.bottom = sides.left = convertToPixels(mod[0], context, '*');
                    }

                    if (mod.length > 1) {
                        if (mod.length > 3) {
                            sides.right = convertToPixels(mod[1], context, 'width');
                            sides.left = convertToPixels(mod[3], context, 'width');
                        }
                        else {
                            sides.right = sides.left = convertToPixels(mod[1], context, 'width');
                        }
                    }
                }
            }

            SIDES.forEach(function (side) {
                if (style.hasOwnProperty(prop + side)) {
                    sides[side.toLowerCase()] = convertToPixels(
                        style[prop + side].split(' ')[0],
                        context,
                        side === 'Top' || side === 'Bottom' ? 'height' : 'width');
                }
            });

            size.height += sides.top + sides.bottom;
            size.width += sides.right + sides.left;
        });
        return size;
    }

    /**
     * Returns truthy object (treat undefined as false)
     */
    function isLayout(component) {
        var result = false;
        try {
            result = (component.constructor !== undefined && component.constructor !== null ?
                component.constructor.isReactDomLayout : undefined) ||
            (component.type !== undefined && component.type !== null ?
                component.type.isReactDomLayout : undefined)

            result = result || false;
        }
        catch (e) { }
        return result;
    }

    /**
     * Layout is a fixed or calculable number (ie. px, em, rem, %)
     */
    function layoutIsFixed(value, context, dim) {
        return value !== undefined && !isNaN(convertToPixels(value, context, dim));
    }

    /**
     * Layout is flex, which evenly distributes any available
     * space among all flex siblings.
     */
    function layoutIsFlex(value) {
        return value !== undefined && value.split(':')[0] === 'flex';
    }

    function layoutIsOmitted(value) {
        return value === undefined || value === 'omit';
    }

    /*************************************************************
     * INTERNAL METHODS
     *************************************************************/
    function getFlex() {
        var flex;
        for (var i = 0; i < FLEX.length; i++) {
            if (CSS.supports('display', FLEX[i])) {
                flex = FLEX[i];
                break;
            }
        }
        return flex;
    }

    function getUnit(str) {
        var unit = 'px';
        if (str.length > 1) {
            if (str.slice(str.length - 2) === 'px') {
                unit = 'px';
            }
            else if (str.slice(str.length - 3) === 'rem') {
                unit = 'rem';
            }
            else if (str.slice(str.length - 2) === 'em') {
                unit = 'em';
            }
            else if (str.slice(str.length - 2) === 'vh') {
                unit = 'vh';
            }
            else if (str.slice(str.length - 2) === 'vw') {
                unit = 'vw';
            }
            else if (str.slice(str.length - 2) === '%h') {
                unit = '%h';
            }
            else if (str.slice(str.length - 2) === '%w') {
                unit = '%w';
            }
            else if (str.slice(str.length - 1) === '%') {
                unit = '%';
            }
        }
        return unit;
    }

    function isNumber(value) {
        return typeof value === 'number';
    }

    /**
     * Parse a 'when' string argument into a breakpoint condition
     */
    function parseBreakpointCondition(breakpoint) {
        return breakpoint.when.split(' ').reduce(function (bp, item, i) {
            switch (i) {
                case 0:
                    var parts = item.split('.');
                    bp.ctx = parts[0];
                    bp.prop = parts[1];
                    break;
                case 1:
                    bp.eq = item;
                    break;
                case 2:
                    bp.val = item;
                    break;
            }
            return bp;
        }, {
            ctx: 'parent', // client (browser - android, chrome, etc), self]
            prop: null,
            eq: '===',
            val: null,
            then: breakpoint.then
        });
    }


    return {
        DIMENSIONS: DIMENSIONS,
        INNER_MODIFIERS: INNER_MODIFIERS,
        OUTER_MODIFIERS: OUTER_MODIFIERS,
        SCROLLBAR_WIDTH: SCROLLBAR_WIDTH,
        convertToPixels: convertToPixels,
        getBreakpointLayout: getBreakpointLayout,
        getFlex: getFlex,
        getFontSizeBase: getFontSizeBase,
        getLayoutOptions: getLayoutOptions,
        getSizeModifiers: getSizeModifiers,
        isLayout: isLayout,
        layoutIsFixed: layoutIsFixed,
        layoutIsFlex: layoutIsFlex,
        layoutIsOmitted: layoutIsOmitted
    };
}));