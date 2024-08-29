# doom-dialogue-template-tool

This tool is designed to make maintaining complex [Strife](https://zdoom.org/wiki/DIALOGUE)/[USDF](https://zdoom.org/wiki/Universal_Strife_Dialog_Format)/[ZSDF](https://zdoom.org/wiki/ZDoom_Strife_Dialog_Format) dialogue projects easier.

Currently it provides two main features:
1. Merging multiple conversations from separate files into one file with a single, customizable header.
2. Using label tokens in place of where you would normally have to write a page index. This means you can insert pages freely inside existing `conversation` blocks and all the references to existing pages will update automatically.

# Requirements
This tool is a JavaScript CLI application, tested with [Node.js v12.18.4 and above](https://nodejs.org/en/download/package-manager). It may work with older versions but has not been tested.

# Installation
Clone this repository with git or use the Code -> Download Zip menu to download a zip archive and extract it.

Navigate to the folder you just downloaded and run `npm install` from the root, where the `package.json` file is.

# Running the tool
There are three ways to invoke the tool from the command line that all work about the same:

Via Node.js:
```sh
node template-tool.js
```

Via NPM:
```sh
npm run template-tool
```

As a Unix Shell Executable:
```sh
./template-tool.js
```

Running the tool with no arguments or the `--help` flag will print help on what the various arguments are.

Here is an example invocation:
```sh
node template-tool.js --templates-dir examples/dialogue_templates/ --template-extension .template.usdf --out-file examples/test_merged.usdf --header examples/test-header.template.usdf  --verbose
```

This invocation will look for template files in the `examples/dialogue_templates/` directory with the extension `.template.usdf` and will use a custom header file from `examples/test-header.template.usdf`, and write the merged output to `examples/test_merged.usdf` with verbose logging enabled.

Note that a custom header template is not required, if none is supplied a default header of `namespace = "ZDoom";` will be used.

If a `--template-extension` is not supplied, all files in the `--templates-dir` will be selected.

# Creating Dialogue Template Files
A dialogue template file is a doom dialogue text file with some special tokens added. The tool supports two types of tokens: page label declaration tokens, and page label substitution tokens.

It is possible to make a template file without page labels, for instance if you are making a simple conversation without any jumps, you can omit the label tokens and the file will be passed through and merged with the other template files.

But I think this feature is really the main value-add of this tool, so I would recommend using it.

## Page Label Declaration Tokens
One and only one unique page label declaration token should exist for each page that needs a label. If you are using labels in the template file at all, you should create a label for every page of dialogue in the template file. Label names must be unique within a template file but do not need to be unique between different template files, each file gets its own namespace.

Page labels are expected to begin with `PAGE_` and then contain some unique sequence of alphanumeric characters and optionally underscores. For example, `PAGE_START`. A declaration token is a **comment** in the file containing a page label wrapped in double curly braces, such as `// {{PAGE_START}}`.

This token should be put next to the `page` block it corresponds to as the order the tokens are declared in determines their page index in the merged output file. So if the page labels get out of order somehow or a page is missing a label, the label substitution tokens will link to the wrong pages. This will also help keep track of what goes where and to make the merged dialogue file more self-documenting.

## Page Label Substitution Tokens
You can have zero or more page label substitution token for each declared page label. These tokens should be placed anywhere you would normally put a page index in the dialogue file, such as the `nexpage` property of a `choice` block, or a `link` property of a `page`. Substitution tokens take the form `<%= PAGE_LABEL %>`, so for example if you wanted to insert the page index of `PAGE_START` declared above you would write `<%= PAGE_START %>`.

Here's an example of a substitution token in context:
```
nextpage = <%= PAGE_WHERE_GET %>; // PAGE_WHERE_GET 
```

In the merged output file, this would become something like:
```
nextpage = 2; // PAGE_WHERE_GET 
```

The comment at the end of the line is not strictly necessary, but I would recommend adding it because it helps track what page label is being referenced when looking at the merged output file.

Substitution tokens referencing page labels which have not been declared are not allowed and will result in a fatal error.

## Page Declaration Comments
This is not strictly necessary, but I found it helpful to add some additional info in the page label declaration comment to make things easier to follow in the merged output file. I put a comment like this at the beginning of every page:
```
page //ID={{PAGE_START}} Index=<%= PAGE_START %>
```

In the merged ouput file, this becomes:
```
page //ID={{PAGE_START}} Index=1
```

So I think this helps if you need to read the merged output file to get a better view at what the game engine is seeing, you can easily see which page label and index are assigned to a given `page` block.

# Examples
Check out the [examples](./examples) folder for an example of a simple project setup. If you have a unix shell environment you can run the [build_examples.sh](./examples/build_examples.sh) script to build the project. If you don't have this environment, take a look at the source code for the shell script to see an example invocation of the tool.