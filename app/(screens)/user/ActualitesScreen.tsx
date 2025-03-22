import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const ActualitesScreen: React.FC = () => {
    const actualites = [
        {
            id: 1,
            titre: "Nouvelle loi sur la protection des victimes",
            date: "15 Mars 2024",
            description: "Une nouvelle législation renforce la protection des femmes victimes de violences...",
            image: "url_image"
        },
        {
            id: 2,
            titre: "Ouverture d'un nouveau centre d'accueil",
            date: "10 Mars 2024",
            description: "Un nouveau centre d'accueil ouvre ses portes à Lyon pour accueillir les femmes en situation d'urgence...",
            image: "url_image"
        }
    ];

    const temoignages = [
        {
            id: 1,
            auteur: "Sarah",
            texte: "Grâce à l'aide reçue, j'ai pu reconstruire ma vie...",
            date: "Mars 2024"
        },
        {
            id: 2,
            auteur: "Marie",
            texte: "Le soutien des associations m'a permis de m'en sortir...",
            date: "Février 2024"
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Actualités et Témoignages</Text>
            </View>

            <View style={styles.actualitesSection}>
                <Text style={styles.sectionTitle}>Dernières Actualités</Text>
                {actualites.map(actualite => (
                    <TouchableOpacity key={actualite.id} style={styles.actualiteCard}>
                        <Text style={styles.actualiteDate}>{actualite.date}</Text>
                        <Text style={styles.actualiteTitre}>{actualite.titre}</Text>
                        <Text style={styles.actualiteDescription}>{actualite.description}</Text>
                        <TouchableOpacity style={styles.lirePlusButton}>
                            <Text style={styles.lirePlusText}>Lire plus</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.temoignagesSection}>
                <Text style={styles.sectionTitle}>Témoignages</Text>
                {temoignages.map(temoignage => (
                    <View key={temoignage.id} style={styles.temoignageCard}>
                        <Text style={styles.temoignageAuteur}>{temoignage.auteur}</Text>
                        <Text style={styles.temoignageDate}>{temoignage.date}</Text>
                        <Text style={styles.temoignageTexte}>{temoignage.texte}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.partagerButton}>
                <Text style={styles.partagerButtonText}>Partager votre témoignage</Text>
            </TouchableOpacity>
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
    actualitesSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    actualiteCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    actualiteDate: {
        fontSize: 12,
        color: '#666',
    },
    actualiteTitre: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 5,
        color: '#333',
    },
    actualiteDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    lirePlusButton: {
        alignSelf: 'flex-start',
    },
    lirePlusText: {
        color: '#D81B60',
        fontSize: 14,
        fontWeight: 'bold',
    },
    temoignagesSection: {
        padding: 15,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    temoignageCard: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    temoignageAuteur: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    temoignageDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    temoignageTexte: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
    },
    partagerButton: {
        backgroundColor: '#D81B60',
        padding: 15,
        borderRadius: 8,
        margin: 15,
        alignItems: 'center',
    },
    partagerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ActualitesScreen; 