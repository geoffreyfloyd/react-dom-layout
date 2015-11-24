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

    var layoutCore = TestUtils.renderIntoDocument(
        <WindowSizeLayout id="rootLayout">
            <Layout>
            </Layout>
            <SplitLayout>
            </SplitLayout>
            <div>
            </div>
        </WindowSizeLayout>
    );

    describe("Core", function () {
        it('should recognize a WindowSizeLayout as a React DOM Layout component', function () {
            var windowSizeLayout = TestUtils.scryRenderedComponentsWithType(layoutCore, WindowSizeLayout)[0];
            expect(core.isLayout(windowSizeLayout) || false).to.be.true;
        });

        it('should recognize a Layout as a React DOM Layout component', function () {
            var layout = TestUtils.scryRenderedComponentsWithType(layoutCore, Layout)[0];
            expect(core.isLayout(layout) || false).to.be.true;
        });

        it('should recognize a SplitLayout as a React DOM Layout component', function () {
            var splitLayout = TestUtils.scryRenderedComponentsWithType(layoutCore, SplitLayout)[0];
            expect(core.isLayout(splitLayout) || false).to.be.true;
        });

        it('should recognize a div as NOT a React DOM Layout component', function () {
            var div = TestUtils.scryRenderedComponentsWithType(layoutCore, React.DOM.div)[0];
            expect(core.isLayout(div) || false).to.be.false;
        });
    });
}));