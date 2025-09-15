export interface CreateUserInput {
    firstName: string;
    lastName: string;
    phone: string;
    role: 'client' | 'chauffeur';
}
