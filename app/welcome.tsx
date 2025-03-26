import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={require('../assets/images/Logopelycan.jpg')} style={styles.logo} />
            <Text style={styles.title}>Bienvenue dans Pelycan</Text>
            <Text style={styles.description}>
                Votre plateforme de soutien pour les femmes victimes de violences et les professionnels d'aide.
            </Text>

            <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Nos Services</Text>
                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="home" size={24} color="#D81B60" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Logement Sécurisé</Text>
                            <Text style={styles.featureDescription}>Trouvez un hébergement d'urgence adapté</Text>
                        </View>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="message" size={24} color="#D81B60" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Messagerie</Text>
                            <Text style={styles.featureDescription}>Échangez en toute sécurité</Text>
                        </View>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="warning" size={24} color="#D81B60" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Alerte Silencieuse</Text>
                            <Text style={styles.featureDescription}>Signalez une situation d'urgence</Text>
                        </View>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="gavel" size={24} color="#D81B60" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Aide Juridique</Text>
                            <Text style={styles.featureDescription}>Accompagnement dans vos démarches</Text>
                        </View>
                    </View>
                </View>
            </View>

            <Link href="/(auth)/register" asChild>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Demander de l'aide</Text>
                </TouchableOpacity>
            </Link>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginTop: 40,
        marginBottom: 20,
        borderRadius: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#D81B60",
        marginBottom: 10,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    featuresSection: {
        width: "100%",
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    featuresList: {
        width: "100%",
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    featureIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: "#666",
    },
    button: {
        backgroundColor: "#D81B60",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});