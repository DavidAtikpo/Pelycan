import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Animated } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

interface HebergementInfo {
    nom: string;
    description: string;
    type: 'accueil' | 'maison' | 'foyer';
}

const centres: HebergementInfo[] = [
    {
        nom: "Hebergement",
        description: "Hébergement d'urgence pour femmes victimes de violences, avec ou sans enfants.",
        type: 'accueil'
    },
    {
        nom: "Structure",

        description: "Structure d'accueil sécurisée avec accompagnement social et psychologique.",
        type: 'maison'
    },
    {
        nom: "Hebergement Temporaire",

        description: "Hébergement temporaire avec suivi personnalisé et soutien juridique.",
        type: 'foyer'
    }
];

const HebergementScreen: React.FC = () => {
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
    
    const handleViewHebergements = () => {
        router.push('/(screens)/user/LogementsDisponiblesScreen');
    };
    
    const handleWriteMessage = () => {
        router.push('/(screens)/user/EcrireMessageScreen');
    };
    
    const handleViewStructures = () => {
        router.push('/(screens)/user/StructuresScreen');
    };
    
    const handleViewTemporaryHousing = () => {
        router.push('/(screens)/user/HebergementsTemporairesScreen');
    };
    
    const handleFaireDemande = (centreType: 'accueil' | 'foyer') => {
        router.push({
            pathname: '/(screens)/FaireDemandeScreen',
            params: { centreType }
        });
    };

    // Fonction pour déterminer les boutons à afficher selon le type de centre
    const renderButtons = (centre: HebergementInfo) => {
        switch(centre.type) {
            case 'accueil':
                return (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewHebergements}
                        >
                            <Ionicons name="home-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Voir les logements</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleFaireDemande('accueil')}
                        >
                            <Ionicons name="mail-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Faire une demande</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'maison':
                return (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewStructures}
                        >
                            <Ionicons name="business-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Voir les structures</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleWriteMessage}
                        >
                            <Ionicons name="chatbox-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Écrire un message</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'foyer':
                return (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleViewTemporaryHousing}
                        >
                            <Ionicons name="bed-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Hébergements temporaires</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleFaireDemande('foyer')}
                        >
                            <Ionicons name="create-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Faire une demande</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <MaterialIcons name="home" size={40} color="#FF5722" />
                    </Animated.View>
                    <Text style={styles.title}>Centres d'Hébergement d'Urgence</Text>
                    <Text style={styles.subtitle}>Disponibles 24h/24 et 7j/7</Text>
                </View>
            </View>

            {centres.map((centre, index) => (
                <View key={index} style={styles.centreCard}>
                    <View style={styles.centreHeader}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons 
                                name={centre.type === 'accueil' ? 'home' : 
                                      centre.type === 'maison' ? 'house' : 'apartment'} 
                                size={28} 
                                color="#FF5722" 
                            />
                        </View>
                        <Text style={styles.centreName}>{centre.nom}</Text>
                    </View>
                    
                    <View style={styles.centreInfo}>
                        <View style={styles.descriptionContainer}>
                            <MaterialIcons name="info" size={20} color="#4A154B" />
                            <Text style={styles.description}>{centre.description}</Text>
                        </View>
                    </View>

                    <View style={styles.buttonsContainer}>
                        {renderButtons(centre)}
                    </View>
                </View>
            ))}

            <View style={styles.disclaimer}>
                <View style={styles.disclaimerContent}>
                    <View style={styles.disclaimerIconContainer}>
                        <MaterialIcons name="security" size={24} color="#FF5722" />
                    </View>
                    <Text style={styles.disclaimerText}>
                        Ces centres sont disponibles pour vous accueillir en toute sécurité et confidentialité.
                        Une équipe de professionnels est présente pour vous accompagner.
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
    centreCard: {
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
    centreHeader: {
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
    centreName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A154B',
    },
    centreInfo: {
        marginBottom: 20,
    },
    descriptionContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
        backgroundColor: '#F8F0FF',
        padding: 15,
        borderRadius: 12,
    },
    description: {
        fontSize: 14,
        color: '#4A154B',
        marginLeft: 10,
        flex: 1,
        lineHeight: 20,
    },
    buttonsContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#FF5722',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
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

export default HebergementScreen; 