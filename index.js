import { JSDOM } from 'jsdom';
import fs from 'fs';

const inputfile = fs.readFileSync('input.html', 'utf-8');

const dom = new JSDOM(inputfile);

let masterscript = dom.window.document.createElement("script");

const componentTypes = [

    {
        htmlselector: "[counter]",
        builder_func: (element, id) => {
            element.removeAttribute("counter");
            element.setAttribute("id", `counter${id}`);

            let button = element.querySelector("[counterbutton]");
            button.setAttribute("onclick", `incrementCounter${id}()`);;
            button.removeAttribute("counterbutton");

            masterscript.innerHTML = masterscript.innerHTML + `
            let counterval${id} = 0;
            let el${id} = document.querySelector('#counter${id}');
            let counterdisplay${id} = el${id}.querySelector("[counterdisplay]");
            function incrementCounter${id}() {
                counterval${id} += 1;
                counterdisplay${id}.innerHTML = "" + counterval${id};
            }
            `;
        }
    }
];

componentTypes.forEach((scriptType)=> {
    dom.window.document.querySelectorAll(scriptType.htmlselector).forEach((element, index)=> {
        //we will use index for id
        let id = index;
        scriptType.builder_func(element, id);
    });
});

dom.window.document.body.appendChild(masterscript);

fs.writeFileSync('output.html', dom.serialize(), 'utf-8');