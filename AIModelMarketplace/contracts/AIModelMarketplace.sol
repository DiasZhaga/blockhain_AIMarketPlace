// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable creator;
        uint16 totalRating; 
        uint16 numberOfRatings; 
    }

    struct ModelDetails {
        string name;
        string description;
        uint256 price;
        address creator;
        uint256 averageRating;
    }

    mapping(uint256 => Model) public models;
    mapping(uint256 => mapping(address => bool)) public purchasers; 
    uint256 public modelCount = 0;

    function listModel(string memory _name, string memory _description, uint256 _price) public {
        require(bytes(_name).length > 0, "Model name cannot be empty");
        require(bytes(_description).length > 0, "Model description cannot be empty");
        require(_price > 0, "Model price must be greater than zero");

        // Initialize a new model directly
        models[modelCount] = Model(_name, _description, _price, payable(msg.sender), 0, 0);
        
        modelCount++;
    }

    function purchaseModel(uint256 _modelId) public payable {
        Model storage model = models[_modelId];
        require(msg.value == model.price, "Incorrect payment amount");
        require(model.price > 0, "Model not found or price not set");

        // Mark the model as purchased by this user
        purchasers[_modelId][msg.sender] = true;

        // Transfer funds to the model creator
        (bool sent, ) = model.creator.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function rateModel(uint256 _modelId, uint8 _rating) public {
        require(purchasers[_modelId][msg.sender], "You must purchase the model before rating it");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");

        Model storage model = models[_modelId];
        model.totalRating += uint16(_rating);
        model.numberOfRatings++;
    }

    function getModelDetails(uint256 _modelId) public view returns (ModelDetails memory) {
        Model storage model = models[_modelId];
        uint256 averageRating = model.numberOfRatings > 0 ? model.totalRating / model.numberOfRatings : 0;
        return ModelDetails(
            model.name,
            model.description,
            model.price,
            model.creator,
            averageRating
        );
    }

    function withdrawFunds() public {
        require(msg.sender == models[0].creator, "Only the contract owner can withdraw funds");
        payable(msg.sender).transfer(address(this).balance);
    }
}