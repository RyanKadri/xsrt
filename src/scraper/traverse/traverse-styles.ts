import { toDataUrl } from "../utils/utils";

export async function extractStyles(styleSheets: CSSStyleSheet[]) {
    styleSheets = styleSheets.filter(sheet => {
        try { sheet.rules; return true; } catch { return }
    });
    const syncRules = Array.from(styleSheets).map((sheet) => 
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
                        const urlMatches = url.match(/\(['"](.*?)['"]\)/);
                        if(urlMatches === null) throw new Error('Assertion error: URL should not be null here');
                        const ruleUrl = urlMatches[1];
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
