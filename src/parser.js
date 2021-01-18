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
    HR,
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
        this.cachedTokenList = [];
        this.useCachedToken = false;
        this.usedCacheTokenIndex = 0;
    }
    getAndCache() {
        // console.log('====>:', tokenType, tokenString);
        const token = scaner.getToken();
        this.cachedTokenList.push(token);
        ({tokenType, tokenString} = token);
        return token;
    }
    useCachedTokens() {
        this.useCachedToken = true;
    }
    getToken() {
        // if (this.useCachedToken) {
        //     if (this.usedCacheTokenIndex < this.cachedTokenList ) {

        //     }
        // } 

        ({ tokenType, tokenString } = scaner.getToken());
        // console.log('====>:', tokenType, tokenString);
    }
    dump() {
        const str = this.cachedTokenList.map((item) => item.tokenString).join('');
        // const str = this.cachedTokenList.join('');
        this.cachedTokenList = [];
        return str;
    }
    dumpWithoutCurrent() {
        this.cachedTokenList.pop();
        const str = this.cachedTokenList.map((item) => item.tokenString).join('');
        // const str = this.cachedTokenList.join('');
        this.cachedTokenList = [];
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
function matchWithCache(expectToken) {
    if (tokenType == expectToken) {
        ({ tokenType, tokenString } = tokenHelper.getAndCache());
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
    while (tokenType != NL && tokenType != END) {
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
        case HEADER:
            t = head_stmt();
            break;
        case NL:
            t = newline_stmt();
            break;
        case TEXT:
        case CHAR:
        case HASH:
            t = text_stmt();
            break;
        case SPACE:
            t = space_stmt();
            break;
        case FSPACE:
            t = four_space_stmt();
            break;
        case HR:
            t = simple_node(HR);
            break;
        default:
            console.error("not handled ", tokenType, tokenString);
            tokenHelper.getToken();
            break;
    }
    return t;
}

function simple_node (n) {
    match(n);
    return new TreeNode(n);
}

function inline_statement() {
    console.log('inline state mentl', tokenString);
    let t;
    switch(tokenType) {
        case HASH:
            if (tokenString === '#') {
                t = merge_hash_exp();
            } else {
                t = default_inline_stmt();
            }
            break;
        case SPACE:
            t = space_stmt();
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

function text_stmt() {
    console.log(tokenType, tokenString);
    const t = new TreeNode(TEXT);
    t.raw = tokenString;
    tokenHelper.getToken();
    // match(NL);
    return t;
}

function head_stmt() {
    console.log("^^^^^^^^^^^^^^^^", tokenString);
    const t = new TreeNode(HEADER);
    t.num = tokenString.trim().length;

    match(HEADER);

    console.log(")))))))))", tokenType, JSON.stringify(tokenString))
    if(tokenType === NL){
        // directly followed by newline element, have no children;
        return t;    
    } else {
        t.child[0] = inline_stmt_sequence();
        t.raw = tokenHelper.dump();
    }
    // t.child[0] = inline_stmt_sequence();
    // tokenHelper.getAndCache();
    // if (hashCount > 6 || tokenType != SPACE) {
    //     console.log(tokenType);
    //     // not head_stmt, treat as text_stmt
    //     console.log("TETETE")
    //     tokenHelper.useCachedToken();
    //     t = multiline_text_stmt();
    //     return t;
    // } else {
    //     matchWithCache(SPACE);
    //     t.child[0] = inline_stmt_sequence();
    //     // let val = '';
    //     // while(tokenType != NL) {
    //     //     // TODO not handling tokenType inside header;
    //     //     val += tokenString;
    //     //     tokenHelper.getAndCache);
    //     //     // console.log(tokenType, tokenString);
    //     // }
    //     // t.value = val;
    //     // t.sibling = new TreeNode(NL)
    // }

    return t;
}

function multiline_text_stmt() {
    // t = 
};

function default_inline_stmt() {
    const t = new TreeNode("default inline stmt");
    console.error(tokenType, tokenString);
    t.raw = tokenString;
    t.rawType = tokenType;
    tokenHelper.getAndCache();
    return t;
}

function space_stmt() {
    let i = 0;
    do {
        tokenHelper.getAndCache();
        i++;
    } while (tokenType === SPACE);
    const t = new TreeNode(SPACE);
    t.num = i;
    t.raw = ' '.repeat(i);
    // t.raw = tokenHelper.dump();
    // console.log(i)
    // console.log(tokenType, tokenString);
    return t;
}

// filter 4 space
function four_space_stmt() {
    do {
        tokenHelper.getAndCache();
    } while (tokenType !== NL && tokenType !== END);
    // tokenType === NL
    const t = new TreeNode(CODE);
    t.value = tokenHelper.dumpWithoutCurrent();
    t.raw = '    ' + t.value;

    return t;
}


function merge_hash_exp() {
    const t = new TreeNode(HASH);
    let s = '';
    do {
        s += tokenString;
        tokenHelper.getAndCache();
    } while(tokenType === HASH)
    t.raw = s;
    t.value = s;
    return t;
}


function line_exp() {
    const t = new treeNode();
}


let INDENT = 0;
function printTree(treeNode) {
    console.log(' '.repeat(INDENT), treeNode.type, treeNode);
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