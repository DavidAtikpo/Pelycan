import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';

const SoutienPsychologiqueScreen: React.FC = () => {
    const handleEmergencyCall = () => {
        Linking.openURL('tel:3919');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Soutien Psychologique</Text>
                <Text style={styles.subtitle}>Un espace d'écoute confidentiel</Text>
            </View>

            <View style={styles.emergencySection}>
                <TouchableOpacity 
                    style={styles.emergencyButton}
                    onPress={handleEmergencyCall}
                >
                    <Text style={styles.emergencyButtonText}>APPELER LE 3919</Text>
                    <Text style={styles.emergencySubtext}>Violences Femmes Info</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.serviceSection}>
                <Text style={styles.sectionTitle}>Services Disponibles</Text>
                <TouchableOpacity style={styles.serviceButton}>
                    <Text style={styles.serviceButtonText}>🗣️ Chat en ligne avec un professionnel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.serviceButton}>
                    <Text style={styles.serviceButtonText}>📅 Prendre rendez-vous</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.serviceButton}>
                    <Text style={styles.serviceButtonText}>👥 Groupes de parole</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Informations Importantes</Text>
                <Text style={styles.infoText}>
                    • Service gratuit et confidentiel{'\n'}
                    • Disponible 24h/24 et 7j/7{'\n'}
                    • Professionnels qualifiés{'\n'}
                    • Accompagnement personnalisé
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
    emergencySection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    emergencyButton: {
        backgroundColor: '#D81B60',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    emergencyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emergencySubtext: {
        color: '#fff',
        fontSize: 14,
        marginTop: 5,
    },
    serviceSection: {
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
    serviceButton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    serviceButtonText: {
        fontSize: 16,
        color: '#333',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    infoText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
});

export default SoutienPsychologiqueScreen; 