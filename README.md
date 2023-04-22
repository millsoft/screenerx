# screenerx

This nodejs project will create batch screenshots of websites.
It uses the awesome puppeteer library which uses a real browser under the hood, e.g. a Chrome or Firefox.

## Installation

```bash
npm install -g screenerx
# or:
yarn global add screenerx
```

## Usage

create a file called `screenerconf.json`, you can see at `screenerconf.json.example` for an example.
An entry looks basically like this:

```json
{
    "linkFile" : "links.txt",
    "tasks": [
        {
            "name" : "test_landscape",
            "enabled" : true,
            "baseUrl" : "https://www.example.com",
            "linkFile" : "links.txt",
            "browser" : "chrome",
            "width" : 1920,
            "height" : 1080,
            "fullPage" : false
        }
    ]
}
```

| prop     | description                                                                                                     |
|----------|-----------------------------------------------------------------------------------------------------------------|
| name     | name of the task, this will be used in directory name                                                           |
| enabled  | should this task run?                                                                                           |
| baseUrl  | if you specify a baseUrl, you can use paths only in your urlfile                                                |
| browser  | chrome, firefox, etc.. Default is chrome, if you need another browsers, see puppeteer docs how to install these |
| width    | width of the screen                                                                                             |
| height   | height of the screen                                                                                            |
| fullPage | if true, the screenshot will be made of the full site (ignores the width param)                                 |
| linkFile | set a different link file for this job                                                                          |

create a a text file and put your links into that file. For example `links.txt` (as specified above in json)
The link list can be a normal list with full URLs starting with http://, https:// or you can also only specify the paths. for example /about. The full URL will be generated out of provided baseUrl in `screenerx.conf.json` and the provided path in links.txt
You can specify the linkFile in the root of the json file, but you can also specify / override it in the task itself.

Now start the screenerx process:

```
screenerx
```

The screenshots will be made in the screenshot folder.

## Arguments

You can also specify a link file:

```
screenerx --file=links2.txt
```