(function (factory) {
    'use strict';
    module.exports = exports = factory(
        require('react'),
        require('./event-handler'),
        require('./window-size-store'),
        require('./LayoutMixin')
    );
}(function (React, EventHandler, windowSizeStore, LayoutMixin) {
    'use strict';
    var WindowSizeLayout = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [LayoutMixin],
        statics: {
            refreshRoot: function () {
                windowSizeStore.refresh();
            }
        },

        /**
         * Root Window Size Layout disables scroll to handle
         * browser layout issues. Scrolling overflow (when needed)
         * should be handled in a child layout.
         */
        // getDefaultProps: function () {
        //     return {
        //         style: {
        //             overflow: 'hidden'
        //         }
        //     };
        // },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            // clear margin on body
            try {
                var margin = window.getComputedStyle(document.body).getPropertyValue('margin');
                if (margin) {
                    document.body.style.margin = '0px';
                    document.body.style.fontSize = '100%';
                }
            }
            catch (e) {
                console.error(e);
            }

            /**
            * Create a filtered event handler
            * that only looks at changes in height
            */
            this.handlers = {
                windowSizeChange: EventHandler.create()
            };

            this.handlers.windowSizeChange
                .debounce(100)
                // .distinctUntilChanged() // sometimes we want to force a refresh due to scrollbars appearing or disappearing
                .subscribe(this.handleStoreUpdate);

            // Subscribe to stores
            windowSizeStore.subscribe(this.handlers.windowSizeChange);

            // store width before render so we can detect change
            this.width = windowSizeStore.getClientSize().width;
        },
        componentDidMount: function () {
            // render once more if a scrollbar changed the client width
            if (this.width !== windowSizeStore.getClientSize().width) {
                this.handleStoreUpdate();
            }
        },
        componentWillUpdate: function () {
            // store width before render so we can detect change
            this.width = windowSizeStore.getClientSize().width;
        },
        componentDidUpdate: function () {
            // render once more if a scrollbar changed the client width
            if (this.width !== windowSizeStore.getClientSize().width) {
                this.handleStoreUpdate();
            }
        },
        componentWillUnmount: function () {
            windowSizeStore.unsubscribe(this.handlers.windowSizeChange);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleStoreUpdate: function () {
            this.setState({
                lastStoreNotify: (new Date()).toISOString()
            });
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        getRootLayoutContext: function () {
            /**
             * Funky results sometimes occur when we rely on getClientSize for height,
             * so we will only get window size until we have time to figure out when and
             * why it becomes unreliable.
             */
            return {
                height: windowSizeStore.getWindowSize().height,
                width: windowSizeStore.getClientSize().width < windowSizeStore.getWindowSize().width && Math.abs(windowSizeStore.getClientSize().width - windowSizeStore.getWindowSize().width) < 100 ?
                    windowSizeStore.getClientSize().width : windowSizeStore.getWindowSize().width
            };
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return this.renderLayout();
        }
    });

    return WindowSizeLayout;
}));
