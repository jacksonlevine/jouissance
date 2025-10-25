import { JSDOM } from 'jsdom';
import fs from 'fs';
import { argv } from 'node:process';
import readline from 'readline';






function processFile() {
    const inputfile = fs.readFileSync(inputPath);

    const dom = new JSDOM(inputfile);
    let masterscript = dom.window.document.createElement("script");

    const componentTypes = [
        {
            htmlselector: "[data-counter]",
            builder_func: (element, id) => {
                element.removeAttribute("data-counter");
                element.setAttribute(`data-counter${id}`, "");

                let button = element.querySelector("[data-counterbutton]");
                button.setAttribute("onclick", `incrementCounter${id}()`);
                button.removeAttribute("data-counterbutton");

                masterscript.innerHTML = masterscript.innerHTML + `
                let counterval${id} = 0;
                let el${id} = document.querySelector('[data-counter${id}]');
                let counterdisplay${id} = el${id}.querySelector("[data-counterdisplay]");
                function incrementCounter${id}() {
                    counterval${id} += 1;
                    counterdisplay${id}.innerHTML = "" + counterval${id};
                }
                `;
            }
        }
    ];

    componentTypes.forEach((scriptType) => {
        dom.window.document.querySelectorAll(scriptType.htmlselector).forEach((element, index) => {
            //we will use index for id
            let id = index;
            scriptType.builder_func(element, id);
        });
    });

    dom.window.document.body.appendChild(masterscript);

    fs.writeFileSync(outputPath, dom.serialize());
    console.log(`Output written to ${outputPath}`);
}









let inputPath = '';
let outputPath = '';
let overwriteOutput = argv.includes('-f');

let nextShouldBeInput = false;
let nextShouldBeOutput = false;
argv.forEach((val, index) => {
    if (nextShouldBeInput) {
        inputPath = val;
        nextShouldBeInput = false;
    }
    if (nextShouldBeOutput) {
        outputPath = val;
        nextShouldBeOutput = false;
    }

    if (val === '-in') {
        nextShouldBeInput = true;
    } else if (val === '-out') {
        nextShouldBeOutput = true;
    }
});

if (!fs.existsSync(inputPath)) {
    console.error(`Error: The input file "${inputPath}" does not exist.`);
    process.exit(1);
}

//Ask for confirmation to overwrite the output file if it exists and -f is not passed
if (fs.existsSync(outputPath) && !overwriteOutput) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`Warning: The output file "${outputPath}" already exists. Do you want to overwrite it? (y/n): `, (answer) => {
        if (answer.toLowerCase() === 'y') {
            processFile();
        } else {
            console.log('Exiting without overwriting the output file.');
            process.exit(0);
        }
        rl.close();
    });
} else {
    processFile();
}


