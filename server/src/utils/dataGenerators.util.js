import dayjs from "dayjs";
import { nanoid } from "nanoid/async";

export const returnExpirationDate = (offset, unit = "minutes") => dayjs().add(offset, unit);
export const returnHash = (length) => nanoid(length);
