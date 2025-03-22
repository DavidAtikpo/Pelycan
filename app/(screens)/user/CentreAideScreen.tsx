import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CentreAideScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const centres = [
        {
            id: 1,
            nom: "Centre d'Accueil d'Urgence",
            adresse: "123 rue de la Paix, Paris",
            telephone: "01 23 45 67 89",
            services: ["Hébergement", "Accompagnement", "Soutien psychologique"]
        },
        {
            id: 2,
            nom: "Maison des Femmes",
            adresse: "456 avenue de la République, Lyon",
            telephone: "04 56 78 90 12",
            services: ["Conseil juridique", "Aide sociale", "Groupe de parole"]
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un centre..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <Ionicons name="search" size={24} color="#666" />
            </View>

            <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Services disponibles :</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>Hébergement</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>Juridique</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>Psychologique</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.centresList}>
                {centres.map(centre => (
                    <View key={centre.id} style={styles.centreCard}>
                        <Text style={styles.centreName}>{centre.nom}</Text>
                        <Text style={styles.centreAddress}>{centre.adresse}</Text>
                        <Text style={styles.centrePhone}>{centre.telephone}</Text>
                        <View style={styles.servicesContainer}>
                            {centre.services.map((service, index) => (
                                <Text key={index} style={styles.serviceTag}>{service}</Text>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.contactButton}>
                            <Text style={styles.contactButtonText}>Contacter</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginRight: 10,
    },
    filterSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    filterButton: {
        backgroundColor: '#D81B60',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    filterButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    centresList: {
        padding: 15,
    },
    centreCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    centreName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    centreAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    centrePhone: {
        fontSize: 14,
        color: '#D81B60',
        marginTop: 5,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    serviceTag: {
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 4,
        marginRight: 5,
        marginBottom: 5,
        fontSize: 12,
    },
    contactButton: {
        backgroundColor: '#D81B60',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CentreAideScreen; 