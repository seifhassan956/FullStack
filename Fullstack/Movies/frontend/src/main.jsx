import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import { Route , RouterProvider, createBrowserRouter , createRoutesFromElements } from 'react-router-dom'
import React from 'react'

import Home from './pages/User/Home.jsx'
import Register from './pages/Auth/Register.jsx'
import Login from './pages/Auth/Login.jsx'
import PrivateRoute from './pages/Auth/PrivateRoute.jsx'
import Profile from './pages/User/Profile.jsx'
import AdminRoutes from './pages/Admin/AdminRoutes.jsx'
import DashBoard from './pages/Admin/DashBoard.jsx'
import AboutMovie from './pages/User/AboutMovie.jsx'
import SearchMovie from './pages/User/SearchMovie.jsx'
import AboutSeries from './pages/User/AboutSeries.jsx'
import MyList from './pages/User/MyList.jsx'

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/movie/:id" element={<AboutMovie />} />
        <Route path="/tv/:id" element={<AboutSeries />} />
        <Route path="/search" element={<SearchMovie/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path='' element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path='admin/dashboard' element={<DashBoard />}/>

        {/* <Route element={<AdminRoutes />}/> */}
      </Route>
    )
  );

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
)
