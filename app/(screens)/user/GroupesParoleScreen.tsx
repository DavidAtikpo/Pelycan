import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GroupesParoleScreen: React.FC = () => {
    const [prochainsSessions, setProchainsSessions] = useState([
        {
            id: 1,
            date: '25 Mars 2024',
            heure: '14:00',
            lieu: 'Centre communautaire de Lomé',
            places: 8,
            theme: 'Faire face au deuil ensemble'
        },
        {
            id: 2,
            date: '28 Mars 2024',
            heure: '16:00',
            lieu: 'Espace culturel d\'Agoè',
            places: 12,
            theme: 'Reconstruire après la perte'
        }
    ]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Groupes de Parole</Text>
                <Text style={styles.subtitle}>Un espace d'échange et de soutien</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>À propos des groupes de parole</Text>
                <Text style={styles.description}>
                    Nos groupes de parole offrent un espace sécurisé et bienveillant où vous pouvez 
                    partager votre expérience avec d'autres personnes qui traversent des épreuves similaires. 
                    Animés par des professionnels qualifiés, ces groupes vous aident à cheminer dans votre processus de deuil.
                </Text>
            </View>

            <View style={styles.sessionsSection}>
                <Text style={styles.sectionTitle}>Prochaines sessions</Text>
                {prochainsSessions.map(session => (
                    <View key={session.id} style={styles.sessionCard}>
                        <View style={styles.sessionHeader}>
                            <Text style={styles.sessionTheme}>{session.theme}</Text>
                            <Text style={styles.placesDisponibles}>Places: {session.places}</Text>
                        </View>
                        <View style={styles.sessionDetails}>
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar" size={20} color="#666" />
                                <Text style={styles.detailText}>{session.date}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time" size={20} color="#666" />
                                <Text style={styles.detailText}>{session.heure}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="location" size={20} color="#666" />
                                <Text style={styles.detailText}>{session.lieu}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.inscriptionButton}>
                            <Text style={styles.inscriptionButtonText}>S'inscrire à cette session</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.guideSection}>
                <Text style={styles.sectionTitle}>Comment ça se passe ?</Text>
                <View style={styles.guideCard}>
                    <Text style={styles.guideTitle}>🕒 Durée</Text>
                    <Text style={styles.guideText}>Les sessions durent environ 2 heures</Text>
                </View>
                <View style={styles.guideCard}>
                    <Text style={styles.guideTitle}>👥 Participants</Text>
                    <Text style={styles.guideText}>Groupes de 8 à 12 personnes maximum</Text>
                </View>
                <View style={styles.guideCard}>
                    <Text style={styles.guideTitle}>🤝 Animation</Text>
                    <Text style={styles.guideText}>Présence d'un psychologue et d'un médiateur</Text>
                </View>
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
    sessionsSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sessionCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sessionTheme: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    placesDisponibles: {
        fontSize: 14,
        color: '#D81B60',
        fontWeight: 'bold',
    },
    sessionDetails: {
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
    },
    inscriptionButton: {
        backgroundColor: '#D81B60',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    inscriptionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    guideSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
    },
    guideCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    guideText: {
        fontSize: 14,
        color: '#666',
    },
});

export default GroupesParoleScreen; 