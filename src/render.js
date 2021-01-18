// import parser from './parser';
// import analyze from './analyze';
import { 
    HEADER,
    CODE,
    NL,
    TEXT,
    SPACE,
    HASH,
    HR,
    EM,
    STRONG,
} from './globals';

// const t = parser.parse()

function render(t) {
    let s = '';
    switch(t.type) {
        case HEADER:
            s = render_header(t);
            break;
        case CODE:
            s = render_code(t);
            break;
        case NL:
            s = '\n';
            break;
        case TEXT:
            s = render_text(t);
            break;
        case HR:
            s = render_hr();
            break;
        case EM:
            s = render_em(t);
            break;
        case STRONG:
            s = render_strong(t);
            break;
        default:
            s = t.raw;
            break;
    }
    return s;
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
    while(cTree) {
        nodes.push(cTree);
        cTree = cTree.sibling;
    }
    // if (cTree) {

    // }
    // if (cTree && cTree.sibling) {
    //     nodes.push(cTree)
    //     cTree = cTree.sibling;
    // }
    // if (cTree) {
    //     nodes.push(cTree);
    // }

    let isTrailHash = true;
    let isTrailSpace = true;

    for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].type === SPACE && isTrailSpace) {
            // "### " remove trail space
            nodes.pop();
        } else {
            if (nodes[i].type === HASH && isTrailHash) {           
                if (i === 0 ) {
                    nodes.pop(); 
                    break;
                }
                if (nodes[i-1].type === SPACE) {
                    // only remove alone hash "  ###"
                    nodes.pop();
                    nodes.pop();
                    i -= 2;
                    isTrailHash = false;
                } 
            } else {
                isTrailHash = false;
            }
        }
        isTrailSpace = false;
    }
    let str = '';
    for (let i = 0, l = nodes.length; i < l; i++) {
        // str += nodes[i].raw;
        str += render(nodes[i]);
    }
    str = str.trim()

    return `<h${t.num}>${str}</h${t.num}>`;
}
function render_code(t) {
    return `<pre><code>${t.value}</code></pre>`
}

function render_text(t) {
    let str = t.raw;
    for (var i = 0, l = t.child.length; i < l; i++) {
        str += render(t.child[i])
    }
    if (t.level === 0) {
        return `<p>${str}</p>`;
    } else {
        return str;
    }
}

function render_hr() {
    return `<hr />`;
}

function render_em(t) {
    return `<em>${t.value}</em>`;
}

function render_strong(t) {
    return `<strong>${t.value}</strong>`;
}

export default comiple;