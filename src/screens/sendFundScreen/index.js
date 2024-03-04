import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { ActivityIndicator, Alert, ToastAndroid } from "react-native";
import walletStore from "../../store/wallet/walletStore";
import LabeledInput from "../../components/labeledInput";
import PrimaryButton from "../../components/primaryButton";
import { canTransferFunds, isValidPolygonAddress } from "../../utils/stringValidation";
import { useNavigation } from "@react-navigation/native";
import { BITCOIN, POLYGON } from "../../constants/commonConstants";

const SendFunds = () => {
    const [receiverAddress, setReceiverAddress] = useState("");
    const [recieverAddressError, setRecieverAddressError] = useState("");
    const [amount, setAmount] = useState("");
    const [amountError, setAmountError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleButtonPress = async () => {

        if (!validateReciverAddress() && !validateAmount()) {
            return;
        }
        setLoading(true);
        const transaction = await walletStore.sendFunds(walletStore, receiverAddress, amount);
        setLoading(false);
        if (transaction.status) {
            navigation.navigate("TransactionDetailScreen", { transactionHash: transaction.txHash })
        }
        else {
            Alert.alert("Transaction Failed", transaction.errorMessage)
        }
    };

    const validateReciverAddress = () => {
        if (!receiverAddress) {
            setRecieverAddressError("Address is required");
            return false;
        }

        if (!isValidPolygonAddress(receiverAddress)) {
            setRecieverAddressError("Invalid address");
            return false;
        }

        setRecieverAddressError("");
        return true;
    };

    const validateAmount = () => {
        if (!amount) {
            setAmountError("Amount is required");
            return false;
        }

        if (!canTransferFunds(walletStore.balance, amount)) {
            setAmountError("Inefficient funds");
            return false;
        }

        setAmountError("");
        return true;
    }

    const handleReciverAddressInput = (text) => {
        if (recieverAddressError) {
            setRecieverAddressError("");
        }
        setReceiverAddress(text);
    }

    const handleAmountInput = (text) => {
        if (amountError) {
            setAmountError("");
        }
        setAmount(text)
    }

    useEffect(() => {
    }, []);

    return (
        <SendFundsComponent>
            <LabeledInput
                label="Enter reciever's address"
                placeholder="Enter public address (0x)"
                onChangeText={(text) => handleReciverAddressInput(text)}
                value={receiverAddress}
                error={recieverAddressError}
            />
            <LabeledInput
                label="Amount"
                placeholder="Enter amount"
                onChangeText={(text) => handleAmountInput(text)}
                value={amount}
                error={amountError}
                showNumpad={true}
            />
            <BalanceTextContainer>
                <BalanceText>Available Balance: {walletStore.balance}</BalanceText>
            </BalanceTextContainer>

            <PrimaryButton onPress={handleButtonPress} text="Send Funds" showLoader={loading} />
        </SendFundsComponent>
    );
};

export default SendFunds;

const SendFundsComponent = styled.ScrollView`
background-color: #ffffffab;
flex: 1;
padding: 20px 20px;
`

const BalanceTextContainer = styled.View`
    margin: 0px 0px 20px;
`

const BalanceText = styled.Text`
  font-size: 16px;
  color: #333;
`;