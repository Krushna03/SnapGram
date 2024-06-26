import { userContext } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom"
import sideImg from "/public/images/side-img.svg" 

function AuthLayout() {
   const { isAuthenticated } = userContext();

   return (
      <>
       { isAuthenticated ? (
         <Navigate to='/'/>
       ) : (
         <>
            <section className="flex flex-1 justify-center items-center felx-col py-10">
               <Outlet />
            </section>

            <img 
               src={sideImg}
               alt="logo" 
               className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
            />
          </>
       ) 
       }
      </>
   )
}

export default AuthLayout
