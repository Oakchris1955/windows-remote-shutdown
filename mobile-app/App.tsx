import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, ViewProps } from 'react-native';
import { ComponentProps, ReactNode, useState, useEffect } from 'react';

import SelectDropdown from 'react-native-select-dropdown'
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DisplayedMethod {
    label: string,
    value: string
}

const methods: DisplayedMethod[] = [
    {
        label: "Τερματισμός λειτουργίας",
        value: "shutdown"
    },
    {
        label: "Επανεκκίνηση",
        value: "reboot"
    }
];

const defaultMethod = methods.find((method) => method.value === "shutdown") as DisplayedMethod;

function stringifyBool(bool: boolean) {
    return bool ? "Ναι" : "Όχι"
}


interface FieldProps extends ViewProps {
    label: string,
    children: ReactNode
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


export default function App() {
    const [selectedMethod, setSelectedMethod] = useState(defaultMethod);
    const [optionsVisible, setOptionsVisibility] = useState(false);
    const [tokenVisible, setTokenVisible] = useState(false);
    const [timeout, setTimeout] = useState(0);
    const [forcefulShutdown, setForcefulShutdown] = useState(true);

    const [authToken, setAuthToken] = useState<string | null | undefined>(undefined);
    const [userToken, setUserToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function getAuthToken() {
            if (typeof authToken !== "string") {
                const storage_authToken = await AsyncStorage.getItem("authToken");
                setAuthToken(storage_authToken);
            } else {
                AsyncStorage.setItem("authToken", authToken);
            }
        }

        getAuthToken()
    }, []);

	return (
		<View style={styles.container}>
            <Field label='Μέθοδος:' style={styles.genericField}>
                <SelectDropdown
                    buttonStyle={styles.picker}
                    defaultValue={selectedMethod}
                    data={methods}
                    buttonTextAfterSelection={(selection: DisplayedMethod) => selection.label}
                    rowTextForSelection={(method: DisplayedMethod) => method.label}
                    onSelect={(itemValue: DisplayedMethod, _itemIndex) => setSelectedMethod(itemValue)}
                />
            </Field>
            <Pressable style={{backgroundColor: "#e7e7e7", paddingVertical: "2%", paddingHorizontal: "4%", margin: "3%"}}>
                <Text style={{fontSize: 14}}>Εκτέλεση ενέργειας</Text>
            </Pressable>
            <Pressable style={{backgroundColor: "#eee", paddingVertical: "2%", paddingHorizontal: "4%", margin: "1%"}} onPress={() => setOptionsVisibility(true)}>
                <Text style={{fontSize: 10}}>Περισσότερες επιλογές</Text>
            </Pressable>
            <Modal visible={optionsVisible}>
                <View style={{width: "100%", flexDirection: "row", justifyContent: "space-between"}}>
                    <Pressable
                        style={{backgroundColor: "#eee", paddingVertical: "2%", paddingHorizontal: "4%", width: "30%"}}
                        onPress={() => setOptionsVisibility(false)}>
                        <Text style={{width: "100%", flexGrow: 1, textAlign: "center", verticalAlign: "middle"}}>Επιστροφή</Text>
                    </Pressable>
                    <Pressable
                        style={{backgroundColor: "#eee", paddingVertical: "2%", paddingHorizontal: "4%", width: "50%"}}
                        onPress={() => setTokenVisible(true)}>
                        <Text style={{width: "100%", flexGrow: 1, textAlign: "center", verticalAlign: "middle"}}>Ορισμός πιστοποιητικού εξουσιοδότησης</Text>
                    </Pressable>
                </View>
                <View style={{justifyContent: "center", alignItems: "center", width: "100%", height: "100%"}}>
                    <View style={{backgroundColor: "#fff", padding: "1%", alignItems: "center", width: "100%"}}>
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
            <Modal visible={authToken === null || tokenVisible}>
                <View style={{justifyContent: "center", alignItems: "center", width: "100%", height: "100%"}}>
                    <TextInput textAlign='center' placeholder='Εισάγετε το πιστοποιητικό εξουσιοδότησης' defaultValue={userToken} style={{backgroundColor: "#ddd", width: "90%", margin: "2%"}} onChangeText={setUserToken}/>
                    <Pressable style={{backgroundColor: "#eee", padding: "1%"}} onPress={() => {
                        if (typeof userToken === "string") {
                            setAuthToken(userToken);
                            setOptionsVisibility(false);
                            setTokenVisible(false);
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
});
