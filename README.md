# React DOM Layout

## Getting Started

npm install --save https://github.com/geoffreyfloyd/react-dom-layout.git#master

import {Layout, LayoutMixin, WindowSizeLayout} from 'react-dom-layout';

The following CSS is required for layout to work consistently:

    *,
    *:before,
    *:after {
      -webkit-box-sizing: border-box;
         -moz-box-sizing: border-box;
              box-sizing: border-box;
    }
