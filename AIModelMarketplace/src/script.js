if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
    web3 = new Web3(window.ethereum); // Use the modern provider

    // Request accounts from MetaMask
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
        console.log('Connected accounts:', accounts);
        loadAccounts(accounts);
    }).catch((err) => {
        displayMessage('User denied account access', true);
    });
} else {
    // Fallback for non-MetaMask users (or if MetaMask is not installed)
    web3 = new Web3("http://127.0.0.1:8545"); // Connect to Ganache or other local provider
    displayMessage("MetaMask not found, connected to Ganache.");
}

// Contract address and ABI
const contractAddress = "0x755983a8e0AC588ACb7e99531603606468ec65a1";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "ModelListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "ModelPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "rater",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			}
		],
		"name": "ModelRated",
		"type": "event"
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
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
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
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
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
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "purchasers",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
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
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Global variable to store accounts
let accounts;

// Load Ethereum accounts
async function loadAccounts(loadedAccounts) {
    accounts = loadedAccounts || await web3.eth.getAccounts();
    if (accounts.length === 0) {
        displayMessage("No accounts found. Please ensure your Ethereum provider (MetaMask or Ganache) is running.", true);
    }
    console.log("Loaded accounts:", accounts);
}

// Display available models
// Function to dynamically show the list of available models
async function displayAvailableModels(modelCount) {
    const modelListDiv = document.getElementById("model-list");
    modelListDiv.innerHTML = ''; // Clear the existing list

    for (let i = 1; i <= modelCount; i++) {
        const model = await contract.methods.models(i).call();
        
        // Ensure model.price is correctly converted from Wei to Ether
        const modelPriceInEther = web3.utils.fromWei(model.price, 'ether');
        
        const modelElement = document.createElement("div");
        modelElement.className = "model-item";
        modelElement.innerHTML = `
            <h3>${model.name}</h3>
            <p>${model.description}</p>
            <p>Price: ${modelPriceInEther} ETH</p>
            <button onclick="viewModelDetails(${i})">View Details</button>
        `;
        modelListDiv.appendChild(modelElement);
    }
}



// General function to display messages
function displayMessage(message, isError, messageId = 'message') {
    const messageDiv = document.getElementById(messageId);
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'error' : 'success';
    messageDiv.style.display = 'block';

    // Hide the message after 3 seconds
    setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}

// List a new AI model
document.querySelector(".purchase-btn").addEventListener("click", async (event) => {
    const button = event.target;

    if (button.textContent === "List Model") {
        const name = button.parentElement.parentElement.querySelector('input[type="text"]').value;
        const description = button.parentElement.parentElement.querySelector('textarea').value;
        const priceInEther = button.parentElement.parentElement.querySelector('input[type="number"]').value;
        const priceInWei = web3.utils.toWei(priceInEther, 'ether'); // Convert Ether to Wei

        try {
            await contract.methods.listModel(name, description, priceInWei).send({ from: accounts[0] });
            displayMessage("Model listed successfully!", false, 'list-message');
            const modelCount = await contract.methods.modelCount().call();
            displayAvailableModels(modelCount);
        } catch (error) {
            displayMessage("Error listing model: " + error.message, true, 'list-message');
        }
    }
});

// Purchase a model
document.getElementById('purchase-model-btn').addEventListener('click', async function() {
    const modelId = document.getElementById('model-id-purchase').value; // Get the model ID from the input field

    if (!modelId) {
        displayMessage('Please enter a Model ID', true, 'purchase-message');
        return;
    }

    try {
        // Retrieve the model's price from the contract
        const model = await contract.methods.models(modelId).call();
        const modelPrice = model.price; // Ensure this returns the price in Wei

        // Call the smart contract function to purchase the model
        await contract.methods.purchaseModel(modelId).send({ from: accounts[0], value: modelPrice });
        
        displayMessage('Model purchased successfully!', false, 'purchase-message');
    } catch (error) {
        displayMessage('Purchase failed. Please try again.', true, 'purchase-message');
        console.error(error);
    }
});

// Rate a purchased model
document.querySelector('.rate-btn').addEventListener('click', async function() {
    const modelId = document.getElementById('modelId').value;
    const rating = document.getElementById('rate').value;

    if (!modelId || !rating) {
        displayMessage('Please enter a Model ID and a rating value', true, 'rate-message');
        return;
    }

    try {
        await contract.methods.rateModel(modelId, rating).send({ from: accounts[0] });
        displayMessage('Model rated successfully!', false, 'rate-message');
    } catch (error) {
        displayMessage('Rating failed. Please try again.', true, 'rate-message');
        console.error(error);
    }
});

// View model details
document.querySelectorAll('.purchase-btn')[2].addEventListener("click", async (event) => {
    event.preventDefault();
    const modelId = document.getElementById('model-id-view').value;

    if (!modelId) {
        displayMessage("Please enter a Model ID", true, 'view-message');
        return;
    }

    try {
        const details = await contract.methods.getModelDetails(modelId).call();
        displayModelDetails(details);
    } catch (error) {
        displayMessage("Error retrieving model details: " + error.message, true, 'view-message');
    }
});

// Withdraw funds
document.querySelectorAll('.purchase-btn')[3].addEventListener("click", async (event) => {
    event.preventDefault();

    try {
        await contract.methods.withdrawFunds().send({ from: accounts[0] });
        displayMessage("Funds withdrawn successfully!", false, 'withdraw-message');
    } catch (error) {
        displayMessage("Error withdrawing funds: " + error.message, true, 'withdraw-message');
    }
});

// Function to dynamically show the list of available models
async function displayAvailableModels() {
    try {
        const modelCount = await contract.methods.modelCount().call();
        const modelListDiv = document.getElementById("model-list");
        modelListDiv.innerHTML = ''; // Clear the existing list

        for (let i = 1; i <= modelCount; i++) {
            const model = await contract.methods.models(i).call();

            // Convert the price from Wei to Ether
            const modelPriceInEther = web3.utils.fromWei(model.price, 'ether');

            // Ensure the model data is properly displayed
            const modelElement = document.createElement("div");
            modelElement.className = "model-item";
            modelElement.innerHTML = `
                <h3>${model.name}</h3>
                <p>${model.description}</p>
                <p>Price: ${modelPriceInEther} ETH</p>
            `;
            modelListDiv.appendChild(modelElement);
        }
    } catch (error) {
        console.error("Error displaying models:", error);
    }
}

// Call this function after loading the page
window.onload = async function () {
    await displayAvailableModels();
};



// Function to display individual model details
function displayModelDetails(details) {
    const detailsDiv = document.getElementById("model-details");

    // Ensure that model details are shown inside the correct container
    detailsDiv.innerHTML = `
        <h3>Model Name: ${details[0]}</h3>
        <p>Description: ${details[1]}</p>
        <p>Price: ${web3.utils.fromWei(details[2], 'ether')} ETH</p>
        <p>Creator: ${details[3]}</p>
        <p>Average Rating: ${details[4]}</p>
    `;

    // Ensure the details container is visible
    detailsDiv.style.display = 'block';
}


// Listen for account and chain changes
window.ethereum.on('accountsChanged', function (newAccounts) {
    loadAccounts(newAccounts);
});

window.ethereum.on('chainChanged', (_chainId) => window.location.reload()); 