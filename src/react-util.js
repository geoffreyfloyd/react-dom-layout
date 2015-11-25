(function (factory) {
    module.exports = exports = factory(
        require('react')
    );
}(function (React) {

    /**
     * Safely iterate any known react children structure
     */
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

    /**
     * Safely map any known react children structure
     */
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

    /**
     * Reduce an array of objects into one style object
     * (React cannot yet natively handle style arrays)
     */
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

    return {
        reactForEach: reactForEach,
        reactMap: reactMap,
        reduceStyle: reduceStyle
    };
}));
