import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';

const HebergementUrgenceScreen: React.FC = () => {
    const handleEmergencyCall = () => {
        Linking.openURL('tel:115');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.emergencySection}>
                <Text style={styles.title}>Hébergement d'Urgence</Text>
                <TouchableOpacity 
                    style={styles.emergencyButton}
                    onPress={handleEmergencyCall}
                >
                    <Text style={styles.emergencyButtonText}>APPELER LE 115</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Centres d'Hébergement Disponibles</Text>
                {/* Liste des centres à proximité */}
            </View>

            <View style={styles.resourceSection}>
                <Text style={styles.sectionTitle}>Ressources Utiles</Text>
                <Text style={styles.resourceText}>
                    • Service d'urgence 24h/24{'\n'}
                    • Accompagnement personnalisé{'\n'}
                    • Solutions temporaires sécurisées
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
    emergencySection: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    emergencyButton: {
        backgroundColor: '#FF0000',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    resourceSection: {
        padding: 20,
        backgroundColor: '#fff',
    },
    resourceText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
});

export default HebergementUrgenceScreen; 