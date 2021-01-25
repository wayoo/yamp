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
    PARAGRAPH,
    MULTINL,
    PUNCTUATION,
    INLINE,
    ENDNL,
    CODEINLINE,
} from './globals';

// const t = parser.parse()

function render(t) {
    let s = '';
    switch(t.type) {
        case HEADER:
            s = render_header(t);
            break;
        case CODE:
        case CODEINLINE:
            s = render_code(t);
            break;
        case ENDNL:
        case NL:
        case MULTINL:
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
        case PARAGRAPH:
            s = render_paragraph(t);
            break;
        case PUNCTUATION:
            s = render_escaped(t);
            break;
        case INLINE:
            s = render_inline(t);
            break;            
        default:
            s = t.raw;
            // console.log('[Render] not rendered: ', t);
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
            console.log("JASS   ", HASH, isTrailHash);
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
    if (t.type === CODE) {
        return `<pre><code>${t.value}</code></pre>`;
    } else {
        return `<code>${t.value}</code>`;
    }
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

function render_escaped(t) {
    let str = t.value;
    return str;
}

function render_hr() {
    return `<hr />`;
}

function render_em(t) {
    let n = t.child[0];
    let str = '';
    while(n) {
        str += render(n);
        n = n.sibling;
    }
    return `<em>${str}</em>`;

    // return `<em>${t.value}</em>`;
}

function render_strong(t) {
    let n = t.child[0];
    let str = '';
    while(n) {
        str += render(n);
        n = n.sibling;
    }
    return `<strong>${str}</strong>`;
}

function render_inline(t) {
    let n = t.child[0];
    let str = '';
    while(n) {
        str += render(n);
        n = n.sibling;
    }
    return str;
}

function render_paragraph(t) {
    let n = t.child[0];
    let str = '';
    while(n) {
        str += render(n);
        n = n.sibling;
    }
    return `<p>${str}</p>`;
};

export default comiple;