import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Resource {
    titre: string;
    description: string;
    contact?: string;
    type: 'info' | 'contact' | 'procedure';
    icon: string;
}

const resources: Resource[] = [
    {
        titre: "Dépôt de plainte",
        description: "Vous pouvez porter plainte dans n'importe quel commissariat ou gendarmerie. Une plainte peut aussi être déposée en ligne pour certains faits.",
        type: 'procedure',
        icon: 'shield'
    },
    {
        titre: "Aide Juridictionnelle",
        description: "Si vos ressources sont insuffisantes, vous pouvez bénéficier d'une prise en charge totale ou partielle des frais de justice et d'avocat.",
        contact: "0 805 120 127",
        type: 'info',
        icon: 'scale'
    },
    {
        titre: "Avocat Spécialisé",
        description: "Consultez un avocat spécialisé en droit des victimes. Première consultation gratuite dans de nombreux barreaux.",
        contact: "01 44 32 49 95",
        type: 'contact',
        icon: 'people'
    },
    {
        titre: "Ordonnance de Protection",
        description: "Mesure d'urgence pour vous protéger des violences. Peut être obtenue rapidement auprès du juge aux affaires familiales.",
        type: 'procedure',
        icon: 'shield-checkmark'
    }
];

const AssistanceJuridiqueScreen: React.FC = () => {
    const handleCall = (telephone: string) => {
        Linking.openURL(`tel:${telephone}`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Assistance Juridique</Text>
                <Text style={styles.subtitle}>Vos droits et démarches</Text>
            </View>

            <View style={styles.emergencyInfo}>
                <Ionicons name="warning" size={24} color="#fff" />
                <Text style={styles.emergencyText}>
                    En cas d'urgence, appelez le 17 ou le 112
                </Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Important à savoir</Text>
                <Text style={styles.infoText}>
                    Conservez toutes les preuves : certificats médicaux, messages, photos, 
                    témoignages. Ces éléments seront essentiels pour vos démarches juridiques.
                </Text>
            </View>

            {resources.map((resource, index) => (
                <View key={index} style={styles.resourceCard}>
                    <View style={styles.resourceHeader}>
                        <Ionicons name={resource.icon as any} size={24} color="#D81B60" />
                        <Text style={styles.resourceTitle}>{resource.titre}</Text>
                    </View>
                    
                    <Text style={styles.resourceDescription}>
                        {resource.description}
                    </Text>

                    {resource.contact && (
                        <TouchableOpacity 
                            style={styles.contactButton}
                            onPress={() => handleCall(resource.contact!)}
                        >
                            <Ionicons name="call" size={20} color="#fff" />
                            <Text style={styles.contactButtonText}>
                                Contacter : {resource.contact}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>Documents Utiles</Text>
                <TouchableOpacity style={styles.documentButton}>
                    <Ionicons name="document-text" size={20} color="#D81B60" />
                    <Text style={styles.documentButtonText}>
                        Modèle de plainte
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.documentButton}>
                    <Ionicons name="document-text" size={20} color="#D81B60" />
                    <Text style={styles.documentButtonText}>
                        Formulaire d'aide juridictionnelle
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                    Ces informations sont données à titre indicatif. 
                    Pour un conseil juridique personnalisé, consultez un avocat 
                    ou une association spécialisée.
                </Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
    emergencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D81B60',
        padding: 15,
        margin: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    emergencyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    infoBox: {
        backgroundColor: '#E8EAF6',
        margin: 10,
        padding: 15,
        borderRadius: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    resourceCard: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 8,
        elevation: 2,
    },
    resourceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    contactButton: {
        backgroundColor: '#D81B60',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    documentSection: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    documentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#D81B60',
        borderRadius: 8,
        marginBottom: 10,
    },
    documentButtonText: {
        color: '#D81B60',
        fontSize: 16,
        marginLeft: 8,
    },
    disclaimer: {
        padding: 20,
        backgroundColor: '#f8f8f8',
        margin: 10,
        borderRadius: 8,
    },
    disclaimerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default AssistanceJuridiqueScreen; 