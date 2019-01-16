import { LocalStorageService } from './local-storage.service';

describe(LocalStorageService.name, () => {
    it('Parses numbers fetched from localStorage', () => {
        const service = new LocalStorageService(mockLocalStorage("123"));
        expect(service.fetchItem("whatever", { type: "number" })).toBe(123);
    });

    it('Parses booleans fetched from localStorage', () => {
        const service = new LocalStorageService(mockLocalStorage("true"));
        expect(service.fetchItem("whatever", { type: "boolean" })).toBe(true);
    });

    it('Parses objects fetched from localStorage', () => {
        const service = new LocalStorageService(mockLocalStorage("{ \"test\": 123 }"));
        expect(service.fetchItem("whatever", { type: "object" })).toEqual({ test: 123 });
    });

    it('Returns a string by default', () => {
        const service = new LocalStorageService(mockLocalStorage("plain"));
        expect(service.fetchItem("whatever")).toEqual("plain");
    });

    it('Returns undefined for null localStorage values', () => {
        const service = new LocalStorageService(mockLocalStorage(null));
        expect(service.fetchItem("whatever", { type: "number" })).toBe(undefined);
    });

    it("Stringifies objects before saving", () => {
        const storage = mockLocalStorage(undefined);
        const service = new LocalStorageService(storage);
        service.saveItem("test", { something: 123 });
        expect(storage.setItem).toHaveBeenCalledWith("test", JSON.stringify({ something: 123 }));
        service.saveItem("test2", "str");
        expect(storage.setItem).toHaveBeenCalledWith("test2", "str");
    });

    it("Can fetch with a default and write back to storage if no value is present", () => {
        const storage = mockLocalStorage(null);
        const service = new LocalStorageService(storage);
        const defaultVal = { test: 123 };
        const res = service.fetchWithDefault("something", defaultVal, { writeBack: true });
        expect(storage.getItem).toHaveBeenCalledWith("something");
        expect(storage.setItem).toHaveBeenCalledWith("something", JSON.stringify(defaultVal));
        expect(res).toEqual(defaultVal);
    })
})

function mockLocalStorage(val: string) {
    return jasmine.createSpyObj<Storage>("localStorage", {
        getItem: val,
        setItem: undefined
    });
}
