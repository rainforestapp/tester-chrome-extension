# tester-chrome-extension [![CircleCI](https://circleci.com/gh/rainforestapp/tester-chrome-extension/tree/develop.svg?style=shield&circle-token=d0778aa4f75fc5985075320174200051a389c6bf)](https://circleci.com/gh/rainforestapp/tester-chrome-extension/tree/develop) [![Coverage Status](https://coveralls.io/repos/github/rainforestapp/tester-chrome-extension/badge.svg)](https://coveralls.io/github/rainforestapp/tester-chrome-extension)

This is a Chrome extension for testers of the Rainforest [QA Testing Platform](https://www.rainforestqa.com/), it notifies testers there is new work to be done.

## Important!!!

This repo is only for technical discussion of the extension, not for general Rainforest-related discussion. Please use the [tester forum](https://forum.rainforestqa.com/) for general discussion (if you're not sure, the forum is likely the right place to go). If you want to open an issue or contribute, please see the [CONTRIBUTING guide](https://github.com/rainforestapp/tester-chrome-extension/blob/develop/CONTRIBUTING.md).

## Installing from the portal

Note: to use this extension you MUST have done at least one job for us before. This is as we pay you via either Mechanical Turk, or Crowd Flower as normal, against an older job you did.

1. Go to https://portal.rainforestqa.com/login (register from any email from us)
2. Login
3. Click on "Get Chrome Extension"

## Developing

### 1. Clone repo

Clone this repo

### 2. Run the watcher

1. Run the file watcher with `npm run watch` to (re)build on code changes
2. (To test websocket interactions) run schrute locally at localhost:4000 (note: this is not open source)

### 2. Install the extension

1. Go to: chrome://extensions/
2. Enable "Developer Mode"
3. Click "Load unpacked extension"
4. Select `extension` folder in this repo

### 3. Run tests

1. `npm install`
2. `npm run lint`
3. `npm test`

## Deploying

1. Bump the version in `package.json`, `production_manifest.json`, `staging_manifest.json` and `extension/manifest.json`
2. Build on circle and download the staging extension.zip
3. Go to https://chrome.google.com/webstore/devconsole/c9b5ecbf-56cb-42cf-8ad6-29bd19a92412
4. Upload the zip to the staging extension and publish it
5. Once the new staging version is live, approve the RF run
6. Wait for RF run to pass
7. Download the production extension.zip from circle
8. Go back to the developer dashboard and upload and publish the production zip to the production extension
9. merge the PR

## Internal

``password.txt.gpg`` contains the password for ``key.pem.gpg``, it's encrypted using Russ's public key, in case we ever lose it from Circle.
