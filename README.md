<div align="center">
<h1>react-stagger</h1>

<p>React component for staggered rendering.</p>
</div>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![PRs Welcome][prs-badge]][prs]
[![All Contributors][contributers-badge]](#contributors)
[![Code of Conduct][coc-badge]][coc]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

When building websites and apps with designers, we want things to flow
smoothly. This often involves making things appear with a staggering effect,
i.e. one at a time.

Doing this in React can be tricky. React encourages component isolation which
can make it difficult to coordinate animation across components, especially
when they are deeply nested.

## This solution

React Stagger provides a low-level Transition-like `Stagger` component that
calculates a rendering delay based on other Stagger instances.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Installation](#installation)
* [Usage](#usage)
  * [Nesting](#nesting)
  * [Stagger on scroll](#stagger-on-scroll)
  * [Advanced: Delay collapse](#advanced-delay-collapse)
* [Inspiration](#inspiration)
* [LICENSE](#license)
* [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```bash
npm install --save react-stagger
```

## Usage

```javascript
import React from 'react'
import {render} from 'react-dom'
import Stagger from 'react-stagger'

render(
  <>
    <Stagger>{({delay}) => <p>{delay}ms</p>}</Stagger>
    <Stagger>{({delay}) => <p>{delay}ms</p>}</Stagger>
    <Stagger delay={200}>{({delay}) => <p>{delay}ms</p>}</Stagger>
  </>,
  document.getElementById('root'),
)

// Renders:
// 0ms
// 100ms
// 300ms
```

`Stagger` does not render anything by itself. Instead, it maintains a rendering
delay across elements and passes it to the render function.

The `Stagger` component can be abstracted with another component that handles
the actual animation:

```javascript
const Appear = ({ children, in, delay = 100 }) =>
  <Stagger in={in} delay={delay}>
    {({ value, delay }) =>
      <div
        style={{
          opacity: value ? 1 : 0,
          transition: `opacity 300ms ${delay}ms`,
        }}
      >
        {children}
      </div>
    }
  </Stagger>
```

You can combine `Stagger` similarly with most React animation libraries,
including [`react-transition-group`][react-transition-group] and
[`react-motion`][react-motion].

Stagger can be used anywhere in the component tree:

```javascript
const ImageGallery = images => (
  <section>
    {images.map(image => (
      <Appear>
        <img src={image.src} alt={image.alt} />
      </Appear>
    ))}
  </section>
)

const Page = ({title, subtitle, images}) => (
  <article>
    <Appear>
      <h1>{title}</h1>
    </Appear>
    <Appear>
      <p>{subtitle}</p>
    </Appear>
    <ImageGallery images={images} />
  </article>
)
```

In this case, the title, subtitle and each image fades in, 100ms
apart.

There are two key features worth expanding on; nesting and delay collapse.

### Nesting

By wrapping a group of `Stagger` elements in a `Stagger` element higher in the
render tree, a few possibilities open up:

* Control the appearance of a whole tree of staggered elements.
* Set a delay around a group of elements.

```javascript
const Page = ({ title, subtitle, images, isReady }) =>
  {/* Start staggering only when the page is ready */}
  <Stagger in={isReady}>
    <article>
      <Appear>
        <h1>{title}</h1>
      </Appear>
      <Appear>
        <p>{subtitle}</p>
      </Appear>

      {/* Delay whole image gallery group by 500ms. */}
      <Stagger delay={500}>
        <ImageGallery images={images} />
      </Stagger>
    </article>
  </Stagger>
```

### Stagger on scroll

By combining `react-stagger` with
[`react-intersection-observer`][react-intersection-observer] or another
scroll observer, you can make elements appear with stagger as you scroll down
the page.

```javascript
import Observer from 'react-intersection-observer'

const ScrollStagger = ({children}) => (
  <Observer triggerOnce rootMargin="10vh">
    {inView => <Stagger in={inView}>{children}</Stagger>}
  </Observer>
)

const PageSection = ({title, subtitle, images}) => (
  <ScrollStagger>
    <section>
      <Appear>
        <h1>{title}</h1>
      </Appear>
      <Appear>
        <p>{subtitle}</p>
      </Appear>
      <ImageGallery images={images} />
    </section>
  </ScrollStagger>
)
```

### Advanced: Delay collapse

Delay in React Stagger works a bit like css margins. The delay is applied
before and after the element. All delay between two "leaf" Stagger elements
collapses, so the biggest delay wins.

```javascript
const renderDelay = title => ({ delay }) => <div>{title} = {delay}ms</div>

render(
  <>
    <Stagger delay={500}>{renderDelay('title')}</Stagger>
    <Stagger>{renderDelay('subtitle')}</Stagger>
    <Stagger>{renderDelay('body')}</Stagger>

    <Stagger delay={500}>
      <Stagger>{renderDelay('image')}</Stagger>
      <Stagger>{renderDelay('image')}</Stagger>
      <Stagger>{renderDelay('image')}</Stagger>
    </Stagger>

    <Stagger>{renderDelay('footer')}
  </>,
  document.getElementById('root'),
)

// Renders:         | Explanation:
// title = 0ms      | first delay collapses
// subtitle = 500ms | max(500ms (title), 100ms (subtitle))
// body = 600ms     | max(100ms (subtitle), 100ms (body))
// image = 1100ms   | max(100ms (body), 500ms (image parent), 100ms (image))
// image = 1200ms   | ...
// image = 1300ms   | ...
// footer = 1800ms  | max(100ms (image), 500ms (image parent), 100ms (footer))
```

## Inspiration

* [react-transition-group][react-transition-group]

## LICENSE

[MIT][license]

[build-badge]: https://img.shields.io/travis/aranja/react-stagger.svg?style=flat-square
[build]: https://travis-ci.org/aranja/react-stagger
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/aranja/react-stagger/blob/master/CODE_OF_CONDUCT.md
[contributers]: #contributors
[contributers-badge]: https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square
[coverage-badge]: https://img.shields.io/codecov/c/github/aranja/react-stagger.svg?style=flat-square
[coverage]: https://codecov.io/github/aranja/react-stagger
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dm/react-stagger.svg?style=flat-square
[github-star-badge]: https://img.shields.io/github/stars/aranja/react-stagger.svg?style=social
[github-star]: https://github.com/aranja/react-stagger/stargazers
[github-watch-badge]: https://img.shields.io/github/watchers/aranja/react-stagger.svg?style=social
[github-watch]: https://github.com/aranja/react-stagger/watchers
[license-badge]: https://img.shields.io/npm/l/react-stagger.svg?style=flat-square
[license]: https://github.com/aranja/react-stagger/blob/master/LICENSE
[node]: https://nodejs.org
[npm]: https://www.npmjs.com/
[npmtrends]: http://www.npmtrends.com/react-stagger
[package]: https://www.npmjs.com/package/react-stagger
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: https://github.com/aranja/react-stagger/issues
[react-intersection-observer]: https://www.npmjs.com/package/react-intersection-observer
[react-transition-group]: https://reactcommunity.org/react-transition-group
[react-motion]: https://github.com/chenglou/react-motion
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/aranja/react-stagger.svg?style=social
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20react-stagger%20by%20%40aranjastudio%20https%3A%2F%2Fgithub.com%2Faranja%2Freact-stagger%20%F0%9F%91%8D
[version-badge]: https://img.shields.io/npm/v/react-stagger.svg?style=flat-square

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/115094?v=4" width="100px;"/><br /><sub><b>Eiríkur Heiðar Nilsson</b></sub>](https://aranja.com)<br />[💻](https://github.com/aranja/react-stagger/commits?author=eirikurn "Code") [📖](https://github.com/aranja/react-stagger/commits?author=eirikurn "Documentation") [🚇](#infra-eirikurn "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/aranja/react-stagger/commits?author=eirikurn "Tests") |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
