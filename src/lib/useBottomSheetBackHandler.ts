import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// Ferme le bottom sheet sur un retour natif (bouton back Android) au lieu de laisser la navigation revenir en arrière.
export function useBottomSheetBackHandler(isOpen: boolean, onClose: () => void) {
    useEffect(() => {
        if (!isOpen) return;

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });

        return () => subscription.remove();
    }, [isOpen, onClose]);
}
