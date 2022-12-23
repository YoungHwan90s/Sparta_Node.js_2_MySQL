const express = require('express');
const router = express.Router();
const { User, Comment } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const { Op } = require("sequelize");


// 댓글 작성 api
router.post("/comments/:postId", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const createdAt = new Date()
        const { userId } = res.locals.user;
        const { nickname } = await User.findOne({
            where: { userId }
        });

        if (typeof comment != 'string') {
            return res.status(412).send({
                success: false,
                errorMessage: "데이터 형식이 올바르지 않습니다.",
            });
        } else {
            await Comment.create({ postId, userId, nickname, comment, createdAt });
            res.status(201).send({});
        }
    } catch (err) {
        console.log(err)
        res.status(412).send({
            success: false,
            errorMessage: "댓글 작성에 실패하였습니다."
        });
    };
})

// 댓글 목록 조회 api
router.get("/comments/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.findAll({
            order: [["createdAt", "desc"]],
            where: { postId }
        });
        const savedComment = comments.map((comment) => {
            return {
                "Comment_ID": comment.commentId,
                "닉네임": comment.nickname,
                "댓글 내용": comment.comment,
                "작성일": comment.createdAt
            };
        });
        res.send({ "댓글 목록": savedComment });
    } catch (err) {
        console.log(err);
        res.status(412).send({
            success: false,
            errorMessage: "댓글 조회에 실패하였습니다."
        });
    };
});

// 댓글 수정 api
router.put("/comments/:commentId", authMiddleware, async (req, res) => {
    try {
    const { userId } = res.locals.user;
    const { comment } = req.body;
    const { commentId } = req.params;
    const updatedAt = new Date()

    const checkComment = await Comment.findAll({
        where: {
            [Op.and]: [
                { commentId },
                { userId }
            ]
        }
    });

    if (!checkComment.length) {
        res.status(412).send({
            success: false,
            Message: "댓글 수정 권한이 없습니다."
        });
        return
    };

    if (typeof comment != 'string') {
        return res.status(412).send({
            success: false,
            errorMessage: "데이터 형식이 올바르지 않습니다."
        });
    };
    if (!checkComment.length) {
        return res.status(400).send({
            success: false,
            errorMessage: "댓글이 존재하지 않습니다."
        });
    }
    if (checkComment.length) {
        await Comment.update({
            comment, updatedAt
        }, {
            where: { commentId }
        });
        res.status(200).send({});
    } else {
        return res.status(404).send({
            success: false,
            errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다."
        });
    };
    } catch(err) {
        console.log(err);
        res.status(400).send({
            success: false,
            errorMessage: "댓글 수정에 실패하였습니다."
        });
    };
});

// 댓글 삭제 api
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { commentId } = req.params;
        const checkComment = await Comment.findAll({
            where: {
                [Op.and]: [
                    { commentId },
                    { userId }
                ]
            }
        });

        if (!checkComment.length) {
            res.status(412).send({
                success: false,
                Message: "댓글 삭제 권한이 없습니다."
            });
            return
        };

        if(!commentId) {
            return res.status(400),send({
                success: false,
                errorMessage: "댓글이 존재하지 않습니다."
            })
        }; 
        if (checkComment.length) {
            await Comment.destroy({
                where: { commentId }
            });
        } else {
            return res.status(404).send({
                success: false,
                errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다."
            });
        };
    } catch (err) {
        console.log(err);
        res.status(400).send({
            success: false,
            errorMessage: "댓글 삭제에 실패하였습니다."
        });
    }
    res.status(200).send({});
});

module.exports = router;