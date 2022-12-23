const express = require('express');
const router = express.Router();
const { Post, Like } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const { Op } = require("sequelize");

// 게시글 좋아요 api
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const likedAt = new Date();
    const addLike = await Like.findOne({
        where: {
            [Op.and]: [
                { postId },
                { userId }
            ]
        }
    });
    const posts = await Post.findOne({
        where: { postId }
    });

    if (posts === null) {
        res.status(404).send({
            success: false,
            errorMessage: "게시글이 존재하지 않습니다."
        });
        return
    };
    // Likes 테이블에 현재 postId와 userId가 없다면,
    // Posts 테이블에 like를 + 1 해주고,
    // Likes 테이블에 postId와 userId를 추가
    if (addLike === null) {
        const like = posts.like + 1;

        await Like.create({
            postId, userId, likedAt
        });
        await Post.update({
            like
        }, {
            where: { postId }
        });
        res.status(200).send({});
        return
    }
    // 현재 로그인한 계정이 좋아요 눌렀던 게시글에 좋아요를 또 호출한 상황
    // Likes 테이블에 현재 postId와 userId가 있다면,
    // Posts 테이블에 like를 -1 해주고 => (좋아요 취소)
    // Likes 테이블에 likeId 제거
    if (addLike != null) {
        const like = posts.like - 1;
        const deleteLikeId = addLike.likeId

        await Post.update({
            like
        }, {
            where: { postId }
        });
        await Like.destroy({
            where: { likeId: deleteLikeId }
        });
        res.status(200).send({});
        return
    }
    else {
        res.status(400).send({
            success: false,
            result: "게시글 좋아요에 실패하였습니다."
        });
    }
});

// 좋아요 게시글 조회
router.get("/posts/like", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const checkLike = await Like.findAll({
        attributes: ['postId'],
        where: { userId }
    });

    const results = checkLike.map((post) => {
        return [post.postId];
    });

    const posts = await Post.findAll({
        order: [["like", "desc"]],
        where: { postId: results }
    })

    if (posts !== null) {
        const results = posts.map((post) => {
            return {
                "No.": post.postId,
                "닉네임": post.nickname,
                "제목": post.title,
                "좋아요": post.like,
                "작성일": post.createdAt,
                "수정일": post.updatedAt
            };
        });
        res.status(200).send({
            "좋아한 게시글": results,
        });
        return
    } else {
        res.status(404).send({
            success: false,
            errorMessage: "좋아요 게시글 조회에 실패하였습니다."
        });
    }
});

module.exports = router;