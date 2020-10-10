import { nanoid } from "nanoid/async";

const generateHash = (length) => nanoid(length);

export default generateHash;
