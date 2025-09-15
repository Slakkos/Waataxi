export function isValidPhone(phone: string): boolean {
    // Bénin: +229XXXXXXXX ou 8 chiffres (aucun 0 initial requis)
    // Accepte aussi le préfixe international 00229.
    const digits = phone.replace(/\s+/g, '');
    return /^(?:(?:\+|00)229)?\d{8}$/.test(digits);
}
