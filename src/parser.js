import scaner from './scaner';
import logger from './logger';
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
    EM,

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
        // logger.log('====>:', tokenType, tokenString);
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
        // logger.log('====>:', tokenType, tokenString);
    }
    prevToken() {
        return this.cachedTokenList[this.cachedTokenList.length - 1];
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
        logger.error("[match] unexpected token -> ");
        logger.log(tokenType, tokenString);
    }
}
function matchWithCache(expectToken) {
    if (tokenType == expectToken) {
        ({ tokenType, tokenString } = tokenHelper.getAndCache());
    } else {
        logger.error("[match] unexpected token -> ");
        logger.log(tokenType, tokenString);
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
            logger.error("not handled ", tokenType, tokenString);
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
    // logger.log('inline state mentl', tokenString);
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
        case ASTERISK:
            t = em_stmt();
            break;
        default:
            t = default_inline_stmt();
            break;
    }
    return t;
}

function newline_stmt() {
    logger.log("new line ....")
    const t = new TreeNode(NL);
    t.raw = tokenString;
    match(NL);
    
    return t;
}

function text_stmt() {
    logger.log(tokenType, tokenString);
    const t = new TreeNode(TEXT);
    t.raw = tokenString;
    tokenHelper.getToken();
    // match(NL);
    return t;
}

function head_stmt() {
    const t = new TreeNode(HEADER);
    t.num = tokenString.trim().length;

    match(HEADER);

    if(tokenType === NL){
        // directly followed by newline element, have no children;
        return t;    
    } else {
        t.child[0] = inline_stmt_sequence();
        t.raw = tokenHelper.dump();
    }
    return t;
}

function multiline_text_stmt() {
    // t = 
};

function default_inline_stmt() {
    const t = new TreeNode("default inline stmt");
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
    // logger.log(i)
    // logger.log(tokenType, tokenString);
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

function em_stmt() {
    logger.log('///////// ====> ');
    matchWithCache(ASTERISK);
    let t;
    let str = '';

    if (tokenType === SPACE) {
        t = new TreeNode(CHAR);
        t.raw = "*";
        return t;
    } else if (tokenType === ASTERISK) {
        // match strong em
        t = double_em_stmt();
        // matchWithCache(ASTERISK);
        // if (tokenType === SPACE) {
        //     t = new TreeNode(TEXT);
        //     t.raw = "**";
        // }
        // return t;
    } else {
        // in the middle of em statement
        do {
            str += tokenString;
            tokenHelper.getAndCache();
        } while(tokenType !== NL && tokenType !== ASTERISK && tokenType !== END);
        if (tokenType === NL) {
            t = new TreeNode(TEXT);
            t.raw = '*' + str;
            return t;
        }
        if (tokenType === ASTERISK) {
            const prevToken = tokenHelper.prevToken();
            if (prevToken.tokenType === SPACE) {
                t = new TreeNode(TEXT);
                t.raw = '*' + str;
            } else {
                match(ASTERISK);
                t = new TreeNode(EM);
                t.raw = '*' + str + '*';
                t.value = str;
            }
            return t;
        }
        t = new TreeNode('Unknow EM STMT');
        t.raw = str;
        return t;
    }
}

function double_em_stmt() {

}


function line_exp() {
    const t = new treeNode();
}


let INDENT = 0;
function printTree(treeNode) {
    logger.log(' '.repeat(INDENT), treeNode.type, treeNode);
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
        logger.error("Code ends before file\n");
        logger.log(tokenType);
    }

    logger.log('=== TTTTTTT ======= :::::')
    printTree(rootT)

    logger.log(rootT);
    return rootT;
}

export default {
    parse
};