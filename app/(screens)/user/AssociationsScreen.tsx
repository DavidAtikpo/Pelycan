import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Association {
    nom: string;
    description: string;
    services: string[];
    telephone: string;
    horaires: string;
    website?: string;
}

const associations: Association[] = [
    {
        nom: "Femmes Solidaires",
        description: "Association nationale de défense des droits des femmes",
        services: [
            "Accompagnement juridique",
            "Soutien psychologique",
            "Groupes de parole",
            "Aide aux démarches administratives"
        ],
        telephone: "01 40 01 02 03",
        horaires: "Lun-Ven 9h-18h",
        website: "https://www.femmes-solidaires.org"
    },
    {
        nom: "SOS Femmes",
        description: "Aide et accompagnement des femmes victimes de violences",
        services: [
            "Hébergement d'urgence",
            "Accompagnement social",
            "Soutien psychologique",
            "Permanence téléphonique 24/7"
        ],
        telephone: "01 45 67 89 10",
        horaires: "24h/24",
        website: "https://www.sosfemmes.org"
    },
    {
        nom: "Association d'Aide aux Victimes",
        description: "Accompagnement global des victimes de violences",
        services: [
            "Assistance juridique",
            "Soutien psychologique",
            "Médiation familiale",
            "Aide aux démarches"
        ],
        telephone: "01 50 60 70 80",
        horaires: "Lun-Sam 8h-20h"
    }
];

const AssociationsScreen: React.FC = () => {
    const handleCall = (telephone: string) => {
        Linking.openURL(`tel:${telephone}`);
    };

    const handleWebsite = (website?: string) => {
        if (website) {
            Linking.openURL(website);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Associations d'Aide aux Victimes</Text>
                <Text style={styles.subtitle}>Des professionnels à votre écoute</Text>
            </View>

            <View style={styles.emergencyInfo}>
                <Ionicons name="warning" size={24} color="#fff" />
                <Text style={styles.emergencyText}>
                    En cas d'urgence, appelez le 17 ou le 112
                </Text>
            </View>

            {associations.map((association, index) => (
                <View key={index} style={styles.associationCard}>
                    <Text style={styles.associationName}>{association.nom}</Text>
                    <Text style={styles.description}>{association.description}</Text>
                    
                    <View style={styles.servicesContainer}>
                        <Text style={styles.servicesTitle}>Services proposés :</Text>
                        {association.services.map((service, idx) => (
                            <View key={idx} style={styles.serviceItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#D81B60" />
                                <Text style={styles.serviceText}>{service}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color="#D81B60" />
                        <Text style={styles.infoText}>{association.horaires}</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.callButton}
                            onPress={() => handleCall(association.telephone)}
                        >
                            <Ionicons name="call" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Appeler</Text>
                        </TouchableOpacity>

                        {association.website && (
                            <TouchableOpacity 
                                style={styles.websiteButton}
                                onPress={() => handleWebsite(association.website)}
                            >
                                <Ionicons name="globe" size={24} color="#D81B60" />
                                <Text style={styles.websiteButtonText}>Site Web</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}

            <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                    Toutes ces associations sont engagées dans la lutte contre les violences 
                    et vous garantissent confidentialité et accompagnement professionnel.
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
    emergencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D81B60',
        padding: 15,
        margin: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    emergencyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    associationCard: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 8,
        padding: 15,
        elevation: 2,
    },
    associationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    servicesContainer: {
        marginBottom: 15,
    },
    servicesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    serviceText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    callButton: {
        backgroundColor: '#D81B60',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    websiteButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#D81B60',
    },
    websiteButtonText: {
        color: '#D81B60',
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

export default AssociationsScreen; 