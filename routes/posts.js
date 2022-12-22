const express = require('express');
const router = express.Router();
const { User, Post } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");


// 게시글 작성 api
router.post("/posts", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const { userId } = res.locals.user;
        const like = 0;
        const { nickname } = await User.findOne({
            where: { userId }
        });
        const createdAt = new Date()

        if (title === "" || content === "") {
            res.status(400).send({
                success: false,
                Message: "제목과 내용 모두 입력하셔야 합니다."
            });
            return;
        }
        await Post.create({ userId, like, nickname, title, content, createdAt });
        res.status(201).send({});
    } catch (err) {
        console.log(err)
        res.status(400).send({
            errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
        });
    };
});

// 게시글 조회 api
router.get("/posts", async (req, res) => {
    const posts = await Post.findAll({ 
        order: [["createdAt", "desc"]] 
    });
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
        "전체 게시글": results,
    });
});

// 게시글 상세조회 api
router.get("/posts/:postId", async (req, res) => {
    // const {postsId} = req.params;
    // const posts = await Posts.find({});
    // const [detail] = posts.filter((posts) => Number(postsId) === posts.postsId)
    // res.status(200).json({detail});
    const { postId } = req.params;
    const posts = await Post.findAll({
        where: { postId }
    });
    const results = posts.map((post) => {
        return {
            "No.": post.postId,
            "닉네임": post.nickname,
            "제목": post.title,
            "내용": post.content,
            "좋아요": post.like,
            "작성일": post.createdAt,
            "수정일": post.updatedAt
        };
    });

    if (posts.length) {
        res.status(200).send({ "게시글": results });
    } else {
        return res.status(404).send({ success: false, result: "해당 데이터를 찾을 수 없습니다." });
    }
});

// 게시글 수정 api
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;

    const adjustPost = await Post.findAll({
        where: { postId }
    });
    if (title === "" || content === "") {
        res.status(400).send({
            success: false,
            Message: "제목과 내용 모두 입력하셔야 합니다."
        });
        return;
    }
    if (adjustPost.length) {
        await Post.update({
            title, content
        }, {
            where: { postId }
        });
    } else {
        return res.status(404).send({
            success: false, 
            result: "해당 데이터를 찾을 수 없습니다."
        });
    }
    res.status(200).send({});
})

// 게시글 삭제 api
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const deletePost = await Post.findAll({
        where: { postId }
    });

    if (deletePost.length) {
        await Post.destroy({
            where: { postId }
        });
    }
    else {
        return res.status(404).send({ success: false, result: "게시글이 존재하지 않거나, 잘못된 요청입니다." });
    }

    res.status(200).send({ success: true, result: "삭제 완료" });
});

module.exports = router;