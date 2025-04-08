"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAdmin = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ message: "No admin token found" });
    }
    next();
};
exports.default = isAdmin;
