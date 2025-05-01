import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ViolenceType {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const typesViolence: ViolenceType[] = [
    {
        title: "Violence Économique",
        description: "Contrôle des ressources financières, interdiction de travailler, confiscation des documents bancaires, dette forcée.",
        icon: "cash",
        color: "#FF5722"
    },
    {
        title: "Violence Institutionnelle",
        description: "Discrimination dans l'accès aux services publics, harcèlement administratif, obstacles à l'autonomie.",
        icon: "business",
        color: "#2196F3"
    },
    {
        title: "Mal-logement",
        description: "Conditions de logement indignes, précarité résidentielle, expulsion illégale, surpeuplement forcé.",
        icon: "home",
        color: "#4CAF50"
    },
    {
        title: "Harcèlement Sexuel",
        description: "Propos ou comportements à connotation sexuelle non désirés, chantage sexuel, pressions pour des faveurs sexuelles.",
        icon: "warning",
        color: "#E91E63"
    },
    {
        title: "Violence Physique",
        description: "Coups, blessures, menaces physiques, privation de soins, contraintes physiques.",
        icon: "body",
        color: "#F44336"
    },
    {
        title: "Viol Conjugal",
        description: "Rapports sexuels forcés dans le couple, chantage sexuel, déni d'autonomie corporelle.",
        icon: "alert-circle",
        color: "#9C27B0"
    }
];

const FormesViolenceScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Formes de Violence</Text>
                    <Text style={styles.headerSubtitle}>
                        Reconnaître les différentes formes de violence est la première étape pour s'en protéger
                    </Text>
                </View>

                <View style={styles.content}>
                    {typesViolence.map((type, index) => (
                        <View key={index} style={styles.card}>
                            <View style={[styles.iconContainer, { backgroundColor: `${type.color}20` }]}>
                                <Ionicons name={type.icon} size={32} color={type.color} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: type.color }]}>{type.title}</Text>
                                <Text style={styles.cardDescription}>{type.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.emergencyNote}>
                    <Ionicons name="alert-circle" size={24} color="#FF0000" />
                    <Text style={styles.emergencyText}>
                        Si vous êtes en danger immédiat, composez le 17 ou le 112
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F0FF',
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E6E0FF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B008B',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    content: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: "#6A0DAD",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    emergencyNote: {
        backgroundColor: '#FFF0F0',
        margin: 15,
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF0000',
    },
    emergencyText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#FF0000',
        fontWeight: '500',
    },
});

export default FormesViolenceScreen; 