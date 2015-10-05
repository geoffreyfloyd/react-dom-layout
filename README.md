# React DOM Layout

Sensible React-DOM Layout. Done Better.

## Why write another layout engine?

After analyzing what solutions were available in the world of React for DOM layout, I found some
great ideas and promising beginnings, however, they all required far too many expectations
and only worked in the simplest of use-cases.

From only supporting pixel-based measurements to not accounting for borders, margins, and paddings, they hinder the designer by forcing unintuitive layout definitions.

What I really needed was a layout engine that easily enabled sensible layouts without making the designer think differently.

## How it works



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
- Layout Breakpoints: apply styles, font sizes, and rules based on dimensional ranges
- Support Simple Calculations (50%-2rem)
- Support Complex Variable & Decision-Based Calculations (layoutFontSize="w<5rem?0.5rem:1rem")
