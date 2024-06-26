import { action } from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BITCOIN, POLYGON, PRIVATE_KEY } from "../../constants/commonConstants";
import { importPolygonWallet, importBitcoinWallet, sendMaticToReciever, sendBitcoinToReciever, getPolygonTransactionDetails} from "../../utils/walletUtils";

export const isWalletActive = action(async (walletStore, walletType) => {
    try {
        walletStore.activeWallet = walletType
        const pvtKey = await AsyncStorage.getItem(`${walletType}${PRIVATE_KEY}`);
        if (pvtKey) {
            return {
                status: true,
                key: pvtKey
            };
        }
        else {
            return {
                status: false
            };
        }
    } catch (error) {
        console.error("error in getting wallet status:", error);
        return false;
    }
});

export const importWallet = action(async ({ walletStore, walletType, privateKey }) => {
    switch (walletType) {
        case POLYGON:
            return importPolygonWallet(walletStore, privateKey);
        case BITCOIN:
            return importBitcoinWallet(walletStore, privateKey);
        default:
            return false;
    }
});

export const switchWallet = action(async (walletStore, network, loading) => {
    loading(true);
    const storedPvtKey = await AsyncStorage.getItem(`${network}${PRIVATE_KEY}`);
    walletStore.activeWallet = network;

    if (!storedPvtKey) {
        // Reset the state before switching the wallet
        walletStore.privateKey = null;
        walletStore.address = "--";
        walletStore.balance = 0;
        walletStore.transactionHistory = [];
    }
    else {
        const walletImported = await importWallet({ walletStore, walletType: network, privateKey: storedPvtKey });
        if (!walletImported) {
            // Reset the state before switching the wallet
            walletStore.privateKey = null;
            walletStore.address = "--";
            walletStore.balance = 0;
            walletStore.transactionHistory = [];
        }
    }
    return true;
});

export const sendFunds = action(async (walletStore, receiverAddress, amount) => {
    let transactionResponse = {};
    switch (walletStore.activeWallet) {
        case POLYGON:
            transactionResponse = await sendMaticToReciever(walletStore, receiverAddress, amount);
            break;
        case BITCOIN:
            transactionResponse = await sendBitcoinToReciever(walletStore, receiverAddress, amount);
            break;
        default:
            transactionResponse['status'] = false;
            break;
    }

    return transactionResponse;
});


export const getTransactionData = action(async (walletStore, transactionHash) => {
    let transactionData = {};
    switch (walletStore.activeWallet) {
        case POLYGON:
            transactionData = await getPolygonTransactionDetails(walletStore, transactionHash);
            break;
        case BITCOIN:
            // transactionData = await getPolygonTransactionDetails(walletStore, receiverAddress, amount);
            break;
        default:
            transactionData['status'] = false;
            break;
    }

    return transactionData;
});

export const loadWalletFromLocalStorage = action(async (walletStore) => {
    const privateKey = await AsyncStorage.getItem(`${walletStore.activeWallet}${PRIVATE_KEY}`);
    if (privateKey) {
        importWallet(walletStore, privateKey, walletStore.activeWallet);
    } else {
        importWallet(walletStore, null, walletStore.activeWallet);
    }
});


export const removeWallet = action(async (walletType) => {
    try {
        await AsyncStorage.removeItem(`${walletType}${PRIVATE_KEY}`);
        return true;
    } catch (error) {
        console.error("error removing wallet", error);
        return false;
    }
});


