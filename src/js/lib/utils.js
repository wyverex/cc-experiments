'use strict';

const dispatch = (name, props) => document.dispatchEvent(
    new CustomEvent(
        name.toLowerCase(),
        Object.assign({}, { detail: props || null })
    )
);

export {
    dispatch
};
