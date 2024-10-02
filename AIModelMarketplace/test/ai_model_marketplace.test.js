const AIModelMarketplace = artifacts.require("AIModelMarketplace");

contract("AIModelMarketplace", (accounts) => {
    let instance;

    // Before each test, deploy a new contract instance
    before(async () => {
        instance = await AIModelMarketplace.deployed();
    });

    it("should list a new model", async () => {
        await instance.listModel("AI Model 1", "Description of AI Model 1", web3.utils.toWei('1', 'ether'), { from: accounts[0] });
        const model = await instance.models(0);
        assert.equal(model.name, "AI Model 1", "The name of the listed model is incorrect");
        assert.equal(model.description, "Description of AI Model 1", "The description of the listed model is incorrect");
        assert.equal(model.price.toString(), web3.utils.toWei('1', 'ether'), "The price of the listed model is incorrect");
        assert.equal(model.creator, accounts[0], "The creator of the listed model is incorrect");
    });

    it("should allow a model to be purchased", async () => {
        await instance.purchaseModel(0, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
        const purchased = await instance.purchasers(0, accounts[1]);
        assert.equal(purchased, true, "The model was not marked as purchased by the user");
    });

    it("should return correct model details", async () => {
        const modelDetails = await instance.getModelDetails(0);
        assert.equal(modelDetails.name, "AI Model 1", "The name of the model is incorrect");
        assert.equal(modelDetails.description, "Description of AI Model 1", "The description of the model is incorrect");
        assert.equal(modelDetails.price.toString(), web3.utils.toWei('1', 'ether'), "The price of the model is incorrect");
        assert.equal(modelDetails.creator, accounts[0], "The creator address of the model is incorrect");
    });

    it("should allow rating of a purchased model", async () => {
        await instance.rateModel(0, 5, { from: accounts[1] });
        const model = await instance.models(0);
        assert.equal(model.totalRating, 5, "The total rating is incorrect");
        assert.equal(model.numberOfRatings, 1, "The number of ratings is incorrect");
    });

    it("should not allow a user to rate a model without purchasing it", async () => {
        try {
            await instance.rateModel(0, 3, { from: accounts[2] });
            assert.fail("Non-purchasers should not be able to rate the model");
        } catch (err) {
            assert(err.message.includes("You must purchase the model before rating it"), "Expected purchase requirement error, got " + err.message);
        }
    });
});
