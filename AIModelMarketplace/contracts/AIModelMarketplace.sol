// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract AIModelMarketplace {
    
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable creator;
        uint16 totalRating;
        uint16 numberOfRatings;
    }

    mapping(uint256 => Model) public models;
    mapping(uint256 => mapping(address => bool)) public purchasers; // Tracks who bought which model
    uint256 public modelCount = 0;

    address public owner; // Contract owner

    // Contract constructor
    constructor() {
        owner = msg.sender; // Set contract deployer as owner
    }

    // Events
    event ModelListed(uint256 modelId, string name, uint256 price, address creator);
    event ModelPurchased(uint256 modelId, address buyer);
    event ModelRated(uint256 modelId, address rater, uint8 rating);

    // Modifier to restrict function access to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    // List a new AI model
    function listModel(string memory _name, string memory _description, uint256 _price) public {
        require(bytes(_name).length > 0, "Model name cannot be empty");
        require(bytes(_description).length > 0, "Model description cannot be empty");
        require(_price > 0, "Model price must be greater than zero");

        models[modelCount] = Model({
            name: _name,
            description: _description,
            price: _price,
            creator: payable(msg.sender),
            totalRating: 0,
            numberOfRatings: 0
        });

        emit ModelListed(modelCount, _name, _price, msg.sender); // Emit model listed event
        modelCount++;
    }

    // Purchase a model by its ID
    function purchaseModel(uint256 _modelId) public payable {
        require(_modelId < modelCount, "Model does not exist");
        Model storage model = models[_modelId];
        require(msg.value == model.price, "Incorrect payment amount");
        require(!purchasers[_modelId][msg.sender], "Model already purchased");

        purchasers[_modelId][msg.sender] = true; // Mark the model as purchased

        // Transfer funds to the model creator
        (bool sent, ) = model.creator.call{value: msg.value}("");
        require(sent, "Failed to send Ether to creator");

        emit ModelPurchased(_modelId, msg.sender); // Emit model purchased event
    }

    // Rate a purchased model
    function rateModel(uint256 _modelId, uint8 _rating) public {
        require(purchasers[_modelId][msg.sender], "You must purchase the model before rating it");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");

        Model storage model = models[_modelId];
        model.totalRating += uint16(_rating);
        model.numberOfRatings++;

        emit ModelRated(_modelId, msg.sender, _rating); // Emit model rated event
    }

    // Retrieve model details by its ID (simplified return type)
    function getModelDetails(uint256 _modelId) public view returns (
        string memory, 
        string memory, 
        uint256, 
        address, 
        uint256
    ) {
        require(_modelId < modelCount, "Model ID does not exist");

        Model storage model = models[_modelId];
        uint256 averageRating = model.numberOfRatings > 0 ? model.totalRating / model.numberOfRatings : 0;

        return (
            model.name,
            model.description,
            model.price,
            model.creator,
            averageRating
        );
    }

    // Withdraw funds accumulated from model sales (only owner can withdraw)
    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
