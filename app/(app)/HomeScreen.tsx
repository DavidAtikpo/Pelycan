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

const urgences: ServiceItem[] = [
    { icon: 'medical', title: 'Victime de Tentative de Féminicide', route: "/(screens)/user/VictimeFeminicideScreen" },
];

const HomeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Image 
                        source={require('../../assets/images/Logopelycan.jpg')}
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
                        <Link href="/(screens)/user/DemandeUrgenceScreen" style={styles.emergencyButtonContent}>
                            <Ionicons name="warning" size={28} color="#FF0000" />
                            <Text style={styles.emergencyButtonText}>URGENCE IMMÉDIATE</Text>
                        </Link>
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="alert-circle" size={24} color="#FF5722" />
                            <Text style={[styles.sectionTitle, { color: '#FF5722' }]}>Urgences</Text>
                        </View>
                        <View style={styles.gridContainer}>
                            {urgences.map((item, index) => (
                                <View key={index} style={styles.gridCard}>
                                    <TouchableOpacity style={styles.gridCardContent}>
                                        <Link href={item.route as any}>
                                            <View style={styles.cardInner}>
                                                <View style={styles.gridIconContainer}>
                                                    <Ionicons name={item.icon} size={32} color="#9C27B0" />
                                                </View>
                                                <Text style={styles.gridCardText}>{item.title}</Text>
                                            </View>
                                        </Link>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="home" size={24} color="#FF5722" />
                            <Text style={[styles.sectionTitle, { color: '#FF5722' }]}>Services</Text>
                        </View>
                        <View style={styles.gridContainer}>
                            {services.map((item, index) => (
                                <View key={index} style={styles.gridCard}>
                                    <TouchableOpacity style={styles.gridCardContent}>
                                        <Link href={item.route as any}>
                                            <View style={styles.cardInner}>
                                                <View style={styles.gridIconContainer}>
                                                    <Ionicons name={item.icon} size={32} color="#9C27B0" />
                                                </View>
                                                <Text style={styles.gridCardText}>{item.title}</Text>
                                            </View>
                                        </Link>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="book" size={24} color="#FF5722" />
                            <Text style={[styles.sectionTitle, { color: '#FF5722' }]}>Ressources</Text>
                        </View>
                        <View style={styles.gridContainer}>
                            {resources.map((item, index) => (
                                <View key={index} style={styles.gridCard}>
                                    <TouchableOpacity style={styles.gridCardContent}>
                                        <Link href={item.route as any}>
                                            <View style={styles.cardInner}>
                                                <View style={styles.gridIconContainer}>
                                                    <Ionicons name={item.icon} size={32} color="#9C27B0" />
                                                </View>
                                                <Text style={styles.gridCardText}>{item.title}</Text>
                                            </View>
                                        </Link>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.section, styles.lastSection]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="newspaper" size={24} color="#FF5722" />
                            <Text style={[styles.sectionTitle, { color: '#FF5722' }]}>Actualités et Témoignages</Text>
                        </View>
                        <View style={styles.gridContainer}>
                            <View style={styles.gridCard}>
                                <TouchableOpacity style={styles.gridCardContent}>
                                    <Link href="/(screens)/user/ActualitesScreen">
                                        <View style={styles.cardInner}>
                                            <View style={styles.gridIconContainer}>
                                                <Ionicons name="time" size={32} color="#9C27B0" />
                                            </View>
                                            <Text style={styles.gridCardText}>Dernières Actualités</Text>
                                        </View>
                                    </Link>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F0FF',
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
        borderBottomColor: '#E6E0FF',
        elevation: 2,
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 15,
        borderRadius: 25,
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
        backgroundColor: '#F0FFF0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        borderWidth: 2,
        borderColor: '#FF0000',
    },
    emergencyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    emergencyButtonText: {
        color: '#FF0000',
        fontSize: 20,
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
        padding: 12,
        shadowColor: "#6A0DAD",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    gridCard: {
        width: '48%',
        marginBottom: 8,
    },
    gridCardContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110,
        shadowColor: "#6A0DAD",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    cardInner: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    gridIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: "#6A0DAD",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    gridCardText: {
        fontSize: 12,
        color: '#4A154B',
        textAlign: 'center',
        fontWeight: '500',
        paddingHorizontal: 4,
    },
    lastSection: {
        marginBottom: 30,
    },
});

export default HomeScreen;