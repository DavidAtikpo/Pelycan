import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FeedbackScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Avis et Signalements</Text>
            {/* Add your feedback content here */}
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

export default FeedbackScreen; 