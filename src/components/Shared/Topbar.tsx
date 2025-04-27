import {Link, useNavigate} from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '@/lib/React-Query/queries&Mutaion'
import { useEffect } from 'react'
import { userContext } from '@/context/AuthContext'
import logo from "/images/logo.svg" 
import logout from "/assets/icons/logout.svg" 

function Topbar() {

   const {mutate: signOut, isSuccess } = useSignOutAccount()
   const navigate = useNavigate()
   const {user} = userContext()

   useEffect(() => {
      if(isSuccess) navigate(0)
   }, [isSuccess])

   return (
      <section className='topbar'>
         <div className='flex-between py-4 px-5'>
            <Link to='/' className='flex gap-3 items-center'>
                <img 
                   src={logo}
                   alt="logo" 
                   width={130}
                   height={325}
                 />
            </Link>

            <div className='flex gap-4'>
               <Button variant='ghost' className='shad-button_ghost'
               onClick={() => signOut()}>
                 <img 
                    src={logout}
                    alt="logout" />
               </Button>

               <Link to={`/profile/${user.id}`} className='flex-center gap-3'>
                  <img 
                     src={user.imageUrl || `/assets/icons/profile-placeholder.svg`} 
                     alt='profile'
                     className='h-8 w-8 rounded-full'
                  />
               </Link>
            </div>
         
         </div>
      </section>
   )
}

export default Topbar
