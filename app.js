const express = require("express");
const app = express();

// 회원가입, 로그인 라우터
const usersRouter = require("./routes/users");
// 게시물 CRUD 라우터
const postsRouter = require("./routes/posts");
// 게시글 좋아요 라우터
const likesRouter = require("./routes/likes");
// 댓글 CRUD 라우터
const commentsRouter = require("./routes/comments");

// JSON MIDDLEWARE - BODY로 전달 받은 데이터 사용을 위함
app.use(express.json())
// 미들웨어 등록
app.use("/api", [usersRouter, likesRouter,postsRouter, commentsRouter]);

app.listen(8080, () => {
    console.log("서버가 요청을 받을 준비가 됐어요");
});

app.get('/', (req, res) => {
    res.send('The page is successfully open');
});
