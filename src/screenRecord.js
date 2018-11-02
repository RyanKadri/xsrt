(async function() {

    await walkDom();

    async function walkDom() {
        const docType = document.doctype.name;
        const root = traverseDom(document.documentElement);
        const [trimmed, leftover] = await transformDom(root);
        const styles = await traverseStyles(document.styleSheets);
        decorateDom(trimmed, styles);
        const serialized = serialize(trimmed, docType);
        
        triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
    }

    async function traverseStyles(styleSheets) {
        const syncRules = Array.from(styleSheets).map(sheet => 
            Array.from(sheet.rules)
                .filter(rule => rule instanceof CSSStyleRule || rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule || rule instanceof CSSKeyframesRule)
                .map(rule => ({ css: rule.cssText, source: sheet.href }))
        ).reduce((acc, rules) => acc.concat(rules));

        const fontRules = Array.from(styleSheets).map(sheet => 
            Array.from(sheet.rules)
                .filter(rule => rule instanceof CSSFontFaceRule)
                .map(rule => ({ css: rule.cssText, source: sheet.href }))
        ).reduce((acc, rules) => acc.concat(rules));

        const localizedRules = await Promise.all(
            [...syncRules, ...fontRules].map(async (rule) => {
                const urls = rule.css.match(/url\(['"].*?['"]\)/);
                if(urls) {
                    const replacements = await Promise.all(
                        urls.map(async url => {
                            let requestUrl;
                            const ruleUrl = url.match(/\(['"](.*?)['"]\)/)[1];
                            if(ruleUrl.startsWith('data:')) return ruleUrl;
                            if(ruleUrl.startsWith('/') || !rule.source) {
                                requestUrl = ruleUrl;
                            } else {
                                requestUrl = rule.source.replace(/\/[^\/]*?$/, '/' + ruleUrl);
                            }
                            try {
                                const resp = await fetch(requestUrl);
                                const blob = await resp.blob();
                                return await toDataUrl(blob);
                            } catch(e) {
                                if(requestUrl.startsWith('//')) {
                                    return requestUrl.replace('//', location.protocol + '//')
                                }
                            }
                        })
                    )
                    for(let urlInd = 0; urlInd < urls.length; urlInd ++) {
                        if(replacements[urlInd] !== undefined) {
                            rule.css = rule.css.replace(urls[urlInd], `url('${replacements[urlInd]}')`);
                        }
                    }
                }
                return rule.css;
            })
        );

        return localizedRules.join('\n');
    }

    function decorateDom(root, styles) {
        const head = root.children.find(el => el.tag === 'head');
        head.children.push({ 
            type: 'element',
            tag: 'style',
            attributes: [],
            children: [
                {
                    type: 'text',
                    content: styles
                }
            ]
        })
    }

    function traverseDom(node) {
        if(node.nodeType === document.ELEMENT_NODE) {
            return {
                type: 'element',
                el: node,
                tag: node.tagName.toLowerCase(),
                attributes: Array.from(node.attributes).map(attr => ({ name: attr.name, value: attr.value })),
                children: Array.from(node.childNodes)
                    .filter(node => 
                        (node.nodeType === document.ELEMENT_NODE) || 
                        (node.nodeType === document.TEXT_NODE && node.textContent !== '')
                    ).map(traverseDom)
            };
        } else if(node.nodeType === document.TEXT_NODE) {
            return {
                type: 'text',
                content: escapeHtml(node.textContent)
            }
        }
    }

    async function transformDom(node) {
        const removable = new Set(['script', 'link', 'style', 'iframe']);
        const leftovers = [];
        const trimmed = await dig(node);
        return [trimmed, leftovers];

        async function dig(node){
            if(node.type === 'element') {
                if(removable.has(node.tag)) {
                    leftovers.push(node)
                    return undefined;
                } else {
                    const children = await Promise.all(node.children.map(dig));
                    return await transform({
                        ...node,
                        children: children.filter(child => child !== undefined),
                        attributes: node.attributes.filter(filterAttribute)
                    })
                }
            } else {
                return node;
            }
        }

        async function transform(node) {
            if(node.tag === 'img') {
                const image = node.el;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = image.naturalHeight;
                canvas.width = image.naturalWidth;
                ctx.drawImage(image, 0, 0);
                const src = node.attributes.find(attr => attr.name === 'src');
                try {
                    const data = await new Promise((resolve, reject) => {
                        canvas.toBlob((blob) => {
                            toDataUrl(blob).then((dataUrl) => {
                                resolve(dataUrl)
                            });
                        })
                    });
                    src.value = data;
                } catch(e) {
                    if(src.value.startsWith('//')) {
                        src.value = src.value.replace('//', location.protocol + '//');
                    }
                }
                return node;
            } else {
                return node;
            }
        }

        function filterAttribute(attr) {
            if(/^on[a-z]+/.test(attr.name)) {
                return false;
            } else if(/^javascript:/i.test(attr.value)) {
                return false;
            } else {
                return true;
            }
        }
    }

    function serialize(root, docType) {
        const emptyElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
        return `<!doctype ${docType}>
${_serialize(root)}`

        function _serialize(node) {
            if(node.type === 'text') {
                return node.content;
            } else {
                if(emptyElements.has(node.tag)) {
                    return `<${node.tag} ${serializeAttrs(node)}>`
                } else {
                    return `<${node.tag} ${serializeAttrs(node)}>${node.children.map(child => _serialize(child)).join('')}</${node.tag}>`;
                }
            }
        }

        function serializeAttrs(node) {
            return node.attributes.map(attr => `${attr.name}="${attr.value}"`).join(' ');
        }
    }

    function triggerDownload(content, type, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([content], { encoding: 'UTF-8', type }));
        link.target = '_blank';
        link.download = fileName;
        link.click();
    }

    function toDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
        })
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;")
             .replace(/\u00A0/, '&nbsp;')
             .replace(/\u200E/, '&lrm;')
    }
})()