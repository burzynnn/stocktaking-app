export default {
    mockRequest: () => {
        const req = {};
        req.body = {};
        req.query = {};
        req.params = {};
        return req;
    },
    mockResponse: () => {
        const res = {};
        res.send = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        res.render = jest.fn().mockReturnValue(res);
        return res;
    },
    mockNext: () => jest.fn(),
};
