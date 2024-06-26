import home from  "/assets/icons/home.svg"
import explore from  "/assets/icons/wallpaper.svg"
import people from  "/assets/icons/people.svg"
import bookmark from  "/assets/icons/bookmark.svg"
import create from  "/assets/icons/gallery-add.svg"


export const sidebarLinks = [
   {
     imgURL: home,
     route: "/",
     label: "Home",
   },
   {
     imgURL: explore,
     route: "/explore",
     label: "Explore",
   },
   {
     imgURL: people,
     route: "/all-users",
     label: "People",
   },
   {
     imgURL: bookmark,
     route: "/saved",
     label: "Saved",
   },
   {
     imgURL: create,
     route: "/create-post",
     label: "Create Post",
   },
 ];
 
 export const bottombarLinks = [
   {
     imgURL: home,
     route: "/",
     label: "Home",
   },
   {
     imgURL: explore,
     route: "/explore",
     label: "Explore",
   },
   {
     imgURL: bookmark,
     route: "/saved",
     label: "Saved",
   },
   {
     imgURL: create,
     route: "/create-post",
     label: "Create",
   },
 ];