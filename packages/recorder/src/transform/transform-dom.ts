import { ScrapedAttribute, ScrapedHtmlElement, ScrapedTextElement } from "@xsrt/common";

export function transformElement(el: ScrapedHtmlElement): ScrapedHtmlElement {
    return {
        ...el,
        attributes: el.attributes
            .filter(filterAttribute)
            .map(attr => transformAttribute(attr, el))
    };
}

// Placeholder in case we need to do text transformations in the future (I kind of doubt it)
export function transformText(el: ScrapedTextElement) {
    return el;
}

function filterAttribute(attr: ScrapedAttribute) {
    if (/^on[a-z]+/.test(attr.name)) {
        return false;
    } else if (/^javascript:/i.test(attr.value)) {
        return false;
    } else {
        return true;
    }
}

function transformAttribute(attr: ScrapedAttribute, el: ScrapedHtmlElement): ScrapedAttribute {
    let newVal = attr.value;
    if (el.tag === "a" && attr.name === "href") {
        newVal = "javascript:;";
    }
    return { ...attr, value: newVal };
}
