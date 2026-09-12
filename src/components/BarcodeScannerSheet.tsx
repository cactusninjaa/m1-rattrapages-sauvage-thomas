import { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts } from '@/constants/theme';
import { normalizeIsbn } from '@/utils/isbn';

type BarcodeScannerSheetProps = {
    visible: boolean;
    onClose: () => void;
    onScanned: (isbn: string) => void;
};

/** Les codes-barres au dos des livres sont des EAN-13 (ISBN-13). */
const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

export default function BarcodeScannerSheet({
    visible,
    onClose,
    onScanned,
}: BarcodeScannerSheetProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />

            <View style={styles.sheet}>
                <View style={styles.grabber} />

                <View style={styles.header}>
                    <Text style={styles.title}>Scanner le code-barres</Text>
                    <Pressable onPress={onClose} hitSlop={8}>
                        <Text style={styles.close}>Fermer</Text>
                    </Pressable>
                </View>

                {/* Monté uniquement à l'ouverture : l'état du scan repart
                    naturellement à zéro, et la caméra est libérée à la fermeture. */}
                {visible ? <Scanner onScanned={onScanned} /> : <View style={styles.viewfinder} />}
            </View>
        </Modal>
    );
}

function Scanner({ onScanned }: { onScanned: (isbn: string) => void }) {
    const [permission, requestPermission] = useCameraPermissions();
    // La caméra émet en rafale : on ne traite qu'un code par ouverture.
    const [handled, setHandled] = useState(false);
    const [rejected, setRejected] = useState<string | null>(null);

    // Demander l'accès est bien une synchronisation avec un système externe.
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (handled) return;

        const isbn = normalizeIsbn(data);
        if (!isbn) {
            setRejected(data);
            return;
        }

        setHandled(true);
        onScanned(isbn);
    };

    return (
        <>
            <View style={styles.viewfinder}>
                {!permission ? null : !permission.granted ? (
                    <View style={styles.permission}>
                        <Ionicons name="camera-outline" size={26} color={colors.textMuted} />
                        <Text style={styles.permissionText}>
                            {permission.canAskAgain
                                ? "L'accès à la caméra est nécessaire pour scanner un livre."
                                : 'Autorisez la caméra dans les réglages de votre téléphone.'}
                        </Text>
                        {permission.canAskAgain ? (
                            <Pressable onPress={requestPermission} style={styles.permissionButton}>
                                <Text style={styles.permissionButtonLabel}>Autoriser la caméra</Text>
                            </Pressable>
                        ) : null}
                    </View>
                ) : (
                    <>
                        <CameraView
                            style={StyleSheet.absoluteFill}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
                            onBarcodeScanned={handled ? undefined : handleBarcodeScanned}
                        />
                        <View style={styles.reticle} />
                    </>
                )}
            </View>

            <Text style={[styles.hint, rejected ? styles.hintRejected : null]}>
                {rejected
                    ? `Code « ${rejected} » non reconnu comme un ISBN.`
                    : 'Visez le code-barres au dos du livre.'}
            </Text>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10,9,11,.62)',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1D1A1E',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTopWidth: 1,
        borderTopColor: 'rgba(243,237,227,.12)',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
    },
    grabber: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(243,237,227,.22)',
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 19,
        color: colors.text,
    },
    close: {
        fontSize: 11.5,
        color: colors.textMuted,
    },
    viewfinder: {
        height: 172,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#17151a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reticle: {
        position: 'absolute',
        top: 26,
        left: 40,
        right: 40,
        bottom: 26,
        borderWidth: 1.5,
        borderColor: 'rgba(228,163,60,.9)',
        borderRadius: 8,
    },
    permission: {
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
    },
    permissionText: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.textSoft,
        textAlign: 'center',
    },
    permissionButton: {
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 9,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionButtonLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.onAccent,
    },
    hint: {
        fontFamily: fonts.mono,
        fontSize: 9.5,
        letterSpacing: 1,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 12,
    },
    hintRejected: {
        color: colors.accent,
    },
});
