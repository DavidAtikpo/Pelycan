import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const SoutienPsychologiqueScreen: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const moods = [
        { emoji: "😊", label: "Bien" },
        { emoji: "😐", label: "Neutre" },
        { emoji: "😔", label: "Triste" },
        { emoji: "😰", label: "Anxieux" },
        { emoji: "😤", label: "Stressé" }
    ];

    const professionals = [
        {
            id: 1,
            name: 'Dr. Marie Laurent',
            title: 'Psychologue clinicienne',
            rating: 5,
            status: 'Disponible',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT51_Si5atnbdyvkdt0k_7gcflCMnekKzfacA&s'
        },
        {
            id: 2,
            name: 'Dr. Louise Bernard',
            title: 'Psychiatre',
            rating: 5,
            status: 'Disponible',
            photo: 'https://psychologue-nawel-hannachi.lu/wp-content/uploads/2021/06/IMG_9876carreNB-1536x1536.jpg'
        }
    ];

    const renderStars = (rating: number) => {
        return [...Array(rating)].map((_, i) => (
            <Ionicons key={i} name="star" size={16} color="#FFD700" />
        ));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Soutien Psychologique</Text>
                <Text style={styles.subtitle}>Nous sommes là pour vous</Text>
            </View>

            {/* Carte d'urgence */}
            <View style={styles.emergencyCard}>
                <Text style={styles.emergencyTitle}>Besoin d'aide urgente?</Text>
                <View style={styles.phoneContainer}>
                    <Ionicons name="call" size={24} color="#FF4081" />
                    <Text style={styles.phoneNumber}>Pelycan</Text>
                </View>
                <Text style={styles.availabilityText}>Disponible</Text>
            </View>

            {/* Services principaux */}
            <View style={styles.servicesGrid}>
                <TouchableOpacity style={styles.serviceCard}>
                    <Ionicons name="chatbubbles-outline" size={24} color="#2196F3" />
                    <Text style={styles.serviceTitle}>Chat en direct</Text>
                    <Text style={styles.serviceSubtitle}>Parlez à un professionnel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                    <Ionicons name="calendar-outline" size={24} color="#2196F3" />
                    <Text style={styles.serviceTitle}>Rendez-vous</Text>
                    <Text style={styles.serviceSubtitle}>Planifier une consultation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                    <Ionicons name="book-outline" size={24} color="#2196F3" />
                    <Text style={styles.serviceTitle}>Ressources</Text>
                    <Text style={styles.serviceSubtitle}>Articles et guides</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.serviceCard}>
                    <Ionicons name="people-outline" size={24} color="#2196F3" />
                    <Text style={styles.serviceTitle}>Groupes de soutien</Text>
                    <Text style={styles.serviceSubtitle}>Rejoindre une communauté</Text>
                </TouchableOpacity>
            </View>

            {/* Suivi du bien-être */}
            <View style={styles.wellbeingSection}>
                <Text style={styles.sectionTitle}>Votre bien-être aujourd'hui</Text>
                <Text style={styles.sectionSubtitle}>Comment vous sentez-vous?</Text>
                <View style={styles.moodContainer}>
                    {moods.map((mood, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={[
                                styles.moodButton,
                                selectedMood === mood.label && styles.selectedMood
                            ]}
                            onPress={() => setSelectedMood(mood.label)}
                        >
                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                            <Text style={styles.moodLabel}>{mood.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Carte de méditation */}
            <TouchableOpacity style={styles.meditationCard}>
                <View style={styles.meditationContent}>
                    <Text style={styles.meditationTitle}>Méditation rapide - 5 min</Text>
                    <Text style={styles.meditationSubtitle}>Prenez un moment pour vous recentrer</Text>
                </View>
                <Image 
                    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQveycylsnwCpP7aVZzWX4OzVSxLDGKm_rMTw&s' }}
                    style={styles.meditationImage}
                />
            </TouchableOpacity>

            {/* Section des professionnels */}
            <View style={styles.professionalsSection}>
                <Text style={styles.sectionTitle}>Nos Professionnels</Text>
                {professionals.map(pro => (
                    <View key={pro.id} style={styles.professionalCard}>
                        <Image 
                            source={{ uri: pro.photo }}
                            style={styles.professionalPhoto}
                        />
                        <View style={styles.professionalInfo}>
                            <Text style={styles.professionalName}>{pro.name}</Text>
                            <Text style={styles.professionalTitle}>{pro.title}</Text>
                            <View style={styles.ratingContainer}>
                                {renderStars(pro.rating)}
                            </View>
                            <Text style={styles.statusText}>{pro.status}</Text>
                        </View>
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
    emergencyCard: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF4081',
        elevation: 3,
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    phoneNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF4081',
        marginLeft: 10,
    },
    availabilityText: {
        color: '#666',
        marginTop: 5,
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
        elevation: 2,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    serviceSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    wellbeingSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    moodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    moodButton: {
        alignItems: 'center',
        padding: 10,
    },
    selectedMood: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    moodEmoji: {
        fontSize: 24,
        marginBottom: 5,
    },
    moodLabel: {
        fontSize: 12,
        color: '#666',
    },
    meditationCard: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        elevation: 2,
    },
    meditationContent: {
        flex: 1,
        padding: 15,
    },
    meditationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    meditationSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    meditationImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        margin: 10,
    },
    professionalsSection: {
        padding: 20,
    },
    professionalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    professionalPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    professionalInfo: {
        flex: 1,
    },
    professionalName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    professionalTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    statusText: {
        color: '#4CAF50',
        fontSize: 14,
        marginTop: 5,
    },
});

export default SoutienPsychologiqueScreen; 