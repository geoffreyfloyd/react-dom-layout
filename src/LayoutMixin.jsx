(function (factory) {
    module.exports = exports = factory(
        require('react')
    );
}(function (React) {
    // many thanks to https://github.com/jsdf/react-layout for base of layout logic

    var DIMENSIONS = ['height', 'width'];
    var PARENT_CONTEXT = ['border', 'padding'];
    var THIS_CONTEXT = ['margin'];
    var SIDES = ['Top', 'Right', 'Bottom', 'Left'];
    var getRootLayoutContext;

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
        getParentContext: function () {
            var layoutContext = Object.assign({}, this.getLayoutContext());

            if (this.props.style) {
                var sizeModifiers = getSizeModifiers(this.props.style, PARENT_CONTEXT, layoutContext.fontSize);
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim]) {
                        layoutContext[dim] -= sizeModifiers[dim];
                    }
                });
            }

            return layoutContext;
        },

        getLayoutContext: function () {
            var layoutContext = {};

            if (this.getRootLayoutContext) {
                layoutContext = this.getRootLayoutContext();
                layoutContext = Object.assign({fontSize: getFontSizeBase()}, layoutContext);
                // register root
                getRootLayoutContext = this.getRootLayoutContext.bind(this);
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

                // set the font size for ems
                if ((inherited && this.props && this.props.layoutFontSize) ||
                    (this.props.style && this.props.style.fontSize))
                {
                    layoutContext.fontSize = convertToPixels(
                        (this.props.style.fontSize || this.props.layoutFontSize), undefined, layoutContext.fontSize);
                }
            }

            if (this.props.style) {
                var sizeModifiers = getSizeModifiers(this.props.style, THIS_CONTEXT, layoutContext.fontSize);
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim]) {
                        layoutContext[dim] -= sizeModifiers[dim];
                    }
                });
            }

            return layoutContext;
        },

        getLocalLayout: function () {
            var layoutContext;
            var local;

            local = {};
            layoutContext = this.getLayoutContext();
            guardLayoutContext(layoutContext);
            //TODO: when should we use getLayoutDef over getLayoutContext?
            //var def = getLayoutDef(this);
            if (layoutContext) {
                local.fontSize = layoutContext.fontSize;
                DIMENSIONS.forEach(function (dim) {
                    if (layoutContext[dim]) {
                        local[dim] = layoutContext[dim];
                    }
                });
            }
            return local;
        },

        measureLayoutForChildren: function (children) {
            var parentLayout, precalc, childrenCount, shareWidth;
            parentLayout = this.getParentContext();
            guardLayoutContext(parentLayout);

            // wrap
            var newWrap = function (available) {
                return {
                    available: available,
                    rejected: 0,
                    layouts: [],
                    measures: [],
                    flexChildren: 0
                };
            };

            precalc = DIMENSIONS.reduce(function (precalc, dim) {
                precalc[dim] = {
                    fixedSum: 0,
                    flexChildren: 0,
                    wraps: [newWrap(parentLayout[dim])]
                };
                return precalc;
            }, {});

            childrenCount = 0;
            shareWidth = false;

            // Measure
            reactForEach(children, function (child) {
                var def;
                if (!child) {
                    return;
                }

                childrenCount++;

                def = getLayoutDef(child);
                if (!def) {
                    return;
                }

                DIMENSIONS.forEach(function (dim) {
                    // get currect wrap
                    var wrap = precalc[dim].wraps[precalc[dim].wraps.length - 1];

                    var min = 1;
                    var flexChildren = 0;

                    if (layoutIsFixed(def[dim], parentLayout[dim], parentLayout.fontSize)) {
                        // fixed is min
                        min = convertToPixels(def[dim], parentLayout[dim], parentLayout.fontSize);

                        // deprecated
                        precalc[dim].fixedSum += min;
                        if (dim === 'width' && min < parentLayout[dim]) {
                            shareWidth = true;
                        }
                    }
                    else if (layoutIsFlex(def[dim])) {
                        // check for flex min
                        var flexParams = def[dim].split(':');
                        if (flexParams.length > 1 && flexParams[1] !== '') {
                            min = convertToPixels(flexParams[1], parentLayout[dim], parentLayout.fontSize);
                        }
                        flexChildren++;

                        // deprecated
                        precalc[dim].flexChildren++;
                        if (dim === 'width') {
                            shareWidth = true;
                        }
                    }
                    else if (def[dim] === 'inherit') {
                        min = parentLayout[dim];
                    }
                    else if (def[dim] === undefined || def[dim] === 'omit') {
                        min = 0;
                    }

                    // if we don't have enough space and at least one
                    // element has been layed out in this wrap, then
                    // it's time for a new wrap
                    if (wrap.layouts.length > 0 && wrap.available < min) {
                        wrap = newWrap(parentLayout[dim]);
                        precalc[dim].wraps.push(wrap);
                    }

                    // add measure and layout to the wrap
                    wrap.available -= min;
                    wrap.measures.push(min);
                    wrap.layouts.push(def[dim]);
                    wrap.flexChildren += flexChildren;
                });
            });

            // second pass
            DIMENSIONS.forEach(function (dim) {
                precalc[dim].wraps.forEach(function (wrap) {
                    if (wrap.flexChildren > 0) {

                        // distribute (first pass)
                        var evenDistrib = wrap.available / wrap.flexChildren;
                        for (var i = 0; i < wrap.layouts.length; i++) {
                            if (layoutIsFlex(wrap.layouts[i])) {

                                var flexArgs = wrap.layouts[i].split(':');
                                if (flexArgs.length > 2 && flexArgs[2] !== '') {
                                    var max = convertToPixels(flexArgs[2], parentLayout[dim], parentLayout.fontSize);
                                    if (max < evenDistrib) {
                                        wrap.flexChildren--;
                                        wrap.measures[i] += max;
                                        wrap.available -= max;
                                    }
                                    else {
                                        wrap.measures[i] += evenDistrib;
                                        wrap.available -= evenDistrib;
                                    }
                                }
                                else {
                                    wrap.measures[i] += evenDistrib;
                                    wrap.available -= evenDistrib;
                                }
                            }
                        }

                        // second pass, if needed
                        if (wrap.flexChildren > 0 && wrap.available > 0.0) {
                            evenDistrib = wrap.available / wrap.flexChildren;
                            for (var i = 0; i < wrap.layouts.length; i++) {
                                if (layoutIsFlex(wrap.layouts[i])) {
                                    wrap.measures[i] += evenDistrib;
                                    wrap.available -= evenDistrib;
                                }
                            }
                        }
                    }
                });
            });

            var containerStyle = {};
            if (shareWidth && childrenCount > 1) {
                containerStyle.display = 'flex';
                // todo: might add wrap prop only if sum of widths are detected to
                // be greater than the parent
                containerStyle.flexWrap = 'wrap';
            }

            return {
                parentLayout: parentLayout,
                precalc: precalc,
                containerStyle: containerStyle
            };
        },

        applyLayoutToChildren: function (children, measure) {
            var childIndex = 0;
            var processChild = function (child) {
                var def;
                var layout;
                if (!(child !== undefined && child !== null ? child.props : undefined)) {
                    childIndex++;
                    return child;
                }
                if (child.props.ref !== undefined && child.props.ref !== null) {
                    childIndex++;
                    return child;
                }

                layout = Object.assign({}, measure.parentLayout);
                def = getLayoutDef(child);

                // child has no layout props,
                // do not modify it
                if (!def) {
                    //return child;
                    childIndex++;
                    return React.cloneElement(child, {
                        layoutContext: layout
                    });
                }

                DIMENSIONS.forEach(function (dim) {
                    var wrap = getWrap(childIndex, measure.precalc[dim].wraps);

                    if (layoutIsFixed(def[dim], measure.parentLayout[dim], measure.parentLayout.fontSize)) {
                        layout[dim] = wrap.measures[wrap.currentIndex];
                    }
                    else if (layoutIsFlex(def[dim])) {
                        layout[dim] = wrap.measures[wrap.currentIndex];
                    }
                    else if (layoutIsOmitted(def[dim])) {
                        delete layout[dim];
                    }
                });

                childIndex++;



                if (isReactLayout(child)) {
                    // if it is a react layout then
                    // pass a layout context and
                    // allow it to set its own style props
                    return React.cloneElement(child, {
                        layoutContext: layout
                    });
                }
                else {


                    // don't pass fontsize layout context to
                    // the style, it's already inherited by the parent
                    var styleLayout = Object.assign({}, layout);
                    if (styleLayout.fontSize) {
                        delete styleLayout.fontSize;
                    }

                    // resolve style
                    // we don't want min and max dims in our style
                    var style = Object.assign({}, child.props.style, styleLayout);
                    var removeProps = ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'];
                    removeProps.forEach(function (prop) {
                        if (style[prop]) {
                            delete style[prop];
                        }
                    });

                    // non-layout components need to account for margin
                    // because it won't get it's own render pass to call
                    // getLayoutContext, which accounts for margin
                    var sizeModifiers = getSizeModifiers(style, THIS_CONTEXT);
                    DIMENSIONS.forEach(function (dim) {
                        if (style[dim]) {
                            style[dim] -= sizeModifiers[dim];
                        }
                    });

                    // if it only has layoutWidth or layoutHeight props
                    // but is not a true layout component, then set the
                    // style
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
        render: function() {
            var ref = this.props;
            var component = ref.component;
            var style = ref.style;
            var extraProps = {};

            var measure = this.measureLayoutForChildren(this.props.children);
            extraProps.style = Object.assign(style || {}, measure.containerStyle, this.getLocalLayout());
            extraProps.children = this.applyLayoutToChildren(this.props.children, measure);
            //extraProps.children = this.props.children;
            return component(Object.assign(this.props, extraProps));
        },
    };

    /*************************************************************
     * INTERNAL METHODS
     *************************************************************/
    function getWrap(index, wraps) {
        var wrap;
        var wrapsIndex = 0;
        while (!wrap && wrapsIndex < wraps.length) {
            if (wraps[wrapsIndex].layouts.length < index + 1) {
                // move on to the next wrap
                index -= wraps[wrapsIndex].layouts.length;
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
        // else if (children instanceof React.ReactElement) {
        //     func(children);
        // }
        else {
            React.Children.forEach(children, func);
        }
    }

    function reactMap (children, func) {
        if (Array.isArray(children)) {
            return children.map(func);
        }
        // else if (children instanceof React.ReactElement) {
        //     return func(children);
        // }
        else {
            return React.Children.map(children, func);
        }
    }

    function getLayoutDef (component) {
        var definition;
        var defaultSetting;
        if (!hasReactLayout(component)) {
            // hold your horses, we're not giving up on laying out this
            // component just yet, let's check the style props
            return getLayoutDefFromStyle(component);
        }
        if (isReactLayout(component)) {
            defaultSetting = 'inherit';
        }
        else {
            defaultSetting = 'omit';
        }
        definition = {
            height: component.props.layoutHeight,
            width: component.props.layoutWidth
        };
        if (definition.height === null) {
            definition.height = defaultSetting;
        }
        if (definition.width === null) {
            definition.width = defaultSetting;
        }
        return definition;
    }

    function getLayoutDefFromStyle (component) {
        if (component.props && component.props.style) {
            var style = component.props.style;
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

            if (definition.height || definition.width) {
                return definition;
            }
        }
    }

    function getSizeModifiers (style, props, context, fontSize) {
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
                    sides.top = sides.right = sides.bottom = sides.left = convertToPixels(mod[0], context, fontSize);
                }
                else { //padding, margin
                    if (mod.length > 2) {
                        sides.top = convertToPixels(mod[0], context, fontSize);
                        sides.bottom = convertToPixels(mod[2], context, fontSize);
                    }
                    else {
                        sides.top = sides.right = sides.bottom = sides.left = convertToPixels(mod[0], context, fontSize);
                    }

                    if (mod.length > 1) {
                        if (mod.length > 3) {
                            sides.right = convertToPixels(mod[1], context, fontSize);
                            sides.left = convertToPixels(mod[3], context, fontSize);
                        }
                        else {
                            sides.right = sides.left = convertToPixels(mod[1], context, fontSize);
                        }
                    }
                }
            }

            SIDES.forEach(function (side) {
                if (style.hasOwnProperty(prop + side)) {
                    sides[side.toLowerCase()] = convertToPixels(style[prop + side].split(' ')[0], context, fontSize);
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
    function layoutIsFixed (value, context, fontSize) {
        //return typeof value === 'number' || !isNaN(convertToPixels(value, context));
        //return value !== undefined && !isNaN(parseFloat(value))
        return value !== undefined && !isNaN(convertToPixels(value, context, fontSize));
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

    function assert (value, name) {
        if (value === null) {
            throw new Error("missing " + name);
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
            else if (str.slice(str.length - 1) === '%') {
                unit = '%';
            }
        }
        return unit;
    }

    var fontSizeBase;
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

    function convertToPixels (str, context, fontSize) {
        if (isNumber(str)) {
            return str;
        }

        var unit = getUnit(str);
        if (unit === 'rem') {
            return parseFloat(str) * getFontSizeBase();
        }
        else if (unit === 'em') {
            if (!fontSize) {
                console.warn('em used root font size (body), because it was not supplied the scoped font size.');
            }
            return parseFloat(str) * (fontSize || getFontSizeBase());
        }
        else if (unit === 'vh') {
            return getRootLayoutContext().height * (parseFloat(str) / 100);
        }
        else if (unit === 'vw') {
            return getRootLayoutContext().width * (parseFloat(str) / 100);
        }
        else if (unit === '%') {
            if (context === undefined || context === null) {
                return NaN;
            }
            else {
                return context * (parseFloat(str) / 100);
            }
        }
        else {
            return parseFloat(str);
        }
    }

    return LayoutMixin;
}));
