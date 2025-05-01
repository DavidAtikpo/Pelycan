import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, FlatList, Linking } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
    | "/(screens)/user/ActualitesScreen" // Gardons cela pour le lien général
    | "/(screens)/user/FormesViolenceScreen"
    | "/(screens)/user/sidebar/a-propos"; // Ajout de la route "à propos"

// Interface pour les items (adaptée pour les différents types de cartes)
interface CardItem {
    title: string;
    subtitle?: string;
    icon?: string;
    route?: string;
    imageUrl?: string;
    date?: string;
    link?: string;
}

// Données pour la section Urgence (style liste)
const urgences: CardItem[] = [
    { 
        title: 'Victime de tentative de féminicide', 
        route: "/(screens)/user/VictimeFeminicideScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOTqSkJa5mue8B9Pc8RFP-lnfmdlLSuyW3Ag&s'
    },
    { 
        title: 'Formes de violence et protection', 
        route: "/(screens)/user/FormesViolenceScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd0G9kEsyeDh4RUsDapWuiQ-MtuTPqR8F6Gw&s'
    },
];

// Données pour la section Services (style grille 2x2)
const services: CardItem[] = [
    { 
        icon: 'home-outline', 
        title: 'Demande de logement', 
        route: "/(screens)/user/LogementsDisponiblesScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp8oa13-a70NmXLXMMwQtj30XHAJXejgesdg&s' 
    },
    { 
        icon: 'business-outline', 
        title: 'Hébergement d\'urgence', 
        route: "/(screens)/user/HebergementsTemporairesScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrlGzhzjA36JRMgR1Ac-aq7BlzjSyJtPc-gQ&s'
    },
    { 
        icon: 'heart-outline', 
        title: 'Soutien psychologique', 
        route: "/(screens)/user/SoutienPsychologiqueScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6Ha6oOTzCiHCXpHt1bPTW8k3sEHzj_k9ulA&s'
    },
    { 
        icon: 'location-outline', 
        title: 'Trouver un centre d\'aide', 
        route: "/(screens)/user/CentreAideScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAkGWyP5E_SJwpVX5N7D61Nw5rzph4gWL9pQ&s'
    },
];

// Données pour la section Ressources (style liste avec sous-titres)
const resources: CardItem[] = [
    { 
        title: 'Ressources d\'urgence', 
        subtitle: 'Accès rapide aux contacts et informations essentielles', 
        route: "/(screens)/user/ResourcesUrgenceScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaaYuhIc4Wzs_UcARc4FjHdCuZTxyzYXKfmg&s'
    },
    { 
        title: 'Support pour familles endeuillées', 
        subtitle: 'Accompagnement et soutien dans les moments difficiles', 
        route: "/(screens)/user/FamilleEndeuilleScreen",
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKcOq7tF2PqWg_fJRFcjlx6FEUjfg_Fz_74Q&s'
    },
];

// Données pour la section Actualités (style cartes horizontales)
const actualites: CardItem[] = [
    {
        title: "Témoignage : Mon parcours vers la liberté",
        subtitle: "Sarah partage son histoire de résilience et de courage",
        imageUrl: "https://www.info.gouv.fr/upload/media/content/0001/12/6c9edcd2de33f88facfed46665d356d414596531.jpg",
        date: "15 mars 2024",
        link: "https://blog.pelycan.fr/temoignage-sarah"
    },
    {
        title: "Nouvelle loi sur les violences conjugales",
        subtitle: "Ce qui change pour les victimes",
        imageUrl: "https://france3-regions.francetvinfo.fr/image/KC4gAKWPJBzzxX1OtPe7hr1A-eE/3x0:627x351/800x450/filters:format(webp)/regions/2025/02/17/dortoir-67b3126aaab97890683199.jpg",
        date: "10 mars 2024",
        link: "https://blog.pelycan.fr/nouvelle-loi-2024"
    },
    {
        title: "Succès de notre programme d'accompagnement",
        subtitle: "100 femmes accompagnées en 2023",
        imageUrl: "https://via.placeholder.com/150/009688/FFFFFF?text=Success",
        date: "5 mars 2024",
        link: "https://blog.pelycan.fr/bilan-2023"
    }
];


const HomeScreen: React.FC = () => {
    // Fonction pour rendre une carte de la section Urgence
    const renderUrgenceCard = ({ item }: { item: CardItem }) => (
        <Link href={item.route as any} asChild>
            <TouchableOpacity style={styles.urgenceCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.urgenceImage} />
                <Text style={styles.urgenceCardText}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#6A0DAD" />
            </TouchableOpacity>
        </Link>
    );

    // Fonction pour rendre une carte de la section Services
    const renderServiceCard = ({ item }: { item: CardItem }) => (
        <Link href={item.route as any} asChild>
            <TouchableOpacity style={styles.serviceCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
                <Text style={styles.serviceCardText}>{item.title}</Text>
            </TouchableOpacity>
        </Link>
    );

    // Fonction pour rendre une carte de la section Ressources
    const renderResourceCard = ({ item }: { item: CardItem }) => (
        <Link href={item.route as any} asChild>
            <TouchableOpacity style={styles.resourceCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.resourceImage} />
                <View style={styles.resourceTextContainer}>
                    <Text style={styles.resourceCardTitle}>{item.title}</Text>
                    <Text style={styles.resourceCardSubtitle}>{item.subtitle}</Text>
                </View>
            </TouchableOpacity>
        </Link>
    );

    // Fonction pour rendre une carte de la section Actualités
    const renderActualiteCard = ({ item }: { item: CardItem }) => (
        <TouchableOpacity 
            style={styles.actualiteCard}
            onPress={() => item.link && Linking.openURL(item.link)}
        >
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.actualiteImage}
            />
            <View style={styles.actualiteContent}>
                <Text style={styles.actualiteTitle}>{item.title}</Text>
                <Text style={styles.actualiteSubtitle}>{item.subtitle}</Text>
                <Text style={styles.actualiteDate}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Logo Pelycan au lieu de l'icône grid-outline */}
                    <Image 
                        source={require('../../assets/images/Logopelycan.jpg')}
                        style={styles.logoHeader}
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.welcomeText}>Bienvenue sur Pelycan</Text>
                        <Text style={styles.headerSloganStyle}>Se Relever pour se Révéler</Text> 
                        <View style={styles.sloganContainer}> 
                            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                            <Text style={styles.sloganText}>Votre espace sécurisé et confidentiel</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Bouton Urgence Immédiate */}
                    <View style={styles.emergencySection}>
                        <Link href="/(screens)/user/DemandeUrgenceScreen" asChild>
                            <TouchableOpacity style={styles.emergencyButton}>
                                <Ionicons name="phone-portrait-outline" size={24} color="#FFFFFF" />
                                <Text style={styles.emergencyButtonText}>URGENCE IMMÉDIATE</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {/* Section Urgence */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Urgence</Text>
                         <FlatList
                            data={urgences}
                            renderItem={renderUrgenceCard}
                            keyExtractor={(item, index) => `urgence-${index}`}
                            scrollEnabled={false} // Désactiver le défilement interne
                        />
                    </View>

                    {/* Section Services */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Services</Text>
                        <FlatList
                            data={services}
                            renderItem={renderServiceCard}
                            keyExtractor={(item, index) => `service-${index}`}
                            numColumns={2} // Grille 2x2
                            columnWrapperStyle={styles.serviceGridRow}
                            scrollEnabled={false}
                        />
                    </View>

                    {/* Section Ressources */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ressources</Text>
                        <FlatList
                            data={resources}
                            renderItem={renderResourceCard}
                            keyExtractor={(item, index) => `resource-${index}`}
                            scrollEnabled={false}
                        />
                    </View>

                    {/* Section Actualités et Témoignages (Déplacée en bas) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Actualités et témoignages</Text>
                        <FlatList
                            data={actualites}
                            renderItem={renderActualiteCard}
                            keyExtractor={(item, index) => `actu-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.actualiteListContainer}
                        />
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
    // --- Header Styles ---
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    logoHeader: {
        width: 45,
        height: 45,
        borderRadius: 23,
    },
    headerTextContainer: {
        marginLeft: 15,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
    },
    headerSloganStyle: { // Style pour le slogan "Se Relever..."
        fontSize: 15,
        color: '#6A0DAD', // Violet
        fontStyle: 'italic',
        marginTop: 2,
        marginBottom: 4,
    },
    sloganContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 4, // Supprimé pour rapprocher du slogan au-dessus
    },
    sloganText: {
        fontSize: 14,
        color: '#4CAF50',
        marginLeft: 5,
    },
     // --- Emergency Button Styles ---
    emergencySection: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    emergencyButton: {
        backgroundColor: '#DC3545',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    emergencyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        textAlign: 'center',
    },
    // --- Actualités Section (Specific Style for positioning) ---
    sectionActualites: {
        paddingLeft: 20, // Aligner le titre avec les autres sections
        marginBottom: 25, // Espace après la section actualités
        // Pas de paddingHorizontal ici car la FlatList gère son padding
    },
    // --- Main Content & Sections ---
    mainContent: {
        paddingHorizontal: 20,
        paddingTop: 0, // Pas besoin de paddingTop ici car Actualités est au-dessus
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF5722',
        marginBottom: 15,
    },
    // --- Urgence Card Styles ---
    urgenceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    urgenceImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    urgenceCardText: {
        flex: 1,
        fontSize: 15,
        color: '#333333',
        fontWeight: '500',
    },
     // --- Service Card Styles ---
     serviceGridRow: {
        justifyContent: 'space-between', // Espace égal entre les cartes de service
    },
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        aspectRatio: 1,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    serviceImage: {
        width: '100%',
        height: 90,
        borderRadius: 4,
        marginBottom: 8,
    },
    serviceCardText: {
        fontSize: 13,
        color: '#333333',
        textAlign: 'center',
        fontWeight: '500',
    },
    // --- Resource Card Styles ---
    resourceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    resourceImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    resourceTextContainer: {
        flex: 1,
        marginLeft: 0, // Pas d'icône à gauche pour l'instant
    },
    resourceCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    resourceCardSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 3,
    },
    // --- Actualités Card Styles (Déjà définis, mais vérifier le container) ---
    actualiteListContainer: {
        paddingLeft: 0, // La FlatList commence au bord de la sectionActualites
        paddingRight: 20, // Espace à droite de la dernière carte
    },
    actualiteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        width: 200, // Réduction de la taille (avant: 250)
        marginRight: 15,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    actualiteImage: {
        width: '100%',
        height: 90, // Réduction de la hauteur (avant: 120)
    },
    actualiteContent: {
        padding: 10, // Réduction du padding (avant: 12)
    },
    actualiteTitle: {
        fontSize: 14, // Réduction de la taille (avant: 15)
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    actualiteSubtitle: {
        fontSize: 12, // Réduction de la taille (avant: 13)
        color: '#666666',
        marginBottom: 6, // Réduction (avant: 8)
    },
    actualiteDate: {
        fontSize: 11, // Réduction de la taille (avant: 12)
        color: '#999999',
    },
    // --- Last Section (Style plus nécessaire ici car Actualités a bougé) ---
    // lastSection: { ... }
});

export default HomeScreen;