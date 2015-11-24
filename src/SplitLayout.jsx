(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./Layout'),
        require('./LayoutMixin')
    );
}(function (React, Layout, LayoutMixin) {
    var SplitLayout = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [LayoutMixin],
        statics: {
            orientation: {
                horizontal: 0,
                vertical: 1
            }
        },

        getDefaultProps: function () {
            return {
                orientation: 0
            };
        },

        /*************************************************************
         * RENDER
         *************************************************************/
        renderHorizontalSplit: function (props, children) {
            var widths = ['50%', '50%'];
            if (props.flex !== undefined) {
                widths[0] = props.flex;
                widths[1] = props.flex;
            }
            if (props.viewOne !== undefined) {
                widths[0] = props.flex;
            }
            if (props.viewTwo !== undefined) {
                widths[1] = props.flex;
            }

            return Layout(props, React.Children.map(children, function (child, index) {
                return Layout({
                    layoutWidth: widths[index],
                    layoutHeight: "omit",
                    style: props.containerStyle
                }, child);
            }));

            //return (
            //    <Layout layoutContext={props.layoutContext}>
            //        {React.Children.map(children, function (child, index) {
            //            return (
            //                <Layout layoutWidth={widths[index]} layoutHeight="omit" style={props.containerStyle}>
            //                    {child}
            //                </Layout>
            //            );
            //        })}
            //    </Layout>
            //);
        },

        render: function () {
            return this.renderLayout(this.renderHorizontalSplit);
        }
    });

    return SplitLayout;
}));
