import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmergencyHousingScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hébergement d'urgence</Text>
            {/* Add your content here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default EmergencyHousingScreen; 