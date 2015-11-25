# React DOM Layout [![Build Status](https://travis-ci.org/geoffreyfloyd/react-dom-layout.svg)](https://travis-ci.org/geoffreyfloyd/react-dom-layout)

Sensible React-DOM Layout. Done Better.

## Why write another layout engine?

After analyzing what solutions were available in the world of React for DOM layout, I found some great ideas and promising beginnings, however, they all required far too many expectations and only worked in the simplest of use-cases.

From only supporting pixel-based measurements to not accounting for borders, margins, and paddings, they hinder the designer by forcing unintuitive layout definitions.

What I really needed was a layout engine that easily enabled sensible layouts without making the designer think differently about it.

## How it works

Layout components (any react component that has the LayoutMixin applied) are responsible for laying out children within its container size, which is determined by the following properties:

- layoutWidth
- layoutHeight
- layoutVisible
- layoutBreakpoints


The value of layoutHeight and layoutWidth can be set to `flex`, `omit`, or a fixed/relative size, such as:

- "20px"
- "2em" - based on the current font size
- "0.5rem" - based on the root font size
- "50%" - percent based on same dimension of the parent layout
- "50%h" - percent based on height of the parent layout
- "50%w" - percent based on width of the parent layout
- "10vh" - percent based on height of the root layout
- "10vw" - percent based on width of the root layout

Additionally, "flex" supports minimum and maximum dimensions, in the format "flex:min:max", such as:

- "flex:2em" - minimum of 2em, no maximum.
- "flex::10em" - no minimum, maximum of 10em.
- "flex:2em:50%" - minimum of 2em, maximum 50% of the parent layout dimension.

### Conditional Layouts

When the layout depends on conditional factors, such as the size of the parent, then you can utilize a property named `layoutBreakpoints`. This property expects an array of objects containing two properties:

    ie. { when: 'parent.width >= 800', then: { visible: true }}

Property when is expected to be a string containing a truthy expression that references an object with dot notation. Currently, the only supported context objects are `parent` and `self`.

The properties that can be referenced are: `height`, `width`, `fontSize`, and `visible`.

The following equation operands are supported:

    - = or == or === : left side of equation equals right side
    - > : left side of equation is greater than right side
    - < : left side of equation is less than right side
    - >= : left side of equation is greater than or equal to right side
    - <= : left side of equation is less than or equal to right side
    - >=< or >==< : left side of equation is within inclusive range of two values separated by ':' (ie. parent.width >=< 50:250)
    - >< : left side of equation is within exclusive range of two values separated by ':' (ie. parent.width >< 50:250)

`then` is expected to be an object of properties to be applied if `when` evaluates to true. Supported properties are:

    - height
    - width
    - visible
    - fontSize
    - style

Except for style, all the properties affect and follow the same rules as the layout* properties, as opposed to the CSS style properties of the same name.

Note that when the context is `self`, the layout of `self` has already been determined, so only style can be applied from `then`.

### Relational Units and Font Size

Designers tend to rely heavily on 'rem' and 'em' units of measurement. In order to correctly calculate ems in its current scope (assuming font-size has changed from its base size defined in 'html' or 'body'), we can set the font size with a property named `layoutFontSize`.

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

Check out the demo for a self-explanatory example of how to use the components:
http://geoffreyfloyd.github.io/react-dom-layout/

The following common CSS reset selector is required for layout to work consistently across major browsers:

    *,
    *:before,
    *:after {
      -webkit-box-sizing: border-box;
         -moz-box-sizing: border-box;
              box-sizing: border-box;
    }

    body {
      margin: 0;
    }

## Recently Added Features

- Detect Scrollbars to dynamically apply overflow and affect available dimensions
- Layout Breakpoints: apply styles, font sizes, and layout rules based on dimensional ranges
- Style Array Support: the React.js community favors style arrays (such as used in Radium)

## Upcoming Features

- Support Simple Calculations (50%-2rem)
- Support Complex Variable & Decision-Based Calculations (layoutFontSize="w<5rem?0.5rem:1rem")

## Credits

While I drew upon the ideas of many layout engines I've worked with over the years, the following code was used as a base point to hit the ground running. Many thanks, and I hope that others will in turn find use from my endeavors, or evolve it to overcome future obstacles:

https://github.com/jsdf/react-layout
