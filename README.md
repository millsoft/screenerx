# Screenerx

This nodejs project will create batch screenshots of websites.
It uses the awesome puppeteer library which uses a real browser under the hood, e.g. a Chrome or Firefox.

## Installation

```bash
npm install -g screenerx
# or:
yarn global add screenerx
# or use docker (see below)
```

## Usage

### Use arguments

You can call screenerx with arguments:


#### Examples
```bash
# create a screenshot with default settings
screenerx --url https://example.com

# set width and height
screenerx --url https://example.com --width=1200 --height=800

# create a full page screenshot
screenerx --url https://example.com --width=1200 --height=full

# set output path
screenerx --url https://example.com --width=1200 --height=800 --output-path=screenshots/test

# set output file (if not set, the url will be used)
screenerx --url https://example.com --width=1200 --height=800 --output-path=screenshots/test --output-file=example.jpg

# pass an url via stdin (e.g. from a file or echo)
echo "https://example.com" | xargs -I {} ./screenerx.js --url={}
 
# create screenshots in parallel (using gnu-parallel) with 4 threads: 
cat links.txt | parallel --line-buffer -j 4 screenerx --url {}

# docker example (see below for more information)
cat links.txt | parallel --line-buffer -j 4 docker-compose run --rm screenerx --url {}

# specify a link file, default is links.txt (link file is ignored if you specify an url!)
screenerx --file=links.txt
```

### Create a config file

If you like, you can also create a config file. The config file will be used to generate the screenshots.

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
            "width" : "1920",
            "height" : "1080"
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
| height   | height of the screen, can be also "full" to create full size screenshots                                        |
| linkFile | set a different link file for this job                                                                          |

create a text file and put your links into that file. For example `links.txt` (as specified above in json)
The link list can be a normal list with full URLs starting with http://, https:// or you can also only specify the paths. for example /about. The full URL will be generated out of provided baseUrl in `screenerx.conf.json` and the provided path in links.txt
You can specify the linkFile in the root of the json file, but you can also specify / override it in the task itself.

The screenshots will be made in the screenshot folder.


## Docker

You can also use this tool in a docker container.
Just build the container with `docker build -t screenerx .` and run it with `docker run -it --rm -v $(pwd):/app/screenshots screenerx`

or use the docker-compose file:

```bash
docker-compose run --rm screenerx
```

## License
MIT

## Author
Michael Milawski
