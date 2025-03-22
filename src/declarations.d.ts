declare module '@react-native-google-signin/google-signin' {
    export const GoogleSignin: any;
    export const GoogleSigninButton: any;
}

declare module 'react-native-biometrics' {
    export const BiometryTypes: {
        TouchID: string;
        FaceID: string;
    };
    export default class ReactNativeBiometrics {
        isSensorAvailable(): Promise<{ available: boolean; biometryType: string }>;
        createKeys(): Promise<{ publicKey: string }>;
    }
}

declare module '*.json' {
    const value: any;
    export default value;
} 