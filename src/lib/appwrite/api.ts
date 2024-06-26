import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, ImageGravity, Query } from 'appwrite'
import { account, appwriteConfig, avatars, databases, storage } from "./config";


////////////// Account creation with the Actual snapGram account

export async function createUserAccount(user: INewUser){
   try {
      const newAccount = await account.create(
         ID.unique(),
         user.email,
         user.password,
         user.name
      )
      if(!newAccount) throw new Error("Account creation failed");
      
      const avatarUrl = avatars.getInitials(user.name)
      
      const newUser = await saveUserDB({
         accountId: newAccount.$id,
         name: newAccount.name,
         email: newAccount.email,
         username: user.username,
         imageUrl: avatarUrl
      })
      return newUser;

   } catch (error) {
      console.error("Error creating user account:", error);
      return error
   }
}


export async function saveUserDB(user: {
   accountId: string,
   email: string,
   name: string,
   imageUrl: URL,
   username?: string
}){
   try {
      const newUser = await databases.createDocument(
         appwriteConfig.databaseID,
         appwriteConfig.userCollectionID,
         ID.unique(),
         user
      )
      return newUser;

   } catch (error) {
      console.error("Error saving user to DB:", error);
      return error;
   }
}


export async function signInAccount(user: {email: string; password: string;}){
    try {
      const session = await account.createEmailPasswordSession(user.email, user.password);
      return session

    } catch (error) {
      console.error("Error signing in account:", error);
      throw error
    }
}


export async function getCurrentUser() {
    try {
      const currentAccount = await account.get()

      if(!currentAccount) throw new Error("No current account found");

      const currentUser = await databases.listDocuments(
          appwriteConfig.databaseID,
          appwriteConfig.userCollectionID,
          [Query.equal('accountId' , currentAccount.$id)],
      ) 
      if(!currentUser) throw new Error("No current user found");

      return currentUser.documents[0];

    } catch (error) {
      throw error; // Rethrow the error after logging
    }
}



export async function signOutAccount() {
   try {
      const session = await account.deleteSession("current")
      return session
   } catch (error) {
      console.error("Error signing out account:", error);
      throw error;
   }
}


export async function createPost(post: INewPost) {
   try {
      const uploadedFile = await uploadFile(post.file[0])

      if(!uploadedFile) throw  new Error("File upload failed");

      //Get the file Url
      const fileUrl = getFilePreview(uploadedFile.$id)
      
      if(!fileUrl) {
         deleteFile(uploadedFile.$id)
         throw new Error("Failed to get file preview");
      }

      // Convert the tags in an Array
      const tags = post.tags?.replace(/ /g, '').split(',') || [];

      //Save post to database
      const newPost = await databases.createDocument(
         appwriteConfig.databaseID,
         appwriteConfig.postCollectionID,
         ID.unique(), 
         {
            creator: post.userId,
            caption: post.caption,
            imageUrl: fileUrl,
            imageId: uploadedFile.$id,
            location: post.location,
            tags: tags
         }
      )

      if (!newPost) {
         await deleteFile(uploadedFile.$id)
         throw new Error("Post creation failed");
      }

      return newPost;

   } catch (error) {
      console.error("Error creating post:", error);
      throw error; // Rethrow the error after logging
   }
}


export async function uploadFile(file: File) {
   try {
      const uploadedFile = await storage.createFile(
         appwriteConfig.storageID,
         ID.unique(),
         file
      )
      return uploadedFile;

   } catch (error) {
      console.error("Error uploading file:", error);
      throw error; // Rethrow the error after logging
   }
}


export function getFilePreview(fileId: string) {
    try {
      const fileUrl = storage.getFilePreview(
         appwriteConfig.storageID,
         fileId,
         2000,
         2000,
         ImageGravity.Center,
        100,   
      )
      if(!fileUrl) throw  new Error("Failed to get file preview");

      return fileUrl
    } catch (error) {
      console.error("Error getting file preview:", error);
      throw error; // Rethrow the error after logging
    }
}


export async function deleteFile(fileId: string) {
   try {
      await storage.deleteFile(appwriteConfig.storageID, fileId)
      return {status: 'ok'}
   } catch (error) {
      console.error("Error deleting file:", error);
      throw error; 
   }
}


export async function getRecentPosts() {
   try {
      const posts = await databases.listDocuments(
         appwriteConfig.databaseID,
         appwriteConfig.postCollectionID,
         [Query.orderDesc('$createdAt'), Query.limit(20)]
      )
      if(!posts) throw new Error("Failed to get recent posts");
 
      return posts;
   } catch (error) {
      console.error("Error getting recent posts:", error);
      throw error; 
   }   
}


export async function likePost(postId: string, likesArray: string[]){
   try {
      const updatedPost = await databases.updateDocument(
         appwriteConfig.databaseID,
         appwriteConfig.postCollectionID,
         postId,
         {
            likes: likesArray
         }
      )
      if (!updatedPost) {
         throw new Error("Failed to like the post")
      }
      return updatedPost

   } catch (error) {
      console.log(error);
      console.log('likePost: error function occur');
   }
}


export async function savePost(postId: string, userId: string){
   try {
      const SavesPost = await databases.createDocument(
         appwriteConfig.databaseID,
         appwriteConfig.savesCollectionID,
         postId,
         {
            user: userId,
            post: postId
         }
      )
      if (!SavesPost) {
         throw new Error("Failed to SavePost the post")
      }
      return SavesPost

   } catch (error) {
      console.log(error);
      console.log('SavePost: error function occur'); 
   }
}



export async function deleteSavedPost(savedRecordId: string){
   try {
      const statusCode = await databases.deleteDocument(
         appwriteConfig.databaseID,
         appwriteConfig.savesCollectionID,
         savedRecordId
      )
      if (!statusCode) {
         throw new Error("Failed to Delete the post")
      }
      return { status: 'ok'}

   } catch (error) {
      console.log(error);
      console.log('DeletPost: error function occur'); 
   }
}



export async function getPostById(postId?: string) {
   if(!postId) throw Error

    try {
       const post = await databases.getDocument(
          appwriteConfig.databaseID,
          appwriteConfig.postCollectionID,
          postId
       )
       if (!post) throw Error;
       
       return post
    } catch (error) {
      console.log('DeletPost: error function occur: ' , error);     
    }
}





export async function updatePost(post: IUpdatePost) {
   const hasFileToUpdate = post.file.length > 0;

   try {
      let image = {
         imageUrl: post.imageUrl,
         imageId: post.imageId
      }

      if (hasFileToUpdate) {
         //Upload image to storage
         const uploadedFile = await uploadFile(post.file[0])
         
         if(!uploadedFile) throw  new Error("File upload failed at update post");
        
         //Get the file Url
         const fileUrl = getFilePreview(uploadedFile.$id)
         
         if(!fileUrl) {
            deleteFile(uploadedFile.$id)
            throw new Error("Failed to get file preview");
         }

         image = { ...image, imageUrl:fileUrl, imageId: uploadedFile.$id }
      }

      // Convert the tags in an Array
      const tags = post.tags?.replace(/ /g, '').split(',') || [];

      //Save post to database
      const updatedPost = await databases.updateDocument(
         appwriteConfig.databaseID,
         appwriteConfig.postCollectionID,
         post.postId, 
         {
            caption: post.caption,
            imageUrl: image.imageUrl,
            imageId: image.imageId,
            location: post.location,
            tags: tags
         }
      )

     // Failed to update
      if (!updatedPost) {
         // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
         await deleteFile(post.imageId)
        }
          // If no new file uploaded, just throw error
         throw new Error("Post creation failed");
      }

       // Safely delete old file after successful update
         if (hasFileToUpdate) {
         await deleteFile(post.imageId);
       }

      return updatedPost;

   } catch (error) {
      console.error("Error creating post:", error);
      throw error; // Rethrow the error after logging
   }
}




export async function deletePost(postId?: string, imageId?: string) {
    if (!postId || !imageId ) return;

   try {
     const statusCode =  await databases.deleteDocument(
          appwriteConfig.databaseID,
          appwriteConfig.postCollectionID,
          postId
      )
      if (!statusCode) throw Error('deletePost error');

      await deleteFile(imageId);

      return { status : 'ok' }
   } catch (error) {
      console.log("Error at the delete post :" , error);
   }
}



export async function getInfinitePosts({ pageParam } : { pageParam: number }){
   let queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]

   if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
   }

   try {
     const posts = await databases.listDocuments(
       appwriteConfig.databaseID,
       appwriteConfig.postCollectionID,
       queries
     ) 
     if(!posts) throw new Error('Infinite post error')

     return posts

   } catch (error) {
      console.log("Infinite api function error", error);
   }
}



export async function searchPosts(searchTerm: string){
   try {
     const posts = await databases.listDocuments(
       appwriteConfig.databaseID,
       appwriteConfig.postCollectionID,
       [Query.search('caption', searchTerm)]
     )  

     if(!posts) throw new Error('searchPosts function error')

     return posts

   } catch (error) {
      console.log("searchPosts api function error", error);
   }
}




export async function getUserById(userId: string) {
   try {
     const user = await databases.getDocument(
       appwriteConfig.databaseID,
       appwriteConfig.userCollectionID,
       userId
     );
 
     if (!user) throw Error;
 
     return user;
   } catch (error) {
     console.log(error);
   }
 }





 // ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
   const hasFileToUpdate = user.file.length > 0;
   try {
     let image = {
       imageUrl: user.imageUrl,
       imageId: user.imageId,
     };
 
     if (hasFileToUpdate) {
       // Upload new file to appwrite storage
       const uploadedFile = await uploadFile(user.file[0]);
       if (!uploadedFile) throw Error;
 
       // Get new file url
       const fileUrl = getFilePreview(uploadedFile.$id);
       if (!fileUrl) {
         await deleteFile(uploadedFile.$id);
         throw Error;
       }
 
       image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
     }
 
     //  Update user
     const updatedUser = await databases.updateDocument(
       appwriteConfig.databaseID,
       appwriteConfig.userCollectionID,
       user.userId,
       {
         name: user.name,
         bio: user.bio,
         imageUrl: image.imageUrl,
         imageId: image.imageId,
       }
     );
 
     // Failed to update
     if (!updatedUser) {
       // Delete new file that has been recently uploaded
       if (hasFileToUpdate) {
         await deleteFile(image.imageId);
       }
       // If no new file uploaded, just throw error
       throw Error;
     }
 
     // Safely delete old file after successful update
     if (user.imageId && hasFileToUpdate) {
       await deleteFile(user.imageId);
     }
 
     return updatedUser;
   } catch (error) {
     console.log(error);
   }
 }
 



 // ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
   if (!userId) return;
 
   try {
     const post = await databases.listDocuments(
       appwriteConfig.databaseID,
       appwriteConfig.postCollectionID,
       [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
     );
 
     if (!post) throw Error;
 
     return post;
   } catch (error) {
     console.log(error);
   }
 }




 // ============================== GET USERS
export async function getUsers(limit?: number) {
   const queries: any[] = [Query.orderDesc("$createdAt")];
 
   if (limit) {
     queries.push(Query.limit(limit));
   }
 
   try {
     const users = await databases.listDocuments(
       appwriteConfig.databaseID,
       appwriteConfig.userCollectionID,
       queries
     );
 
     if (!users) throw Error;
 
     return users;
   } catch (error) {
     console.log(error);
   }
 }