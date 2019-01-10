describe(`Mutation Observer Expectations`, () => {
  
    xit(`Generates a single mutation when a structure is built off-page and inserted`, () => {
        const mutations = generateMutationsFor(() => {
            const [div, section, span] = el('div', 'section', 'span');
        
            div.appendChild(section);
            section.appendChild(span);
            document.body.appendChild(div); //Build then append
            return div;
        });

        expect(mutations.length).toEqual(1);
    });

    xit(`Generates multiple mutations for synchronous element building on-page`, () => {
        const mutations = generateMutationsFor(() => {
            const [div, section, span] = el('div', 'section', 'span');
        
            document.body.appendChild(div); //Append first then build
            div.appendChild(section);
            section.appendChild(span);
            return div;
        });

        expect(mutations.length).toEqual(3);
    });

    xit(`Does not optimize synchronous overwriting changes on single elements`, () => {
        const mutations = generateMutationsFor(() => {
            const [div] = el('div');
            document.body.appendChild(div);
            div.textContent = 'Test';
            div.textContent = 'Testing';
            div.setAttribute('attr', 'thingy')
            div.setAttribute('attr', 'thingy123') 
            return div;
        })
        expect(mutations.length).toEqual(5);
    })

    function el(...tags: string[]) {
        return tags.map(tag => document.createElement(tag))
    }

    function generateMutationsFor(changeCb: () => HTMLElement) {
        let mutationGroups: MutationRecord[][] = [];
        const obs = new MutationObserver(e => mutationGroups.push(e));
        obs.observe(document.documentElement!, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true 
        });
        const created = changeCb();
        const records = obs.takeRecords();
        if(created) document.body.removeChild(created)
        obs.disconnect();
        return records;
    }
});