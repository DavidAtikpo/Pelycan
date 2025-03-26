import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FamilleEndeuilleStackParamList } from './navigation';

type FamilleEndeuilleScreenNavigationProp = StackNavigationProp<
    FamilleEndeuilleStackParamList,
    'FamilleEndeuille'
>;

const FamilleEndeuilleScreen: React.FC = () => {
    const navigation = useNavigation<FamilleEndeuilleScreenNavigationProp>();

    const handleCall = (numero: string) => {
        Linking.openURL(`tel:${numero}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Soutien aux Familles Endeuillées</Text>
                <Text style={styles.subtitle}>Vous n'êtes pas seul(e)</Text>
            </View>

            <View style={styles.supportSection}>
                <Text style={styles.sectionTitle}>Soutien Immédiat</Text>
                <TouchableOpacity 
                    style={styles.supportButton}
                    onPress={() => handleCall('0145554141')}
                >
                    <Ionicons name="call" size={24} color="#fff" />
                    <Text style={styles.supportButtonText}>Ligne d'écoute dédiée</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.resourcesSection}>
                <Text style={styles.sectionTitle}>Ressources Disponibles</Text>
                <TouchableOpacity 
                    style={styles.resourceCard}
                    onPress={() => navigation.navigate('GroupesParole')}
                >
                    <Text style={styles.resourceTitle}>👥 Groupes de Parole</Text>
                    <Text style={styles.resourceDescription}>
                        Rencontrez d'autres familles et partagez votre expérience dans un cadre bienveillant
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.resourceCard}
                    onPress={() => navigation.navigate('SoutienPsychologique')}
                >
                    <Text style={styles.resourceTitle}>💭 Soutien Psychologique</Text>
                    <Text style={styles.resourceDescription}>
                        Accompagnement personnalisé par des professionnels spécialisés
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.resourceCard}
                    onPress={() => navigation.navigate('AideJuridique')}
                >
                    <Text style={styles.resourceTitle}>⚖️ Aide Juridique</Text>
                    <Text style={styles.resourceDescription}>
                        Assistance pour les démarches administratives et juridiques
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.associationsSection}>
                <Text style={styles.sectionTitle}>Associations Partenaires</Text>
                <TouchableOpacity 
                    style={styles.associationCard}
                    onPress={() => navigation.navigate('AssociationsPartenaires')}
                >
                    <Text style={styles.associationName}>Association d'Aide aux Familles</Text>
                    <Text style={styles.associationContact}>Contact: 01 XX XX XX XX</Text>
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
    supportSection: {
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
    supportButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    resourcesSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    resourceCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#666',
    },
    associationsSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    associationCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    associationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    associationContact: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    memorialSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
    },
    memorialButton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    memorialButtonText: {
        color: '#D81B60',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FamilleEndeuilleScreen; 