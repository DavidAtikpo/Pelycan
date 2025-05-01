import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

interface Service {
    id: string;
    title: string;
    subtitle: string;
    icon: IconName;
    color: string;
}

interface Resource {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

interface SupportGroup {
    id: string;
    name: string;
    address: string;
    schedule: string;
}

const FamilleEndeuilleScreen: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const services: Service[] = [
        {
            id: 'psychologique',
            title: 'Soutien\nPsychologique',
            subtitle: 'Accompagnement personnalisé par des professionnels',
            icon: 'heart-outline',
            color: '#6B4E71'
        },
        {
            id: 'demarches',
            title: 'Démarches\nAdministratives',
            subtitle: 'Guide des formalités à accomplir',
            icon: 'document-text-outline',
            color: '#6B4E71'
        },
        {
            id: 'groupes',
            title: 'Groupes de\nParole',
            subtitle: 'Échangez avec d\'autres familles',
            icon: 'people-outline',
            color: '#6B4E71'
        },
        {
            id: 'ressources',
            title: 'Ressources\nPratiques',
            subtitle: 'Documentation et conseils utiles',
            icon: 'book-outline',
            color: '#6B4E71'
        }
    ] as const;

    const resources: Resource[] = [
        {
            id: 'deuil',
            title: 'Faire face au deuil',
            description: 'Guide pratique pour traverser cette période',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-3Kr-tYH30gQUkbjFiU65NIWyLaIaT--0Ww&s'
        },
        {
            id: 'soutien',
            title: 'Soutenir ses proches',
            description: 'Comment aider face au deuil',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrLGFJL4bQnKGUh2XtoddbhFu5XAm-YhSEQw&s'
        }
    ];

    const supportGroups: SupportGroup[] = [
        {
            id: 'entraide',
            name: 'Centre d\'Entraide',
            address: '15 rue de la Paix, Paris',
            schedule: 'Mardi, 18h30'
        },
        {
            id: 'reconfort',
            name: 'Maison du Réconfort',
            address: '8 avenue des Lilas, Lyon',
            schedule: 'Jeudi, 14h00'
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Soutien aux familles endeuillées</Text>
            </View>

            {/* Services Grid */}
            <View style={styles.servicesGrid}>
                {services.map(service => (
                    <TouchableOpacity key={service.id} style={styles.serviceCard}>
                        <View style={[styles.iconContainer, { backgroundColor: service.color + '20' }]}>
                            <Ionicons name={service.icon} size={24} color={service.color} />
                        </View>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Emergency Help Section */}
            <View style={styles.emergencySection}>
                <Text style={styles.sectionTitle}>Besoin d'aide immédiate ?</Text>
                <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call-outline" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>Appeler maintenant</Text>
                </TouchableOpacity>
                <Text style={styles.emergencyNumber}></Text>
            </View>

            {/* Resource Library */}
            <View style={styles.resourcesSection}>
                <Text style={styles.sectionTitle}>Bibliothèque de ressources</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourcesScroll}>
                    {resources.map(resource => (
                        <TouchableOpacity key={resource.id} style={styles.resourceCard}>
                            <Image source={{ uri: resource.imageUrl }} style={styles.resourceImage} />
                            <Text style={styles.resourceTitle}>{resource.title}</Text>
                            <Text style={styles.resourceDescription}>{resource.description}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Support Groups */}
            <View style={styles.groupsSection}>
                <Text style={styles.sectionTitle}>Groupes de soutien près de chez vous</Text>
                {supportGroups.map(group => (
                    <TouchableOpacity key={group.id} style={styles.groupCard}>
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            <View style={styles.groupDetails}>
                                <Ionicons name="location-outline" size={16} color="#666" />
                                <Text style={styles.groupText}>{group.address}</Text>
                            </View>
                            <View style={styles.groupDetails}>
                                <Ionicons name="time-outline" size={16} color="#666" />
                                <Text style={styles.groupText}>{group.schedule}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Contact Form */}
            <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Nous contacter</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre nom"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Votre email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.messageInput}
                    placeholder="Votre message"
                    value={formData.message}
                    onChangeText={(text) => setFormData({ ...formData, message: text })}
                    multiline
                    numberOfLines={4}
                />
                <TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Envoyer</Text>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
    },
    serviceCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    serviceSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    emergencySection: {
        margin: 20,
        padding: 20,
        backgroundColor: '#6B4E71',
        borderRadius: 12,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginVertical: 10,
    },
    callButtonText: {
        color: '#6B4E71',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emergencyNumber: {
        color: '#fff',
        marginTop: 5,
    },
    resourcesSection: {
        padding: 20,
    },
    resourcesScroll: {
        marginTop: 10,
    },
    resourceCard: {
        width: 250,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 15,
        overflow: 'hidden',
    },
    resourceImage: {
        width: '100%',
        height: 150,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        margin: 10,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    groupsSection: {
        padding: 20,
    },
    groupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    groupDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    groupText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    contactSection: {
        padding: 20,
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 12,
    },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    messageInput: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#6B4E71',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FamilleEndeuilleScreen; 