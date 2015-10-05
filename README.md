# React DOM Layout

Sensible React-DOM Layout. Done Better.

## Why write another layout engine?

After analyzing what solutions were available in the world of React for DOM layout, I found some great ideas and promising beginnings, however, they all required far too many expectations and only worked in the simplest of use-cases.

From only supporting pixel-based measurements to not accounting for borders, margins, and paddings, they hinder the designer by forcing unintuitive layout definitions.

What I really needed was a layout engine that easily enabled sensible layouts without making the designer think differently about it.

## How it works

Layout components (any react component that has the LayoutMixin applied) are responsible for laying out children within its container size, which is determined by the following properties:

- layoutWidth
- layoutHeight

The value of these properties can be set to "flex", "omit", or a fixed/relative size, such as:

- "20px"
- "2em" - based on the current font size
- "0.5rem" - based on the root font size
- "50%" - percent based on same dimension of the parent layout
- "50%h" - percent based on height of the parent layout
- "50%w" - percent based on width of the parent layout
- "10vh" - percent based on the root layout

Additionally, "flex" supports minimum and maximum dimensions, such as:

- "flex:2em" - minimum of 2em, no maximum.
- "flex::10em" - no minimum, maximum of 10em.
- "flex:2em:50%" - minimum of 2em, maximum 50% of the parent layout dimension.

### Relational Units and Font Size

Designers tend to rely heavily on 'rem' and 'em' units of measurement. In order to correctly calculate ems in its current scope (assuming font-size has changed from its base size defined in 'html' or 'body'), we can set the font size with a property named 'layoutFontSize'.

### Relaying the Layout Context

When a react component is not itself a LayoutMixin, but contains a LayoutMixin component, you may want to pass the context to the composed component within the render definition:

    var MyAwesomeComponent = React.createClass({
        render () {
            return {
                <Layout layoutContext={this.props.layoutContext}>
                    <...></...>
                </Layout>
            }
        }  
    });

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

## Roadmap

- Detect Scrollbars to dynamically apply overflow and affect available dimensions
- ContextRelayMixin: Relay layout context from a non-layout component to a LayoutMixin child.
- Layout Breakpoints: apply styles, font sizes, and rules based on dimensional ranges
- Support Simple Calculations (50%-2rem)
- Support Complex Variable & Decision-Based Calculations (layoutFontSize="w<5rem?0.5rem:1rem")
