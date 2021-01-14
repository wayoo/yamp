// import parser from './parser';
// import analyze from './analyze';
import { 
    HEADER,
    CODE,
} from './globals';


// const t = parser.parse()

function render(treeNode) {
    let htmlStr = '';
    switch(treeNode.type) {
        case HEADER:
            htmlStr = render_header(treeNode);
            break;
        case CODE:
            htmlStr = render_code(treeNode);
            break;
    }
    return htmlStr;
}

function traverse(t, str) {
    if (t !== undefined) {
        str += render(t);
        if (t.sibling) {
            str = traverse(t.sibling, str);
        }
    }
    return str;
}

function comiple(t) {
    return traverse(t, '');
}


function render_header(t) {
    console.log(t);
    return `<h${t.num}>${t.value.trim()}</h${t.num}>\n`;
}
function render_code(t) {
    return `<pre><code>${t.value}</code></pre>`
}

export default comiple;