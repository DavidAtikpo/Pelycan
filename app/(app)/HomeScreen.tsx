import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'installer @expo/vector-icons

// Définir un type pour les routes valides
type AppRoute = 
    | "/(screens)/user/LogementsDisponiblesScreen" 
    | "/(screens)/user/HebergementsTemporairesScreen" 
    | "/(screens)/user/SoutienPsychologiqueScreen" 
    | "/(screens)/user/CentreAideScreen"
    | "/(screens)/user/ResourcesUrgenceScreen"
    | "/(screens)/user/FamilleEndeuilleScreen"
    | "/(screens)/user/DemandeUrgenceScreen"
    | "/(screens)/user/VictimeFeminicideScreen"
    | "/(screens)/user/ActualitesScreen";

// Modifier l'interface des items
interface ServiceItem {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    route: AppRoute;
}

// Mettre à jour le tableau avec le typage correct
const services: ServiceItem[] = [
    { icon: 'home', title: 'Demande de Logement', route: "/(screens)/user/LogementsDisponiblesScreen" },
    { icon: 'bed', title: 'Hébergement d\'Urgence', route: "/(screens)/user/HebergementsTemporairesScreen" },
    { icon: 'heart', title: 'Soutien Psychologique', route: "/(screens)/user/SoutienPsychologiqueScreen" },
    { icon: 'location', title: 'Trouver un Centre d\'Aide', route: "/(screens)/user/CentreAideScreen" },
];

const resources: ServiceItem[] = [
    { icon: 'information-circle', title: 'Ressources d\'Urgence', route: "/(screens)/user/ResourcesUrgenceScreen" },
    { icon: 'people', title: 'Support pour Familles Endeuillées', route: "/(screens)/user/FamilleEndeuilleScreen" },
];

const HomeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Image 
                        // source={require('../assets/images/Logopelycan.jpg')} // Ajoutez votre logo
                        style={styles.logo}
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.welcomeText}>Bienvenue sur Pelycan</Text>
                        <View style={styles.securityBadge}>
                            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                            <Text style={styles.securityIndicator}>Espace sécurisé</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.emergencySection}>
                    <TouchableOpacity style={styles.emergencyButton}>
                        <Link href="/(screens)/user/DemandeUrgenceScreen" style={styles.emergencyButtonText}>
                            <Ionicons name="warning" size={24} color="#FFF" />
                            {" URGENCE IMMÉDIATE"}
                        </Link>
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="alert-circle" size={24} color="#D81B60" />
                            <Text style={styles.sectionTitle}>Urgences</Text>
                        </View>
                        <TouchableOpacity style={styles.card}>
                            <Link href="/(screens)/user/VictimeFeminicideScreen" style={styles.redLink}>
                                <View style={styles.cardContent}>
                                    <Ionicons name="medical" size={24} color="#FF0000" />
                                    <Text style={styles.cardText}>Victime de Tentative de Féminicide</Text>
                                </View>
                            </Link>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="home" size={24} color="#D81B60" />
                            <Text style={styles.sectionTitle}>Services</Text>
                        </View>
                        {services.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.card}>
                                <Link href={item.route as any} style={styles.cardLink}>
                                    <View style={styles.cardContent}>
                                        <Ionicons name={item.icon} size={24} color="#D81B60" />
                                        <Text style={styles.cardText}>{item.title}</Text>
                                    </View>
                                </Link>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="book" size={24} color="#D81B60" />
                            <Text style={styles.sectionTitle}>Ressources</Text>
                        </View>
                        {resources.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.card}>
                                <Link href={item.route as any} style={styles.cardLink}>
                                    <View style={styles.cardContent}>
                                        <Ionicons name={item.icon} size={24} color="#D81B60" />
                                        <Text style={styles.cardText}>{item.title}</Text>
                                    </View>
                                </Link>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.section, styles.lastSection]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="newspaper" size={24} color="#D81B60" />
                            <Text style={styles.sectionTitle}>Actualités et Témoignages</Text>
                        </View>
                        <TouchableOpacity style={styles.card}>
                            <Link href="/(screens)/user/ActualitesScreen" style={styles.cardLink}>
                                <View style={styles.cardContent}>
                                    <Ionicons name="time" size={24} color="#D81B60" />
                                    <Text style={styles.cardText}>Dernières Actualités</Text>
                                </View>
                            </Link>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B008B',
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    securityIndicator: {
        fontSize: 14,
        color: '#4CAF50',
        marginLeft: 5,
    },
    emergencySection: {
        padding: 15,
    },
    emergencyButton: {
        backgroundColor: '#FF0000',
        borderRadius: 10,
        padding: 15,
        elevation: 3,
    },
    emergencyButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mainContent: {
        padding: 10,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        elevation: 2,
    },
    lastSection: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D81B60',
        marginLeft: 10,
    },
    card: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
    cardLink: {
        padding: 15,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    redLink: {
        padding: 15,
        color: '#FF0000',
    },
});

export default HomeScreen;