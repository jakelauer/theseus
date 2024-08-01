## [15.0.1](https://github.com/jakelauer/theseus-js/compare/v15.0.0...v15.0.1) (2024-08-01)


### Bug Fixes

* **packed:** remove tests from built files ([c1f4a38](https://github.com/jakelauer/theseus-js/commit/c1f4a380e2f9b12455b200ac003f6f5e85398584))

# [15.0.0](https://github.com/jakelauer/theseus-js/compare/v14.1.0...v15.0.0) (2024-08-01)


### Bug Fixes

* **frost:** fix for old reference to renamed prop ([6ba951e](https://github.com/jakelauer/theseus-js/commit/6ba951ebf1c64d0f3e74c7fa42cb113c46e16412))
* **proxy action map:** fix requests to properties which exist on the target which have undefined values ([a4e6988](https://github.com/jakelauer/theseus-js/commit/a4e6988ecbeb2ff9b00b9e0c8e6af0b515462261))


### Features

* **evolver:** add frost and sandbox options to allow control over behavior of input data with respect to output ([59a2bb8](https://github.com/jakelauer/theseus-js/commit/59a2bb89abbcfe094da7ac3400903db18ef4d090))


### BREAKING CHANGES

* **evolver:** by default, output is frozen and sandbox mode is copy

# [14.1.0](https://github.com/jakelauer/theseus-js/compare/v14.0.1...v14.1.0) (2024-07-31)


### Features

* **evolver:** add sandbox and frost parameters to evolver creation ([34fa279](https://github.com/jakelauer/theseus-js/commit/34fa279f1b1fcda147ac6f93815a84bef7da2a7e))

## [14.0.1](https://github.com/jakelauer/theseus-js/compare/v14.0.0...v14.0.1) (2024-07-24)


### Bug Fixes

* **sandbox:** fix sandbox return type when input is readonly ([f354056](https://github.com/jakelauer/theseus-js/commit/f3540560fc28f06ebea7a356bf208f3179caab19))

# [14.0.0](https://github.com/jakelauer/theseus-js/compare/v13.0.1...v14.0.0) (2024-07-23)


### Features

* **evolver:** ensure async methods work correctly when chained ([4040fbe](https://github.com/jakelauer/theseus-js/commit/4040fbeb1ad2472ef36c5576e58f8e00014b5751))


### BREAKING CHANGES

* **evolver:** .

## [13.0.1](https://github.com/jakelauer/theseus-js/compare/v13.0.0...v13.0.1) (2024-07-23)


### Bug Fixes

* **evolver:** fix endAsync() not triggering true end functionality when triggered via EvolverComplex ([3123088](https://github.com/jakelauer/theseus-js/commit/3123088e46c141ef728ee54fcf9c5b7e5231e403))

# [13.0.0](https://github.com/jakelauer/theseus-js/compare/v12.0.11...v13.0.0) (2024-07-23)


### Bug Fixes

* **ci:** ci ([4908aba](https://github.com/jakelauer/theseus-js/commit/4908aba879ba873fb5ffbb86996bd2effe28c1e3))
* **tests:** introducing quibble, wrestling with esm ([760714b](https://github.com/jakelauer/theseus-js/commit/760714b0d64e3f59b8ed64b9dccbaf5f4d674df9))
* **tests:** missed files ([dedf27b](https://github.com/jakelauer/theseus-js/commit/dedf27b1f2bcbad0e8d1fa2eea07bae9867c0639))


### Features

* **major:** major ([ba4366f](https://github.com/jakelauer/theseus-js/commit/ba4366f4c87ee9a66d7c1c19eb1972955924071e))
* **na:** na ([3c1cbd2](https://github.com/jakelauer/theseus-js/commit/3c1cbd23447b09bea276e53853bfc0afe28a1035))


### Tests

* **vitest:** switch to vitest from mocha ([4bd8173](https://github.com/jakelauer/theseus-js/commit/4bd8173ef5dbf951cbb8e54ed90bcf8bb25b20f5))


### BREAKING CHANGES

* **na:** major
* **major:** major
* **vitest:** I'm just assuming I broke something along the way and since we're basically pre-release even at version 12 (becuase NPM won't let me reset), let's just make it a major.
