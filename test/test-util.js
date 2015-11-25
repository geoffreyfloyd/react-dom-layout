(function (factory) {
    module.exports = exports = factory();
}(function () {

    /**
     * Return a style object from an inline style string (key-name:value;)
     */
    function parseStyle(inlineStyle) {
        var style = {};
        var parts = inlineStyle.split(';');

        var dashNamePattern = /-[a-z]/g;

        parts.forEach(function (keyval) {
            if (keyval.trim().length > 0) {
                var key = keyval.split(':')[0].trim();
                var val = keyval.split(':')[1].trim();

                key = key.replace(dashNamePattern, function (match) {
                    return match.slice(1).toUpperCase();
                });

                style[key] = val;
            }
        });

        return style;
    }

    return {
        parseStyle: parseStyle
    };
}));