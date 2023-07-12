<h1 align="center" style="text-align:center">psap 🌀</h1>
<br>
<p align="center" style="text-align:center">psap for "pretty gsap" is a gsap-like web animation library with a small footprint.</p>
<br>
<br>

## Packages

| Package                                       | Version                                                                                                    | Size |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |------|
| [@wbe/psap](packages/psap/README.md)         | [![version](https://badge.fury.io/js/%40psap%2Fpsap.svg)](https://badge.fury.io/js/%40psap%2Fpsap)         | x    |
| [@wbe/interpol](packages/interpol/README.md) | [![version](https://badge.fury.io/js/%40psap%2Finterpol.svg)](https://badge.fury.io/js/%40psap%2Finterpol) | x |

## Why

Because gsap is a great library but too big for some projects, psap is a small alternative
witch provides (almost) the same global API (tween, timeline, easing, ...) but not all the features.

## Install

Install this package with npm:

```shell
$ npm i @wbe/psap
```

## Workflow

```shell
# Install dependencies
pnpm i

# Build and watch lib changes
pnpm run build:watch

# Start all examples dev-server
pnpm run dev

# Start tests and watch
pnpm run test:watch
```

## License

See the LICENSE file for license rights and limitations (MIT).
