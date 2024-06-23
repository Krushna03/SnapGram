import {Routes, Route} from 'react-router-dom'
import './globals.css'
import { CreatePost, Explore, Home, Profile, Saved, UpdatePost, AllUsers, PostDetails, EditPost} from './Root/Pages'
import SigninForm from './Auth/Forms/SigninForm'
import SignupForm from './Auth/Forms/SignupForm'
import AuthLayout from './Auth/AuthLayout'
import RootLayout from './Root/RootLayout'
import { Toaster } from "@/components/ui/toaster"
import UpdateProfile from './Root/Pages/UpdateProfile'


function App() {

  return (
    <main className='flex h-screen'>
      <Routes>
         
         {/* Public Routes */}
         <Route element={<AuthLayout />}>
            <Route path='/Sign-in' element={<SigninForm />} /> 
            <Route path='/Sign-up' element={<SignupForm />} /> 
         </Route>


         {/* Private Routes : index: Starting page */}
         <Route element={<RootLayout />}>
            <Route index element={<Home />} /> 
            <Route path="/explore" element={<Explore />} /> 
            <Route path="/saved" element={<Saved />} /> 
            <Route path="/all-users" element={<AllUsers />} /> 
            <Route path="/create-post" element={<CreatePost />} /> 
            <Route path="/update-post/:id" element={<EditPost />} /> 
            <Route path="/posts/:id" element={<PostDetails />} /> 
            <Route path="/profile/:id/*" element={<Profile />} /> 
            <Route path="/update-profile/:id" element={<UpdateProfile />} /> 
          </Route>

      </Routes>

      <Toaster />
    </main>
  )
}

export default App
