import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Association {
    nom: string;
    description: string;
    services: string[];
    telephone: string;
    horaires: string;
    website?: string;
}

const associations: Association[] = [
    {
        nom: "Femmes Solidaires",
        description: "Association nationale de défense des droits des femmes",
        services: [
            "Accompagnement juridique",
            "Soutien psychologique",
            "Groupes de parole",
            "Aide aux démarches administratives"
        ],
        telephone: "01 40 01 02 03",
        horaires: "Lun-Ven 9h-18h",
        website: "https://www.femmes-solidaires.org"
    },
    {
        nom: "SOS Femmes",
        description: "Aide et accompagnement des femmes victimes de violences",
        services: [
            "Hébergement d'urgence",
            "Accompagnement social",
            "Soutien psychologique",
            "Permanence téléphonique 24/7"
        ],
        telephone: "01 45 67 89 10",
        horaires: "24h/24",
        website: "https://www.sosfemmes.org"
    },
    {
        nom: "Association d'Aide aux Victimes",
        description: "Accompagnement global des victimes de violences",
        services: [
            "Assistance juridique",
            "Soutien psychologique",
            "Médiation familiale",
            "Aide aux démarches"
        ],
        telephone: "01 50 60 70 80",
        horaires: "Lun-Sam 8h-20h"
    }
];

const AssociationsScreen: React.FC = () => {
    const pulseAnim = new Animated.Value(1);

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleCall = (telephone: string) => {
        Linking.openURL(`tel:${telephone}`);
    };

    const handleWebsite = (website?: string) => {
        if (website) {
            Linking.openURL(website);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <MaterialIcons name="people" size={40} color="#FF5722" />
                    </Animated.View>
                    <Text style={styles.title}>Associations d'Aide aux Victimes</Text>
                    <Text style={styles.subtitle}>Des professionnels à votre écoute</Text>
                </View>
            </View>

            {associations.map((association, index) => (
                <View key={index} style={styles.associationCard}>
                    <View style={styles.associationHeader}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="business" size={28} color="#FF5722" />
                        </View>
                        <Text style={styles.associationName}>{association.nom}</Text>
                    </View>

                    <View style={styles.descriptionContainer}>
                        <MaterialIcons name="info" size={20} color="#4A154B" />
                        <Text style={styles.description}>{association.description}</Text>
                    </View>
                    
                    <View style={styles.servicesContainer}>
                        <View style={styles.servicesHeader}>
                            <MaterialIcons name="list" size={24} color="#FF5722" />
                            <Text style={styles.servicesTitle}>Services proposés</Text>
                        </View>
                        {association.services.map((service, idx) => (
                            <View key={idx} style={styles.serviceItem}>
                                <View style={styles.serviceIconContainer}>
                                    <MaterialIcons name="check-circle" size={20} color="#FF5722" />
                                </View>
                                <Text style={styles.serviceText}>{service}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoIconContainer}>
                                <MaterialIcons name="schedule" size={20} color="#FF5722" />
                            </View>
                            <Text style={styles.infoText}>{association.horaires}</Text>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.callButton}
                            onPress={() => handleCall(association.telephone)}
                        >
                            <MaterialIcons name="phone" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Appeler</Text>
                        </TouchableOpacity>

                        {association.website && (
                            <TouchableOpacity 
                                style={styles.websiteButton}
                                onPress={() => handleWebsite(association.website)}
                            >
                                <MaterialIcons name="language" size={24} color="#FF5722" />
                                <Text style={styles.websiteButtonText}>Site Web</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}

            <View style={styles.disclaimer}>
                <View style={styles.disclaimerContent}>
                    <View style={styles.disclaimerIconContainer}>
                        <MaterialIcons name="security" size={24} color="#FF5722" />
                    </View>
                    <Text style={styles.disclaimerText}>
                        Toutes ces associations sont engagées dans la lutte contre les violences 
                        et vous garantissent confidentialité et accompagnement professionnel.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F0FF',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E0FF',
        elevation: 2,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A154B',
        marginTop: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#FF5722',
        marginTop: 5,
        textAlign: 'center',
        fontWeight: '500',
    },
    associationCard: {
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    associationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        elevation: 2,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    associationName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A154B',
    },
    descriptionContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8F0FF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    description: {
        fontSize: 14,
        color: '#4A154B',
        marginLeft: 10,
        flex: 1,
        lineHeight: 20,
    },
    servicesContainer: {
        marginBottom: 15,
    },
    servicesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    servicesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5722',
        marginLeft: 10,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    serviceText: {
        fontSize: 14,
        color: '#4A154B',
        flex: 1,
    },
    infoContainer: {
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#4A154B',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    callButton: {
        backgroundColor: '#FF5722',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        flex: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    websiteButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        flex: 1,
        borderWidth: 2,
        borderColor: '#FF5722',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        gap: 10,
    },
    websiteButtonText: {
        color: '#FF5722',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimer: {
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    disclaimerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    disclaimerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        elevation: 2,
        shadowColor: "#6A0DAD",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    disclaimerText: {
        fontSize: 14,
        color: '#4A154B',
        flex: 1,
        lineHeight: 20,
        fontStyle: 'italic',
    },
});

export default AssociationsScreen; 