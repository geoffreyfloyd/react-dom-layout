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

    var layoutSplit = TestUtils.renderIntoDocument(
        <WindowSizeLayout>
            <SplitLayout id="firstLayout" style={{margin: '1px'}}>
                <div layoutHeight="inherit" layoutWidth="inherit" id="firstLayoutChild">one</div>
                <div layoutHeight="inherit" layoutWidth="inherit" id="secondLayoutChild">one</div>
            </SplitLayout>
        </WindowSizeLayout>
    );

    describe("SplitLayout", function () {
        // Asserting behavior with split layout
        var width1, width2;
        TestUtils.findAllInRenderedTree(layoutSplit, function (component) {
            if (component.props.id === 'firstLayoutChild') {
                width1 = component.props.style.width;
            }
            else if (component.props.id === 'secondLayoutChild') {
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