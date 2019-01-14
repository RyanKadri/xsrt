import { Container } from "inversify";

const ExtensionContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
export { ExtensionContainer };
