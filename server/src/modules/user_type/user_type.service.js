class UserTypeService {
    constructor(userTypeModel) {
        this.userTypeModel = userTypeModel;
    }

    findOneByUUID = (uuid, attributes) => this.userTypeModel.findOne({
        where: {
            uuid,
        },
        attributes,
    });
}

export default UserTypeService;
