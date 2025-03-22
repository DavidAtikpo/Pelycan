import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import { Link } from 'expo-router';

export default function WelcomeScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Logo et titre */}
            <Image source={require('../assets/images/Logopelycan.jpg')} style={styles.logo} />
            <Text style={styles.title}>Bienvenue dans Pelycan!</Text>
            <Text style={styles.description}>
                Cette application est conçue Pour accompagner, aider efficacement les femmes victimes de violences intra familiales, sexuelles et sexistes ainsi que les professionnel.le.s aidant... 
                Utilisez cette plateforme pour accéder à des ressources et des services de soutien.
                
            </Text>

            {/* Section des fonctionnalités de l'application */}
            <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Fonctionnalités de Pelycan</Text>
                <View style={styles.featureItem}>
                    <Text style={styles.featureTitle}>1. Trouver un logement sécurisé</Text>
                    <Text style={styles.featureText}>
                        Accédez à une base de données de logements sécurisés et disponibles en urgence.
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureTitle}>2. Messagerie sécurisée</Text>
                    <Text style={styles.featureText}>
                        Communiquez de manière anonyme et sécurisée avec des bailleurs et des associations partenaires.
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureTitle}>3. Bouton d'alerte silencieux</Text>
                    <Text style={styles.featureText}>
                        Activez une alerte silencieuse en cas de danger pour prévenir vos contacts de confiance ou les autorités.
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureTitle}>4. Accompagnement socio-juridique</Text>
                    <Text style={styles.featureText}>
                        Obtenez de l'aide pour les démarches administratives, la création de dossiers de demande de logement et l'ouverture des droits sociaux.
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureTitle}>5. Soutien psychologique</Text>
                    <Text style={styles.featureText}>
                        Accédez à des ressources et des services de soutien psychologique pour favoriser votre rétablissement émotionnel.
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureTitle}>6. Ressources et guides</Text>
                    <Text style={styles.featureText}>
                        Consultez des guides pratiques et des liens utiles pour vous aider dans vos démarches.
                    </Text>
                </View>
            </View>

            {/* Lien pour demander de l'aide */}
            <Link href="/(auth)/register" style={styles.link}>
                Demande de l'aide
            </Link>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    featuresSection: {
        width: "100%",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#D81B60",
    },
    featureItem: {
        marginBottom: 15,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    featureText: {
        fontSize: 14,
        color: "#555",
    },
    link: {
        fontSize: 16,
        color: "#333cff",
        textDecorationLine: 'underline',
        marginTop: 10,
    },
});