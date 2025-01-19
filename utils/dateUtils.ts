export const calculateAge = (birthDate: string | Date | null) => {
    if (!birthDate) return null;

    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }

    return age;
};

export const getDisplayAge = (age: number | null, birthDate: string | Date | null) => {
    if (age !== null) return age;
    return birthDate ? calculateAge(birthDate) : null;
};
