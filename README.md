# Hydra Source Installer

An unofficial static website for opening authorized Hydra Launcher download-source URLs through Hydra's supported custom URL protocol.

## How it works
1. A user chooses a source on the website.
2. The website opens `hydralauncher://install-source?url=...`.
3. Hydra handles the deep link and presents its own source-install flow.
4. The website never writes to Hydra's local files.

## Add sources
Edit `sources.js` and add only sources you are authorized to distribute or recommend.

This project is not affiliated with Hydra Launcher and must not be used to bypass authentication, signatures, or access controls.