import {unchecked} from "../advanced/7_unchecked";

// Only verifies that no uncaught exceptions are thrown, including syntax errors etc.
describe("Test node examples", function () {
    it("Unchecked", async () => {
        await unchecked();
    });
})