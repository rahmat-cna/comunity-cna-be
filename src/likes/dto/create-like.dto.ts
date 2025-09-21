import { isNotEmpty, IsNotEmpty } from "class-validator";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/user/entities/user.entity";

export class CreateLikeDto {
    @IsNotEmpty()
    user: User

    @IsNotEmpty()
    post:Post
}
