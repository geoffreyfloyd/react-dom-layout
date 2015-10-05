(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('../src/Layout'),
        require('../src/WindowSizeLayout')
    );
}(function (React, Layout, WindowSizeLayout) {
    'use strict';
    var Demo = React.createClass({

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <WindowSizeLayout>
                    {/* Top Half */}
                    <Layout key="top" layoutHeight="50%" style={{ border: '10px solid black', borderRadius: '10px', margin: '5px', padding: '1em' }}>
                        {/* Top Left */}
                        <Layout key="top-left-left" layoutHeight="omit" layoutWidth="50%" style={{ border: '1px solid black', margin: '20px', overflowY: 'auto' }}>
                            <Layout key="top-left" layoutFontSize="2rem" layoutWidth="flex:10rem" style={{ border: '1px solid black', margin: '5px', overflowY: 'auto' }}>
                                {range(1,15).map(function (content) {
                                    return <div layoutWidth="flex:2.5em:5em" layoutBreakpoints={[{ dim: 'width', min: '2.5em', max: '4em', fontSize: '0.25em'}]} style={{border: '1px solid black', margin: '5px', fontSize: '0.5em'}}>Content {String(content)}</div>;
                                })}
                            </Layout>
                            <Layout key="top-left-right" layoutWidth="flex:20rem" style={{ border: '1px solid black', margin: '5px' }}>
                                <div key="top-left-c" layoutWidth="flex:10rem" style={{border: '1px solid black', margin: '5px'}}>Content 1.C</div>
                                <div key="top-left-d" layoutWidth="flex:10rem" style={{border: '1px solid black', margin: '5px'}}>Content 1.D</div>
                            </Layout>
                        </Layout>
                        {/* Top Right */}
                        <Layout key="top-right" layoutWidth="50%" style={{ border: '1px solid black' }}>
                            <div>Content 2</div>
                        </Layout>
                    </Layout>
                    {/* Bottom Half */}
                    <Layout key="bottom" layoutHeight="50%" style={{ border: '1px solid black', overflowY: 'scroll' }}>
                        <Layout style={{height: '100vh'}}>
                            {range(1,1000).map(function (content) {
                                return <div layoutHeight="5em" layoutWidth="flex:5em:10em" style={{border: '1px solid black', margin: '5px', fontSize: '0.5em'}}>Content {String(content)}</div>;
                            })}
                        </Layout>
                    </Layout>
                </WindowSizeLayout>
            );
        }
    });

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
