(function (factory) {
    var React = require('react/addons'),
        TestUtils = React.addons.TestUtils,
        WindowSizeLayout = require('../src/WindowSizeLayout'),
        Layout = require('../src/Layout'),
        SplitLayout = require('../src/SplitLayout');

    module.exports = exports = factory(
        React, TestUtils, WindowSizeLayout, Layout, SplitLayout
    );
}(function (React, TestUtils, WindowSizeLayout, Layout, SplitLayout) {

    // Create a Layout component
    var layoutBorders = TestUtils.renderIntoDocument(
        <WindowSizeLayout>
            <Layout id="firstLayout" style={{border: '1px'}}>
                <div layoutHeight="inherit" id="firstLayoutChild_InheritHeightNonLayout">one</div>
                <div layoutWidth="inherit" id="firstLayoutChild_InheritWidthNonLayout">two</div>
            </Layout>
        </WindowSizeLayout>
    );

    var layoutPadding = TestUtils.renderIntoDocument(
        <WindowSizeLayout>
            <Layout id="firstLayout" style={{padding: '1px'}}>
                <div layoutHeight="inherit" id="firstLayoutChild">one</div>
            </Layout>
        </WindowSizeLayout>
    );

    var layoutMargin = TestUtils.renderIntoDocument(
        <WindowSizeLayout>
            <Layout id="firstLayout" style={{margin: '1px'}}>
                <div layoutHeight="inherit" id="firstLayoutChild">one</div>
            </Layout>
        </WindowSizeLayout>
    );

    var windowSize = layoutBorders.getRootLayoutContext();

    describe("Layout", function () {

        // Basic assertions
        it('should create', function () { expect(layoutBorders).not.to.be.null; });
        it('should have default prop - component', function () { expect(layoutBorders.props).not.to.be.null && expect(layoutBorders.props.component).not.to.be.null && expect(layoutBorders.props.component).to.equal(React.DOM.div); });
        it('should have default prop - layoutHeight', function () { expect(layoutBorders.props).not.to.be.null && expect(layoutBorders.props.layoutHeight).to.be.null; });
        it('should have default prop - layoutWidth', function () { expect(layoutBorders.props).not.to.be.null && expect(layoutBorders.props.layoutWidth).to.be.null; });

        // Asserting behavior with borders
        TestUtils.findAllInRenderedTree(layoutBorders, function (component) {
            if (component.props.id === 'firstLayout') {
                it('should inherit height and width from parent layout', function () {
                    expect(component.props.layoutContext.height).to.equal(windowSize.height);
                    expect(component.props.layoutContext.width).to.equal(windowSize.width);
                });
            }
            else if (component.props.id === 'firstLayoutChild_InheritHeightNonLayout') {
                it('should not define dimension for non-Layout component unless explicitly inherited', function () {
                    expect(component.props.style.width).to.equal(undefined);
                });
                it('should subtract from available dimension when border style is used', function () {
                    expect(component.props.style.height).to.equal(windowSize.height - 2);
                });
            }
            else if (component.props.id === 'firstLayoutChild_InheritWidthNonLayout') {
                it('should not define dimension for non-Layout component unless explicitly inherited', function () {
                    expect(component.props.style.height).to.equal(undefined);
                });
                it('should subtract from available dimension when border style is used', function () {
                    expect(component.props.style.width).to.equal(windowSize.width - 2);
                });
            }
        });
        
        // Asserting behavior with padding
        TestUtils.findAllInRenderedTree(layoutPadding, function (component) {
            if (component.props.id === 'firstLayoutChild') {
                it('should subtract from available dimension when padding style is used', function () {
                    expect(component.props.style.height).to.equal(windowSize.height - 2);
                });
            }
        });

        // Asserting behavior with margin
        TestUtils.findAllInRenderedTree(layoutMargin, function (component) {
            if (component.props.id === 'firstLayoutChild') {
                it('should subtract from available dimension when margin style is used', function () {
                    expect(component.props.style.height).to.equal(windowSize.height - 2);
                });
            }
        });
    });

}));