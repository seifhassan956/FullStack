import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Loader from "../../components/Loader"
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'
import { useLoginMutation } from '../../redux/api/users'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [login, { isLoading }] = useLoginMutation()
  const { userInfo } = useSelector((state) => state.auth)
  const { search } = useLocation()

  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [userInfo, navigate, redirect])

  const handleSubmit = (e) => {
    e.preventDefault()

    login({ email, password })
      .unwrap()
      .then((data) => {
        dispatch(setCredentials(data))
        navigate(redirect)
        toast.success('Login successful')
      })
      .catch((error) => {
        toast.error(error?.data?.message || 'Login failed')
      })
  }

  return (
    <div 
      className='w-full min-h-screen flex items-center justify-center bg-[#141414] px-4'
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)'
      }}
    >
      <div className='w-full max-w-[450px] p-10 bg-black/75 rounded-md border border-gray-800 shadow-2xl'>
        <h1 className='text-3xl font-bold text-white mb-8'>Sign In</h1>
        
        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
          <div className="relative">
            <input 
              type="email" 
              placeholder='Email or phone number' 
              className='w-full p-4 bg-[#333] text-white rounded outline-none border-none focus:ring-2 focus:ring-[#E50914] transition-all placeholder-gray-500' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder='Password' 
              className='w-full p-4 bg-[#333] text-white rounded outline-none border-none focus:ring-2 focus:ring-[#E50914] transition-all placeholder-gray-500' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type='submit' 
            className='w-full p-3 bg-[#E50914] text-white font-bold rounded hover:bg-[#b20710] transition-colors duration-300 shadow-lg mt-4 flex items-center justify-center' 
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Sign In'}
          </button>
        </form>

        <div className='flex flex-col gap-4 mt-10'>
          <div className='flex items-center justify-between text-gray-500 text-xs'>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" className="accent-gray-500" />
              <span>Remember me</span>
            </label>
            <Link to="#" className='hover:underline'>Need help?</Link>
          </div>

          <p className='text-gray-500 text-base'>
            New to MovieApp? <Link to="/register" className='text-white font-medium hover:underline'>Sign up now.</Link>
          </p>
          
          <p className='text-gray-500 text-[13px] leading-tight'>
            This page is protected by Google reCAPTCHA to ensure you're not a bot. <span className='text-blue-600 hover:underline cursor-pointer'>Learn more.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login