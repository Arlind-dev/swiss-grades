## [2.0.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.16.0...v2.0.0) (2026-07-01)

### ⚠ BREAKING CHANGES

* **average:** The Grade Average CSV export is removed.

* **needed:** The Required Grade tool no longer supports naming future exams
or giving them individual weights; it now takes a single count of remaining
exams, each weighted as one normal grade. Saved state and old share links are
migrated, but any per-exam weights they carried are dropped.

* **ui:** The default number of blank grade rows changes from 10 to 5,
and on small screens the subject-name field and drag handle are hidden.

* **qv:** The rebuilt QV drops the completion progress bar, the visual
preset-picker modal (now a plain select), the sticky desktop column header,
and the per-variant mode descriptions from the previous UI.

* **needed:** The Required Grade tool's saved state (swiss-grades-needed)
adopts a new shape; state written by the previous version is not read back and
falls back to defaults.

* **average:** The rebuilt Average drops the per-row delta chips (each
grade's difference from the running average) and the grade-input border
colour coding that the previous UI provided.

* **chrome:** The previous mobile off-canvas navigation drawer, the
keyboard-navigable language dropdown, and the page fade-in / transition
animations are removed in favour of a simpler top bar and a native language
select. (The mobile drawer is reinstated in a later commit.)

### Features

* **average:** commit grade/weight edits on blur, not per keystroke ([837705c](https://github.com/Arlind-dev/swiss-grades/commit/837705c8b404bcef4df1e3c6431b77d3f0fcfc2b))
* **average:** rebuild weighted average with subgrades, reorder, CSV ([d1807af](https://github.com/Arlind-dev/swiss-grades/commit/d1807af82a5c8e41c2caa95ffc253f8679daba51))
* **average:** remove CSV export, drop dead code ([5ee67d0](https://github.com/Arlind-dev/swiss-grades/commit/5ee67d0d661cffdadec21e96f3f076e5f5307576))
* **calculator:** rebuild points-to-grade tool ([3143188](https://github.com/Arlind-dev/swiss-grades/commit/3143188f5ca7268217e02515a3607cfa779bc7a8))
* **chrome:** minimal top bar, theme toggle, locale select, footer ([99eea85](https://github.com/Arlind-dev/swiss-grades/commit/99eea850762b613094c832c50c695d372938abfd))
* **design:** Catppuccin token layer and global base ([90d4263](https://github.com/Arlind-dev/swiss-grades/commit/90d426318f7061d6bae66a8975e3c248f36f65d5))
* **grades:** format grades to 2 decimals, fix deep-nest propagation ([9f06302](https://github.com/Arlind-dev/swiss-grades/commit/9f063028b96954ae08ed882a2503f77e32eb437c))
* **needed:** rebuild required-grade tool ([4aa6df7](https://github.com/Arlind-dev/swiss-grades/commit/4aa6df732f34bff5d4449cddf6e0fb6183f2bc92))
* **qv:** rebuild final apprenticeship-grade tool ([b36a5b4](https://github.com/Arlind-dev/swiss-grades/commit/b36a5b4c232d1e63bdbb77aacd0bde96934414d0))
* **ui:** add calm design-system baseline and shared components ([34c7673](https://github.com/Arlind-dev/swiss-grades/commit/34c7673f60adbdaa812e49202cb6088e9632e096))
* **ui:** centered layout, consistent buttons, proper footer ([f587e1c](https://github.com/Arlind-dev/swiss-grades/commit/f587e1cddaece5eb490ea2879cdfe06debe8c2e4))
* **ui:** fit weights in every language, better placeholders, mobile rows ([9b95739](https://github.com/Arlind-dev/swiss-grades/commit/9b95739ae817c553eba7b1579bdcebff446b9db0))
* **ui:** mobile drawer, no locale flash, weight 1-100, Mac shortcuts ([9714e73](https://github.com/Arlind-dev/swiss-grades/commit/9714e7347b61e214c50f0dafcad0cbc981cb9c16))
* **ui:** native share sheet, QV descriptions + normalized weights ([572f493](https://github.com/Arlind-dev/swiss-grades/commit/572f493f090c1ba443d5d776e68d511596928a19))
* **ui:** pair Inter UI font with JetBrains Mono for numbers ([8a73398](https://github.com/Arlind-dev/swiss-grades/commit/8a7339891b87f4bd2dea1542c02dd66748eb8106))
* **ui:** rework navigation into a calm icon top bar ([1b25760](https://github.com/Arlind-dev/swiss-grades/commit/1b257601a1779b848b8b1b2d01eb9d41974678e5))
* **ui:** shared primitives for the tool screens ([3494c84](https://github.com/Arlind-dev/swiss-grades/commit/3494c84746c16e35cb17190f1bd151f3dbf14731))

### Bug Fixes

* **average:** keep weight aligned at max sub-grade depth ([b4b80f0](https://github.com/Arlind-dev/swiss-grades/commit/b4b80f01887da58a883b84e7716371f94198d62f))
* harden share round-trips, restore QV preset text, dedupe grade tone ([9e7894b](https://github.com/Arlind-dev/swiss-grades/commit/9e7894b134af33966fba0064eeb7ba189d48ea13))
* **qv:** scale result, fix fallnote badge overflow, reflow grid on tablet ([38eb009](https://github.com/Arlind-dev/swiss-grades/commit/38eb0095bce9ba895f063251d5f81b0cb5baef2c))
* **qv:** show the preset logo on the apprenticeship selector button ([a14dfe6](https://github.com/Arlind-dev/swiss-grades/commit/a14dfe64956fb3f35e44611879910a7396bb56f8))
* **qv:** stop the fallnote fail badge from overflowing ([3278da2](https://github.com/Arlind-dev/swiss-grades/commit/3278da29a1ae4c6d4f546247b41b66bd72131e56))
* **ui:** make clear/reset buttons theme-aware ([965dd0d](https://github.com/Arlind-dev/swiss-grades/commit/965dd0da21dc4246553940f250616d65fc2bafd9))
* **ui:** make result displays and page headings responsive ([4ba82fe](https://github.com/Arlind-dev/swiss-grades/commit/4ba82fe2152fffbb122ce4b7b4eec26af02cbaf0))
* **ui:** theme toggle icon no longer flashes on refresh ([f754d8d](https://github.com/Arlind-dev/swiss-grades/commit/f754d8dffc4e296d8f965fecd4bb60f10a5999d4))

### Reverts

* **ui:** restore JetBrains Mono as the app font ([3d70a8e](https://github.com/Arlind-dev/swiss-grades/commit/3d70a8e033281b09540debbda00bf04f57d4b893))

### Code Refactoring

* **needed:** simplify to target + remaining-exams count ([b695ee9](https://github.com/Arlind-dev/swiss-grades/commit/b695ee9f7a5abb0533cd9edab7f795d84d590fae))

## [1.16.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.15.0...v1.16.0) (2026-05-19)

### Features

* **qv:** clarify eGK grade sources ([#50](https://github.com/Arlind-dev/swiss-grades/issues/50)) ([f5fbbc4](https://github.com/Arlind-dev/swiss-grades/commit/f5fbbc4690fdf60f3e57138eacc89ff856f31edf))
* **qv:** clarify eGK semester grades ([#49](https://github.com/Arlind-dev/swiss-grades/issues/49)) ([fbfbf53](https://github.com/Arlind-dev/swiss-grades/commit/fbfbf53bea601da16720502a64ef97d136e70d15))
* **qv:** localize preset content ([#52](https://github.com/Arlind-dev/swiss-grades/issues/52)) ([6165f41](https://github.com/Arlind-dev/swiss-grades/commit/6165f41b38a1f135946f747bb34148d0fe62fe74))

## [1.15.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.14.0...v1.15.0) (2026-05-19)

### Features

* **qv:** add ABU detail grade modes ([#48](https://github.com/Arlind-dev/swiss-grades/issues/48)) ([823d64f](https://github.com/Arlind-dev/swiss-grades/commit/823d64ff1c7d416e936d617ddf13a0e390313bee)), closes [#47](https://github.com/Arlind-dev/swiss-grades/issues/47)

## [1.14.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.13.0...v1.14.0) (2026-05-05)

### Features

* add shareable calculator links ([#43](https://github.com/Arlind-dev/swiss-grades/issues/43)) ([c1bb703](https://github.com/Arlind-dev/swiss-grades/commit/c1bb7039617c1b39d7ed69f35fadafd4b9a001c3))

## [1.13.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.12.0...v1.13.0) (2026-05-05)

### Features

* **average:** add CSV export ([#44](https://github.com/Arlind-dev/swiss-grades/issues/44)) ([12157fb](https://github.com/Arlind-dev/swiss-grades/commit/12157fb8169b21000ae673a3463e5db65c73d77c))

## [1.12.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.11.0...v1.12.0) (2026-05-05)

### Features

* add Informatiker EFZ QV presets ([#42](https://github.com/Arlind-dev/swiss-grades/issues/42)) ([ddc48fa](https://github.com/Arlind-dev/swiss-grades/commit/ddc48fadb8c6a3506648f60cdef60d56695072e2))

## [1.11.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.10.2...v1.11.0) (2026-05-05)

### Features

* **i18n:** add Albanian, Somali, Russian and Turkish translations ([#41](https://github.com/Arlind-dev/swiss-grades/issues/41)) ([c1aa993](https://github.com/Arlind-dev/swiss-grades/commit/c1aa993fcfda8cbacdc9afd63f9c284b3e818c08))

## [1.10.2](https://github.com/Arlind-dev/swiss-grades/compare/v1.10.1...v1.10.2) (2026-05-02)

### Bug Fixes

* **ui:** uniform rounding placement, button styles, and labels across pages ([#39](https://github.com/Arlind-dev/swiss-grades/issues/39)) ([490ca9b](https://github.com/Arlind-dev/swiss-grades/commit/490ca9b318e7e2f909227c70b230705b50404401))

## [1.10.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.10.0...v1.10.1) (2026-05-02)

### Bug Fixes

* **average:** restore delta indicator markup and styles lost during rebase ([#38](https://github.com/Arlind-dev/swiss-grades/issues/38)) ([90b5dfb](https://github.com/Arlind-dev/swiss-grades/commit/90b5dfb79f50ea9c3aaef1dcc49c0d1ba5828b23))

## [1.10.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.9.0...v1.10.0) (2026-05-02)

### Features

* **average:** show grade chip with color on average result ([#37](https://github.com/Arlind-dev/swiss-grades/issues/37)) ([6916fb0](https://github.com/Arlind-dev/swiss-grades/commit/6916fb0f4cf939a2a48992b8ef8264054e15d678))

## [1.9.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.8.2...v1.9.0) (2026-05-02)

### Features

* **average:** show delta indicator per grade row  ([#36](https://github.com/Arlind-dev/swiss-grades/issues/36)) ([147408e](https://github.com/Arlind-dev/swiss-grades/commit/147408e3ce524e4d3c5f72f837da35309213a79b))

## [1.8.2](https://github.com/Arlind-dev/swiss-grades/compare/v1.8.1...v1.8.2) (2026-05-02)

### Bug Fixes

* **theme:** cover full viewport and set color-scheme per theme ([#33](https://github.com/Arlind-dev/swiss-grades/issues/33)) ([bdda7de](https://github.com/Arlind-dev/swiss-grades/commit/bdda7de06eca417dcf27d433f7e360e1402a7ec4))

## [1.8.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.8.0...v1.8.1) (2026-05-02)

### Bug Fixes

* **ux:** support Cmd+Enter/Backspace shortcuts on Mac ([#32](https://github.com/Arlind-dev/swiss-grades/issues/32)) ([04dc6f5](https://github.com/Arlind-dev/swiss-grades/commit/04dc6f50e6eae6e2cb533763fa81dc1dd1ccf313))

## [1.8.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.7.2...v1.8.0) (2026-05-02)

### Features

* add rounding selector with persistence and ommit calculate button ([#31](https://github.com/Arlind-dev/swiss-grades/issues/31)) ([03f2ed2](https://github.com/Arlind-dev/swiss-grades/commit/03f2ed2c50b6af212cd77f90fcb27b09dd3fb106))

## [1.7.2](https://github.com/Arlind-dev/swiss-grades/compare/v1.7.1...v1.7.2) (2026-05-02)

### Bug Fixes

* **needed:** persist exam names and prevent autocomplete prefill ([#30](https://github.com/Arlind-dev/swiss-grades/issues/30)) ([2490923](https://github.com/Arlind-dev/swiss-grades/commit/249092329706e7818eb194bff36a070500b9e319))

## [1.7.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.7.0...v1.7.1) (2026-05-02)

### Bug Fixes

* **responsive:** various responsiveness fixes ([#29](https://github.com/Arlind-dev/swiss-grades/issues/29)) ([bef178a](https://github.com/Arlind-dev/swiss-grades/commit/bef178a86a56bd641de3b88e29e7f42864314ab1))

## [1.7.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.6.1...v1.7.0) (2026-05-02)

### Features

* **persistence:** add localStorage and clear all button to calculator and needed pages ([#28](https://github.com/Arlind-dev/swiss-grades/issues/28)) ([92380b9](https://github.com/Arlind-dev/swiss-grades/commit/92380b9798acf64f90070c74eb2085aedc7a7904))

## [1.6.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.6.0...v1.6.1) (2026-05-02)

### Bug Fixes

* **needed:** align target grade input width and placeholder with grade row ([#27](https://github.com/Arlind-dev/swiss-grades/issues/27)) ([2631ce5](https://github.com/Arlind-dev/swiss-grades/commit/2631ce5f4b5e209d6c88b10a0d513c2b6e6888cc))

## [1.6.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.5.3...v1.6.0) (2026-05-02)

### Features

* **needed:** show best attainable grade on required grade page ([#26](https://github.com/Arlind-dev/swiss-grades/issues/26)) ([d744136](https://github.com/Arlind-dev/swiss-grades/commit/d7441368047aa07f86446432e8c3fc5aadad58e3))

## [1.5.3](https://github.com/Arlind-dev/swiss-grades/compare/v1.5.2...v1.5.3) (2026-05-02)

### Bug Fixes

* **ci:** use step output to produce lowercase image name for Docker registry ([#25](https://github.com/Arlind-dev/swiss-grades/issues/25)) ([ca457b3](https://github.com/Arlind-dev/swiss-grades/commit/ca457b378b12bbd761e3e071a013af4e17983769))

## [1.5.2](https://github.com/Arlind-dev/swiss-grades/compare/v1.5.1...v1.5.2) (2026-05-02)

### Bug Fixes

* **footer:** center footer content horizontally ([#23](https://github.com/Arlind-dev/swiss-grades/issues/23)) ([df40da6](https://github.com/Arlind-dev/swiss-grades/commit/df40da65701ceff18542340e3809318816da7fe1))

## [1.5.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.5.0...v1.5.1) (2026-05-02)

### Bug Fixes

* **ssr:** hide page content until hydrated to prevent data flash  ([#22](https://github.com/Arlind-dev/swiss-grades/issues/22)) ([ff2ff46](https://github.com/Arlind-dev/swiss-grades/commit/ff2ff46f44793e98038d9c7c9de37f6ff598c248))

## [1.5.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.4.0...v1.5.0) (2026-05-02)

### Features

* persist locale to localStorage and detect browser language ([#21](https://github.com/Arlind-dev/swiss-grades/issues/21)) ([fdbc8fa](https://github.com/Arlind-dev/swiss-grades/commit/fdbc8facd5cefce5c7fc90c6e381a06171b0ef0f))

## [1.4.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.3.2...v1.4.0) (2026-05-02)

### Features

* add favicon  ([#15](https://github.com/Arlind-dev/swiss-grades/issues/15)) ([367933b](https://github.com/Arlind-dev/swiss-grades/commit/367933bf2fab97675073a077be67350891e9cdaa))

## [1.3.2](https://github.com/Arlind-dev/swiss-grades/compare/v1.3.1...v1.3.2) (2026-05-02)

### Bug Fixes

* use named imports from flowbite-svelte-icons to fix cold start error ([#14](https://github.com/Arlind-dev/swiss-grades/issues/14)) ([703d0e2](https://github.com/Arlind-dev/swiss-grades/commit/703d0e2142813571889af967c5531828ed4425d3))

## [1.3.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.3.0...v1.3.1) (2026-05-01)

### Bug Fixes

* **navbar:** fix flat bottom corners on desktop nav links ([#11](https://github.com/Arlind-dev/swiss-grades/issues/11)) ([d9991d1](https://github.com/Arlind-dev/swiss-grades/commit/d9991d19b391af73521613e4abfd586285bb4ba1))

## [1.3.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.2.0...v1.3.0) (2026-04-26)

### Features

* ui improvements and project documentation, add footer ([#5](https://github.com/Arlind-dev/swiss-grades/issues/5)) ([3c2ffa9](https://github.com/Arlind-dev/swiss-grades/commit/3c2ffa9226c0d16c5c0e150cc938ab91c7036996))

## [1.2.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.1.1...v1.2.0) (2026-04-26)

### Features

* add semantic-release with verified bot commits ([#4](https://github.com/Arlind-dev/swiss-grades/issues/4)) ([4cd4e75](https://github.com/Arlind-dev/swiss-grades/commit/4cd4e757ba53ffa8c327d4639b368ab6663b054e))

## [1.1.1](https://github.com/Arlind-dev/swiss-grades/compare/v1.1.0...v1.1.1) (2026-04-26)

### Bug Fixes

* rename project ([#2](https://github.com/Arlind-dev/swiss-grades/issues/2))

## [1.1.0](https://github.com/Arlind-dev/swiss-grades/compare/v1.0.0...v1.1.0) (2026-04-26)

### Features

* add cloudflare adapter ([#1](https://github.com/Arlind-dev/swiss-grades/issues/1))

## 1.0.0 (2026-04-26)

### Features

* create swiss grade calculator
