import dayjs from "dayjs";

const generateExpirationDate = (increase) => dayjs().add(increase, "hour");

export default generateExpirationDate;
