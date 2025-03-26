import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AideJuridiqueScreen: React.FC = () => {
    const handleCall = (numero: string) => {
        Linking.openURL(`tel:${numero}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Aide Juridique</Text>
                <Text style={styles.subtitle}>Assistance et conseils légaux</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Services proposés</Text>
                <View style={styles.serviceCard}>
                    <Ionicons name="document-text" size={24} color="#D81B60" />
                    <Text style={styles.serviceTitle}>Démarches administratives</Text>
                    <Text style={styles.serviceDescription}>
                        Assistance pour les documents officiels et les procédures administratives
                    </Text>
                </View>
                <View style={styles.serviceCard}>
                    <Ionicons name="people" size={24} color="#D81B60" />
                    <Text style={styles.serviceTitle}>Consultation juridique</Text>
                    <Text style={styles.serviceDescription}>
                        Conseils personnalisés avec nos avocats partenaires
                    </Text>
                </View>
                <View style={styles.serviceCard}>
                    <Ionicons name="briefcase" size={24} color="#D81B60" />
                    <Text style={styles.serviceTitle}>Médiation</Text>
                    <Text style={styles.serviceDescription}>
                        Accompagnement dans la résolution des conflits
                    </Text>
                </View>
            </View>

            <View style={styles.documentsSection}>
                <Text style={styles.sectionTitle}>Documents importants</Text>
                <View style={styles.documentList}>
                    <View style={styles.documentItem}>
                        <Ionicons name="document" size={20} color="#666" />
                        <Text style={styles.documentText}>Certificat de décès</Text>
                    </View>
                    <View style={styles.documentItem}>
                        <Ionicons name="document" size={20} color="#666" />
                        <Text style={styles.documentText}>Acte de succession</Text>
                    </View>
                    <View style={styles.documentItem}>
                        <Ionicons name="document" size={20} color="#666" />
                        <Text style={styles.documentText}>Testament</Text>
                    </View>
                    <View style={styles.documentItem}>
                        <Ionicons name="document" size={20} color="#666" />
                        <Text style={styles.documentText}>Assurance vie</Text>
                    </View>
                </View>
            </View>

            <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contacts utiles</Text>
                <TouchableOpacity 
                    style={styles.contactCard}
                    onPress={() => handleCall('22890000000')}
                >
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>Assistance juridique</Text>
                        <Text style={styles.contactDetails}>Disponible du lundi au vendredi</Text>
                        <Text style={styles.contactDetails}>8h - 17h</Text>
                    </View>
                    <Ionicons name="call" size={24} color="#D81B60" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.contactCard}
                    onPress={() => handleCall('22891111111')}
                >
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>Médiateur</Text>
                        <Text style={styles.contactDetails}>Service de médiation familiale</Text>
                        <Text style={styles.contactDetails}>9h - 16h</Text>
                    </View>
                    <Ionicons name="call" size={24} color="#D81B60" />
                </TouchableOpacity>
            </View>

            <View style={styles.rdvSection}>
                <Text style={styles.sectionTitle}>Prendre rendez-vous</Text>
                <TouchableOpacity style={styles.rdvButton}>
                    <Text style={styles.rdvButtonText}>Consulter un avocat</Text>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    serviceCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 5,
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    documentsSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    documentList: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    documentText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
    },
    contactSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    contactCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    contactDetails: {
        fontSize: 14,
        color: '#666',
    },
    rdvSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
    },
    rdvButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    rdvButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AideJuridiqueScreen; 