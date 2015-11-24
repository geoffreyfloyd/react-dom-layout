(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('../src/Layout'),
        require('../src/SplitLayout'),
        require('../src/WindowSizeLayout')
    );
}(function (React, Layout, SplitLayout, WindowSizeLayout) {
    'use strict';
    var Demo = React.createClass({

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var breakpoints = [
                { when: 'parent.width <= 15rem', then: {width: 'flex:5rem:7.5rem', style: { fontSize: '0.75rem', color: 'red'}}},
                { when: 'parent.width >=< 15rem:20rem', then: {width: 'flex:7.5rem:10rem', style: { fontSize: '0.75rem', color: 'green'}}},
                { when: 'parent.width >=< 25rem:30rem', min: '25rem', max: '30rem', then: {width: 'flex:12.5rem:15rem', style: { fontSize: '0.75rem', color: 'blue'}}},
                { when: 'parent.width > 30rem', then: {width: 'flex:15rem:30rem', style: { fontSize: '0.75rem', color: 'purple'}}},
                { when: 'self.width > 800px', then: {style: { fontSize: '0.75rem', color: 'orange'}}},
            ];
            return (
                <WindowSizeLayout style={styles.border}>
                    <SplitLayout flex="flex:400px" containerStyle={styles.border}>
                        <div style={styles.border}>one</div>
                        <div style={styles.border}>two</div>
                    </SplitLayout>
                </WindowSizeLayout>
            );
        },
        renderOld: function () {
            return (
                <WindowSizeLayout>
                    {/* Top Half */}
                    <Layout key="top" layoutHeight="50%" style={{ border: '10px solid black', borderRadius: '10px', margin: '5px', padding: '1em' }}>
                        {/* Top Left */}
                        <Layout key="top-left" layoutHeight="omit" layoutWidth="50%" style={{ border: '1px solid black', margin: '20px' }}>
                            <Layout key="top-left-inner" layoutFontSize="2rem" layoutWidth="flex:10rem" style={{ border: '1px solid black', margin: '5px' }}>
                                {range(1,15).map(function (content, index) {
                                    return <div key={index} layoutWidth="flex:2.5rem:5rem" layoutBreakpoints={breakpoints} style={{border: '1px solid black', margin: '5px'}}>Content {String(content)}</div>;
                                })}
                            </Layout>
                        </Layout>
                        {/* Top Right */}
                        <Layout key="top-right" layoutWidth="50%" layoutVisible={false} layoutBreakpoints={[{when: 'parent.width > 1000px', then: { visible: true }}]} style={{ border: '1px solid black' }}>
                            <div>Content 2</div>
                        </Layout>
                    </Layout>
                    {/* Bottom Half */}
                    <Layout key="bottom" layoutHeight="50%" style={{ border: '1px solid black' }}>
                    {range(1,1000).map(function (content, index) {
                        return <div key={index} layoutHeight="5em" layoutWidth="flex:5em:10em" style={{border: '1px solid black', margin: '5px'}}>Content {String(content)}</div>;
                    })}
                    </Layout>
                </WindowSizeLayout>
            );
        }
    });

    var styles = {
        border: {
            border: '1px solid black'
        }
    };

    var range = function (start, end) {
        if (end === undefined) {
            end = start;
            start = 1;
        }

        var rng = [];
        for (var i = start; i <= end; i++) {
            rng.push(i);
        }
        return rng;
    };

    // make accessible for browser initialization
    if (window) {
        React.render(React.createElement(Demo), document.getElementById('demo'));
    }

    return Demo;
}));
