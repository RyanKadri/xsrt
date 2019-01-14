import { createShallow } from "@material-ui/core/test-utils";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import React from "react";
import { noop } from "../../../common/utils/functional-utils";
import { ActionPrompt } from "./action-prompt";

configure({ adapter: new Adapter() });

describe("ActionPrompt", () => {
    it("Renders the prompt prop as text inside a button", () => {
        const prompt = createShallow({ dive: true })(<ActionPrompt prompt="Test" onPromptClicked={noop} />);
        const button = prompt.find("div").childAt(0);
        expect(button.childAt(0).text()).toBe("Test");
    });

    it("Attaches the onPromptClick callback to the button click", () => {
        const prompt = createShallow({ dive: true })(<ActionPrompt prompt="Test" onPromptClicked={noop} />);
        const button = prompt.find("div").childAt(0);
        expect(button.prop("onClick")).toBe(noop);
    });
});
