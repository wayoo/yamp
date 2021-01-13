import {
    TRUE,
    FALSE,
    START,
    IN_PRE_HEADER,
    IN_HEADER,
    IN_HEADER_ID,
    IN_TEXT,
    DONE,

    HEADER,
    TEXT,
    END,

    ASTERISK,
    UNDERSCORE,
    NL,
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

let str = "######5 # 1212 \nsdasd\n--";
// let str = "--";
let i = 0;
// let startI = 0;

// function load(s) {
//     str = s;
//     i = 0;
//     startI = 0;
// }

function getNextChar() {
    return {
        i: i,
        c: str[i++],
    };
}

function ungetNextChar() {
    i--;
}

const elementStartMark = [
    undefined,
    '`',
    '*',
    '_',
    '[',
    '\n',
];


let tokenStringIndex = 0;
// return token once a time
function getToken() {
    let save = TRUE;
    let state = START;
    let currentTokenType;
    let tokenString = '';
    console.log(state);
    let _di = 0;

    while (state != DONE && _di < 100) {
        _di++
        const {
            i,
            c
        } = getNextChar();

        console.log(`input ${_di}:` + c);
        switch (state) {
            case START:
                if (c == '#') {
                    state = IN_HEADER;
                    tokenStringIndex = i;
                } else if(!elementStartMark.includes(c)){                    
                    state = IN_TEXT;
                } else {
                    // this input are all single character identifier
                    state = DONE;
                    switch (c) {
                        case undefined:
                            currentTokenType = END;
                            break;
                        case '*':
                            currentTokenType = ASTERISK;
                            break;
                        case '_':
                            currentTokenType = UNDERSCORE;
                            break;
                        case '\n':
                            currentTokenType = NL;
                            break
                        default:
                            console.error('cant handle from START: ' + c);
                    }
                }
                break;
            case IN_TEXT:
                if (['\n', undefined].includes(c)) {
                    // backup in the input
                    ungetNextChar();
                    save = FALSE;
                    state = DONE;
                    currentTokenType = TEXT;
                }
                break;
            case IN_HEADER:
                if (c == '#' && ((i - tokenStringIndex) <= 5)) {
                    continue
                } else if (c == ' ') {
                    state = IN_HEADER_ID;
                    currentTokenType = HEADER;
                    // currentTokenType = HTMLElement[`H${i-tokenStringIndex}`];
                    // tokenStringIndex = i + 1;
                } else {
                    state = IN_TEXT;
                }
                break;
            case IN_HEADER_ID:
                if (c === '\n') {
                    state = DONE;
                }
                break;
            default:
                state = DONE;
                console.error(`State [${state}] Error input ${c}`);
                break;
        }
    }
    if (state === DONE) {
        tokenString = str.slice(tokenStringIndex, i);
        tokenStringIndex = i;
    }
    console.log(state, currentTokenType, tokenString);
    return currentTokenType;
}

export default {
    getToken
}