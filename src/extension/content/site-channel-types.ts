// Note. These types have to be a separate file from site-channel so they can be imported 
// without side effects from the page-side script

export class ExtensionMessage<P = any> {
    static readonly type = "__extension-screen-record:fromExtension";
    readonly type = ExtensionMessage.type;
    constructor(
        public id: number,
        public payload: P
    ) { }
}

export class ExtensionMessageResponse<P = any> {
    static readonly type = "__extension-screen-record:fromPage";
    readonly type = ExtensionMessageResponse.type;
    constructor(
        public id: number,
        public payload?: P
    ) { }
}