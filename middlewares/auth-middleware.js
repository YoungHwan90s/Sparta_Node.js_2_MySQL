const jwt = require("jsonwebtoken");
const { User } = require("../models");

// 사용자 인증 미들웨어 API
module.exports = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const [authType, authToken] = authorization.split(" ");
        // authType: Bearer
        // authToken: 실제 jwt 값

        // 값이 없거나 검증에 실패했을 때
        if (!authToken || authType !== "Bearer") {
            res.status(401).send({
                errorMessage: "로그인 후 이용 가능한 기능입니다.",
            });
            return;
        }
        // 해당하는 jwt 토큰이 유효한가 검증하는 단계
        const { userId } = jwt.verify(authToken, "secret-key");
        User.findByPk(userId).then((user) => {
            res.locals.user = user;
            next();
        });
    } catch (err) {
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
    }
};