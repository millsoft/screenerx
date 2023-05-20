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
        .example('$0 --width=800 --height=400', 'set the width and height of the viewport')
        .example('$0 --url=https://example.com', 'take a screenshot of a single URL (ignores link file)')
        .example('$0 --outputPath=screenshots', 'save screenshots to a custom folder')
        .example('$0 --outputFile=screenshots.jpg', 'save screenshots to a single file')
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
                describe: 'Width of the viewport',
                type: 'string'
            }
        })
        //add a new option for "height":
        .options({
            'height': {
                describe: 'Height of the viewport',
                type: 'string'
            }
        })
        //add output path option:
        .options({
            'outputPath': {
                describe: 'Path to save screenshots',
            }
        })
        .options({
            'outputFile': {
                describe: 'Save screenshots to a single file',
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
        url: argv.url,
        width: argv.width || undefined,
        height: argv.height || undefined,
        outputPath: argv.outputPath || undefined,
        outputFile: argv.outputFile || undefined
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
                    "height": 1080
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
    const currentScreenshotPath = arguments.outputPath ?? `${screenshotPath}/${task.name}_${task.browser}`;
    await createFolder(currentScreenshotPath);

    const browser = await puppeteer.launch({
        headless: "new",
        product: task.browser,
        ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();

    let height = arguments.height ?? task.height ?? 'full';
    let fullPage = false;
    if(height === 'full'){
        fullPage = true;
        height = 800;
    }

    const viewPortCongig = {
        width: parseInt(arguments.width ?? task.width ?? 1920),
        height: parseInt(height),
        deviceScaleFactor: 1
    };
    await page.setViewport(viewPortCongig);

    let links = [];
    const currentLinkFile = arguments.linkFile ?? task.linkFile ?? conf.linkFile ?? "links.txt";


    if (arguments.url) {
        links = [arguments.url];
    } else {
        links = (await fs.readFile(currentLinkFile, 'utf-8')).split('\n');
    }

    try {
        for (const link of links) {
            if (!link) continue;

            const baseUrl = task.baseUrl ?? '';
            const finalUrl = link.startsWith('http') ? link : `${baseUrl}${link}`;

            console.log(`Taking screenshot of ${finalUrl}...`);
            await page.goto(finalUrl, {waitUntil: 'networkidle0'});

            const outputFile = arguments.outputFile ?? `${link.replace(/[^a-z0-9]/gi, '-')}.jpg`;
            const screenshotParams = {
                path: `${currentScreenshotPath}/${outputFile}`,
                fullPage: fullPage
            };
            await page.screenshot(screenshotParams);
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
