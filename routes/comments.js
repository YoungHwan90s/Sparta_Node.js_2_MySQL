const express = require('express');
const router = express.Router();
const { User, Comment } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");


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

        if (comment === "") {
            return res.status(412).send({
                success: false,
                errorMessage: "댓글 내용을 입력해주세요",
            });
        } else {
            await Comment.create({ postId, userId, nickname, comment, createdAt });
            res.status(201).send({
                success: true,
                result: "댓글을 작성하였습니다."
            });
        }
    } catch (err) {
        console.log(err)
        res.status(412).send({
            success: false,
            errorMessage: "데이터 형식이 올바르지 않습니다."
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

        if (!comments.length) {
            res.status(400).send({
                success: false,
                errorMessage: "댓글 조회에 실패하였습니다."
            });
            return
        };

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
            errorMessage: "데이터 형식이 올바르지 않습니다"
        });
    };
});

// 댓글 수정 api
router.put("/comments/:commentId", authMiddleware, async (req, res) => {
    const { comment } = req.body;
    const { commentId } = req.params;
    const updatedAt = new Date()

    const checkComment = await Comment.findAll({
        where: { commentId }
    });

    if (!comment.length) {
        return res.status(412).send({
            success: false,
            errorMessage: "데이터 형식이 올바르지 않습니다"
        });
    };
    if (checkComment.length) {
        await Comment.update({
            comment, updatedAt
        }, {
            where: { commentId }
        });
    } else {
        return res.status(404).send({
            success: false,
            errorMessage: "댓글이 존재하지 않습니다."
        });
    }
    res.status(200).send({});
})

// 댓글 삭제 api
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const checkComment = await Comment.findAll({
            where: { commentId }
        });
        console.log(checkComment)

        if(!commentId) {
            return res.status(400),send({
                success: false,
                errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다."
            })
        }; 
        if (checkComment.length) {
            await Comment.destroy({
                where: { commentId }
            });
        } else {
            return res.status(404).send({
                success: false,
                errorMessage: "댓글이 존재하지 않습니다"
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