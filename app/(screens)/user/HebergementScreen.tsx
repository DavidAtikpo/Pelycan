import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

interface HebergementInfo {
    nom: string;
    adresse: string;
    telephone: string;
    disponibilite: string;
    description: string;
    type: 'accueil' | 'maison' | 'foyer';
}

const centres: HebergementInfo[] = [
    {
        nom: "Centre d'Accueil d'Urgence",
        adresse: "15 rue de la Paix, Paris",
        telephone: "01 23 45 67 89",
        disponibilite: "24h/24",
        description: "Hébergement d'urgence pour femmes victimes de violences, avec ou sans enfants.",
        type: 'accueil'
    },
    {
        nom: "Maison des Femmes",
        adresse: "25 avenue de la République, Lyon",
        telephone: "04 56 78 90 12",
        disponibilite: "24h/24",
        description: "Structure d'accueil sécurisée avec accompagnement social et psychologique.",
        type: 'maison'
    },
    {
        nom: "Foyer d'Urgence",
        adresse: "8 rue de la Solidarité, Marseille",
        telephone: "04 91 23 45 67",
        disponibilite: "24h/24",
        description: "Hébergement temporaire avec suivi personnalisé et soutien juridique.",
        type: 'foyer'
    }
];

const HebergementScreen: React.FC = () => {
    const handleCall = (telephone: string) => {
        Linking.openURL(`tel:${telephone}`);
    };
    
    const handleViewHebergements = () => {
        router.push('/(screens)/user/LogementsDisponiblesScreen');
    };
    
    const handleWriteMessage = () => {
        router.push('/(screens)/user/EcrireMessageScreen');
    };
    
    const handleViewStructures = () => {
        router.push('/(screens)/user/StructuresScreen');
    };
    
    const handleViewTemporaryHousing = () => {
        router.push('/(screens)/user/HebergementsTemporairesScreen');
    };
    
    const handleFaireDemande = (centreType: 'accueil' | 'foyer') => {
        router.push({
            pathname: '/(screens)/FaireDemandeScreen',
            params: { centreType }
        });
    };

    // Fonction pour déterminer les boutons à afficher selon le type de centre
    const renderButtons = (centre: HebergementInfo) => {
        switch(centre.type) {
            case 'accueil':
                return (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewHebergements}
                        >
                            <Ionicons name="home-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Voir les logements</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleFaireDemande('accueil')}
                        >
                            <Ionicons name="mail-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Faire une demande</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'maison':
                return (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewStructures}
                        >
                            <Ionicons name="business-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Voir les structures</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleWriteMessage}
                        >
                            <Ionicons name="chatbox-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Écrire un message</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'foyer':
                return (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewTemporaryHousing}
                        >
                            <Ionicons name="bed-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Hébergements temporaires</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleFaireDemande('foyer')}
                        >
                            <Ionicons name="create-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Faire une demande</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Centres d'Hébergement d'Urgence</Text>
                <Text style={styles.subtitle}>Disponibles 24h/24 et 7j/7</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                    En cas d'urgence immédiate, contactez le 3919 (numéro gratuit et anonyme)
                </Text>
            </View>

            {centres.map((centre, index) => (
                <View key={index} style={styles.centreCard}>
                    <Text style={styles.centreName}>{centre.nom}</Text>
                    <View style={styles.centreInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={20} color="#D81B60" />
                            <Text style={styles.infoText}>{centre.adresse}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={20} color="#D81B60" />
                            <Text style={styles.infoText}>{centre.disponibilite}</Text>
                        </View>
                        <Text style={styles.description}>{centre.description}</Text>
                    </View>
                    {renderButtons(centre)}
                </View>
            ))}

            <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                    Ces centres sont disponibles pour vous accueillir en toute sécurité et confidentialité.
                    Une équipe de professionnels est présente pour vous accompagner.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    infoSection: {
        padding: 15,
        backgroundColor: '#D81B60',
        margin: 10,
        borderRadius: 8,
    },
    infoText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    centreCard: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 8,
        padding: 15,
        elevation: 2,
    },
    centreName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    centreInfo: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    buttonsContainer: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: '#D81B60',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    disclaimer: {
        padding: 20,
        backgroundColor: '#f8f8f8',
        margin: 10,
        borderRadius: 8,
    },
    disclaimerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default HebergementScreen; 