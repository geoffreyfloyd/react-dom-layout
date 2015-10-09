(function (factory) {
    module.exports = exports = factory(
        require('react')
    );
}(function (React) {
    // many thanks to https://github.com/jsdf/react-layout for base of layout logic
    var DIMENSIONS = ['height', 'width'];
    var INNER_MODIFIERS = ['border', 'padding'];
    var OUTER_MODIFIERS = ['margin'];
    var SIDES = ['Top', 'Right', 'Bottom', 'Left'];
    var SCROLLBAR_WIDTH = 22;

    var fontSizeBase, getRootLayoutContext;

    var LayoutMixin = {
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        contextTypes: {
            layoutContext: React.PropTypes.object
        },
        childContextTypes: {
            layoutContext: React.PropTypes.object
        },
        statics: {
            hasReactLayout: true
        },

        getDefaultProps: function () {
            return {
                component: React.DOM.div,
                layoutHeight: null,
                layoutWidth: null
            };
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        getLayoutContext: function () {
            var layoutContext = {};

            if (this.getRootLayoutContext) {
                layoutContext = this.getRootLayoutContext();
                layoutContext = Object.assign({fontSize: getFontSizeBase()}, layoutContext);
                // register root
                getRootLayoutContext = this.getRootLayoutContext;
            }
            else {
                var inherited;
                inherited = this.props.layoutContext;
                if (inherited) {
                    layoutContext = Object.assign({}, inherited);
                }
                else {
                    layoutContext = {
                        width: isNumber(this.props.layoutWidth) ? this.props.layoutWidth : undefined,
                        height: isNumber(this.props.layoutHeight) ? this.props.layoutHeight : undefined,
                        fontSize: isNumber(this.props.layoutFontSize) ? this.props.layoutFontSize : undefined
                    };
                }
            }

            if (this.props.style) {
                var sizeModifiers = getSizeModifiers(reduceStyle(this.props.style), OUTER_MODIFIERS, layoutContext);
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim]) {
                        layoutContext[dim] -= sizeModifiers[dim];
                    }
                });
            }

            return layoutContext;
        },

        getParentLayout: function (subtract) {
            var layoutContext = Object.assign({}, this.getLayoutContext());

            if (subtract) {
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim] && subtract[dim]) {
                        layoutContext[dim] -= subtract[dim];
                    }
                });
            }

            if (this.props.style) {
                var sizeModifiers = getSizeModifiers(reduceStyle(this.props.style), INNER_MODIFIERS, layoutContext);
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim]) {
                        layoutContext[dim] -= sizeModifiers[dim];
                    }
                });
            }

            return layoutContext;
        },

        /**
         * Return calculated style for component
         */
        getLocalLayout: function (subtract) {
            var layoutContext, local;

            local = {};
            layoutContext = this.getLayoutContext();
            guardLayoutContext(layoutContext);

            if (layoutContext) {
                local.fontSize = layoutContext.fontSize;
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim]) {
                        local[dim] = layoutContext[dim];
                    }
                });
            }

            if (subtract) {
                DIMENSIONS.forEach(function (dim) {
                    if (subtract[dim] && local[dim]) {
                        local[dim] -= subtract[dim];
                    }
                });
            }

            var breakpoint = {};
            applyBreakpoints(this, breakpoint, local, 'parent');

            if (breakpoint.style) {
                Object.assign(local, breakpoint.style);
            }

            return local;
        },

        measureLayoutForChildren: function (children, subtract) {
            var parentLayout, layout;
            parentLayout = this.getParentLayout(subtract);
            guardLayoutContext(parentLayout);

            // wrap
            var newWrap = function (available) {
                return {
                    available: available,
                    elements: []
                };
            };

            layout = DIMENSIONS.reduce(function (lay, dim) {
                lay[dim] = {
                    wraps: [newWrap(parentLayout[dim])]
                };
                return lay;
            }, {});

            // additional styles from breakpoint
            layout.styles = [];

            // Measure
            reactForEach(children, function (child) {
                var childLayout;

                if (child) {
                    childLayout = getChildLayout(child, parentLayout);

                    if (childLayout) {
                        // add style that may have been applied from breakpoint
                        layout.styles.push(childLayout.style || {});
                    }
                    else {
                        //return;
                        layout.styles.push({});
                        //debugger;
                    }
                }
                // else {
                //     return;
                // }

                DIMENSIONS.forEach(function (dim) {
                    // get currect wrap
                    var wrap = layout[dim].wraps[layout[dim].wraps.length - 1];

                    var arg;
                    var calculate = true;
                    var fontSize = childLayout && childLayout.fontSize ? convertToPixels(childLayout.fontSize, parentLayout, dim) : parentLayout.fontSize;
                    var min = 1;

                    if (!child || !childLayout || childLayout[dim] === undefined || childLayout[dim] === 'omit') {
                        arg = childLayout ? childLayout[dim] : undefined;
                        min = 0;
                        calculate = false;
                    }
                    else if (layoutIsFixed(childLayout[dim], parentLayout, dim)) {
                        // fixed is min
                        arg = childLayout[dim];
                        min = convertToPixels(childLayout[dim], parentLayout, dim);
                        calculate = false;
                    }
                    else if (layoutIsFlex(childLayout[dim])) {
                        // check for flex min
                        arg = childLayout[dim];
                        var flexParams = childLayout[dim].split(':');
                        if (flexParams.length > 1 && flexParams[1] !== '') {
                            min = convertToPixels(flexParams[1], parentLayout, dim);
                        }
                    }
                    else {
                        // inherit and all else  if (childLayout[dim] === 'inherit')
                        arg = childLayout[dim];
                        min = parentLayout[dim] || 0;
                        calculate = false;
                    }

                    // if we don't have enough space and at least one
                    // element has been layed out in this wrap, then
                    // it's time for a new wrap
                    if (wrap.elements.length > 0 && wrap.available < min) {
                        wrap = newWrap(parentLayout[dim]);
                        layout[dim].wraps.push(wrap);
                    }

                    // add element to the wrap
                    wrap.available -= min;
                    wrap.elements.push({
                        arg: arg,
                        calculate: calculate,
                        fontSize: fontSize,
                        measure: min
                    });
                });
            });

            var uncalculated = function (item) {
                return item.calculate;
            };

            // second pass
            DIMENSIONS.forEach(function (dim) {
                layout[dim].wraps.forEach(function (wrap) {
                    var uncalculatedElements = wrap.elements.filter(uncalculated).length;
                    if (uncalculatedElements > 0) {
                        // distribute (first pass)
                        var evenDistrib = wrap.available / uncalculatedElements;
                        wrap.elements.filter(uncalculated).forEach(function (element) {
                            var flexArgs = element.arg.split(':');
                            if (flexArgs.length > 2 && flexArgs[2] !== '') {
                                var max = convertToPixels(flexArgs[2], parentLayout, dim);
                                if (max < evenDistrib + element.measure) {
                                    var maxAvail = max - element.measure;
                                    element.measure += maxAvail;
                                    wrap.available -= maxAvail;
                                    element.calculate = false;
                                }
                                else {
                                    element.measure += evenDistrib;
                                    wrap.available -= evenDistrib;
                                }
                            }
                            else {
                                element.measure += evenDistrib;
                                wrap.available -= evenDistrib;
                            }
                        });

                        // assign the rest of available space to items that can
                        // still flex
                        uncalculatedElements = wrap.elements.filter(uncalculated).length;
                        if (uncalculatedElements > 0 && wrap.available > 0.0) {
                            evenDistrib = wrap.available / uncalculatedElements;
                            wrap.elements.filter(uncalculated).forEach(function (element) {
                                element.measure += evenDistrib;
                                wrap.available -= evenDistrib;
                                element.calculate = false;
                            });
                        }
                    }
                });
            });

            var containerStyle = {};
            if (needsFlex(layout.width.wraps) || needsWrap(layout.width.wraps)) {
                containerStyle.display = 'flex';
            }

            if (needsWrap(layout.width.wraps)) {
                containerStyle.flexWrap = 'wrap';
            }

            var scrollbar = needsScrollbar(layout, parentLayout);
            if (scrollbar) {
                containerStyle.overflowY = 'scroll';
            }

            return {
                parentLayout: parentLayout,
                layout: layout,
                containerStyle: containerStyle,
                needsScrollbar: scrollbar
            };
        },

        applyLayoutToChildren: function (children, measure) {
            var childIndex = 0;
            var processChild = function (child) {

                // TODO: If child has no props then just return the child.. but why?
                if (!(child !== undefined && child !== null ? child.props : undefined)) {
                    childIndex++;
                    return child;
                }

                // TODO: Figure out what happens when a ref child is cloned
                if (child.props.ref !== undefined && child.props.ref !== null) {
                    debugger;
                    childIndex++;
                    return child;
                }

                var layout;
                layout = Object.assign({}, measure.parentLayout);

                var  hasLayout = false;
                DIMENSIONS.forEach(function (dim) {
                    var wrap = getWrap(childIndex, measure.layout[dim].wraps);
                    if (wrap) {
                        if (wrap.elements[wrap.currentIndex].arg !== undefined ) {
                            hasLayout = true;
                            // Apply dimension
                            if (layoutIsOmitted(wrap.elements[wrap.currentIndex].arg)) {
                                delete layout[dim];
                            }
                            else {
                                layout[dim] = wrap.elements[wrap.currentIndex].measure;
                            }
                        }
                        // Apply fontSizeBase
                        if (wrap.elements[wrap.currentIndex].fontSize) {
                            layout.fontSize = wrap.elements[wrap.currentIndex].fontSize;
                        }
                    }
                });



                if (isReactLayout(child)) {
                    // if it is a react layout then
                    // pass a layout context and
                    // allow it to set its own style props
                    childIndex++;
                    return React.cloneElement(child, {
                        layoutContext: layout
                    });
                }
                else {

                    // if it didn't have a layout at all
                    // then only pass the context so that
                    // it can be passed on, however, do
                    // not set any styles
                    if (!hasLayout) {
                        childIndex++;

                        // strip off unused props
                        for (var prop in layout) {
                            if (layout.hasOwnProperty(prop) && !layout[prop]) {
                                delete layout[prop];
                            }
                        }

                        return React.cloneElement(child, {
                            layoutContext: layout
                        });
                    }

                    var layoutStyle = Object.assign({}, layout);
                    var breakpointStyle = measure.layout.styles[childIndex];

                    // resolve style
                    // we don't want min and max dims in our style
                    var style = Object.assign({}, reduceStyle(child.props.style), layoutStyle, breakpointStyle);
                    var removeProps = ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'];
                    removeProps.forEach(function (prop) {
                        if (style[prop]) {
                            delete style[prop];
                        }
                    });

                    // non-layout components need to account for margin
                    // because it won't get it's own render pass to call
                    // getLayoutContext, which accounts for margin
                    var sizeModifiers = getSizeModifiers(style, OUTER_MODIFIERS, measure.parentLayout);
                    DIMENSIONS.forEach(function (dim) {
                        if (style[dim]) {
                            style[dim] -= sizeModifiers[dim];
                        }
                    });

                    // if it only has layoutWidth or layoutHeight props
                    // but is not a true layout component, then set the
                    // style
                    childIndex++;
                    return React.cloneElement(child, {
                        layoutContext: layout,
                        style: style
                    });
                }
            };

            /**
             * Do not call React.Children.map if it is an array:
             * It seems that every time an array changed to their
             * special type of children object the keys get doubled
             * up. Besides this, it is faster to iterate the array.
             */
            return reactMap(children, processChild);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var ref = this.props;
            var component = ref.component;
            var style = ref.style;
            var extraProps = {};

            var measure = this.measureLayoutForChildren(this.props.children);
            if (measure.needsScrollbar) {
                measure = this.measureLayoutForChildren(this.props.children, {width: SCROLLBAR_WIDTH});
            }

            extraProps.style = Object.assign(reduceStyle(style) || {}, measure.containerStyle, this.getLocalLayout());
            extraProps.children = this.applyLayoutToChildren(this.props.children, measure);
            //extraProps.children = this.props.children;
            return component(Object.assign(this.props, extraProps));
        },
    };

    /*************************************************************
     * INTERNAL METHODS
     *************************************************************/
    function getWrap (index, wraps) {
        var wrap;
        var wrapsIndex = 0;
        while (!wrap && wrapsIndex < wraps.length) {
            if (wraps[wrapsIndex].elements.length < index + 1) {
                // move on to the next wrap
                index -= wraps[wrapsIndex].elements.length;
                wrapsIndex++;
            }
            else {
                // add true childindex to wrap object
                wrap = wraps[wrapsIndex];
                wrap.currentIndex = index;
            }
        }
        return wrap;
    }

    function reactForEach (children, func) {
        if (Array.isArray(children)) {
            children.forEach(func);
        }
        else if (React.isValidElement(children)) {
            func(children);
        }
        else {
            React.Children.forEach(children, func);
        }
    }

    function reactMap (children, func) {
        if (Array.isArray(children)) {
            return children.map(func);
        }
        else if (React.isValidElement(children)) {
            return func(children);
        }
        else {
            return React.Children.map(children, func);
        }
    }

    function getChildLayout (component, context) {
        var defaultSetting, definition;

        if (isReactLayout(component)) {
            defaultSetting = 'inherit';
            definition = {
                height: component.props.layoutHeight,
                width: component.props.layoutWidth,
                fontSize: component.props.layoutFontSize
            };
        }
        else {
            defaultSetting = 'omit';
            definition = {
                height: component.props.layoutHeight,
                width: component.props.layoutWidth,
                fontSize: component.props.layoutFontSize
            };

            // strip off unused props
            for (var prop in definition) {
                if (definition.hasOwnProperty(prop) && definition[prop] === null) {
                    definition[prop] = defaultSetting;
                }
                else if (definition.hasOwnProperty(prop) && definition[prop] === undefined) {
                    delete definition[prop];
                }
            }

            if (definition.fontSize && definition.fontSize === 'omit') {
                definition.fontSize = getFontSizeBase();
            }

            if (definition.width || definition.height) {
                if (!definition.width) {
                    definition.width = 'omit';
                }
                else if (!definition.height) {
                    definition.height = 'omit';
                }
                definition = Object.assign({}, getChildLayoutFromStyle(component), definition)
            }
            else {
                return getChildLayoutFromStyle(component);
                if (!definition) {
                    return;
                }
            }
        }

        if (definition.height === null) {
            definition.height = defaultSetting;
        }
        if (definition.width === null) {
            definition.width = defaultSetting;
        }

        /**
         * Apply breakpoint to definition
         */
        applyBreakpoints(component, definition, context, 'child');

        return definition;
    }

    function applyBreakpoints (component, definition, context, target) {
        // apply breakpoint layout
        if (component.props && component.props.layoutBreakpoints && component.props.layoutBreakpoints.length) {
            component.props.layoutBreakpoints.filter(function (bp) { return bp.trg === target; }).forEach(function (breakpoint) {
                var min = convertToPixels(breakpoint.min || '0px', context, breakpoint.dim);
                var max = convertToPixels(breakpoint.max || '100%', context, breakpoint.dim);

                // test range of breakpoint
                if (context[breakpoint.dim] >= min && max >= context[breakpoint.dim]) {
                    // apply pixel conversions if target is parent
                    if (target === 'parent') {
                        CONTEXT_PROPS.forEach(function (prop) {
                            if (breakpoint.ctx.hasOwnProperty(prop)) {
                                breakpoint.ctx[prop] = convertToPixels(breakpoint.ctx[prop], context, breakpoint.dim);
                            }
                        });
                    }

                    // apply breakpoint to layout context
                    Object.assign(definition, breakpoint.ctx);
                }
            });
        }
    }

    function getChildLayoutFromStyle (component) {
        if (component.props && component.props.style) {
            var style = reduceStyle(component.props.style);
            var definition = {};
            if (style.width) {
                definition.width = style.width;
            }
            else if (style.minWidth || style.maxWidth) {
                definition.width = 'flex:' + (style.minWidth || '') + ':' + (style.maxWidth || '');
            }
            if (style.height) {
                definition.height = style.height;
            }
            else if (style.minHeight || style.maxHeight) {
                definition.height = 'flex:' + (style.minHeight || '') + ':' + (style.maxHeight || '');
            }

            if (style.fontSize) {
                definition.fontSize = style.fontSize;
            }

            if (definition.height || definition.width) {
                return definition;
            }
        }
    }

    function getSizeModifiers (style, props, context) {
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
     * Ensure layout context has expected properties
     */
    function guardLayoutContext (layoutContext) {
        assert(layoutContext, 'layoutContext');
        assert(layoutContext.height, 'layoutContext.height');
        assert(layoutContext.width, 'layoutContext.width');
    }

    /**
     * Returns truthy object (treat undefined as false)
     */
    function hasReactLayout (component) {
        return (
            (component.props !== undefined && component.props !== null ?
                component.props.layoutHeight : undefined) ||
            (component.props !== undefined && component.props !== null ?
                component.props.layoutWidth : undefined) ||
            (component.constructor !== undefined && component.constructor !== null ?
                component.constructor.hasReactLayout : undefined) ||
            (component.type !== undefined && component.type !== null ?
                component.type.hasReactLayout : undefined)
        );
    }

    /**
     * Returns truthy object (treat undefined as false)
     */
    function isReactLayout (component) {
        return (
            (component.constructor !== undefined && component.constructor !== null ?
                component.constructor.hasReactLayout : undefined) ||
            (component.type !== undefined && component.type !== null ?
                component.type.hasReactLayout : undefined)
        );
    }

    /**
     * Layout is a fixed or calculable number (ie. px, em, rem, %)
     */
    function layoutIsFixed (value, context, dim) {
        //return typeof value === 'number' || !isNaN(convertToPixels(value, context));
        //return value !== undefined && !isNaN(parseFloat(value))
        return value !== undefined && !isNaN(convertToPixels(value, context, dim));
    }

    /**
     * Layout is flex, which evenly distributes any available
     * space among all flex siblings.
     */
    function layoutIsFlex (value) {
        //return value === 'flex' || getUnit(value) === '%';
        //return value === 'flex';

        return value !== undefined && value.split(':')[0] === 'flex';
    }

    function layoutIsOmitted (value) {
        return value === undefined || value === 'omit';
    }

    // var layoutIsInherited = function (value) {
    //     return value === 'inherit' ||
    //         !(
    //             layoutIsFixed(value) ||
    //             layoutIsFlex(value) ||
    //             layoutIsOmitted(value)
    //         );
    // };

    var needsFlex = function (wraps) {
        for (var i = 0; i < wraps.length; i++) {
            if (wraps[i].elements.length > 1) {
                return true;
            }
        }
        return false;
    };

    var unmanaged = function (element) {
        return element.measure === 0;
    };

    var managed = function (element) {
        return element.measure !== 0;
    };

    var needsWrap = function (wraps) {
        if (wraps.length > 1 || (wraps[0].elements.filter(unmanaged).length > 0)) {
            return true;
        }
        return false;
    };

    var needsScrollbar = function (layout, parentLayout) {
        var containedHeight = parentLayout.height;

        if (!containedHeight) {
            return false;
        }

        var overallHeight = 0;
        var childIndex = 0;

        for (var i = 0; i < layout.width.wraps.length; i++) {
            var wrapHeight = 0;
            for (var j = 0; j < layout.width.wraps[i].elements.length; j++) {
                // update max height
                var heightWrap = getWrap(childIndex, layout.height.wraps);
                var heightElement = heightWrap.elements[heightWrap.currentIndex];
                if (heightElement.measure > wrapHeight) {
                    wrapHeight = heightElement.measure;
                }

                // up the child index
                childIndex++;
            }
            overallHeight += wrapHeight;
        }

        if (overallHeight > containedHeight) {
            return true;
        }

        return false;
    };

    function assert (value, name) {
        if (value === null) {
            throw new Error('missing ' + name);
        }
    }

    function isNumber (value) {
        return typeof value === 'number';
    }

    function getUnit (str) {
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

    function getFontSizeBase () {
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

    function convertToPixels (str, context, dim) {
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

    function reduceStyle (style) {
        if (Array.isArray(style)) {
            var reduce = {};
            style.forEach(function (s) {
                Object.assign(reduce, reduceStyle(s));
            });
            return reduce;
        }
        else {
            return style;
        }
    }

    return LayoutMixin;
}));
