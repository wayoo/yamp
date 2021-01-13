const TRUE = Symbol('true');
const FALSE = Symbol('false');
// state
const START = Symbol('start');
const IN_PRE_HEADER = Symbol('in_pre_header');
const IN_HEADER = Symbol('in_header');
const IN_HEADER_ID = Symbol('in_header_id');
const IN_TEXT = Symbol('in_text');
const DONE = Symbol('done');



// token
const HEADER = Symbol('header');
const TEXT = Symbol('text');
const END = Symbol('end');

// special symbols
// *
const ASTERISK = Symbol('asterisk'); 
// _
const UNDERSCORE = Symbol('underscore'); 
// \n
const NL = Symbol('newline');


export {
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
}