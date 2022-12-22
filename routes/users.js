const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const jwt = require("jsonwebtoken");

// 회원가입 api
router.post("/signup", async (req, res) => {
    try {
        const { nickname, password, confirmPassword } = req.body;
        const createdAt = new Date()

        // 1. 패스워드, 패스워드 검증 값이 일치하는가
        if (password !== confirmPassword) {
            res.status(400).send({
                success: false,
                Message: "패스워드가 일치하지 않습니다."
            });
            return;
        }
        // 3. nickname에 해당하는 사용자가 있는가
        const existsUsers = await User.findOne({
            where: { nickname },
        });
        if (existsUsers !== null) {
            res.status(400).send({
                success: false,
                errorMessage: "중복된 닉네임입니다."
            });
            return;
        }
        // 4. DB에 데이터를 삽입
        await User.create({ nickname, password, createdAt });
        res.status(201).send({
            success: true,
            Message: "가입 성공!"
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errorMessage: "요청한 데이터 형식이 올바르지 않습니다."
        });
    };
});

// 로그인 api
router.post("/login", async (req, res) => {
    try {
        const { nickname, password } = req.body;
        const user = await User.findOne({
            where: { nickname },
        });
        // 1. 사용자가 존재하지 않거나,
        // 2. 입력받은 비밀번호와 사용자의 비밀번호가 다를 때 에러메시지 발생
        if (!user || password !== user.password) {
            res.status(400).send({
                errorMessage: "닉네임 또는 패스워드를 확인해주세요."
            });
            return;
        }
        res.send({
            token: jwt.sign({ userId: user.userId }, "secret-key"),
        });
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errorMessage: "로그인에 실패하였습니다."
        });
    };
});

// 로그인 인증 미들웨어 등록 API 
// 사용자가 토큰을 헤더에 담아서 보내야 동작하는 API
// 내 정보 조회 API
router.get("/users/me", authMiddleware, async (req, res) => {
    res.send({ user: res.locals.user });
});


module.exports = router;