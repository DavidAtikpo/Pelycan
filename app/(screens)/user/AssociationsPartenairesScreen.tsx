import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AssociationsPartenairesScreen: React.FC = () => {
    const associations = [
        {
            id: 1,
            nom: "Association d'Aide aux Familles Endeuillées",
            description: "Soutien psychologique et accompagnement des familles en deuil",
            adresse: "123 Rue de la Solidarité, Lomé",
            telephone: "22890000001",
            email: "contact@aafe-togo.org",
            services: ["Groupes de parole", "Soutien individuel", "Aide administrative"]
        },
        {
            id: 2,
            nom: "SOS Familles Togo",
            description: "Assistance d'urgence et accompagnement social",
            adresse: "45 Avenue de l'Espoir, Agoè",
            telephone: "22890000002",
            email: "contact@sosfamilles-togo.org",
            services: ["Aide d'urgence", "Médiation familiale", "Support juridique"]
        },
        {
            id: 3,
            nom: "Entraide et Solidarité",
            description: "Réseau de solidarité et d'entraide communautaire",
            adresse: "78 Boulevard de la Paix, Kara",
            telephone: "22890000003",
            email: "contact@entraide-togo.org",
            services: ["Réseau d'entraide", "Assistance matérielle", "Soutien moral"]
        }
    ];

    const handleCall = (numero: string) => {
        Linking.openURL(`tel:${numero}`);
    };

    const handleEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Associations Partenaires</Text>
                <Text style={styles.subtitle}>Un réseau de soutien à votre service</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.description}>
                    Nous travaillons en étroite collaboration avec des associations locales 
                    expérimentées dans l'accompagnement des familles endeuillées. Chaque 
                    association propose des services spécifiques pour répondre au mieux à vos besoins.
                </Text>
            </View>

            <View style={styles.associationsSection}>
                {associations.map(association => (
                    <View key={association.id} style={styles.associationCard}>
                        <Text style={styles.associationName}>{association.nom}</Text>
                        <Text style={styles.associationDescription}>
                            {association.description}
                        </Text>
                        
                        <View style={styles.servicesContainer}>
                            <Text style={styles.servicesTitle}>Services proposés :</Text>
                            {association.services.map((service, index) => (
                                <View key={index} style={styles.serviceItem}>
                                    <Ionicons name="checkmark-circle" size={16} color="#D81B60" />
                                    <Text style={styles.serviceText}>{service}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.contactContainer}>
                            <View style={styles.contactInfo}>
                                <Ionicons name="location" size={16} color="#666" />
                                <Text style={styles.contactText}>{association.adresse}</Text>
                            </View>
                            
                            <View style={styles.contactButtons}>
                                <TouchableOpacity 
                                    style={styles.contactButton}
                                    onPress={() => handleCall(association.telephone)}
                                >
                                    <Ionicons name="call" size={20} color="#fff" />
                                    <Text style={styles.contactButtonText}>Appeler</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.contactButton}
                                    onPress={() => handleEmail(association.email)}
                                >
                                    <Ionicons name="mail" size={20} color="#fff" />
                                    <Text style={styles.contactButtonText}>Email</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.joinSection}>
                <Text style={styles.joinTitle}>Vous êtes une association ?</Text>
                <Text style={styles.joinDescription}>
                    Rejoignez notre réseau de partenaires pour aider plus de familles dans le besoin.
                </Text>
                <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Devenir partenaire</Text>
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
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    associationsSection: {
        padding: 20,
    },
    associationCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    associationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    associationDescription: {
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
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    contactContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    contactButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    contactButton: {
        backgroundColor: '#D81B60',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        flex: 0.48,
    },
    contactButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 14,
        fontWeight: 'bold',
    },
    joinSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    joinTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    joinDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    joinButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AssociationsPartenairesScreen; 