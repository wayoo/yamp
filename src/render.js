// import parser from './parser';
// import analyze from './analyze';
import { 
    HEADER,
    CODE,
    NL,
    TEXT,
    SPACE,
    HASH,
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
        case NL:
            htmlStr = '\n';
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
    let cTree = t.child[0];
    const nodes = [];
    do {
        nodes.push(cTree)
        cTree = cTree.sibling;
    } while(cTree);
    let trailHashRemoved = false;
    for (let i = nodes.length - 1; i > 0; i--) {
        if (nodes[i].type === HASH && !trailHashRemoved) {
            trailHashRemoved = true;
            nodes.pop()
        } else if (nodes[i].type === SPACE) {
            nodes.pop()
        } else {
            break;
        }
    }
    let str = '';
    for (let i = 0, l = nodes.length; i < l; i++) {
        str += nodes[i].raw;
    }
    str = str.trim()

    return `<h${t.num}>${str}</h${t.num}>`;
}
function render_code(t) {
    return `<pre><code>${t.value}</code></pre>`
}

export default comiple;