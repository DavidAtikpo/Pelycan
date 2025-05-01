import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResourcesUrgenceScreen: React.FC = () => {
    const emergencyNumbers = [
        {
            id: 'samu',
            number: '15',
            label: 'SAMU',
            icon: 'medkit-outline'
        },
        {
            id: 'police',
            number: '17',
            label: 'Police',
            icon: 'shield-checkmark-outline'
        },
        {
            id: 'pompiers',
            number: '18',
            label: 'Pompiers',
            icon: 'flame-outline'
        },
        {
            id: 'europe',
            number: '112',
            label: 'Numéro d\'urgence\neuropéen',
            icon: 'call-outline'
        }
    ];

    const quickActions = [
        {
            id: 'hospital',
            title: 'Localiser l\'hôpital le plus proche',
            icon: 'business-outline'
        },
        {
            id: 'pharmacy',
            title: 'Trouver une pharmacie de garde',
            icon: 'medical-outline'
        },
        {
            id: 'poison',
            title: 'Centre antipoison',
            icon: 'warning-outline'
        },
        {
            id: 'doctor',
            title: 'SOS Médecin',
            icon: 'person-outline'
        }
    ];

    const importantInfo = [
        {
            id: 'blood',
            title: 'Groupe Sanguin',
            value: 'A positif',
            icon: 'heart-outline'
        },
        {
            id: 'allergies',
            title: 'Allergies',
            value: 'Pénicilline',
            icon: 'alert-circle-outline'
        },
        {
            id: 'contacts',
            title: 'Contacts d\'urgence',
            value: 'Marie Dubois - 06 12 34 56 78',
            icon: 'people-outline'
        }
    ];

    const safetyTips = [
        {
            id: 'firstaid',
            title: 'Premiers Secours',
            description: 'Apprenez les gestes qui sauvent',
            icon: 'medical-outline'
        },
        {
            id: 'emergency',
            title: 'En cas d\'urgence',
            description: 'Gardez votre calme et appelez les secours',
            icon: 'warning-outline'
        }
    ];

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ressources d'Urgence</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Numéros d'Urgence</Text>
                <View style={styles.emergencyGrid}>
                    {emergencyNumbers.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.emergencyCard}
                            onPress={() => handleCall(item.number)}
                        >
                            <Ionicons name={item.icon as any} size={24} color="#FF3B30" />
                            <Text style={styles.emergencyNumber}>{item.number}</Text>
                            <Text style={styles.emergencyLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions Rapides</Text>
                {quickActions.map(action => (
                    <TouchableOpacity key={action.id} style={styles.actionButton}>
                        <View style={styles.actionIcon}>
                            <Ionicons name={action.icon as any} size={20} color="#FF3B30" />
                        </View>
                        <Text style={styles.actionText}>{action.title}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations Importantes</Text>
                {importantInfo.map(info => (
                    <View key={info.id} style={styles.infoCard}>
                        <View style={styles.infoIcon}>
                            <Ionicons name={info.icon as any} size={20} color="#FF3B30" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>{info.title}</Text>
                            <Text style={styles.infoValue}>{info.value}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conseils de Sécurité</Text>
                <View style={styles.safetyGrid}>
                    {safetyTips.map(tip => (
                        <TouchableOpacity key={tip.id} style={styles.safetyCard}>
                            <Ionicons name={tip.icon as any} size={24} color="#FF3B30" />
                            <Text style={styles.safetyTitle}>{tip.title}</Text>
                            <Text style={styles.safetyDescription}>{tip.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        backgroundColor: '#FF3B30',
        padding: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000',
    },
    emergencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    emergencyCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    emergencyNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginVertical: 8,
    },
    emergencyLabel: {
        fontSize: 14,
        color: '#000',
        textAlign: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    infoValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    safetyGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    safetyCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    safetyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    safetyDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default ResourcesUrgenceScreen; 