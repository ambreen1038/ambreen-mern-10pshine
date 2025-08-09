// components/AnimatedAuth/AnimatedAuth.jsx
import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import AuthForm from '../AuthForm';

export default function AnimatedAuth() {
  const [isLogin, setIsLogin] = useState(true);

  // Animation
  const { transform } = useSpring({
    transform: `translateX(${isLogin ? '0%' : '-100%'})`,
    config: { tension: 300, friction: 30 }
  });

  return (
    <div className="w-full max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow-xl">
      {/* Toggle Buttons */}
      <div className="relative flex justify-between mb-8 bg-gray-100 rounded-full overflow-hidden">
        <button
          className={`w-1/2 py-2 z-10 font-medium transition duration-300 ${
            isLogin ? 'text-white' : 'text-gray-600'
          }`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`w-1/2 py-2 z-10 font-medium transition duration-300 ${
            !isLogin ? 'text-white' : 'text-gray-600'
          }`}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>

        {/* Active Indicator */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-blue-500 rounded-full transform transition-transform duration-300 ${
            !isLogin ? 'translate-x-full' : ''
          }`}
        />
      </div>

      {/* Forms */}
      <div className="relative flex overflow-hidden h-[300px]">
        <animated.div
          style={{ transform }}
          className="w-full absolute left-0 top-0 transition-all duration-300"
        >
          <AuthForm isLogin={true} />
        </animated.div>
        <animated.div
          style={{ transform }}
          className="w-full absolute left-full top-0 transition-all duration-300"
        >
          <AuthForm isLogin={false} />
        </animated.div>
      </div>
    </div>
  );
}
