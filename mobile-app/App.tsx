import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, ViewProps, Alert } from 'react-native';
import { ReactNode, useState, useEffect } from 'react';
import ipRegex from 'ip-regex';

import SelectDropdown from 'react-native-select-dropdown'
import AsyncStorage from '@react-native-async-storage/async-storage';

enum Method {
    Shutdown = "shutdown",
    Reboot = "reboot",
    Abort = "abort"
}

type DisplayedMethods = {
    [key in Method]: string;
};

type DisplayedMethodAsList = [Method, string];

const methods: DisplayedMethods = {
    [Method.Shutdown]: "Τερματισμός λειτουργίας",
    [Method.Reboot]: "Επανεκκίνηση",
    [Method.Abort]: "Ακύρωση ενέργειας"
};

const defaultMethod = Method.Shutdown

function stringifyBool(bool: boolean) {
    return bool ? "Ναι" : "Όχι"
}


interface FieldProps extends ViewProps {
    label: string
}

function Field({ label, children, style }: FieldProps) {
    return (
        <View style={[fieldStyles.container, style]}>
            <Text style={fieldStyles.text}>{label}</Text>
            {children}
        </View>
    )
}

const fieldStyles = StyleSheet.create({
    container: {
        width: "100%",
    },

    text: {
        textAlign: "left",
        paddingLeft: "2%",
        marginBottom: "1%",
        fontSize: 17.5
    }
});

/// Function obtained from https://dmitripavlutin.com/timeout-fetch-request/ with minor changes
async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number }) {
    const { timeout = 5000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
    });
    clearTimeout(id);
  
    return response;
}

const defaultRemoteIP = "192.168.1.11";
const defaultRemotePort = 8600;

export default function App() {
    const [selectedMethod, setSelectedMethod] = useState(defaultMethod);
    const [optionsVisible, setOptionsVisibility] = useState(false);
    const [tokenVisible, setTokenVisible] = useState(false);
    const [timeout, setTimeout] = useState(0);
    const [forcefulShutdown, setForcefulShutdown] = useState(true);

    const [authToken, setAuthToken] = useState<string | null | undefined>(undefined);
    const [userToken, setUserToken] = useState<string | undefined>(undefined);
    const [showToken, setShowToken] = useState(false);

    const [remoteIP, setRemoteIP] = useState<string | undefined>(undefined);
    const [remotePort, setRemotePort] = useState<number | undefined>(undefined);

    const [userIP, setUserIP] = useState<string | undefined>(defaultRemoteIP);
    const [userPort, setUserPort] = useState<number | undefined>(defaultRemotePort);

    function performAction() {
        if (typeof authToken === "string") {
            fetchWithTimeout(`http://${remoteIP}:${remotePort}/${selectedMethod}`, {
                method: "POST",
                timeout: 1000,
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    "auth_token": authToken,
                    ...( selectedMethod !== Method.Abort ? {
                        "timeout": timeout.toString(),
                        "forceful": new Boolean(forcefulShutdown).toString()
                    } : {})
                }).toString()
            }).then((response) => {
                switch (response.status) {
                    case 401:
                    case 403:
                        Alert.alert("Μη έγκυρο πιστοποιητικό", "Είτε το πιστοποιητικό σύνδεσης σας είναι μη έγκυρο ή δεν έχετε εισάγει ένα");
                        break;
                    case 202:
                        Alert.alert("Επιτυχία", `Η εκτέλεση της ενέργειας σας (${methods[selectedMethod]}) θα αρχίσει σύντομα`);
                        break;
                    default:
                        Alert.alert("Κρίσιμο σφάλμα", "Αν διαβάζετε αυτό το μήνυμα, επικοινωνήστε με το δημιουργό της εφαρμογής");
                }
            }).catch((_error) => {
                Alert.alert("Σφάλμα", "Σφάλμα σύνδεσης. Ελέγξτε την σύνδεση σας")
            })
        }
    }

    useEffect(() => {
        async function processAuthToken() {
            if (typeof authToken !== "string") {
                const storage_authToken = await AsyncStorage.getItem("authToken");
                if (storage_authToken === null) {
                    setTokenVisible(true);
                } else {
                    setAuthToken(storage_authToken);
                }
            } else if (typeof userToken === "string" && userToken.length !== 0) {
                AsyncStorage.setItem("authToken", userToken);
            }
        }

        async function processRemoteIP() {
            if (typeof remoteIP === "undefined") {
                const storage_remoteIP = await AsyncStorage.getItem("remoteIP")
                if (typeof storage_remoteIP === "string") {
                    if (ipRegex({exact: true}).test(storage_remoteIP)) {
                        setRemoteIP(storage_remoteIP)
                        setUserIP(storage_remoteIP)
                    } else {
                        AsyncStorage.removeItem("remoteIP")
                    }
                }
            } else {
                AsyncStorage.setItem("remoteIP", remoteIP);
            }
        }

        async function processRemotePort() {
            if (typeof remotePort === "undefined") {
                const storage_remotePort = await AsyncStorage.getItem("remotePort")
                if (typeof storage_remotePort === "string") {
                    const storage_remotePort_number = +storage_remotePort;
                    if (!isNaN(storage_remotePort_number)) {
                        setRemotePort(storage_remotePort_number)
                        setUserPort(storage_remotePort_number)
                    } else {
                        AsyncStorage.removeItem("remotePort")
                    }
                }
            } else {
                AsyncStorage.setItem("remotePort", remotePort.toString());
            }
        }

        processAuthToken()
        processRemoteIP()
        processRemotePort()
    }, [optionsVisible, tokenVisible, authToken, remoteIP, remotePort]);

	return (
		<View style={styles.container}>
            <Field label='Μέθοδος:' style={styles.genericField}>
                <SelectDropdown
                    buttonStyle={styles.picker}
                    defaultValue={[selectedMethod, methods[selectedMethod]]}
                    data={Object.entries(methods)}
                    buttonTextAfterSelection={(selection: DisplayedMethodAsList) => selection[1]}
                    rowTextForSelection={(method: DisplayedMethodAsList) => method[1]}
                    onSelect={(itemValue: DisplayedMethodAsList, _itemIndex) => setSelectedMethod(itemValue[0])}
                />
            </Field>
            <Pressable style={styles.executeButton} onPress={performAction}>
                <Text style={{fontSize: 14}}>Εκτέλεση ενέργειας</Text>
            </Pressable>
            <Pressable style={styles.optionsButton} onPress={() => setOptionsVisibility(true)}>
                <Text style={{fontSize: 10}}>Περισσότερες επιλογές</Text>
            </Pressable>
            <Modal visible={optionsVisible} onRequestClose={() => setOptionsVisibility(false)}>
                <View style={styles.optionsModal}>
                    <Pressable
                        style={[styles.button, {width: "30%"}]}
                        onPress={() => setOptionsVisibility(false)}>
                        <Text style={styles.buttonText}>Επιστροφή</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.button, {width: "50%"}]}
                        onPress={() => setTokenVisible(true)}>
                        <Text style={styles.buttonText}>Ορισμός πιστοποιητικού εξουσιοδότησης</Text>
                    </Pressable>
                </View>
                <View style={styles.modalView}>
                    <View style={{backgroundColor: "#fff", padding: "1%", alignItems: "center", width: "100%"}}>
                        <Field label='Διεύθυνση IP:' style={styles.genericField}>
                            <View style={{flexDirection: "row", width: "100%"}}>
                            <Text style={{verticalAlign: "middle"}}>http://</Text>
                                <TextInput
                                    style={{alignItems: "stretch", backgroundColor: "#ddd", padding: 0, width: "55%"}}
                                    value={userIP}
                                    onChangeText={setUserIP}
                                    onSubmitEditing={() => {
                                        if (ipRegex({exact: true}).test(userIP || defaultRemoteIP)) {
                                            setRemoteIP(userIP)
                                        } else {
                                            // If IP isn't valid, revert input value back to original
                                            setUserIP(remoteIP)
                                            // Also, alert the user
                                            Alert.alert("Μη έγκυρη διεύθυνση IP", "Η διεύθυνση IP που εισαγάγατε δεν είναι έγκυρη")
                                        }
                                    }}
                                />
                                <Text style={{verticalAlign: "middle", paddingHorizontal: 1}}>:</Text>
                                <TextInput
                                    style={{alignItems: "stretch", backgroundColor: "#ddd", padding: 0, width: "15%"}}
                                    value={userPort?.toString()}
                                    inputMode='numeric'
                                    onChangeText={(text) => setUserPort(+text)}
                                    onSubmitEditing={() => {
                                        if (!isNaN(userPort || defaultRemotePort) && userPort || defaultRemotePort > 0 && userPort || defaultRemotePort < 2**16) {
                                            setRemotePort(userPort)
                                        } else {
                                            // If port number isn't valid, revert input value back to original
                                            setUserPort(remotePort)
                                            // Also, alert the user
                                            Alert.alert("Μη έγκυρος αριθμός θύρας", "Ο αριθμός θύρας που εισαγάγατε δεν είναι έγκυρος")
                                        }
                                    }}
                                />
                            </View>
                        </Field>
                        <Field label='Εκτέλεση ενέργειας σε ... δεύτερα:' style={styles.genericField}>
                            <TextInput
                                style={{alignItems: "stretch", backgroundColor: "#ddd", padding: 0}}
                                inputMode='numeric'
                                textAlign='center'
                                defaultValue={timeout.toString()}
                                onChangeText={(text) => {
                                    let timeout = +text;

                                    if (!isNaN(timeout)) {
                                        setTimeout(timeout)
                                    }
                                }}
                                maxLength={10}
                            />
                        </Field>
                        <Field label='Άμεσο κλείσιμο παραθύρων:' style={styles.genericField}>
                            <SelectDropdown
                                buttonStyle={styles.picker}
                                defaultValue={forcefulShutdown}
                                data={[true, false]}
                                buttonTextAfterSelection={stringifyBool}
                                rowTextForSelection={stringifyBool}
                                onSelect={(itemValue: boolean, _itemIndex) => setForcefulShutdown(itemValue)}
                            />
                        </Field>
                    </View>
                </View>
            </Modal>
            <Modal visible={authToken === null || tokenVisible} onRequestClose={() => {if (typeof authToken === "string") {setTokenVisible(false); setShowToken(false)}}}>
                <View style={styles.modalView}>
                    <Field label={!showToken ? "Πατήστε το κουμπί για να δείτε το πιστοποιητικό εξουσιοδότησής σας:" : "Παρόν πιστοποιητικό εξουσιοδότησης:"} style={{alignItems: "center"}}>
                        {showToken ?
                            <Text>{authToken}</Text> :
                            <Pressable style={styles.button} onPress={() => setShowToken(true)}>
                                <Text>Προβολή πιστοποιητικού</Text>
                            </Pressable>
                        }
                    </Field>
                    <Field label='Νέο πιστοποιητικό εξουσιοδότησης:' style={{alignItems: "center"}}>
                        <TextInput textAlign='center' placeholder='Εισάγετε το πιστοποιητικό εξουσιοδότησης' style={{backgroundColor: "#ddd", width: "90%", margin: "2%"}} onChangeText={setUserToken}/>
                    </Field>
                    <Pressable style={{backgroundColor: "#eee", padding: "1%"}} onPress={() => {
                        if (typeof userToken === "string" && userToken.length !== 0) {
                            setAuthToken(userToken);
                            setOptionsVisibility(false);
                            setTokenVisible(false);
                            setShowToken(false);
                        }
                    }}>
                        <Text>Υποβολή πιστοποιητικού</Text>
                    </Pressable>
                </View>
            </Modal>
			<StatusBar style="auto"/>
		</View>
	);
}

const styles = StyleSheet.create({
 	container: {
        width: "100%",
        height: "100%",
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},

    genericField: {
        width: "70%",
        margin: "5%",
    },

    picker: {
        backgroundColor: "#ddd",
        width: "100%"
    },

    executeButton: {
        backgroundColor: "#e7e7e7",
        paddingVertical: "2%",
        paddingHorizontal: "4%",
        margin: "3%"
    },

    optionsButton: {
        backgroundColor: "#eee",
        paddingVertical: "2%",
        paddingHorizontal: "4%",
        margin: "1%"
    },

    optionsModal: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    modalView: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%"
    },

    button: {
        backgroundColor: "#eee",
        paddingVertical: "2%",
        paddingHorizontal: "4%"
    },

    buttonText: {
        width: "100%",
        flexGrow: 1,
        textAlign: "center",
        verticalAlign: "middle"
    },
});
