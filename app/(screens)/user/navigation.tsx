import { createStackNavigator } from '@react-navigation/stack';
import FamilleEndeuilleScreen from './FamilleEndeuilleScreen';
import GroupesParoleScreen from './GroupesParoleScreen';
import SoutienPsychologiqueScreen from './SoutienPsychologiqueScreen';
import AideJuridiqueScreen from './AideJuridiqueScreen';
import AssociationsPartenairesScreen from './AssociationsPartenairesScreen';

const Stack = createStackNavigator();

export const FamilleEndeuilleStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#D81B60',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen 
                name="FamilleEndeuille" 
                component={FamilleEndeuilleScreen}
                options={{
                    title: 'Soutien aux Familles',
                }}
            />
            <Stack.Screen 
                name="GroupesParole" 
                component={GroupesParoleScreen}
                options={{
                    title: 'Groupes de Parole',
                }}
            />
            <Stack.Screen 
                name="SoutienPsychologique" 
                component={SoutienPsychologiqueScreen}
                options={{
                    title: 'Soutien Psychologique',
                }}
            />
            <Stack.Screen 
                name="AideJuridique" 
                component={AideJuridiqueScreen}
                options={{
                    title: 'Aide Juridique',
                }}
            />
            <Stack.Screen 
                name="AssociationsPartenaires" 
                component={AssociationsPartenairesScreen}
                options={{
                    title: 'Associations Partenaires',
                }}
            />
        </Stack.Navigator>
    );
};

export type FamilleEndeuilleStackParamList = {
    FamilleEndeuille: undefined;
    GroupesParole: undefined;
    SoutienPsychologique: undefined;
    AideJuridique: undefined;
    AssociationsPartenaires: undefined;
};

export default FamilleEndeuilleStack; 