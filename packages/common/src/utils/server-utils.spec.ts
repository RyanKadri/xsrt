import { hash } from './server-utils';

describe(hash.name, () => {
    it('Hashes using sha1 and encodes to base64', () =>{
        expect(hash("abc")).toBe("qZk+NkcGgWq6PiVxeFDCbJzQ2J0=")
    })
})