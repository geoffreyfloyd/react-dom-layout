(function (factory) {
    var React = require('react/addons'),
        TestUtils = React.addons.TestUtils,
        core = require('../src/core'),
        WindowSizeLayout = require('../src/WindowSizeLayout'),
        Layout = require('../src/Layout'),
        SplitLayout = require('../src/SplitLayout');

    module.exports = exports = factory(
        React, TestUtils, core, WindowSizeLayout, Layout, SplitLayout
    );
}(function (React, TestUtils, core, WindowSizeLayout, Layout, SplitLayout) {

    var layoutSplit = TestUtils.renderIntoDocument(
        <WindowSizeLayout id="rootLayout">
            <SplitLayout id="firstLayout" style={{margin: '1px'}}>
                <div layoutHeight="inherit" layoutWidth="inherit" id="firstLayoutChild">one</div>
                <div layoutHeight="inherit" layoutWidth="inherit" id="secondLayoutChild">one</div>
            </SplitLayout>
        </WindowSizeLayout>
    );

    describe("SplitLayout", function () {

        var width1, width2;

        TestUtils.findAllInRenderedTree(layoutSplit, function (component) {
            if (component.props.id === 'firstLayoutChild' && TestUtils.isCompositeComponent(component)) {
                width1 = component.props.style.width;
            }
            else if (component.props.id === 'secondLayoutChild' && TestUtils.isCompositeComponent(component)) {
                width2 = component.props.style.width;
            }
        });

        it('should equally divide available space', function () {
            expect(width1).to.be.above(0);
            expect(width2).to.be.above(0);
            expect(width1).to.equal(width2);
        });
    });

}));