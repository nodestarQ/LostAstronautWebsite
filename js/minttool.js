import {scABI} from "./scABI.js";
import "./ethers.min.js";

const scAddress = "SMART CONTRACT ADDRESS IN HERE";
var provider, account, signer, contract;
const abashoPrice = 0.01;
const regularPrice = 0.04;

async function connectAccounts() {
    if(window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        account = await provider.send("eth_requestAccounts",[]);
        console.log(account);
        signer = provider.getSigner();
        contract = new ethers.Contract(
            scAddress,
            scABI.abi,
            signer);
        walletConnected();
    } else {
        // metamask not available, lets get another provider
        console.log("No provider :-(");
        provider = new WalletConnectProvider.default({
            infuraId: "cc7b423d235940cbafbee2eb7fc13935",
        });
        provider.enable().then(async function(res) {
            account = await provider.send("eth_requestAccounts",[]);
            console.log(account);
            signer = provider.getSigner();
            contract = new ethers.Contract(
                scAddress,
                scABI.abi,
                signer);
            walletConnected();
        });
    }
}

async function totalSupply(){
    if (window.ethereum) {
        try {
          const currentSupply = await contract.totalSupply();
          return currentSupply.toNumber();
        } catch(err) {
          return 0;
        }
    }
  }

function walletConnected() {
    document.getElementById("ConnectWalletBtn").classList.remove("btn-primary");
    document.getElementById("ConnectWalletBtn").classList.add("btn-outline-success");
    document.getElementById("ConnectWalletBtn").innerHTML = "WALLET CONNECTED";
    
    document.getElementById("regularMintBtn").classList.remove("disabled");
    document.getElementById("abashoMintBtn").classList.remove("disabled");

    updateMintCount();
}

async function mintRegular() {
    if (window.ethereum) {
        try {
            const mint = await contract.recoverAstronaut({value: ethers.utils.parseEther(regularPrice.toString())});
            updateMintCount();
        } catch(err) {
            alert("Something went wrong!");
            console.log(err);
        }
    }
}

async function mintAbasho() {
    if (window.ethereum) {
        try {
            const mint = await contract.abashoRecoverAstronaut(parseInt(document.getElementById("abashoID").value), {value: ethers.utils.parseEther(abashoPrice.toString())});
            updateMintCount();
        } catch(err) {
            alert("Something went wrong!");
            console.log(err);
        }
    }
}


function updateMintCount() {
    document.getElementById("mintAmount").classList.remove("visually-hidden");
    document.getElementById("mintAmount").innerHTML = totalSupply() + "/250";
}







window.connectAccounts = connectAccounts;
window.walletConnected = walletConnected;
window.mintRegular = mintRegular;
window.mintAbasho = mintAbasho;
