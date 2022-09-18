import {scABI} from "./scABI.js";
import "./ethers.min.js";

const scAddress = "0x1DeB1cf3Ec6A1F10808b59a0679c079D0dc4A5AC";
var provider, account, signer, contract;
const abashoPrice = 0.01;
const regularPrice = 0.04;

async function connectAccounts() {
    if(window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        account = await provider.send("eth_requestAccounts",[]);
        signer = provider.getSigner();
        contract = new ethers.Contract(
            scAddress,
            scABI.abi,
            signer);
        await walletConnected();
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
            await walletConnected();
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

async function walletConnected() {
        document.getElementById("ConnectWalletBtn").classList.remove("btn-dark");
        document.getElementById("ConnectWalletBtn").classList.add("btn-outline-dark");
        document.getElementById("ConnectWalletBtn").innerHTML = "WALLET CONNECTED";
        
        document.getElementById("regularMintBtn").classList.remove("disabled");
        document.getElementById("abashoMintBtn").classList.remove("disabled");
    
        updateMintCount();

    
}

async function mintRegular() {
    if (window.ethereum) {
        if(await contract.riftOpen()) {
            try {
                const mint = await contract.recoverAstronaut({value: ethers.utils.parseEther(regularPrice.toString())});
                updateMintCount();
            } catch(err) {
                document.getElementById("alerts").classList.remove("visually-hidden");
                document.getElementById("alerts").innerHTML = "Something went wrong: "+ err.error.message;
            }
        }
        else {
            document.getElementById("alerts").classList.remove("visually-hidden");
            document.getElementById("alerts").innerHTML = "Regular Mint did not start yet...";
        }
    }
}

async function mintAbasho() {
    if (window.ethereum) {
        if(await contract.riftOpenAbasho()) {
            if((await contract.abashoClaimed(parseInt(document.getElementById("abashoID").value)))==true) {
                document.getElementById("alerts").classList.remove("visually-hidden");
                document.getElementById("alerts").innerHTML = "Abasho Mint for #"+parseInt(document.getElementById("abashoID").value)+" has already been claimed";
            }
            else{
                try {
                    const mint = await contract.abashoRecoverAstronaut(parseInt(document.getElementById("abashoID").value), {value: ethers.utils.parseEther(abashoPrice.toString())});
                    updateMintCount();
                } catch(err) {
                    document.getElementById("alerts").classList.remove("visually-hidden");
                    document.getElementById("alerts").innerHTML = "Something went wrong: "+ err.error.message;
                }
                }
            
        }
        else {
            document.getElementById("alerts").classList.remove("visually-hidden");
            document.getElementById("alerts").innerHTML = "Abasho Mint did not start yet...";
        }
    }
}


async function updateMintCount() {
    document.getElementById("mintAmount").classList.remove("visually-hidden");
    document.getElementById("mintAmount").innerHTML = await totalSupply() + "/250";
}







window.connectAccounts = connectAccounts;
window.walletConnected = walletConnected;
window.mintRegular = mintRegular;
window.mintAbasho = mintAbasho;
