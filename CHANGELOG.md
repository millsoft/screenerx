### 1.1.1 - 2023-05-21
Added
- Support for Docker. Added Dockerfile and docker-compose.yml. Puppeteer will be started with --no-sandbox and --disable-setuid-sandbox to make it work in docker.

### 1.1.0 - 2023-05-20
Added
- New arguments: --url, --width, --height, --outputPath, --outputFile have been added.
- Added support for stdin input, so you can for example use gnu-parallel to create screenshots in parallel. See README.md for an example.
- Removed fullPage argument, use --height=full instead.

### 1.0.1 - 2023-04-20
Release
- Initial release.