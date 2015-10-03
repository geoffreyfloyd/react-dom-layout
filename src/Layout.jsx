(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./LayoutMixin')
    );
}(function (React, LayoutMixin) {
    var Layout = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [LayoutMixin]
    });

    return Layout;
}));
