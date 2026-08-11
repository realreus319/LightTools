# Third-Party Notices

LightTools tracks third-party dependencies before commercial release. The committed lockfile is the source of truth for installed transitive versions.

| Package                        | Version | Purpose                   | License status                                        |
| ------------------------------ | ------- | ------------------------- | ----------------------------------------------------- |
| Next.js                        | 16.2.12 | Web application framework | MIT; retain applicable notices                        |
| React / React DOM              | 19.2.8  | UI runtime                | MIT; retain applicable notices                        |
| Tailwind CSS                   | 4.3.3   | Styling                   | MIT; retain applicable notices                        |
| Appica UI (`@appica/ui-react`) | 1.0.0   | UI component system       | MIT; npm registry metadata verified in CI             |
| Zod                            | 4.4.3   | Runtime schema validation | MIT; official package metadata/documentation verified |
| fflate                         | 0.8.3   | Browser ZIP creation      | MIT; npm package metadata verified                    |
| @jsquash/jpeg                  | 1.6.0   | JPEG WASM encode/decode   | Apache-2.0 package; retain codec notices              |
| @jsquash/png                   | 3.1.1   | PNG WASM encode/decode    | Apache-2.0 package; retain codec notices              |
| @jsquash/webp                  | 1.5.0   | WebP WASM encode/decode   | Apache-2.0 package; retain libwebp notices            |
| @jsquash/avif                  | 2.1.1   | AVIF WASM encode/decode   | Apache-2.0 package; retain libavif/AOM notices        |
| @jsquash/resize                | 2.1.1   | Image resize WASM         | Apache-2.0 package; retain bundled library notices    |
| Vitest                         | 4.1.10  | Unit/integration tests    | MIT; development dependency                           |

## jSquash notice policy

The jSquash repository is Apache-2.0, while bundled codecs include upstream components such as MozJPEG, libwebp, libavif/AOM, Rust PNG and resize libraries. Before a paid release, generate the complete transitive license report from the locked installation and preserve every notice required by those upstream components. Do not reduce the notice obligation to the top-level package license alone.

## Release rule

A dependency with unknown, custom, copyleft, source-available, or otherwise ambiguous commercial terms cannot be shipped in the paid product until legal/engineering review records the exact installed version and applicable license here.
