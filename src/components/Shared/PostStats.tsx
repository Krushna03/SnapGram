import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/React-Query/queries&Mutaion"
import { checkIsLiked } from "@/lib/utils"
import { Models } from "appwrite"
import { useEffect, useState } from "react"
import Loader from "./Loader"
import liked from  "/assets/icons/liked.svg" 
import like from "/assets/icons/like.svg"
import saved from  "/assets/icons/saved.svg" 
import save from "/assets/icons/save.svg"


type PostStatsProps = {
   post: Models.Document,
   userId: string;
}

function PostStats( {post, userId} : PostStatsProps) {
  const LikesList = post?.likes.map((user: Models.Document)=> user.$id)

  const [ likes, setLikes ] = useState<string[]>(LikesList)
  const [ isSaved, setSaved ] = useState(false)

  const {mutate: likePost} = useLikePost()
  const {mutate: savePost, isPending: isSavingPost} = useSavePost()
  const {mutate: deleteSavedPost, isPending: isDeletingSaved} = useDeleteSavedPost()

  const { data: currentUser } = useGetCurrentUser();


  const handleLikedPost = (e: React.MouseEvent) => {
     e.stopPropagation();

     let likesArray = [...likes]

    //  let hasLiked = newLikes.includes(userId)

     if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((id) => id !== userId)
     }
     else{
      likesArray.push(userId)
     }

     setLikes(likesArray);
     likePost({ postId: post?.$id || '', likesArray })
  }


  const savedPostRecord = currentUser?.save.find(
     (record: Models.Document) => record.post?.$id === post?.$id)

     
  useEffect(() => {
    //checks for the true and false value. if false then true & elsewhere
     setSaved(!!savedPostRecord) 
  }, [currentUser])



  const handleSavedPost = (e: React.MouseEvent) => {
      e.stopPropagation()

      if (savedPostRecord) {
         setSaved(false)
         deleteSavedPost(savedPostRecord.$id)
      }
      else{
        savePost( {postId: post?.$id || '', userId })
        setSaved(true)
      }
  }


   return (
     <div className="flex justify-between items-center z-20">
       
       <div className="flex gap-2 mr-5">
          <img 
            src={ checkIsLiked(likes , userId) 
                   ? liked
                   : like}
            alt="like" 
            width={20}
            height={20}
            onClick={handleLikedPost}
            className="cursor-pointer"
          />
          <p className="small-medium lg:base-medium">{likes.length}</p>
       </div>

       <div className="flex gap-2">
       { isSavingPost || isDeletingSaved ? <Loader /> :
          <img 
            src={ isSaved 
                  ? saved
                  : save
                }
            alt="like" 
            width={20}
            height={20}
            onClick={handleSavedPost}
            className="cursor-pointer"
          />
        }
       </div>

     </div> 
   )
}

export default PostStats
