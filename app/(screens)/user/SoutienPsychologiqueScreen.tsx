import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SoutienPsychologiqueScreen: React.FC = () => {
    const [psychologues] = useState([
        {
            id: 1,
            nom: 'Dr. Kokou AMEDZRO',
            specialite: 'Psychologue clinicien',
            experience: '15 ans d\'expérience',
            disponibilite: 'Lundi - Vendredi',
            langues: ['Français', 'Ewe', 'Anglais'],
            photo: 'https://example.com/photo1.jpg'
        },
        {
            id: 2,
            nom: 'Dr. Ama KOFFI',
            specialite: 'Psychothérapeute',
            experience: '12 ans d\'expérience',
            disponibilite: 'Mardi - Samedi',
            langues: ['Français', 'Kabye', 'Anglais'],
            photo: 'https://example.com/photo2.jpg'
        }
    ]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Soutien Psychologique</Text>
                <Text style={styles.subtitle}>Un accompagnement professionnel et personnalisé</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notre approche</Text>
                <Text style={styles.description}>
                    Nous proposons un accompagnement psychologique adapté à chaque situation. 
                    Nos professionnels sont formés spécifiquement pour accompagner les personnes 
                    en situation de deuil et leurs proches.
                </Text>
            </View>

            <View style={styles.servicesSection}>
                <Text style={styles.sectionTitle}>Nos services</Text>
                <View style={styles.serviceCard}>
                    <Ionicons name="person" size={24} color="#D81B60" />
                    <Text style={styles.serviceTitle}>Consultations individuelles</Text>
                    <Text style={styles.serviceDescription}>
                        Séances personnalisées avec un psychologue
                    </Text>
                </View>
                <View style={styles.serviceCard}>
                    <Ionicons name="people" size={24} color="#D81B60" />
                    <Text style={styles.serviceTitle}>Thérapie familiale</Text>
                    <Text style={styles.serviceDescription}>
                        Accompagnement pour toute la famille
                    </Text>
                </View>
                <View style={styles.serviceCard}>
                    <Ionicons name="videocam" size={24} color="#D81B60" />
                    <Text style={styles.serviceTitle}>Consultations en ligne</Text>
                    <Text style={styles.serviceDescription}>
                        Séances à distance par vidéoconférence
                    </Text>
                </View>
            </View>

            <View style={styles.psychologuesSection}>
                <Text style={styles.sectionTitle}>Nos psychologues</Text>
                {psychologues.map(psy => (
                    <View key={psy.id} style={styles.psychologueCard}>
                        <View style={styles.psychologueHeader}>
                            <View style={styles.psychologueInfo}>
                                <Text style={styles.psychologueName}>{psy.nom}</Text>
                                <Text style={styles.psychologueSpecialite}>{psy.specialite}</Text>
                            </View>
                        </View>
                        <View style={styles.psychologueDetails}>
                            <Text style={styles.detailText}>✓ {psy.experience}</Text>
                            <Text style={styles.detailText}>✓ Disponible: {psy.disponibilite}</Text>
                            <Text style={styles.detailText}>✓ Langues: {psy.langues.join(', ')}</Text>
                        </View>
                        <TouchableOpacity style={styles.rdvButton}>
                            <Text style={styles.rdvButtonText}>Prendre rendez-vous</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.urgenceSection}>
                <Text style={styles.sectionTitle}>Besoin urgent ?</Text>
                <TouchableOpacity style={styles.urgenceButton}>
                    <Ionicons name="call" size={24} color="#fff" />
                    <Text style={styles.urgenceButtonText}>Ligne d'urgence 24/7</Text>
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
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    servicesSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    serviceCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'column',
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
    psychologuesSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    psychologueCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    psychologueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    psychologueInfo: {
        flex: 1,
    },
    psychologueName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    psychologueSpecialite: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    psychologueDetails: {
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    rdvButton: {
        backgroundColor: '#D81B60',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    rdvButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    urgenceSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
    },
    urgenceButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    urgenceButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default SoutienPsychologiqueScreen; 