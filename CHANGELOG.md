# [10.2.0](https://github.com/jakelauer/theseus-js/compare/v10.1.4...v10.2.0) (2024-07-02)


### Features

* **sandbox:** frost detection improve ([097c3b1](https://github.com/jakelauer/theseus-js/commit/097c3b12762873cf11d4a19f6c41aebd152c88d7))

## [10.1.4](https://github.com/jakelauer/theseus-js/compare/v10.1.3...v10.1.4) (2024-07-01)


### Bug Fixes

* **sandbox:** fix sandbox detection in nested objects ([591dc33](https://github.com/jakelauer/theseus-js/commit/591dc33fceea1028505c9f8384e25de35c6889df))

## [10.1.3](https://github.com/jakelauer/theseus-js/compare/v10.1.2...v10.1.3) (2024-06-30)


### Bug Fixes

* **sandbox.cement:** fix recursive cementing ([d155739](https://github.com/jakelauer/theseus-js/commit/d155739400587869deea2ca4cf28e931dc825a3a))

## [10.1.2](https://github.com/jakelauer/theseus-js/compare/v10.1.1...v10.1.2) (2024-06-29)


### Bug Fixes

* **sandbox:** fix cement for nested sandboxes, enhance isSandbox to account for inelligible properties ([05ded9e](https://github.com/jakelauer/theseus-js/commit/05ded9e552525f10165606d6b2f75da752edfc59))
* **sandbox:** fix cement for nested sandboxes, enhance isSandbox… ([#29](https://github.com/jakelauer/theseus-js/issues/29)) ([865ba10](https://github.com/jakelauer/theseus-js/commit/865ba10d65c2dd6efc6fe47226df69b4fb8def06))

## [10.1.1](https://github.com/jakelauer/theseus-js/compare/v10.1.0...v10.1.1) (2024-06-29)


### Bug Fixes

* **sandbox:** fix for misidentification of sandbox items, add tests ([65253e3](https://github.com/jakelauer/theseus-js/commit/65253e3694e8716e80e00023fa931a82fbee380d))

# [10.1.0](https://github.com/jakelauer/theseus-js/compare/v10.0.2...v10.1.0) (2024-06-27)


### Bug Fixes

* **missed files:** missed files ([aa506b7](https://github.com/jakelauer/theseus-js/commit/aa506b72743785055e44f7ad055de47045b531a5))


### Features

* **frost:** allow defrosting of a frosted object ([fd2d9de](https://github.com/jakelauer/theseus-js/commit/fd2d9de9b2bbb20ad8c00139d71ede0c4d3edf3d))

## [10.0.2](https://github.com/jakelauer/theseus-js/compare/v10.0.1...v10.0.2) (2024-06-27)


### Bug Fixes

* **sandbox:** fix built-in objects (e.g. Date) being proxified instead of left alone ([c8fe418](https://github.com/jakelauer/theseus-js/commit/c8fe418213f73b82f49375a6be1f3e3f3a7d1e0c))
* **sandbox:** fix built-in objects (e.g. Date) being proxified instead of left alone ([#28](https://github.com/jakelauer/theseus-js/issues/28)) ([3425f45](https://github.com/jakelauer/theseus-js/commit/3425f452528640393b40d255dac5f6386461d348))

## [10.0.1](https://github.com/jakelauer/theseus-js/compare/v10.0.0...v10.0.1) (2024-06-26)


### Bug Fixes

* **logs:** reduce logging ([f83dd7a](https://github.com/jakelauer/theseus-js/commit/f83dd7a876996f0d2e40581170e934889fca5393))

# [10.0.0](https://github.com/jakelauer/theseus-js/compare/v9.0.1...v10.0.0) (2024-06-26)


### Bug Fixes

* **mutators:** handle nested mutators ([1a4dbca](https://github.com/jakelauer/theseus-js/commit/1a4dbca4860d8c7f3a34d854a83399571830ea85))
* **mutators:** handle nested mutators ([#27](https://github.com/jakelauer/theseus-js/issues/27)) ([b089304](https://github.com/jakelauer/theseus-js/commit/b08930460613f9be9fa831cf9c82f0b01a4ffe0c))


### BREAKING CHANGES

* **mutators:** changes to interactions with mutators

## [9.0.1](https://github.com/jakelauer/theseus-js/compare/v9.0.0...v9.0.1) (2024-06-25)


### Bug Fixes

* **eslint:** version bump ([d0c4ff0](https://github.com/jakelauer/theseus-js/commit/d0c4ff045e4bcc2979bb838532ba514473481dda))
* **eslint:** version bump ([#26](https://github.com/jakelauer/theseus-js/issues/26)) ([24c88c0](https://github.com/jakelauer/theseus-js/commit/24c88c0fe530c3eb417c312a2a143056f4418d84))

# [9.0.0](https://github.com/jakelauer/theseus-js/compare/v8.0.1...v9.0.0) (2024-06-25)


### Bug Fixes

* **mutators:** disable nested mutators ([96d9ace](https://github.com/jakelauer/theseus-js/commit/96d9acec54b324c3371101623b65e00f7ca94a73))
* **mutators:** disable nested mutators ([#25](https://github.com/jakelauer/theseus-js/issues/25)) ([44b7822](https://github.com/jakelauer/theseus-js/commit/44b782246a3134d5c8bd46238addfbe52901b8f8))
* **types:** remove nestable mutators from TS types ([b690a20](https://github.com/jakelauer/theseus-js/commit/b690a20650d3e96b22f74048b7b799e0e6a548ee))


### BREAKING CHANGES

* **mutators:** Cannot nest mutators or forges

## [8.0.1](https://github.com/jakelauer/theseus-js/compare/v8.0.0...v8.0.1) (2024-06-24)


### Bug Fixes

* **types:** handle both sync and async in FinishChain ([01fe9ea](https://github.com/jakelauer/theseus-js/commit/01fe9ea4aa1a10a8c33c0e357466fe64e21d6a91))
* **types:** handle both sync and async in FinishChain ([#24](https://github.com/jakelauer/theseus-js/issues/24)) ([56afa85](https://github.com/jakelauer/theseus-js/commit/56afa85c4abf8a48c3fc591a37a32da855995372))

# [8.0.0](https://github.com/jakelauer/theseus-js/compare/v7.4.7...v8.0.0) (2024-06-23)


### Features

* **broadcast:** avoid broadcasting updates to changes made during evolution ([e95a3a0](https://github.com/jakelauer/theseus-js/commit/e95a3a0fd484b6b388ce4846d44eee1ff2d91c71))
* **everything:** changes to linting, chain ending, ensuring changes during evolution don't broadcast ([06773d1](https://github.com/jakelauer/theseus-js/commit/06773d16e252d89108ee997fa407a11c0d521eef))
* **sandbox:** improvements to recursive sandbox and frost ([6b6dbc9](https://github.com/jakelauer/theseus-js/commit/6b6dbc93f3422c1684a461ee65c14b0630765528))


### BREAKING CHANGES

* **sandbox:** Evolvers do not modify data until the end, all levels are always frosted

## [7.4.7](https://github.com/jakelauer/theseus-js/compare/v7.4.6...v7.4.7) (2024-06-19)


### Bug Fixes

* **sandbox:** prevent sandboxing invalid objects (null, etc) ([5ecaf99](https://github.com/jakelauer/theseus-js/commit/5ecaf998785be2d7c3b27240fba87669469008c7))

## [7.4.6](https://github.com/jakelauer/theseus-js/compare/v7.4.5...v7.4.6) (2024-06-18)


### Bug Fixes

* **ci:** ci ([900e985](https://github.com/jakelauer/theseus-js/commit/900e98595ab9726f3848410a8d1653c554bc4f5f))

## [7.4.5](https://github.com/jakelauer/theseus-js/compare/v7.4.4...v7.4.5) (2024-06-18)


### Bug Fixes

* **eslint:** fix ([df2911c](https://github.com/jakelauer/theseus-js/commit/df2911cb49870a0077917246b52109f50730f8f7))

## [7.4.4](https://github.com/jakelauer/theseus-js/compare/v7.4.3...v7.4.4) (2024-06-18)


### Bug Fixes

* **npmrc:** remove unused props ([0d1671b](https://github.com/jakelauer/theseus-js/commit/0d1671ba017b6142a984f99f0c01a77bea9208c0))

## [7.4.3](https://github.com/jakelauer/theseus-js/compare/v7.4.2...v7.4.3) (2024-06-18)


### Bug Fixes

* **fix:** fix ([266bfbc](https://github.com/jakelauer/theseus-js/commit/266bfbc74a9e1b2e690a35ff69a5c833b1f2dc04))

## [7.4.2](https://github.com/jakelauer/theseus-js/compare/v7.4.1...v7.4.2) (2024-06-18)


### Bug Fixes

* **fix:** fix ([2609028](https://github.com/jakelauer/theseus-js/commit/260902857d6f19f485059e03a097452a0f86ae49))

## [7.4.1](https://github.com/jakelauer/theseus-js/compare/v7.4.0...v7.4.1) (2024-06-18)


### Bug Fixes

* **eslint:** attempt to fix eslint plugin ([7ba7cb8](https://github.com/jakelauer/theseus-js/commit/7ba7cb8d9c252fec0892922012dec6a87374842d))

# [7.4.0](https://github.com/jakelauer/theseus-js/compare/v7.3.3...v7.4.0) (2024-06-18)


### Bug Fixes

* **secret:** remove ([4d08be4](https://github.com/jakelauer/theseus-js/commit/4d08be44b167bfd1b8c702a3d86321f94632b8d6))


### Features

* **publishing:** eslint-plugin-theseus ([e44388f](https://github.com/jakelauer/theseus-js/commit/e44388fd742cc3046431a6ee8bfb2d2a1e4b5e0c))

## [7.3.3](https://github.com/jakelauer/theseus-js/compare/v7.3.2...v7.3.3) (2024-06-18)


### Bug Fixes

* **release:** need to force a release ([c4e0a30](https://github.com/jakelauer/theseus-js/commit/c4e0a3098caf729c07e149bb1d3b4f85d57ab9a4))

## [7.3.2](https://github.com/jakelauer/theseus-js/compare/v7.3.1...v7.3.2) (2024-06-18)


### Bug Fixes

* **sandbox:** fix main/module in package.json ([99090e2](https://github.com/jakelauer/theseus-js/commit/99090e231780325e4e09342fc4268ed4e944489d))

## [7.3.1](https://github.com/jakelauer/theseus-js/compare/v7.3.0...v7.3.1) (2024-06-17)


### Bug Fixes

* **sandbox:** fix main ([c849370](https://github.com/jakelauer/theseus-js/commit/c84937056a7bded2504d07a31345e246d134f2d6))

# [7.3.0](https://github.com/jakelauer/theseus-js/compare/v7.2.2...v7.3.0) (2024-06-17)


### Bug Fixes

* **theseus:** remove getChanges() from theseus level ([1c61462](https://github.com/jakelauer/theseus-js/commit/1c61462a71f004e7c2e4facf476fe88aab5f2cf0))


### Features

* **sandbox/cement/frost:** add recursive behavior to all aspects of sandbox ([d0640ad](https://github.com/jakelauer/theseus-js/commit/d0640ad2cb1da90f7aba15a2a0e05228b360847e))
* **sandbox/cement/frost:** add recursive behavior to all aspects of sandbox ([#22](https://github.com/jakelauer/theseus-js/issues/22)) ([d249339](https://github.com/jakelauer/theseus-js/commit/d2493391a343bafb8bb637b1487d81c4759d5da8))
* **sandbox:** allow getting in-progress changes ([9547b60](https://github.com/jakelauer/theseus-js/commit/9547b60ef4c82b7f7a3b546123a1ec42c56f8a7c))

## [7.2.2](https://github.com/jakelauer/theseus-js/compare/v7.2.1...v7.2.2) (2024-06-15)


### Bug Fixes

* **sandbox:** fix logging result ([afabdcf](https://github.com/jakelauer/theseus-js/commit/afabdcf19918f02f57fc51a9e862fac9f9bd6d26))

## [7.2.1](https://github.com/jakelauer/theseus-js/compare/v7.2.0...v7.2.1) (2024-06-15)


### Bug Fixes

* **sandbox:** fix logging issues ([1887213](https://github.com/jakelauer/theseus-js/commit/18872138d89cc6918d76383e3676b60009ac05c4))
* **stringifier:** fix stringifier skipping sandbox proxy ([3460855](https://github.com/jakelauer/theseus-js/commit/3460855d09c1497d1f2788386ae36c0f96765c6d))

# [7.2.0](https://github.com/jakelauer/theseus-js/compare/v7.1.1...v7.2.0) (2024-06-15)


### Features

* **sandbox:** use recursive proxies ([35b4173](https://github.com/jakelauer/theseus-js/commit/35b417397912ec1ff32b491cd59600e13dd29992))

## [7.1.1](https://github.com/jakelauer/theseus-js/compare/v7.1.0...v7.1.1) (2024-06-14)


### Bug Fixes

* **sandbox:** set mode to copy ([03e2785](https://github.com/jakelauer/theseus-js/commit/03e2785821d770315a5bc774441edc03d09ce6be))

# [7.1.0](https://github.com/jakelauer/theseus-js/compare/v7.0.0...v7.1.0) (2024-06-13)


### Features

* **component:** add ability to get changes from sandbox ([f3ca5bc](https://github.com/jakelauer/theseus-js/commit/f3ca5bc60b89e05d5fc7f9ee400d8a64f6d4c49e))

# [7.0.0](https://github.com/jakelauer/theseus-js/compare/v6.0.14...v7.0.0) (2024-06-08)


### Bug Fixes

* **output:** cjs + esm ([9c2ad64](https://github.com/jakelauer/theseus-js/commit/9c2ad641db02e912c6e7a5552cbf734f03f1765d))
* **test:** fix missing chai ref ([7f665db](https://github.com/jakelauer/theseus-js/commit/7f665db6d185f270760f4124787ebbe91bc9e132))


### BREAKING CHANGES

* **output:** cjs and esm both present

## [6.0.14](https://github.com/jakelauer/theseus-js/compare/v6.0.13...v6.0.14) (2024-06-08)


### Bug Fixes

* **testing change to sandbox:** sandbox ([b288c70](https://github.com/jakelauer/theseus-js/commit/b288c700f71ef34959a6af85c4a1ac41233e2d69))

## [6.0.13](https://github.com/jakelauer/theseus-js/compare/v6.0.12...v6.0.13) (2024-06-08)


### Bug Fixes

* **publish:** remove npm and use pnpm ([7290086](https://github.com/jakelauer/theseus-js/commit/72900866250b3fca7f1c1864ab6542955dbc5a84))

## [6.0.12](https://github.com/jakelauer/theseus-js/compare/v6.0.11...v6.0.12) (2024-06-08)


### Bug Fixes

* **ci:** ci ([b51a341](https://github.com/jakelauer/theseus-js/commit/b51a3412004404860d4a163b14788e6a45504e70))
* **ci:** fix test and buil ([0d99c89](https://github.com/jakelauer/theseus-js/commit/0d99c8918d9853c297536c058e2996991348865a))
* **x:** x ([2420c7d](https://github.com/jakelauer/theseus-js/commit/2420c7d81a560878c0cb819d0a11c742cb6c2b4c))

## [6.0.11](https://github.com/jakelauer/theseus-js/compare/v6.0.10...v6.0.11) (2024-06-07)


### Bug Fixes

* **more:** idk maybe this will work ([9f229ca](https://github.com/jakelauer/theseus-js/commit/9f229ca3da0c051f7d30b1bfebda3425b95fad00))
* x ([8622b33](https://github.com/jakelauer/theseus-js/commit/8622b337c910119519483a5b14a6dbefec612aa7))
* x ([64b3336](https://github.com/jakelauer/theseus-js/commit/64b3336ef2ff9e2cf482e79847cf01cb167f4893))
* **x:** x ([79c1987](https://github.com/jakelauer/theseus-js/commit/79c19876c04d0cbb8c72d0b151922887fac249a3))
* **x:** x ([da3bce2](https://github.com/jakelauer/theseus-js/commit/da3bce28b830dd57bc37d575ce293de89f96899b))

## [6.0.10](https://github.com/jakelauer/theseus-js/compare/v6.0.9...v6.0.10) (2024-06-07)


### Bug Fixes

* **ci:** avoid husky in github actions ([f887a14](https://github.com/jakelauer/theseus-js/commit/f887a149b48e449e2454d6d44cc7c437e7412907))

## [6.0.9](https://github.com/jakelauer/theseus-js/compare/v6.0.8...v6.0.9) (2024-06-07)


### Bug Fixes

* **npm:** remove prepublish ([a4ce296](https://github.com/jakelauer/theseus-js/commit/a4ce296752432eef5939583e07c29c87771083ee))
* x ([655c840](https://github.com/jakelauer/theseus-js/commit/655c840966b6d61a5b49581112242df091d300a0))

## [6.0.8](https://github.com/jakelauer/theseus-js/compare/v6.0.7...v6.0.8) (2024-06-07)


### Bug Fixes

* x ([db5ff73](https://github.com/jakelauer/theseus-js/commit/db5ff733cc12c790d12c535c81b43c2eb4f9f1c2))

## [6.0.7](https://github.com/jakelauer/theseus-js/compare/v6.0.6...v6.0.7) (2024-06-07)


### Bug Fixes

* x ([70432ba](https://github.com/jakelauer/theseus-js/commit/70432ba1a7a142a78315f72dcb711db7502ca7a7))

# 1.0.0 (2024-06-07)


### Bug Fixes

* ..a ([875ba84](https://github.com/jakelauer/theseus-js/commit/875ba84dfc01d26aed18fe1b2cfdb9524722e418))
* **broadcast:** fix broadcaster to use the sandbox cemented result ra… ([#21](https://github.com/jakelauer/theseus-js/issues/21)) ([666c52c](https://github.com/jakelauer/theseus-js/commit/666c52c63e0e4b2417b39a5d35296cf55013e3a3))
* **broadcast:** fix broadcaster to use the sandbox cemented result rather than the OG draft ([844787c](https://github.com/jakelauer/theseus-js/commit/844787ca146e6dc1f370167af031bf0bb8824bd4))
* **chore:** chore ([3b69428](https://github.com/jakelauer/theseus-js/commit/3b694283b553c8a7a554a1030e795270773e3993))
* **ci:** workspace fixes ([998768d](https://github.com/jakelauer/theseus-js/commit/998768d4af227b9eb4bb9915f73cc2c0fc4247bc))
* **dependencies:** use bundledDependencies ([6e0dfd1](https://github.com/jakelauer/theseus-js/commit/6e0dfd1b5e04fdb57e11f935a256e6ac928461e4))
* **logging:** fix log level settings ([d5ef730](https://github.com/jakelauer/theseus-js/commit/d5ef730cc6e4b14473bf47b234a4e65e24bdf392))
* **package.json:** remove postinstall from package.json ([a52fed4](https://github.com/jakelauer/theseus-js/commit/a52fed40b15b1fa74a97638cba1f32a230006cbc))
* **packages:** including packages in output ([64a4a06](https://github.com/jakelauer/theseus-js/commit/64a4a0618b5045f4513b287ab25dedb1215575de))
* **release:** attempt to fix pnpm release ([897df80](https://github.com/jakelauer/theseus-js/commit/897df801b98145d01ec0642463608c2d332b8afe))
* **release:** fixing release rules ([5609865](https://github.com/jakelauer/theseus-js/commit/56098650dbca29650aca6f7c00438c9e7feb9a21))
* **release:** trigger patch release ([b02f034](https://github.com/jakelauer/theseus-js/commit/b02f03487b264edb168441d7404175365e345f0d))
* **test:** fix mocha reference in sandbox test script ([2a4def1](https://github.com/jakelauer/theseus-js/commit/2a4def134c7ab36a50b1a8d038999ddbeee3f5ab))


* Docs update (#15) ([1c06a0c](https://github.com/jakelauer/theseus-js/commit/1c06a0c4449dbdb525a7f546a9c55704f8035376)), closes [#15](https://github.com/jakelauer/theseus-js/issues/15)


### Features

* **commitlint:** commitlint config ([cd68170](https://github.com/jakelauer/theseus-js/commit/cd681706b96d797fb9a02e9f51f2e5e896174e83))
* **fix:** fix ([27ef130](https://github.com/jakelauer/theseus-js/commit/27ef130ff3df5dbc95d95ef94c24086e770ea9f3))
* **immutability:** immutability with immer ([#16](https://github.com/jakelauer/theseus-js/issues/16)) ([66f9715](https://github.com/jakelauer/theseus-js/commit/66f97150448864a0446e0f60b44e46cdcd942a3b))
* **immutability:** replace immer with custom package ([d121ee5](https://github.com/jakelauer/theseus-js/commit/d121ee55adbe1c7783285a44db6ae349a6587e06))
* **immutability:** replace immer with custom package ([#20](https://github.com/jakelauer/theseus-js/issues/20)) ([066e276](https://github.com/jakelauer/theseus-js/commit/066e276697d9c8839238176f9d1f49c5e1ae6779))
* **nit:** release ([d5a7188](https://github.com/jakelauer/theseus-js/commit/d5a7188a17a635b1ffab79a991e10d97c35b4bab))
* **pnpm build:** pnpm build fixes for ci ([a65d065](https://github.com/jakelauer/theseus-js/commit/a65d06596c8c99c7537f7db7bcad87bb004c93f8))
* **refineries:** array-based refineries ([#14](https://github.com/jakelauer/theseus-js/issues/14)) ([302c587](https://github.com/jakelauer/theseus-js/commit/302c5878e2f042d5b16877353afb228cd3ec6b60))
* **release:** release ([bbb7882](https://github.com/jakelauer/theseus-js/commit/bbb78827a05b8eb415c562c2bad5de4483a1a74d))


### BREAKING CHANGES

* **immutability:** immer replaced
* refineries and complexes cannot be referenced int he same way

* docs(tutorial): continuing tutorial

Adding refineries to tutorial docs

* docs(tutorial): more docs for tutorial

added some information about the purpose of Theseus and why it exists

* docs(tutorial): updating contents

* docs(tutorial): swapping out the style tag

* docs(tutorial): fix FIRM description

* docs(tutorial): complexess

Added evolver and refinery complex docs

* docs(tutorial): updating readme

* docs(docs): minor

* fix(test): fixed data noun reference
* **immutability:** No longer mutable anywhere, no more requirements for naming

Co-authored-by: Jake Lauer <jakelauer@Jake-MacBook-M2-2.local>
* **refineries:** refineries and complexes cannot be referenced int he same way

Co-authored-by: Jake Lauer <jakelauer@Jake-MacBook-M2-2.local>
* **nit:** Evolvers as arrays
* **fix:** fix
* **release:** release

## [6.0.5](https://github.com/jakelauer/theseus-js/compare/v6.0.4...v6.0.5) (2024-06-07)


### Bug Fixes

* **dependencies:** use bundledDependencies ([95c92f8](https://github.com/jakelauer/theseus-js/commit/95c92f883fd46a1d639a581c9ca89995d06d3cb9))
* **test:** fix mocha reference in sandbox test script ([522e2bd](https://github.com/jakelauer/theseus-js/commit/522e2bd00e66e11908fe4df4f0e6531ec60ecf8f))

## [6.0.4](https://github.com/jakelauer/theseus-js/compare/v6.0.3...v6.0.4) (2024-06-07)


### Bug Fixes

* **ci:** workspace fixes ([4f120d8](https://github.com/jakelauer/theseus-js/commit/4f120d852f220c8364dc66979fac0958443093ea))

## [6.0.3](https://github.com/jakelauer/theseus-js/compare/v6.0.2...v6.0.3) (2024-06-06)


### Bug Fixes

* **packages:** including packages in output ([3d3113f](https://github.com/jakelauer/theseus-js/commit/3d3113fa540d223d88b77c13dbdd42a8f9026e0e))

## [6.0.2](https://github.com/jakelauer/theseus-js/compare/v6.0.1...v6.0.2) (2024-06-06)


### Bug Fixes

* **package.json:** remove postinstall from package.json ([4bdab8b](https://github.com/jakelauer/theseus-js/commit/4bdab8b9cfa439f17ac61f7a73a65af89c477766))

## [6.0.1](https://github.com/jakelauer/theseus-js/compare/v6.0.0...v6.0.1) (2024-06-06)


### Bug Fixes

* **broadcast:** fix broadcaster to use the sandbox cemented result ra… ([#21](https://github.com/jakelauer/theseus-js/issues/21)) ([73dace6](https://github.com/jakelauer/theseus-js/commit/73dace60a2692a8581337f952e1f2ea87b41acb4))
* **broadcast:** fix broadcaster to use the sandbox cemented result rather than the OG draft ([df56f80](https://github.com/jakelauer/theseus-js/commit/df56f8006badfdf282ef5519208efecd068c8898))

# [6.0.0](https://github.com/jakelauer/theseus-js/compare/v5.0.1...v6.0.0) (2024-06-06)


### Features

* **immutability:** replace immer with custom package ([b9d505d](https://github.com/jakelauer/theseus-js/commit/b9d505d1a139e30eb6fe2985d65b0eeb98c4d285))
* **immutability:** replace immer with custom package ([#20](https://github.com/jakelauer/theseus-js/issues/20)) ([abe16a8](https://github.com/jakelauer/theseus-js/commit/abe16a801bc94475631d50a38ddf76bf6164ed57))


### BREAKING CHANGES

* **immutability:** immer replaced

## [5.0.1](https://github.com/jakelauer/theseus-js/compare/v5.0.0...v5.0.1) (2024-05-30)


### Bug Fixes

* **logging:** fix log level settings ([3686ed5](https://github.com/jakelauer/theseus-js/commit/3686ed56d57f2765b6333f21d754a787dc10ed1d))
* **release:** trigger patch release ([996602e](https://github.com/jakelauer/theseus-js/commit/996602e248e2aa2428d71734fda2c2a38495da03))

# [5.0.0](https://github.com/jakelauer/theseus-js/compare/v4.0.0...v5.0.0) (2024-05-30)


* Docs update (#15) ([dc3bdc2](https://github.com/jakelauer/theseus-js/commit/dc3bdc28b5dccdebff9110fadbf2e47c6558fe9c)), closes [#15](https://github.com/jakelauer/theseus-js/issues/15)


### BREAKING CHANGES

* refineries and complexes cannot be referenced int he same way

* docs(tutorial): continuing tutorial

Adding refineries to tutorial docs

* docs(tutorial): more docs for tutorial

added some information about the purpose of Theseus and why it exists

* docs(tutorial): updating contents

* docs(tutorial): swapping out the style tag

* docs(tutorial): fix FIRM description

* docs(tutorial): complexess

Added evolver and refinery complex docs

* docs(tutorial): updating readme

* docs(docs): minor

* fix(test): fixed data noun reference

# [4.0.0](https://github.com/jakelauer/theseus-js/compare/v3.0.0...v4.0.0) (2024-05-30)


### Features

* **immutability:** immutability with immer ([#16](https://github.com/jakelauer/theseus-js/issues/16)) ([31cdbd9](https://github.com/jakelauer/theseus-js/commit/31cdbd99ea5775685f96614a78ecefe99f52748b))


### BREAKING CHANGES

* **immutability:** No longer mutable anywhere, no more requirements for naming

Co-authored-by: Jake Lauer <jakelauer@Jake-MacBook-M2-2.local>

# [3.0.0](https://github.com/jakelauer/theseus-js/compare/v2.0.0...v3.0.0) (2024-05-27)


### Features

* **refineries:** array-based refineries ([#14](https://github.com/jakelauer/theseus-js/issues/14)) ([08a84d2](https://github.com/jakelauer/theseus-js/commit/08a84d21c7d803cf5152a53817feec0fabcb473d))


### BREAKING CHANGES

* **refineries:** refineries and complexes cannot be referenced int he same way

Co-authored-by: Jake Lauer <jakelauer@Jake-MacBook-M2-2.local>

# [2.0.0](https://github.com/jakelauer/theseus-js/compare/v1.4.1...v2.0.0) (2024-05-27)


### Bug Fixes

* **chore:** chore ([1244197](https://github.com/jakelauer/theseus-js/commit/1244197e869e121375581e358e6dd9a6bbfdd083))


### Features

* **nit:** release ([6ee1933](https://github.com/jakelauer/theseus-js/commit/6ee193332e881b8d7019c44aa48eb7507997ec11))


### BREAKING CHANGES

* **nit:** Evolvers as arrays

## [1.4.1](https://github.com/jakelauer/theseus-js/compare/v1.4.0...v1.4.1) (2024-05-26)


### Bug Fixes

* **release:** fixing release rules ([ecc7eb0](https://github.com/jakelauer/theseus-js/commit/ecc7eb001fb26aa183c27584f892dca3de4a521f))

# [1.4.0](https://github.com/jakelauer/theseus-js/compare/v1.3.1...v1.4.0) (2024-05-26)


### Bug Fixes

* ..a ([33fedeb](https://github.com/jakelauer/theseus-js/commit/33fedeb29d243da962e09dc1b8aafa0ed65520a5))


### Features

* **commitlint:** commitlint config ([1aa3a8f](https://github.com/jakelauer/theseus-js/commit/1aa3a8fef9a32c2cf418b3f2cab1094e73e13efc))
* **pnpm build:** pnpm build fixes for ci ([4f0e64b](https://github.com/jakelauer/theseus-js/commit/4f0e64bb07ea92ce158b37845d591e13b2e1d941))
