// 'use client'

// import { useState } from 'react'
// import { useAuthStore } from '@/store/authStore'

// export default function LoginForm() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const { login, loginWithGoogle, loading, error } = useAuthStore()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       await login({ email, password })
//     } catch (error) {
//       console.error('Login error:', error)
//     }
//   }

//   const handleGoogleLogin = async () => {
//     try {
//       await loginWithGoogle()
//     } catch (error) {
//       console.error('Google login error:', error)
//     }
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <div className="p-8 bg-white rounded-lg shadow-md w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center">Login to HRGenie</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               required
//             />
//           </div>

//           {error && (
//             <div className="text-red-500 text-sm">{error}</div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <div className="mt-6">
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300" />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">Or continue with</span>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={handleGoogleLogin}
//             disabled={loading}
//             className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//               <path
//                 fill="currentColor"
//                 d="M12.545,12.151L12.545,12.151c0,1.054,0.846,1.909,1.909,1.909h3.536c-0.378,1.825-1.563,3.325-3.059,4.079c-1.185,0.595-2.524,0.794-3.829,0.533c-1.305-0.261-2.467-0.997-3.29-2.109c-0.823-1.112-1.239-2.524-1.239-3.996c0-1.472,0.416-2.884,1.239-3.996c0.823-1.112,1.985-1.848,3.29-2.109c1.305-0.261,2.644-0.062,3.829,0.533c0.927,0.464,1.714,1.152,2.268,1.996l2.029-2.029c-0.898-1.06-2.091-1.911-3.482-2.439c-1.839-0.699-3.857-0.834-5.796-0.388c-1.939,0.446-3.743,1.492-5.157,2.906c-1.414,1.414-2.46,3.218-2.906,5.157c-0.446,1.939-0.312,3.957,0.388,5.796c0.699,1.839,1.911,3.482,3.482,4.577c1.571,1.095,3.455,1.727,5.467,1.727c2.012,0,3.896-0.632,5.467-1.727c1.571-1.095,2.783-2.738,3.482-4.577c0.699-1.839,0.834-3.857,0.388-5.796c-0.446-1.939-1.492-3.743-2.906-5.157l-1.909,1.909C12.848,10.242,12.545,11.097,12.545,12.151z"
//               />
//             </svg>
//             Sign in with Google
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }