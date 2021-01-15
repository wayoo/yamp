import {
    TRUE,
    FALSE,
    START,
    IN_PRE_HEADER,
    IN_HEADER,
    IN_HEADER_ID,
    IN_TEXT,
    IN_OPEN_BRACKET,
    IN_NL,
    IN_ESCAPE,

    DONE,

    HEADER,
    TEXT,
    END,

    CHAR,
    FSPACE,
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
    IN_FSPACE,
    BACKSLASH,
} from './globals'

const HTMLElement = {
    H1: Symbol('h1'),
    H2: Symbol('h2'),
    H3: Symbol('h3'),
    H4: Symbol('h4'),
    H5: Symbol('h5'),


}


// function getNextChar() {

// }

// let str = "###### 1 ############# 1212 \nsdasd\n--[1212](asasas) 阿萨说 阿萨说";
// let str = "    # foo\n";
// let str = "    # foo\n";
// let str = "### foo \\###1\n## foo #\\##\n# foo \\#\n";
let str = "#                  foo                     \n";
// let str = " ### foo\n  ## foo\n   # foo\n";
// let str = "#                  foo                     \n";
let i = 0;
let preFSpace = true;
let tokenStringIndex = 0;
let currentTokenType;
let nextTokenType = null;
let nextTokenString = null;


function load(s) {
    str = s;
    i = 0;
    preFSpace = true;
    tokenStringIndex = 0;
}
// let str = "--";
// let startI = 0;

// function load(s) {
//     str = s;
//     i = 0;
//     startI = 0;
// }

function getNextChar() {
    return {
        // i: i,
        c: str[i++],
    };
}

function ungetNextChar() {
    i--;
}

const elementStartMark = [
    undefined,
    '#',
    '`',
    '*',
    '_',
    '[',
    ']',
    '(',
    ')',
    '\n',
    ' ',
    '\\',
];

// return token once a time
function getToken() {
    let save = TRUE;
    let state = START;
    let _di = 0;

    if (nextTokenType !== null) {
        const token = {
            tokenType: nextTokenType,
            tokenString: nextTokenString,
        };
        nextTokenType = null;
        nextTokenString = null;
        return token;
    }

    while (state != DONE && _di < 1000) {
        _di++
        const {
            c
        } = getNextChar();
        // !!!!
        // i pointer to next character's position, not currrent c's position
        switch (state) {
            case START:
                if (c == '\\') { // handle escape mark (backslash);
                    tokenStringIndex = i; // ignore current '\' mark, direct point to next char
                    state = IN_ESCAPE;
                } else if (c == ' ' && i === 1 && preFSpace) { // handle start 4 space
                    tokenStringIndex = 0;
                    state = IN_FSPACE;
                    break;
                } else if (c == '\n') {  // handle newline 4 space 
                    state = IN_NL;
                    tokenStringIndex = i-1;
                    break;
                    // currentTokenType = SPACE;
                    // state = DONE;
                } else if (c == ' ') {
                    currentTokenType = SPACE;
                    state = DONE;
                    break;
                }else if (c == '\t') {
                    currentTokenType = TAB;
                    state = DONE;
                } else if(!elementStartMark.includes(c)){     
                    state = IN_TEXT;
                } else {
                    // this input are all single character identifier
                    state = DONE;
                    switch (c) {
                        case undefined:
                            currentTokenType = END;
                            break;
                        case '#':
                            currentTokenType = HASH;
                            break;
                        case '*':
                            currentTokenType = ASTERISK;
                            break;
                        case '_':
                            currentTokenType = UNDERSCORE;
                            break;
                        case '`':
                            currentTokenType = BACKTICK;
                            break
                        case '[':
                            currentTokenType = LBRACKET;
                            break;
                        case ']':
                            currentTokenType = RBRACKET;
                            break;
                        case '(':
                            currentTokenType = LPAREN;
                            break;
                        case ')':
                            currentTokenType = RPAREN;
                            break;
                        case '\n':
                            currentTokenType = NL;
                            break
                        default:
                            console.error('cant handle from START: ' + c);
                    }
                }
                break;
            case IN_NL:
                // \n take one position, default gap is 1
                // so need to check five gap to ensure four tab
                if (c == ' ' && ((i - tokenStringIndex) <= 5)) {
                    continue;
                } else {
                    state = DONE;
                    // newline and tab, cache for next state
                    if (i - tokenStringIndex > 5) {
                        currentTokenType = NL;
                        nextTokenType = FSPACE;
                        nextTokenString = '    ';
                        i = tokenStringIndex + 5;
                    } else if (c !== ' ') {
                        // newline not followed by 4 space
                        // put back consumed index;
                        currentTokenType = NL;
                        // tokenStringIndex;
                        i = tokenStringIndex + 1;
                    }
                }
                break;
            case IN_FSPACE:
                if (c == ' ' && ((i - tokenStringIndex) < 4)) {
                    continue
                } else {
                    state = DONE;
                    if (i - tokenStringIndex >= 4) {
                        currentTokenType = FSPACE;
                    } else {
                        preFSpace = false;
                        i = 0;
                    }
                }
                break;
            case IN_TEXT:
                if (elementStartMark.includes(c)) {
                    // backup in the input
                    ungetNextChar();
                    save = FALSE;
                    state = DONE;
                    currentTokenType = TEXT;
                }
                break;
            case IN_ESCAPE:
                currentTokenType = CHAR;
                state = DONE;
                break;
            default:
                console.error(state, `State Error input ${c}`);
                state = DONE;
                break;
        }
    }
    let tokenString;
    if (state === DONE) {
        tokenString = str.slice(tokenStringIndex, i);
        tokenStringIndex = i;
    }
    
    return {
        tokenType: currentTokenType,
        tokenString: tokenString,
    };
}

export default {
    getToken,
    load,
}