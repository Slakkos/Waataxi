import { CreateUserInput } from '../types/UserInput';
import { isValidPhone } from '../utils/validatePhone';
import { createUser } from '../services/userService';

export async function registerUser(input: CreateUserInput) {
    if (!isValidPhone(input.phone)) {
        throw new Error('Numéro de téléphone invalide');
    }

    // Tu pourrais ici ajouter d’autres règles (vérif doublons, etc.)
    const user = await createUser(input);
    return user;
}
