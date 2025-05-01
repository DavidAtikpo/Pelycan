import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

interface Service {
    id: string;
    title: string;
    subtitle: string;
    icon: IconName;
    iconBgColor: string;
}

interface QuickAccessItem {
    id: string;
    title: string;
    icon: IconName;
}

interface ResourceItem {
    id: string;
    title: string;
    icon: IconName;
}

const CentreAideScreen: React.FC = () => {
    const services: Service[] = [
        {
            id: 'hebergement',
            title: "Hébergement d'Urgence",
            subtitle: "Trouver un abri immédiat",
            icon: "home-outline",
            iconBgColor: "#FFE4E1"
        },
        {
            id: 'logement',
            title: "Logement",
            subtitle: "Solutions de logement à long terme",
            icon: "business-outline",
            iconBgColor: "#E8EAF6"
        },
        {
            id: 'juridique',
            title: "Aide Juridique",
            subtitle: "Consultation juridique gratuite",
            icon: "shield-outline",
            iconBgColor: "#FFF3E0"
        },
        {
            id: 'psychologique',
            title: "Soutien Psychologique",
            subtitle: "Parlez à un professionnel",
            icon: "heart-outline",
            iconBgColor: "#E8F5E9"
        }
    ] as const;

    const quickAccess: QuickAccessItem[] = [
        {
            id: 'numeros',
            title: "Numéros\nd'Urgence",
            icon: "call-outline"
        },
        {
            id: 'chat',
            title: "Chat en\nDirect",
            icon: "chatbubbles-outline"
        },
        {
            id: 'localisation',
            title: "Localiser un\nCentre",
            icon: "location-outline"
        }
    ] as const;

    const resources: ResourceItem[] = [
        {
            id: 'faq',
            title: "Questions Fréquentes",
            icon: "help-circle-outline"
        },
        {
            id: 'documents',
            title: "Documents Importants",
            icon: "document-text-outline"
        },
        {
            id: 'centres',
            title: "Centres de Support",
            icon: "location-outline"
        }
    ] as const;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Centre d'Aide d'Urgence</Text>
                <Text style={styles.subtitle}>Assistance immédiate</Text>
            </View>

            {/* Numéro d'urgence */}
            <TouchableOpacity style={styles.emergencyCard}>
                <View style={styles.emergencyContent}>
                    <Text style={styles.emergencyTitle}>Centre d'Aide d'Urgence</Text>
                    <Text style={styles.emergencyNumber}></Text>
                </View>
                <View style={styles.emergencyIconContainer}>
                    <Ionicons name="call" size={24} color="#fff" />
                </View>
            </TouchableOpacity>

            {/* Services principaux */}
            {services.map(service => (
                <TouchableOpacity key={service.id} style={styles.serviceCard}>
                    <View style={[styles.serviceIconContainer, { backgroundColor: service.iconBgColor }]}>
                        <Ionicons name={service.icon} size={24} color="#333" />
                    </View>
                    <View style={styles.serviceContent}>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                    </View>
                    <TouchableOpacity style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>Contacter</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}

            {/* Accès Rapide */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accès Rapide</Text>
                <View style={styles.quickAccessGrid}>
                    {quickAccess.map(item => (
                        <TouchableOpacity key={item.id} style={styles.quickAccessItem}>
                            <Ionicons name={item.icon} size={24} color="#2196F3" />
                            <Text style={styles.quickAccessText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Caractéristiques */}
            <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="time" size={20} color="#2196F3" />
                    </View>
                    <Text style={styles.featureText}>Disponibilité 24/7</Text>
                </View>
                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    </View>
                    <Text style={styles.featureText}>Services Gratuits</Text>
                </View>
                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="lock-closed" size={20} color="#FF9800" />
                    </View>
                    <Text style={styles.featureText}>Confidentialité Assurée</Text>
                </View>
            </View>

            {/* Ressources */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ressources</Text>
                {resources.map(resource => (
                    <TouchableOpacity key={resource.id} style={styles.resourceItem}>
                        <Ionicons name={resource.icon} size={24} color="#666" />
                        <Text style={styles.resourceText}>{resource.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Carte d'aide immédiate */}
            <View style={styles.helpCard}>
                <Text style={styles.helpCardTitle}>Besoin d'aide immédiate ?</Text>
                <Text style={styles.helpCardSubtitle}>Nos conseillers sont disponibles 24/7</Text>
                <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call" size={20} color="#2196F3" />
                    <Text style={styles.callButtonText}>Appeler maintenant</Text>
                </TouchableOpacity>
                <View style={styles.alternativeButtons}>
                    <TouchableOpacity style={styles.alternativeButton}>
                        <Ionicons name="mail" size={20} color="#2196F3" />
                        <Text style={styles.alternativeButtonText}>Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.alternativeButton}>
                        <Ionicons name="chatbubbles" size={20} color="#2196F3" />
                        <Text style={styles.alternativeButtonText}>Chat</Text>
                    </TouchableOpacity>
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
    emergencyCard: {
        backgroundColor: '#FF4444',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emergencyContent: {
        flex: 1,
    },
    emergencyTitle: {
        color: '#fff',
        fontSize: 16,
    },
    emergencyNumber: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
    emergencyIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceContent: {
        flex: 1,
        marginLeft: 15,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    serviceSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    contactButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    contactButtonText: {
        color: '#666',
        fontSize: 14,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    quickAccessItem: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        width: '30%',
    },
    quickAccessText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 8,
    },
    featuresList: {
        padding: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        color: '#333',
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    resourceText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    helpCard: {
        backgroundColor: '#2196F3',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
    },
    helpCardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    helpCardSubtitle: {
        color: '#fff',
        opacity: 0.8,
        marginTop: 5,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 25,
        justifyContent: 'center',
        marginTop: 15,
    },
    callButtonText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    alternativeButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    alternativeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    alternativeButtonText: {
        color: '#fff',
        marginLeft: 5,
    },
});

export default CentreAideScreen; 