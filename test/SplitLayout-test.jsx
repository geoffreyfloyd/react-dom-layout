(function (factory) {
    var React = require('react'),
        ReactTestUtils = require('react-addons-test-utils'),
        core = require('../src/core'),
        WindowSizeLayout = require('../src/WindowSizeLayout'),
        Layout = require('../src/Layout'),
        SplitLayout = require('../src/SplitLayout');

    module.exports = exports = factory(
        React, ReactTestUtils, core, WindowSizeLayout, Layout, SplitLayout
    );
}(function (React, ReactTestUtils, core, WindowSizeLayout, Layout, SplitLayout) {
    var width1, width2;
    var getWidth1 = function (ref) {
        width1 = ref.props.style.width;
    };
    var getWidth2 = function (ref) {
        width2 = ref.props.style.width;
    };
    var layoutSplit = ReactTestUtils.renderIntoDocument(
        <WindowSizeLayout id="rootLayout">
            <SplitLayout id="firstLayout" style={{margin: '1px'}}>
                <div layoutHeight="inherit" layoutWidth="inherit" ref={getWidth1}>one</div>
                <div layoutHeight="inherit" layoutWidth="inherit" ref={getWidth2}>one</div>
            </SplitLayout>
        </WindowSizeLayout>
    );

    describe("SplitLayout", function () {
        
        // ReactTestUtils.findAllInRenderedTree(layoutSplit, function (component) {
        //     if (ReactTestUtils.isDOMComponent(component) && component.props.style !== void 0) {
        //         console.log(component.props.style);
        //         //widths.push(component.props.style.width);
        //     }
        // });

        it('should equally divide available space', function () {
            expect(width1).to.be.above(0);
            expect(width2).to.be.above(0);
            expect(width1).to.equal(width2);
        });
    });

}));