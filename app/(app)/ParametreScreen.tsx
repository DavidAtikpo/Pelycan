import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ParametreScreen: React.FC = () => {
    const handleChangePassword = () => {
        // Logique pour changer le mot de passe
        alert("Fonctionnalité de changement de mot de passe à implémenter.");
    };

    const handleManageNotifications = () => {
        // Logique pour gérer les notifications
        alert("Fonctionnalité de gestion des notifications à implémenter.");
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Paramètres</Text>

            {/* Section Changer le mot de passe */}
            <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
                <Text style={styles.optionText}>Changer le mot de passe</Text>
            </TouchableOpacity>

            {/* Section Gérer les notifications */}
            <TouchableOpacity style={styles.option} onPress={handleManageNotifications}>
                <Text style={styles.optionText}>Gérer les notifications</Text>
            </TouchableOpacity>

            {/* Ajoutez d'autres options de paramètres ici */}
            <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Autres paramètres</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    option: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    optionText: {
        fontSize: 18,
    },
});

export default ParametreScreen; 