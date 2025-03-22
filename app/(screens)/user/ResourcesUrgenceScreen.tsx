import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResourcesUrgenceScreen: React.FC = () => {
    const resources = [
        {
            id: 1,
            titre: "Kit de Sécurité",
            description: "Documents essentiels à préparer en cas d'urgence",
            icon: "document-text"
        },
        {
            id: 2,
            titre: "Plan d'Évacuation",
            description: "Comment préparer votre départ en toute sécurité",
            icon: "map"
        },
        {
            id: 3,
            titre: "Contacts Utiles",
            description: "Liste des numéros d'urgence et associations",
            icon: "call"
        }
    ];

    const numerosDurgence = [
        { nom: "Police", numero: "17" },
        { nom: "SAMU", numero: "15" },
        { nom: "Pompiers", numero: "18" },
        { nom: "Violences Femmes Info", numero: "3919" }
    ];

    const handleCall = (numero: string) => {
        Linking.openURL(`tel:${numero}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ressources d'Urgence</Text>
                <Text style={styles.subtitle}>Accès rapide aux informations essentielles</Text>
            </View>

            <View style={styles.emergencyCallSection}>
                <Text style={styles.sectionTitle}>Numéros d'Urgence</Text>
                {numerosDurgence.map((numero, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.emergencyButton}
                        onPress={() => handleCall(numero.numero)}
                    >
                        <Ionicons name="call" size={24} color="#fff" />
                        <View style={styles.emergencyButtonText}>
                            <Text style={styles.emergencyButtonTitle}>{numero.nom}</Text>
                            <Text style={styles.emergencyButtonNumber}>{numero.numero}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.resourcesSection}>
                <Text style={styles.sectionTitle}>Ressources Disponibles</Text>
                {resources.map(resource => (
                    <TouchableOpacity key={resource.id} style={styles.resourceCard}>
                        <Ionicons name={resource.icon as any} size={24} color="#D81B60" />
                        <View style={styles.resourceContent}>
                            <Text style={styles.resourceTitle}>{resource.titre}</Text>
                            <Text style={styles.resourceDescription}>{resource.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.quickAccessSection}>
                <Text style={styles.sectionTitle}>Accès Rapide</Text>
                <TouchableOpacity style={styles.quickAccessButton}>
                    <Text style={styles.quickAccessText}>📍 Trouver l'aide la plus proche</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAccessButton}>
                    <Text style={styles.quickAccessText}>📱 Chat avec un professionnel</Text>
                </TouchableOpacity>
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
    emergencyCallSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    emergencyButtonText: {
        marginLeft: 15,
    },
    emergencyButtonTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emergencyButtonNumber: {
        color: '#fff',
        fontSize: 14,
    },
    resourcesSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    resourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resourceContent: {
        flex: 1,
        marginLeft: 15,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    resourceDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    quickAccessSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    quickAccessButton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    quickAccessText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
});

export default ResourcesUrgenceScreen; 