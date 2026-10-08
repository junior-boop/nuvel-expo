import { Stack } from 'expo-router';

// Constante module-level : un objet litteral inline en prop screenOptions serait recree
// a chaque render du layout, ce qui fait croire au navigateur que les options ont change.
const screenOptions = { headerShown: false };

export default function OnboardingLayout() {
    return <Stack screenOptions={screenOptions} />;
}
