#!/usr/bin/env node

const yargs = require('yargs');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const screenshotBasePath = 'screenshots';
const screenshotPath = `${screenshotBasePath}/${new Date().toISOString()}`;
const confFile = 'screenerx.conf.json';

async function getArguments() {

    const argv = yargs
        .help('h')
        .alias('h', 'help')
        .example('$0 -f links.txt', 'Use --file option to specify path to file')
        .example('$0 links.txt', 'Use positional argument to specify path to file')
        .options({
            'file': {
                alias: 'f',
                describe: 'Path to link file',
                type: 'string'
            }
        }).argv;

    return {
        linkFile: argv.file
    }
}

async function readConfigFile() {
    try {
        const data = await fs.readFile(confFile, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.log(`Config file ${confFile} does not exist. Using default config.`);

        const defaultConf = {
            "linkFile": "links.txt",
            "tasks": [
                {
                    "name": "screenshot",
                    "enabled": true,
                    "browser": "chrome",
                    "width": 1920,
                    "height": 1080,
                    "fullPage": false
                }
            ]
        }

        return defaultConf;
    }
}

async function createFolder(path) {
    try {
        await fs.access(path);
    } catch {
        await fs.mkdir(path, {recursive: true});
    }
}

async function takeScreenshots(task, conf, arguments) {
    const currentScreenshotPath = `${screenshotPath}/${task.name}_${task.browser}`;
    await createFolder(currentScreenshotPath);

    const browser = await puppeteer.launch({
        product: task.browser,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    await page.setViewport({
        width: task.width,
        height: task.height,
        deviceScaleFactor: 1
    });

    const fullPage = task?.fullPage ?? false;
    const currentLinkFile = arguments.linkFile ?? task.linkFile ?? conf.linkFile ?? "links.txt";
    console.log("Reading links from file: " + currentLinkFile);

    try {
        const links = (await fs.readFile(currentLinkFile, 'utf-8')).split('\n');

        for (const link of links) {
            if (!link) continue;

            const baseUrl = task.baseUrl ?? '';
            const finalUrl = link.startsWith('http') ? link : `${baseUrl}${link}`;

            console.log(`Taking screenshot of ${finalUrl}...`);

            await page.goto(finalUrl, {waitUntil: 'networkidle0'});

            await page.screenshot({
                path: `${currentScreenshotPath}/${link.replace(/[^a-z0-9]/gi, '-')}.png`,
                fullPage: fullPage
            });
        }

        await browser.close();

    } catch (err) {

        if (err.code === 'ENOENT') {
            console.log(`Link file ${currentLinkFile} does not exist.`);
            return;
        }

    }
}

(async () => {
    const conf = await readConfigFile();
    const arguments = await getArguments();

    for (const task of conf.tasks) {
        if (!task.enabled ?? true) continue;
        await takeScreenshots(task, conf, arguments);
    }

    console.log("Done!");
    process.exit(0);
})();
