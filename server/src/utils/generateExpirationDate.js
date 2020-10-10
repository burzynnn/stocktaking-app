const generateExpirationDate = (increase) => {
    const now = new Date();
    now.setHours(now.getHours() + increase);
    return now;
};

export default generateExpirationDate;
