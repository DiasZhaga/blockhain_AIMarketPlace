import Web3 from 'web3';

const web3 = new Web3("http://127.0.0.1:7545"); 

const contractAddress = "0xbCd28B3204F36Aa52c7DA0CE071CE9Ca64000787"; 
const contractABI = [
    {
      "inputs": [],
      "name": "modelCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "models",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "totalRating",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "numberOfRatings",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "listModel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_modelId",
          "type": "uint256"
        }
      ],
      "name": "purchaseModel",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_modelId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "_rating",
          "type": "uint8"
        }
      ],
      "name": "rateModel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_modelId",
          "type": "uint256"
        }
      ],
      "name": "getModelDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "averageRating",
              "type": "uint256"
            }
          ],
          "internalType": "struct AIModelMarketplace.ModelDetails",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_recipient",
          "type": "address"
        }
      ],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]; 

const contract = new web3.eth.Contract(contractABI, contractAddress);

// List a new AI model
document.getElementById("list-model-btn").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;

    try {
        await contract.methods.listModel(name, description, price).send({ from: accounts[0] });
        alert("Model listed successfully!");
    } catch (error) {
        console.error(error);
        alert("Error listing model: " + error.message);
    }
});

// Purchase a model
document.getElementById("purchase-model-btn").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission
    const modelId = document.getElementById("model-id").value;

    try {
        const model = await contract.methods.models(modelId).call();
        await contract.methods.purchaseModel(modelId).send({ from: accounts[0], value: model.price });
        alert("Model purchased successfully!");
    } catch (error) {
        console.error(error);
        alert("Error purchasing model: " + error.message);
    }
});

// Rate a purchased model
document.getElementById("rate-model-btn").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission
    const modelId = document.getElementById("model-id-rate").value;
    const rating = document.getElementById("rating").value;

    try {
        await contract.methods.rateModel(modelId, rating).send({ from: accounts[0] });
        alert("Model rated successfully!");
    } catch (error) {
        console.error(error);
        alert("Error rating model: " + error.message);
    }
});

// View model details
document.getElementById("view-model-btn").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission
    const modelId = document.getElementById("model-id-view").value;

    try {
        const details = await contract.methods.getModelDetails(modelId).call();
        alert(`Model Name: ${details.name}\nDescription: ${details.description}\nPrice: ${details.price}\nCreator: ${details.creator}\nAverage Rating: ${details.averageRating}`);
    } catch (error) {
        console.error(error);
        alert("Error retrieving model details: " + error.message);
    }
});

// Withdraw funds
document.getElementById("withdraw-funds-btn").addEventListener("click", async (event) => {
    event.preventDefault(); 
    const recipient = document.getElementById("recipient").value;

    try {
        await contract.methods.withdrawFunds().send({ from: accounts[0], value: 0 });
        alert("Funds withdrawn successfully!");
    } catch (error) {
        console.error(error);
        alert("Error withdrawing funds: " + error.message);
    }
});