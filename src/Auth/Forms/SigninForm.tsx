import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { Form,FormControl,FormField,FormItem,FormLabel, FormMessage} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SigninValidation } from "@/lib/validation"
import Loader from "@/components/Shared/Loader"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { useSigninAccount} from "@/lib/React-Query/queries&Mutaion"
import { userContext } from "@/context/AuthContext"
import logo from "/images/logo.svg"


function SigninForm() {

   const {toast} = useToast()
   const {checkAuthUser, isLoading: isUserLoading} = userContext()
   const navigate = useNavigate()

   // Query
   const { mutateAsync: signInAccount} = useSigninAccount();

   
    // 1. Define your form.
   const form = useForm<z.infer<typeof SigninValidation>>({
   resolver: zodResolver(SigninValidation),
   defaultValues: {
     email: '',
     password: ''
   },
 })


 // 2. Define a submit handler.
 async function onSubmit(values: z.infer<typeof SigninValidation>) {
   const session = await signInAccount({
       email: values.email,
       password: values.password,
   })
   console.log({...session});
   

   if(!session){
      return toast({title: 'Sign in failed. PLease try again.'})
   }

   const isLoggedIn = await checkAuthUser()

   if(isLoggedIn){
      form.reset()
      navigate('/')
   }
   else{
     return toast({title: 'Sign up failed. Please try again.'})
   }
 }
   

   return (
        <Form {...form}>

          <div className="sm:w-420 flex-center flex-col">
            <img src={logo} alt="" />

            <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
               Log in to your account
            </h2>

            <p className="text-light-3 small-medium md:base-regular mt-2">
              Welcome back! Please enter your details
            </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">


            <FormField
               control={form.control}
               name="email"
               render={({ field }) => (
                  <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                     <Input type="Email" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="password"
               render={({ field }) => (
                  <FormItem>
                  <FormLabel>Password (Min. 8 characters are required)</FormLabel>
                  <FormControl>
                     <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
               )}
            />
            
          <Button type="submit" className="shad-button_primary" >
            { isUserLoading ? (
              <div className="flex-center gap-2">
                  <Loader /> Loading....
              </div>
            ) : "Sign in"}
          </Button>

           <p className="text-small-regular text-light-2 text-center mt-1">
             Don't have an account?
             <Link to='/sign-up' className="text-primary-500 text-small-semibold ml-1">
              Sign up
             </Link>
           </p>

         </form>

         </div>
       </Form>
   )
}

export default SigninForm
