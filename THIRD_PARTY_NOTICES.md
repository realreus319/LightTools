# Third-Party Notices

LightTools tracks third-party dependencies before commercial release. The committed lockfile is the source of truth for installed transitive versions.

| Package                                      | Version | Purpose                          | License status                                        |
| -------------------------------------------- | ------- | -------------------------------- | ----------------------------------------------------- |
| Next.js                                      | 16.2.12 | Web application framework        | MIT; retain applicable notices                        |
| React / React DOM                            | 19.2.8  | UI runtime                       | MIT; retain applicable notices                        |
| Tailwind CSS                                 | 4.3.3   | Styling                          | MIT; retain applicable notices                        |
| Appica UI (`@appica/ui-react`)               | 1.0.0   | UI component system              | MIT; npm registry metadata verified in CI             |
| Zod                                          | 4.4.3   | Runtime schema validation        | MIT; official package metadata/documentation verified |
| fflate                                       | 0.8.3   | Browser ZIP creation             | MIT; npm package metadata verified                    |
| @jsquash/jpeg                                | 1.6.0   | JPEG WASM encode/decode          | Apache-2.0 package; retain codec notices              |
| @jsquash/png                                 | 3.1.1   | PNG WASM encode/decode           | Apache-2.0 package; retain codec notices              |
| @jsquash/webp                                | 1.5.0   | WebP WASM encode/decode          | Apache-2.0 package; retain libwebp notices            |
| @jsquash/avif                                | 2.1.1   | AVIF WASM encode/decode          | Apache-2.0 package; retain libavif/AOM notices        |
| @jsquash/resize                              | 2.1.1   | Image resize WASM                | Apache-2.0 package; retain bundled library notices    |
| pdf-lib                                      | 1.17.1  | PDF create/merge/split           | MIT; retain applicable notices                        |
| pdfjs-dist                                   | 5.7.284 | PDF page rendering               | Apache-2.0; retain applicable notices                 |
| qrcode                                       | 1.5.4   | Browser QR code generation       | MIT; retain applicable notices                        |
| @img/sharp-libvips-linux-x64                 | 1.2.4   | Optional Next/sharp libvips      | LGPL-3.0-or-later; pinned reviewed exception          |
| @img/sharp-libvips-linuxmusl-x64             | 1.2.4   | Optional Next/sharp libvips      | LGPL-3.0-or-later; pinned reviewed exception          |
| Vitest                                       | 4.1.10  | Unit/integration tests           | MIT; development dependency                           |

## jSquash notice policy

The jSquash repository is Apache-2.0, while bundled codecs include upstream components such as MozJPEG, libwebp, libavif/AOM, Rust PNG and resize libraries. Before a paid release, generate the complete transitive license report from the locked installation and preserve every notice required by those upstream components. Do not reduce the notice obligation to the top-level package license alone.

## PDF notice policy

`pdf-lib` is MIT licensed. `pdfjs-dist` is the distributed package of Mozilla PDF.js and is Apache-2.0 licensed. Production releases must preserve all license/notice files carried by the exact locked packages and any bundled worker/font assets that are shipped.

## libvips exception

Next.js may install platform-specific `@img/sharp-libvips-*` packages as optional transitive dependencies. The current Linux glibc and musl packages are pinned at `1.2.4` and report `LGPL-3.0-or-later`. They are not browser-side LightTools codecs. The automated license gate accepts only these exact reviewed package/version/license tuples; any version, package, or license change fails CI and requires a new commercial distribution review. Required LGPL notices and relinking/source obligations must be preserved wherever these binaries are actually distributed.

## Release rule

A dependency with unknown, custom, copyleft, source-available, or otherwise ambiguous commercial terms cannot be shipped in the paid product until engineering/compliance review records the exact installed version and applicable license here. Reviewed copyleft exceptions must remain explicitly pinned in the automated license gate.
