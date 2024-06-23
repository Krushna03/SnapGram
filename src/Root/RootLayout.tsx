import Bottombar from '@/components/Shared/Bottombar'
import Leftsidebar from '@/components/Shared/Leftsidebar'
import Topbar from '@/components/Shared/Topbar'
import { Outlet } from 'react-router-dom'


function RootLayout() {


   return (

      <div className='w-full md:flex'>

         <Topbar />
         <Leftsidebar />

         <section className='flex flex-1 h-full'>
            <Outlet />
         </section>

         <Bottombar />
      </div>

   )
}

export default RootLayout
