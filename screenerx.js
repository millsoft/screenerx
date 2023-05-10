#!/usr/bin/env node
const readline = require('readline');

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
        })
        //add a new option for "width":
        .options({
            'width': {
                alias: 'w',
                describe: 'Width of the viewport',
                type: 'number'
            }
        })
        //add a new option for "height":
        .options({
            'height': {
                alias: 'h',
                describe: 'Height of the viewport',
                type: 'number'
            }
        })
        //add a new option for "fullPage":
        .options({
            'fullPage': {
                describe: 'Full page screenshot',
                type: 'boolean'
            }
        })
        //add a new option for "url":
        .options({
            'url': {
                describe: 'URL to screenshot',
                type: 'string'
            }
        }).argv;


    return {
        linkFile: argv.file,
        url: argv.url
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

    let links = [];
    const currentLinkFile = arguments.linkFile ?? task.linkFile ?? conf.linkFile ?? "links.txt";

    if (arguments.url) {
        links = [arguments.url];
    } else if (arguments.linkFile) {
        console.log("Reading links from file: " + currentLinkFile);
        links = (await fs.readFile(currentLinkFile, 'utf-8')).split('\n');
    }

    console.log("LINKS: " + links);

    try {
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
