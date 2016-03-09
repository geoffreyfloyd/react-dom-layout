(function (factory) {
    var React = require('react'),
        ReactTestUtils = require('react-addons-test-utils'),
        core = require('../src/core'),
        testUtils = require('./test-util'),
        WindowSizeLayout = require('../src/WindowSizeLayout'),
        Layout = require('../src/Layout'),
        SplitLayout = require('../src/SplitLayout');

    module.exports = exports = factory(
        React, ReactTestUtils, core, testUtils, WindowSizeLayout, Layout, SplitLayout
    );
}(function (React, ReactTestUtils, core, testUtils, WindowSizeLayout, Layout, SplitLayout) {

    var layoutCore = ReactTestUtils.renderIntoDocument(
        <WindowSizeLayout id="rootLayout">
            <Layout style={[{color: 'red'}, {background: 'blue'}]}>
            </Layout>
            <SplitLayout>
            </SplitLayout>
            <div>
            </div>
        </WindowSizeLayout>
    );

    describe("Core", function () {
        it('should recognize a WindowSizeLayout as a React DOM Layout component', function () {
            var windowSizeLayout = ReactTestUtils.scryRenderedComponentsWithType(layoutCore, WindowSizeLayout)[0];
            expect(core.isLayout(windowSizeLayout) || false).to.be.true;
        });

        it('should recognize a Layout as a React DOM Layout component', function () {
            var layout = ReactTestUtils.scryRenderedComponentsWithType(layoutCore, Layout)[0];
            expect(core.isLayout(layout) || false).to.be.true;
        });

        it('should recognize a SplitLayout as a React DOM Layout component', function () {
            var splitLayout = ReactTestUtils.scryRenderedComponentsWithType(layoutCore, SplitLayout)[0];
            expect(core.isLayout(splitLayout) || false).to.be.true;
        });

        it('should recognize a div as NOT a React DOM Layout component', function () {
            var div = ReactTestUtils.scryRenderedComponentsWithType(layoutCore, React.DOM.div)[0];
            expect(core.isLayout(div) || false).to.be.false;
        });

        it('should reduce a style array and apply to DOM component', function () {
            var layoutStyleArray = ReactTestUtils.scryRenderedComponentsWithType(layoutCore, Layout)[0];
            var style = testUtils.parseStyle(layoutStyleArray.getDOMNode().getAttribute('style'));
            expect(style.color).to.equal('red');
            expect(style.background).to.equal('blue');
        });
    });
}));
