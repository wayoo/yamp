import scaner from './scaner';
import {
    TRUE,
    FALSE,
    START,
    IN_PRE_HEADER,
    IN_HEADER,
    IN_HEADER_ID,
    IN_TEXT,
    IN_OPEN_BRACKET,

    DONE,

    HEADER,
    TEXT,
    END,

    SPACE,
    TAB,
    ASTERISK,
    UNDERSCORE,
    NL,
    BACKTICK,
    LBRACKET,
    RBRACKET,
    LPAREN,
    RPAREN,
    HASH,
    FSPACE,

    CODE,
    CHAR,
} from './globals';

class TreeNode {
    constructor(type) {
        this.type = type;
        this.child = [];
        this.sibling;
    }
}

let tokenType, tokenString, textCache = [];


class TokenHelper {
    constructor() {
        this.tokenStringList = [];
    }
    getAndCache() {
        // console.log('====>:', tokenType, tokenString);
        this.tokenStringList.push(tokenString);
        ({ tokenType, tokenString } = scaner.getToken());
    }
    getToken() {
        // console.log('====>:', tokenType, tokenString);
        ({ tokenType, tokenString } = scaner.getToken());
    }
    dump() {
        const str = this.tokenStringList.join('');
        this.tokenStringList = [];
        return str;
    }
}

const tokenHelper = new TokenHelper();

function match(expectToken) {
    if (tokenType == expectToken) {
        ({ tokenType, tokenString } = scaner.getToken());
    } else {
        console.error("[match] unexpected token -> ");
        console.log(tokenType, tokenString);
    }
}



function stmt_sequence() {
    let t = statement();
    let p = t;

    while (tokenType != END) {
        let q = statement();
        if (q != undefined) {
            if (t === undefined) {
                t = p = q;
            } else {
                p.sibling = q;
                p = q;
            }
        }
    }
    
    return t;
}

function inline_stmt_sequence() {
    let t = inline_statement();
    let p = t;
    while (tokenType != NL) {
        console.log("XX", tokenType);
        let q = inline_statement();
        if (q !== undefined) {
            if (t === undefined) {
                t = p = q;
            } else {
                p.sibling = q;
                p = q;
            }
        }
    }
    return t;
}

function statement() {
    let t;
    switch (tokenType) {
        case HASH:
            t = head_stmt();
            break;
        case NL:
            t = newline_stmt();
            break;
        case TEXT:
            t = text_stmt();
            break;
        case SPACE:
            t = space_stmt();
            break;
        case FSPACE:
            t = four_space_stmt();
            break;
        default:
            console.error("not handled ", tokenType, tokenString);
            tokenHelper.getToken();
            break;
    }
    return t;
}

function inline_statement() {
    console.log('inline state mentl');
    let t;
    switch(tokenType) {
        case HASH:
        case CHAR:
            if (tokenString === '#') {
                t = merge_hash_exp();
            } else {
                t = default_inline_stmt();
            }
            break;
        default:
            t = default_inline_stmt();
            break;
    }
    return t;
}

function newline_stmt() {
    console.log("new line ....")
    const t = new TreeNode(NL);
    t.raw = tokenString;
    match(NL);
    
    return t;
}


function head_stmt() {
    console.log("^^^^^^^^^^^^^^^^");
    const t = new TreeNode(HEADER);
    let hashCount = 0;
    do {
        tokenHelper.getAndCache();
        hashCount++;
    } while (tokenType === HASH);
    if (hashCount > 6 || tokenType != SPACE) {
        console.log(tokenType);
        // not head_stmt, treat as text_stmt
        console.log("TETETE")
    } else {
        match(SPACE);
        t.child[0] = inline_stmt_sequence();
        // let val = '';
        // while(tokenType != NL) {
        //     // TODO not handling tokenType inside header;
        //     val += tokenString;
        //     tokenHelper.getAndCache);
        //     // console.log(tokenType, tokenString);
        // }
        // t.value = val;
        // t.sibling = new TreeNode(NL)
    }
    t.num = hashCount;
    t.raw = tokenHelper.dump();
    return t;
}

function default_inline_stmt() {
    const t = new TreeNode("default inline stmt");
    console.error(tokenType, tokenString);
    t.raw = tokenString;
    t.rawType = tokenType;
    tokenHelper.getAndCache();
    return t;
}

// filter 4 space
function space_stmt() {
    let i = 0;
    do {
        tokenHelper.getAndCache();
        i++;
    } while (tokenType === SPACE);
    const t = new TreeNode(SPACE);
    t.num = i;
    t.raw = tokenHelper.dump();
    // console.log(i)
    // console.log(tokenType, tokenString);
    return t;
}

function four_space_stmt() {
    do {
        tokenHelper.getAndCache();
    } while (tokenType !== NL && tokenType !== END);
    // tokenType === NL
    const t = new TreeNode(CODE);
    t.raw = tokenHelper.dump();
    t.value = t.raw.slice(4);

    return t;
}


function merge_hash_exp() {
    const t = new TreeNode(HASH);
    let s = '';
    do {
        s += tokenString;
        tokenHelper.getAndCache();
    } while(tokenString === '#')
    t.raw = s;
    t.value = s;
    return t;
}


function line_exp() {
    const t = new treeNode();
}


let INDENT = 0;
function printTree(treeNode) {
    console.log(' '.repeat(INDENT), treeNode.type, treeNode.raw, treeNode.rawType);
    let l = treeNode.child.length;
    if (l > 0) {
        INDENT += 4;
        for (let i = 0; i < l; i++) {
            printTree(treeNode.child[i]);
        } 
        INDENT -= 4;
    }


    if (treeNode.sibling) {
        printTree(treeNode.sibling);
    }
}

let rootT;

function parse() {
    ({ tokenType, tokenString } = scaner.getToken());
    rootT = null;
    rootT = stmt_sequence();
    if (tokenType != END) {
        console.error("Code ends before file\n");
        console.log(tokenType);
    }

    console.log('=== TTTTTTT ======= :::::')
    printTree(rootT)

    console.log(rootT);
    return rootT;
}

export default {
    parse
};